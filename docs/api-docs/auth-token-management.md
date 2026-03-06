# Token Management - Refresh, Rotation & Revocation

Token lifecycle, refresh rotation, and session management.

## Token Refresh with Rotation

**Process**:
1. Client sends `POST /auth/refresh` with refreshToken cookie
2. Gateway converts opaque RT to JWT via Redis lookup
3. Auth service validates JWT signature + JTI (not blacklisted)
4. Generates new access + refresh tokens
5. Marks old JTI as "used" (prevents replay)
6. Gateway mints new opaque tokens
7. Returns both tokens + new httpOnly cookie

**Key Property**: Old JTI cannot be reused
- Prevents token reuse attacks
- Detects compromised refresh tokens
- Forces sequential refresh patterns

## Session Logout Flow

```
CLIENT:
  POST /auth/logout
  Authorization: Bearer {access_opaque_token}
  X-Device-Id: device-1 (optional)

GATEWAY OpaqueToJwtPreFilter:
  - Convert opaque to JWT
  - Pass to auth service

AUTH SERVICE logout() handler:
  1. Extract username from JWT
  2. Find UserSession:
     - By username + deviceId (if provided)
     - Or current session
  3. Mark session as inactive:
     UPDATE user_session SET is_active = false
  4. Extract refresh token JTI from session
  5. Revoke JTI immediately:
     - Add to Redis blacklist
     - Or mark as revoked in DB
  6. Delete refresh token cookie
  7. Log logout event (audit trail)

  Return:
    {
      "success": true,
      "message": "LOGGED_OUT"
    }
    Set-Cookie: refreshToken=; Max-Age=0; Path=/

CLIENT:
  - Clears access token from memory
  - Browser deletes httpOnly cookie
  - Next API call without token fails with 401

Result:
  - Session marked inactive
  - JTI invalidated (refresh fails)
  - User must login again
```

## Session-Based Revocation

```
When user changes password:
  1. Auth service triggers bulk logout
  2. Fetch all active sessions for user
  3. For each session:
     - Mark inactive
     - Revoke JTI
     - Notify user (audit event)
  4. User must login with new password

When admin revokes user:
  1. Find all sessions
  2. Mark all inactive
  3. Revoke all JTIs
  4. User access denied immediately

When user deletes account (30-day grace):
  1. Account marked for deletion
  2. All sessions revoked
  3. All JTIs blacklisted
  4. Account data purged after 30 days
```

## JTI Blacklist Management

**Storage**: Redis + Database backup

```
Redis Key: "jti:blacklist:{jti}"
TTL: 7 days (matches refresh token lifetime)
Value: timestamp of revocation

Lookup on refresh:
  1. Check Redis first (fastest)
  2. If miss, check DB (slower)
  3. If in blacklist → reject request
  4. If not in blacklist → allow

Cleanup:
  - Redis automatically expires (TTL)
  - DB cleanup job runs daily (remove expired entries)
```

## Multi-Device Session Management

```
Login creates session per device:
  - sessionId: unique per login
  - deviceId: client-provided identifier
  - userAgent: browser info
  - ipAddress: location tracking

GET /sessions → List all sessions:
  [
    {
      "sessionId": "session-1",
      "deviceId": "device-laptop",
      "userAgent": "Chrome/120 Windows",
      "ipAddress": "192.168.1.1",
      "location": "New York, USA",
      "createdAt": "2026-03-05T10:00:00Z",
      "lastActivityAt": "2026-03-07T14:30:00Z",
      "isCurrent": false
    },
    {
      "sessionId": "session-2",
      "deviceId": "device-phone",
      "userAgent": "Safari/17 iOS",
      "ipAddress": "203.0.113.42",
      "location": "Los Angeles, USA",
      "createdAt": "2026-03-07T09:00:00Z",
      "lastActivityAt": "2026-03-07T15:45:00Z",
      "isCurrent": true  // Current browser
    }
  ]

DELETE /sessions/{sessionId} → Logout specific device:
  1. Mark session inactive
  2. Revoke its JTI
  3. That device's refresh token invalid
  4. User can continue on other devices

DELETE /sessions/all → Logout all other devices:
  1. Find all sessions except current
  2. Mark all inactive
  3. Revoke all JTIs
  4. Keep current session alive
```

---

**Last Updated**: 2026-03-07
