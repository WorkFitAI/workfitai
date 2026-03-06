# Login & Token Issuance Flow

Normal login and 2FA login flows with detailed token generation steps.

## Normal Login (No 2FA)

```
CLIENT REQUEST:
  POST /auth/login
  {
    "email": "john@example.com",
    "password": "SecurePass@123"
  }
  Headers: X-Device-Id (optional)

↓ [API Gateway] ↓
  - Rate limit: 5 req/min per endpoint
  - Route to auth-service:9080
  - [PUBLIC - no auth required]

↓ [Auth Service] ↓
  AuthController.login() → iAuthService.login()

  Validation Steps:
    1. Find user by email
    2. Validate password (BCrypt compare)
    3. Check account status = ACTIVE
    4. Check if email verified (OTP completed)
    5. Check if 2FA enabled (TwoFactorAuth entity)

  Token Generation (NO 2FA):
    1. Build JWT payload:
       {
         "sub": "john_doe",
         "iss": "auth-service",
         "email": "john@example.com",
         "roles": ["CANDIDATE"],
         "perms": ["candidate:read", ...],
         "iat": now,
         "exp": now + 900s
       }
    2. Sign with RS256 private key
    3. Generate random JTI (UUID)
    4. Build refresh token:
       {
         "sub": "john_doe",
         "iss": "auth-service",
         "id": "<jti>",
         "iat": now,
         "exp": now + 604800s (7 days)
       }
    5. Sign refresh token with RS256
    6. Store JTI in RefreshTokenService

  Session Creation:
    1. Create UserSession record:
       - sessionId: UUID
       - userId: extracted from user entity
       - deviceId: from X-Device-Id header
       - userAgent: from User-Agent header
       - ipAddress: from X-Forwarded-For / remote IP
       - location: GeoIP lookup
       - createdAt: now
       - lastActivityAt: now
       - twoFactorCompletedAt: null (no 2FA)
    2. Save to DB

  Return Response:
    {
      "success": true,
      "message": "TOKENS_ISSUED",
      "data": {
        "accessToken": "eyJhbGciOiJSUzI1NiIs...",
        "expiresIn": 900,
        "username": "john_doe",
        "roles": ["CANDIDATE"],
        "companyId": null
      }
    }
    Set-Cookie: refreshToken=eyJhbGc...;
                HttpOnly; Secure; SameSite=Strict;
                Path=/; Max-Age=604800

↓ [API Gateway - MintOpaquePostFilter] ↓
  Triggered on: POST /auth/login response

  Processing:
    1. Parse response JSON
    2. Extract accessToken (JWT)
    3. Decode JWT payload (Base64 decode part 2)
    4. Read exp claim (expiration timestamp)
    5. Calculate TTL = exp - now (≈900s)
    6. Generate opaque token: UUID.randomUUID()
    7. Store in Redis:
       Key: "opaque:access:{opaque_uuid}"
       Value: "{jwt_string}"
       TTL: 900s
       Log: "[MintOpaque] stored key=... (ttl=15m)"
    8. Replace response body:
       data.accessToken = opaque_uuid (not JWT)
    9. Mint opaque for refresh token in cookie
       (Same process, stored as "opaque:refresh:{uuid}")
    10. Response now contains opaque tokens

  Security Headers Added:
    - X-Content-Type-Options: nosniff
    - X-Frame-Options: DENY
    - Content-Security-Policy: default-src 'self'
    - Strict-Transport-Security: max-age=31536000

↓ [CLIENT receives] ↓
  HTTP 200 OK
  {
    "success": true,
    "data": {
      "accessToken": "550e8400e29b41d4a716446655440000",  // Opaque UUID
      "expiresIn": 900,
      "username": "john_doe",
      "roles": ["CANDIDATE"]
    }
  }
  Cookie: refreshToken=9a84f08d12e1447a8b0d7f8c9e8f0a1b; HttpOnly; ...

  Browser automatically stores:
    - accessToken in memory (not persistent)
    - refreshToken in httpOnly cookie (automatic, secure storage)
```

## Login with 2FA Enabled

```
CLIENT REQUEST:
  POST /auth/login
  {
    "email": "john@example.com",
    "password": "SecurePass@123"
  }

↓ [Auth Service validates password] ↓

  Check 2FA Status:
    1. Query TwoFactorAuth by userId
    2. Check enabled methods: TOTP, EMAIL, SMS
    3. Determine 2FA is REQUIRED

  Generate TEMPORARY Token:
    1. Build temp JWT (LIMITED SCOPE):
       {
         "sub": "john_doe",
         "userId": "user-uuid",
         "scope": "2fa-verification",
         "iat": now,
         "exp": now + 300s  // 5 minutes only
       }
    2. Sign with RS256

  Prepare OTP/TOTP:
    - TOTP method:
      * Read TOTP secret from TwoFactorAuth
      * Generate QR code image (data:image/png...)
      * No OTP needed (uses authenticator app)
    - EMAIL method:
      * Generate OTP: random 6-digit code
      * Store in Redis: "otp:{userId}" with 10-min TTL
      * Send email with OTP
    - SMS method:
      * Generate OTP: random 6-digit code
      * Store in Redis: "otp:{userId}" with 10-min TTL
      * Send SMS with OTP

  Return Partial Response:
    {
      "success": true,
      "message": "2FA verification required",
      "data": {
        "tempToken": "eyJhbGciOiJSUzI1NiIs...",
        "userId": "550e8400-e29b-41d4-a716-446655440000",
        "method": "TOTP",  // or EMAIL, SMS
        "qrCode": "data:image/png;base64,iVBORw0KG..."  // TOTP only
      }
    }

  NOTE: NO refreshToken cookie set
        NO opaque token generation yet
        tempToken is JWT with short TTL

↓ [User receives 2FA challenge] ↓
  - TOTP: Scan QR, app generates 6-digit code
  - EMAIL: Check email, copy 6-digit code
  - SMS: Check SMS, copy 6-digit code

CLIENT REQUEST:
  POST /auth/verify-2fa-login
  {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "tempToken": "eyJhbGciOiJSUzI1NiIs...",
    "code": "123456"
  }

↓ [Auth Service] ↓
  Verify2FALoginRequest handler:

  Validation:
    1. Parse and validate tempToken (RS256)
    2. Extract userId, check expiry (5-min window)
    3. Find TwoFactorAuth by userId
    4. Check which method is enabled

  Verify Code:
    - TOTP:
      * Get TOTP secret from TwoFactorAuth
      * Calculate TOTP for window (current ±1)
      * Compare with provided code
      * Allow 30-sec time skew
    - EMAIL/SMS:
      * Lookup OTP from Redis: "otp:{userId}"
      * Compare with provided code
      * Delete OTP from Redis (one-time use)
      * Check if expired

  Generate FULL Tokens (same as normal login):
    1. Build full access token (all claims)
       {
         "sub": "john_doe",
         "email": "john@example.com",
         "roles": ["CANDIDATE"],
         "perms": ["candidate:read", ...],
         "iat": now,
         "exp": now + 900s
       }
    2. Generate refresh token with JTI
    3. Store JTI in DB

  Update Session:
    1. Mark 2FA as completed: twoFactorCompletedAt = now
    2. Update lastActivityAt

  Return Full IssuedTokens:
    {
      "success": true,
      "message": "TOKENS_ISSUED",
      "data": {
        "accessToken": "eyJhbGciOiJSUzI1NiIs...",
        "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
        "expiresIn": 900,
        "username": "john_doe",
        "roles": ["CANDIDATE"]
      }
    }
    Set-Cookie: refreshToken=...; HttpOnly; ...

↓ [Gateway MintOpaquePostFilter] ↓
  Process response same as normal login:
    - Mint opaque token for access token
    - Mint opaque token for refresh token
    - Replace JWT with opaque in response
    - Set httpOnly cookie

↓ [CLIENT receives] ↓
  Same as normal login - opaque tokens only
```

## Error Cases

| Scenario | Status | Response | Recovery |
|----------|--------|----------|----------|
| User not found | 400 | INVALID_CREDENTIALS | Retry with correct email |
| Wrong password | 400 | INVALID_CREDENTIALS | Retry; 5 failures → 429 |
| Account not verified | 401 | ACCOUNT_NOT_VERIFIED | Verify OTP from registration |
| Account inactive | 401 | ACCOUNT_INACTIVE | Contact support |
| 2FA code invalid | 400 | INVALID_2FA_CODE | Retry with correct code |
| 2FA code expired | 400 | 2FA_CODE_EXPIRED | Request new code |
| Too many attempts | 429 | TOO_MANY_REQUESTS | Wait before retrying |
| Server error | 500 | Internal error | Retry after delay |

---

**Last Updated**: 2026-03-07
