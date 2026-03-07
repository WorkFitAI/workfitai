# API Gateway - Routing & Resilience

Service routing, circuit breaker, retry logic, and fallbacks.

## Route Configuration

**Route Pattern**:
```
Request path → Match pattern → Apply filters → Forward to service
```

**Service URIs** (Consul service discovery):
- `lb://auth` → Auth Service
- `lb://user` → User Service
- `lb://job` → Job Service
- `lb://cv` → CV Service
- `lb://notification` → Notification Service

**Example Route**:
```
Client: POST /auth/login
Gateway route config: path=/auth/**, method=POST
Filters: StripPrefix(1) → remove "/auth"
Forward: lb://auth/login
Auth Service: 9080/login
```

**Public Routes** (no auth required):
- `GET /auth` - Health check
- `POST /auth/register` - Registration
- `POST /auth/login` - Login
- `POST /auth/verify-otp` - OTP verification
- `POST /auth/refresh` - Token refresh
- `POST /auth/forgot-password` - Password reset initiation
- `POST /auth/verify-reset-otp` - Reset OTP verification
- `POST /auth/reset-password` - Password reset completion

**Protected Routes** (require JWT):
- `/auth/logout`, `/auth/me`, `/auth/sessions/*` - Auth endpoints
- `/user/*`, `/profile/*`, `/candidates/*`, `/hr/*` - User endpoints

**Admin-Only Routes** (require ADMIN role):
- `/permissions/*` - Permission CRUD
- `/roles/*` - Role CRUD

## Circuit Breaker Configuration

**Purpose**: Prevent cascading failures; detect unhealthy services.

**Default Settings**:
- Sliding window size: 10 calls (COUNT_BASED)
- Failure rate threshold: 50%
- Slow call rate: 60% (calls taking > slow duration)
- Slow call duration: 3 seconds
- Wait duration (Open → Half-Open): 30 seconds
- Half-Open permitted calls: 5

**Service-Specific Overrides**:

| Service | Failure % | Slow Dur | Wait |
|---------|-----------|----------|------|
| auth | 30% | 2s | 60s |
| user | 40% | 3s | 30s |
| job | 60% | 5s | 30s |
| cv | default | 10s | 30s |
| notification | 70% | 3s | 30s |

**States**:
- **CLOSED**: Normal operation, count failures
- **OPEN**: Reject requests immediately (fail fast)
- **HALF_OPEN**: Allow limited test calls to detect recovery

**Metrics** (available at `/actuator/prometheus`):
- `resilience4j.circuitbreaker.state` - Current state (0=CLOSED, 1=OPEN, 2=HALF_OPEN)
- `resilience4j.circuitbreaker.buffered_calls_total` - Call count
- `resilience4j.circuitbreaker.failure_rate` - Current failure percentage

## Retry Logic

**When applied**: Before circuit breaker; on transient failures.

**Default Settings**:
- Max attempts: 3
- Initial wait: 500ms
- Backoff: Exponential (2x multiplier)
  - Attempt 1: immediate
  - Attempt 2: 500ms
  - Attempt 3: 1000ms

**Retry on**:
- `HttpServerErrorException` (5xx)
- `IOException` (network errors)
- `TimeoutException` (request timeout)

**Service-Specific**:

| Service | Max Attempts | Wait |
|---------|--------------|------|
| auth | 2 | 300ms |
| user | 3 | 500ms |
| job | 3 | 1000ms |
| cv | 1 | none |
| application | 2 | 500ms |

**Do NOT retry**:
- 4xx errors (client fault)
- POST requests with body (no idempotency guarantee)

## Fallback Responses

When service unavailable (circuit breaker OPEN):

```
GET /fallback/{service}/* → Returns:
{
  "success": false,
  "message": "Service temporarily unavailable",
  "status": 503
}
```

**Available Fallbacks**:
- `/fallback/auth/*` - Auth service fallback
- `/fallback/user/*` - User service fallback
- `/fallback/job/*` - Job service fallback
- `/fallback/cv/*` - CV service fallback

## Timeout Configuration

**Global default**: 10 seconds

**Per-service timeouts**:
- auth: 5s (fast, simple operations)
- user: 8s (DB queries)
- job: 15s (search/filtering)
- cv: 30s (file operations)
- application: 12s (moderate operations)
- notification: 8s (event publishing)

**Timeout behavior**:
- Request aborted after timeout
- Returns 504 Gateway Timeout
- Triggers circuit breaker failure counter

---

**Last Updated**: 2026-03-07
