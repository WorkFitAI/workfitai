# API Gateway Documentation

Central routing layer for all WorkfitAI microservices.

## Overview

**Service**: `api-gateway:9005`
**Tech**: Spring Cloud Gateway, Spring Security, Resilience4j, Redis

Gateway provides:
- Service routing (Consul discovery)
- JWT authentication & token transformation
- Rate limiting (multi-level)
- Circuit breaker with fallbacks
- CORS & security headers
- Request/response compression

## Key Documentation Links

**Authentication & Tokens**:
- [Authentication Flow](./authentication-flow.md) - Complete JWT architecture & lifecycle
- [Login & 2FA Flows](./auth-flow-login.md) - Token issuance & 2FA
- [Token Management](./auth-token-management.md) - Refresh rotation, logout, sessions
- [Gateway Auth Middleware](./gateway-auth-middleware.md) - Filter chain, OpaqueToJwt, MintOpaque

**Routing & Resilience**:
- [Routing & Resilience](./gateway-routing-resilience.md) - Routes, circuit breaker, retry, timeouts

## Architecture Overview

**Filter Chain**:
1. LoggingMdc → SecurityHeaders → RateLimit
2. OpaqueToJwt (convert opaque UUID → JWT via Redis)
3. Spring Security (JWT validation via RS256)
4. JwtClaimsExtraction (extract claims, add X-Username/X-User-Roles headers)
5. Route → Upstream Service
6. MintOpaque (convert JWT → opaque UUID in response)
7. ResponseCache, Compression

## Rate Limiting

**Global**: 1000 req/s per IP | **Per-User**: 5000 req/s authenticated

**Endpoint-Specific**:
- `/auth/login`: 5 req/min (brute force protection)
- `/auth/register`: 3 req/min (signup flood protection)
- `/cv/upload`: 1 req/min (file operations)

**Headers**: `X-RateLimit-Remaining`, `X-RateLimit-Retry-After`

## Security Headers

All responses include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy: default-src 'self'`
- `Strict-Transport-Security: max-age=31536000`

## CORS Configuration

**Allowed Origins** (per profile):
- **Local**: localhost:3000, localhost:3001
- **Docker**: From `ALLOWED_ORIGINS` env var
- **Production**: From `ALLOWED_ORIGINS` env var (required)

## WebSocket Support

```
ws://gateway:9005/ws/notifications
ws://gateway:9005/ws/updates
```

Routes to notification service (separate stream).

## Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `SERVER_PORT` | 9005 | Gateway port |
| `ALLOWED_ORIGINS` | localhost | CORS origins |
| `WS_ALLOWED_ORIGINS` | localhost | WebSocket origins |
| `AUTH_SERVICE_URL` | http://auth-service:9005 | Auth service URL |

**Profiles**: `local` (dev), `docker` (container), `production` (hardened)

## Health & Monitoring

```
GET /actuator/health          → Service status
GET /actuator/prometheus      → Metrics (requests, circuit breaker, rate limits)
```

## Debug Endpoints (Testing Only)

```
POST /debug/mint-test                    → Test opaque token generation
GET /debug/lookup-test/{opaqueToken}     → Test token conversion
GET /debug/redis-keys                    → List all Redis keys
GET /debug/redis-get/{key}               → Get Redis value
```

---

**Last Updated**: 2026-03-07
**Main Class**: `ApiGatewayApplication.java`
**Config**: `application.yml`
