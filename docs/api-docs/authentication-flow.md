# Authentication Flow - Detailed Technical Reference

Complete end-to-end authentication architecture and flows for WorkfitAI platform.

## Token Architecture

### Token Types

**Access Token (JWT)**:
- Algorithm: RS256 (RSA asymmetric)
- Lifetime: 900 seconds (15 minutes)
- Format: Sent in `Authorization: Bearer {token}` header
- Storage: Client memory or session storage
- Contains: username, roles, permissions, email, companyId (if HR)

**Refresh Token**:
- Algorithm: RS256 JWT
- Lifetime: 7 days
- Format: HttpOnly, Secure, SameSite=Strict cookie
- Name: `refreshToken`
- Contains: username, JTI (JWT ID for rotation tracking)
- Auto-rotated on each refresh

**Opaque Token**:
- Format: Random UUID (no JWT structure)
- Storage: Client memory (sent in Authorization header)
- Backend: Mapped to JWT in Redis cache
- Lifetime: Inherits from underlying JWT TTL
- Purpose: Prevents JWT exposure in client; allows token revocation

### JWT Claims Structure (Access Token)

```json
{
  "sub": "john_doe",
  "iss": "auth-service",
  "aud": null,
  "email": "john@example.com",
  "roles": ["CANDIDATE"],
  "perms": ["candidate:read", "candidate:write", "profile:update"],
  "companyId": "company-uuid",
  "iat": 1704067200,
  "exp": 1704068100
}
```

**Claims Explanation**:
- `sub`: Subject (username) - used as principal identity
- `iss`: Issuer - always "auth-service"
- `email`: User email address
- `roles`: List of role names (e.g., CANDIDATE, HR, HR_MANAGER, ADMIN)
- `perms`: Union of all permissions from assigned roles
- `companyId`: Only present for HR/HR_MANAGER users
- `iat`: Issued-at timestamp (seconds)
- `exp`: Expiration timestamp (seconds)

### Signature & Validation

**Key Management**:
- Auth Service generates RS256 key pair on startup
- Public key exposed at: `GET /public-key`
- Private key stored in JVM memory, secured by Vault
- All services validate JWT signature using public key

**Validation Process**:
```
1. Extract JWT from Authorization header
2. Split JWT into 3 parts: header.payload.signature
3. Decode payload (Base64 URL-safe)
4. Verify signature using auth-service public key
5. Check expiration (exp < now = invalid)
6. Load claims (sub, roles, perms)
7. Convert to Spring Security Authentication
```

---

## End-to-End Authentication Flow

### Normal Login (No 2FA)

```
┌─────────────────┐
│  Client/Browser │
└────────┬────────┘
         │ 1. POST /auth/login
         │    { email, password }
         ▼
┌──────────────────────┐
│  API Gateway:9005    │
├──────────────────────┤
│ [PUBLIC - No auth]   │
│ - Rate limit: 5req/m │
│ - Route to auth:9080 │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Auth Service:9080            │
│ AuthController.login()       │
├──────────────────────────────┤
│ 1. Find user by email        │
│ 2. Validate password (BCrypt)│
│ 3. Check account status      │
│ 4. Check if 2FA enabled      │
│ 5. [NO 2FA] Generate tokens: │
│    - RS256 access token      │
│    - RS256 refresh token     │
│    - JTI for rotation        │
│ 6. Create UserSession record │
│    (device, IP, location)    │
│ 7. Return IssuedTokens       │
└────────┬────────────────────┘
         │
         │ { success: true,
         │   data: {
         │     accessToken: JWT,
         │     refreshToken: JWT,
         │     expiresIn: 900,
         │     username: "john_doe",
         │     roles: ["CANDIDATE"]
         │   }}
         │
         ▼
┌──────────────────────────────────┐
│ API Gateway - MintOpaqueFilter   │
├──────────────────────────────────┤
│ [POST /auth/login RESPONSE]      │
│ 1. Extract accessToken (JWT)     │
│ 2. Decode JWT to get expiry      │
│ 3. Generate opaque UUID          │
│ 4. Store in Redis:               │
│    key: "opaque:access:{uuid}"   │
│    value: JWT                    │
│    ttl: JWT's exp - now (900s)   │
│ 5. Replace JWT with opaque in    │
│    response body                 │
│ 6. Set HttpOnly refreshToken     │
│    cookie (7 days)               │
│ 7. Add CORS/security headers     │
└────────┬───────────────────────┘
         │
         │ { success: true,
         │   data: {
         │     accessToken: "opaque-uuid",
         │     refreshToken: "opaque-uuid"
         │   }}
         │
         ▼
┌─────────────────┐
│ Client/Browser  │ STORAGE:
├─────────────────┤ - accessToken in memory
│ Authorization:  │ - refreshToken in httpOnly cookie
│ Bearer {opaque} │ (automatic with all requests)
└────────┬────────┘
         │
         │ 5. SUBSEQUENT REQUEST:
         │    GET /user/profile
         │    Authorization: Bearer {opaque}
         │    Cookie: refreshToken={opaque}
         │
         ▼
┌──────────────────────────────────┐
│ API Gateway - OpaqueToJwtPreFilt │
├──────────────────────────────────┤
│ 1. Extract "Bearer {token}"      │
│ 2. Detect if JWT (has 2 dots)    │
│    or opaque (UUID format)       │
│ 3. [OPAQUE] Lookup in Redis      │
│    key: "opaque:access:{token}"  │
│    → returns original JWT        │
│ 4. Replace header:               │
│    Authorization: Bearer {JWT}   │
│ 5. Set X-Token-Source: opaque    │
│ 6. Set X-Original-Token for logs │
└────────┬───────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Spring Security (Gateway)        │
├──────────────────────────────────┤
│ [JwtAuthenticationProvider]      │
│ 1. Extract "Bearer {JWT}"        │
│ 2. Verify RS256 signature        │
│ 3. Parse JWT claims              │
│ 4. Load GrantedAuthorities:      │
│    - ROLE_CANDIDATE              │
│    - candidate:read              │
│    - candidate:write             │
│    - profile:update              │
│ 5. Create Authentication object  │
│ 6. Store in SecurityContext      │
└────────┬───────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ JwtClaimsExtractionFilter        │
├──────────────────────────────────┤
│ [Runs after Spring Security]     │
│ 1. Read Authentication from      │
│    SecurityContext               │
│ 2. Extract JWT claims:           │
│    - username (sub)              │
│    - roles (from claim)          │
│ 3. Add request headers:          │
│    X-Username: john_doe          │
│    X-User-Roles: CANDIDATE       │
│ 4. Pass to upstream service      │
└────────┬───────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ Upstream Service (user-service)  │
├──────────────────────────────────┤
│ [SecurityConfig.jwtDecoder()]    │
│ 1. Receive JWT from gateway      │
│ 2. Fetch public key from         │
│    auth-service (cached)         │
│ 3. Verify RS256 signature        │
│ 4. Parse claims                  │
│ 5. Create SecurityContext        │
│ 6. [UserIdExtractionFilter]      │
│    Extract username from JWT     │
│    Lookup user ID in DB          │
│    Set request attribute:        │
│    request.setAttribute(         │
│      "userId", uuid_str)         │
│ 7. Execute @Secured endpoint     │
│    with full auth context        │
└──────────────────────────────────┘
```

### Login with 2FA Enabled

```
Client POST /auth/login
  ↓
Auth Service validates credentials ✓
  ↓
Check TwoFactorAuth document:
  - If TOTP enabled: read secret, generate QR
  - If EMAIL enabled: send OTP to email
  - If SMS enabled: send OTP to phone
  ↓
Generate TEMP JWT (limited scope):
  {
    "sub": "username",
    "scope": "2fa-verification",
    "exp": now + 5minutes
  }
  ↓
Return 200 OK:
  {
    "success": true,
    "message": "2FA verification required",
    "data": {
      "tempToken": "{temp_jwt}",
      "userId": "user-uuid",
      "method": "TOTP",
      "qrCode": "data:image/png;base64,..."  // For TOTP only
    }
  }
  ↓
[NO opaque token generated - tempToken is JWT]
  ↓
Client receives temp token, user enters 2FA code
  ↓
Client POST /auth/verify-2fa-login
  {
    "userId": "user-uuid",
    "tempToken": "{temp_jwt}",
    "code": "123456"
  }
  ↓
Auth Service:
  1. Validate temp token (verify signature + expiry)
  2. Extract userId from temp token
  3. Verify TOTP/OTP code against TwoFactorAuth record
  4. Generate FULL access token (all claims)
  5. Generate refresh token with new JTI
  6. Update UserSession with 2FA completion flag
  7. Return full IssuedTokens (same as normal login)
  ↓
[Gateway MintOpaque filter processes normally]
```

---

## Token Refresh & Rotation

```
CLIENT sends refresh request:
  POST /auth/refresh
  Authorization: Bearer {opaque_access_token}  [OPTIONAL - auto from header]
  Cookie: refreshToken={opaque_rt}

GATEWAY OpaqueToJwtPreFilter:
  [Converts opaque tokens to JWT]
  - Authorization header (if provided)
  - refreshToken cookie
  Result: Both converted to their original JWTs

AUTH SERVICE refresh() handler:
  1. Extract refresh token from cookie
  2. Validate signature + expiry (RS256)
  3. Extract JTI (rotation token ID)
  4. Check if JTI is blacklisted (revoked sessions)
  5. Fetch user by username (sub claim)
  6. Generate NEW access token
  7. Generate NEW refresh token with NEW JTI
  8. Mark OLD JTI as "used" (prevents reuse)
  9. Return IssuedTokens with both new tokens

GATEWAY MintOpaqueFilter:
  - Mint opaque token for new access token
  - Set new httpOnly refreshToken cookie

CLIENT receives:
  - New opaque access token
  - New opaque refresh token (in cookie)
  - Automatic: oldJTI invalidated in Redis
```

**Key Properties**:
- Refresh tokens rotate: old token cannot be reused
- Sessions tied to device via deviceId (optional)
- Token compromise: revoke session = all tokens invalid
- Long-lived storage: Only refresh token stored server-side

---

## Session Management

### Session Record (UserSession entity)

```java
{
  sessionId: UUID,
  userId: UUID,
  deviceId: String,        // Client-provided identifier
  userAgent: String,       // Browser/client software
  ipAddress: String,       // Client IP
  location: String,        // Geo-location (IP → city)
  createdAt: Instant,
  lastActivityAt: Instant,
  isActive: boolean,
  twoFactorCompletedAt: Instant  // When 2FA was verified
}
```

### Session Lifecycle

1. **Created**: On successful login (after password validation)
2. **Updated**: On each API request (lastActivityAt refresh)
3. **Marked Inactive**: On explicit logout
4. **Revoked**: On password change (all sessions logged out)
5. **Auto-Cleaned**: Sessions older than 90 days

### Session Endpoints

```
GET /sessions
  → List all active sessions for current user
  → Shows device info, last activity, location

GET /sessions/{sessionId}
  → Get specific session details

DELETE /sessions/{sessionId}
  → Mark session inactive
  → Invalidate its refresh token JTI
  → Subsequent requests with old refresh token fail

DELETE /sessions/all
  → Log out from ALL other devices
  → Keep current session active (requires refresh)

DELETE /sessions (all)
  [Triggered by password change]
  → Invalidates ALL sessions
  → User must login again
```

---

## Logout Flow

```
CLIENT:
  POST /auth/logout
  Authorization: Bearer {access_token}
  X-Device-Id: device-1 (optional)

GATEWAY:
  [Normal JWT validation/conversion process]
  → Injects X-Username, X-User-Roles headers
  → Routes to auth service

AUTH SERVICE logout():
  1. Extract username from JWT
  2. Find session by username + deviceId
  3. Mark session inactive
  4. Extract refresh token JTI
  5. Revoke JTI in RefreshTokenService
     (add to blacklist/mark as used)
  6. Delete refresh token cookie
  7. Return 200 OK

CLIENT:
  Receives Set-Cookie: refreshToken=; Max-Age=0
  Clears access token from memory
  Next API call fails with 401 (no token)
```

---

## Password Reset Flow

```
1. CLIENT POST /auth/forgot-password
   { "email": "user@example.com" }

2. AUTH SERVICE:
   - Find user by email
   - Generate OTP (6 digits)
   - Store OTP in Redis with 30-min TTL
   - Send email with OTP
   - Return: { expiresIn: 1800 }

3. CLIENT:
   - Receives email with OTP
   - Enters OTP in form

4. CLIENT POST /auth/verify-reset-otp
   {
     "email": "user@example.com",
     "otp": "123456"
   }

5. AUTH SERVICE:
   - Lookup OTP from Redis
   - Validate (not expired, matches)
   - Generate RESET token (limited scope)
   - Return: { resetToken: JWT, expiresIn: 600 }
   - Note: resetToken NOT an access token (no roles/perms)

6. CLIENT POST /auth/reset-password
   {
     "token": "reset-token-jwt",
     "newPassword": "NewPass@123",
     "confirmPassword": "NewPass@123"
   }

7. AUTH SERVICE:
   - Validate reset token (signature + expiry)
   - Extract username from reset token
   - Hash new password (BCrypt)
   - Update user password
   - Invalidate ALL sessions (force re-login)
   - Return: 200 OK

8. CLIENT:
   - Redirects to login
   - Logs in with new credentials
```

---

## OAuth/Social Login (if enabled)

```
1. CLIENT:
   GET /auth/oauth/authorize?provider=google&redirect_uri=...

2. GATEWAY:
   [PUBLIC route]
   → Routes to auth service

3. AUTH SERVICE OAuthController:
   - Validate provider (google, github, etc)
   - Validate redirect_uri against whitelist
   - Generate state token (CSRF protection)
   - Store state in Redis (5-min TTL)
   - Redirect to provider auth endpoint:
     https://accounts.google.com/o/oauth2/v2/auth
     ?client_id=...&scope=...&state=...

4. OAUTH PROVIDER (Google):
   - User grants permission
   - Redirects to callback:
     https://gateway:9005/auth/oauth/callback
     ?code=...&state=...

5. GATEWAY:
   [PUBLIC route]
   → Routes to auth service

6. AUTH SERVICE OAuthController.callback():
   - Verify state token matches (prevent CSRF)
   - Exchange code for access_token (server-to-server)
   - Call provider API to fetch user profile
   - Extract: email, name, picture, provider_id
   - Lookup user by email:
     a) EXISTS: Update oauth_accounts (link)
     b) NEW: Create user + oauth_accounts record
   - Generate standard JWT + refresh token
   - [Continue as normal login]

7. GATEWAY MintOpaqueFilter:
   - Same as normal login flow

Result: User logged in via OAuth, standard JWT/opaque tokens
```

---

## Key Security Properties

| Property | Mechanism | Benefit |
|----------|-----------|---------|
| Token Signing | RS256 (asymmetric) | Can't forge tokens without private key |
| Secret Storage | Refresh JTI in DB | Compromised token can be revoked |
| Token Format | Opaque UUID (client) | JWT never exposed to client |
| HttpOnly Cookies | Browser enforced | XSS can't steal refresh token |
| SameSite=Strict | CSRF protection | Can't post token to other sites |
| Token Expiry | 15 min access / 7 days refresh | Limits exposure window |
| Device Tracking | Session + deviceId | Detect suspicious logins |
| Rate Limiting | Gateway enforced | Brute force protection |
| Password Hashing | BCrypt (12 rounds) | Slow, resistant to GPU attacks |
| Multi-Factor Auth | TOTP/Email/SMS | Adds second factor |

---

**Last Updated**: 2026-03-07
