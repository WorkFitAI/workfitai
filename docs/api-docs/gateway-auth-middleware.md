# API Gateway - Authentication Middleware

Authentication filters and token transformation in the API Gateway.

## Filter Chain Order

**Spring Cloud Gateway Filter Execution**:

```
Incoming Request
    ↓
1. [LoggingMdcFilter] - Extract request ID, user info
    ↓
2. [SecurityHeadersFilter] - Add X-Content-Type-Options, etc.
    ↓
3. [RateLimitFilter] - Check rate limits per IP/user
    ↓
4. [OpaqueToJwtWebFilter] - Convert opaque token to JWT
    ↓
5. [Spring Security] - Authenticate JWT (RS256 verification)
    ↓
6. [JwtClaimsExtractionFilter] - Extract claims, add headers
    ↓
7. [Route matching & forwarding]
    ↓
8. [Upstream Service] (auth-service, user-service, etc)
    ↓
[Response]
    ↓
9. [MintOpaquePostFilter] - Convert JWT to opaque in response
    ↓
10. [ResponseCacheFilter] - Cache if applicable
    ↓
Client
```

## OpaqueToJwtWebFilter

**Purpose**: Convert opaque tokens (from client) to JWT (for services).

**When triggered**:
- Any request with `Authorization: Bearer {token}` header
- Any request with `refreshToken` cookie

**Logic**:

```
1. Extract token from:
   - Authorization: Bearer {token}
   - Cookie: refreshToken={token}

2. Detect token type:
   - If JWT (has 2 dots, length > 50): SKIP conversion
   - If UUID format: CONVERT to JWT

3. Redis lookup:
   Key: "opaque:access:{token}" or "opaque:refresh:{token}"
   Value: Original JWT

4. Replace in request:
   - Authorization header: "Bearer {jwt}"
   - Refresh cookie: {jwt}

5. Add debugging headers:
   - X-Token-Source: "opaque"
   - X-Original-Token: {opaque_uuid}

6. Log conversion:
   "[OpaqueToJwtPre] Found JWT for opaque=..."
```

## JwtClaimsExtractionFilter

**Purpose**: Extract JWT claims and inject as request headers for upstream services.

**When triggered**: After Spring Security completes JWT validation.

**Extracted claims**:
- `sub` claim → `X-Username` header
- `roles` claim → `X-User-Roles` header (comma-separated)

**Example transformation**:

```
Input JWT:
  {
    "sub": "john_doe",
    "roles": ["CANDIDATE", "ADMIN"],
    "email": "john@example.com",
    ...
  }

Output headers added to request:
  X-Username: john_doe
  X-User-Roles: CANDIDATE,ADMIN

Request forwarded to upstream with headers
```

**Filter Order**: Runs AFTER Spring Security (order = -50).

## MintOpaquePostFilter

**Purpose**: Convert JWT in response to opaque token (client-friendly).

**When triggered**: On login/refresh endpoints only.

**Endpoints**:
- `POST /auth/login`
- `POST /auth/oauth/exchange`
- `POST /auth/refresh`

**Process**:

```
1. Intercept response body (JSON)

2. Find JWT in response:
   data.accessToken = "{jwt}"

3. Parse JWT payload:
   - Extract expiration (exp claim)
   - Calculate TTL = exp - now

4. Generate opaque token:
   UUID randomUUID() → "550e8400e29b41d4a716446655440000"

5. Store in Redis:
   Key: "opaque:access:{uuid}"
   Value: {original_jwt}
   TTL: (expiration - now) seconds
   Timeout handling: Min 5 seconds

6. Replace in response:
   data.accessToken = "{opaque_uuid}"

7. Do same for refresh token in Set-Cookie

8. Log: "[MintOpaque] stored key=... (ttl=15m)"
```

**Error handling**: If Redis fails, return original JWT (fail-open).

## JWT Validation (Spring Security)

**JwtDecoder bean**: Uses auth-service public key.

```
1. Extract Bearer token from header
2. Split JWT: header.payload.signature
3. Decode payload (Base64 URL-safe)
4. Verify signature using public key (RS256)
5. Check expiration: now < exp
6. Create Authentication object
7. Store in SecurityContext
```

**Public key loading**:
- Fetched from: `auth-service:9080/public-key`
- Cached: Default 1 hour
- Fallback: Stored in memory if service unavailable

**Validation result**:
- ✓ Valid → Authenticated request, set SecurityContext
- ✗ Expired → 401 Unauthorized
- ✗ Invalid signature → 401 Unauthorized
- ✗ Missing token → Allowed if route is public

## Rate Limiting

**Per-endpoint limits** (checked before routing):

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/login` | 5 req | 1 minute |
| `/auth/register` | 3 req | 1 minute |
| Other `/auth/*` | Inherited | Global |
| All authenticated | 5000 req | 1 second |
| All unauthenticated | 1000 req | 1 second |

**Headers returned**:
- `X-RateLimit-Remaining`: Requests left in window
- `X-RateLimit-Retry-After`: Seconds until reset

**Status**: 429 Too Many Requests when exceeded.

---

**Last Updated**: 2026-03-07
