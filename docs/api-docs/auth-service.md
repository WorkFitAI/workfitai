# Auth Service API Documentation

User authentication, authorization, and session management for WorkfitAI.

## Overview

**Service Name**: `auth-service`
**Port**: 9080 (internal), 9005 (via gateway)
**Tech Stack**: Spring Boot, Spring Security, JWT, 2FA/TOTP

Handles user registration, login, password management, sessions, roles/permissions, and multi-factor authentication.

## Service Health Check

### Health Check
```
GET /
Method: GET
Auth: None
Response:
{
  "success": true,
  "message": "AUTH_SERVICE_RUNNING",
  "data": "AUTH_SERVICE_RUNNING"
}
```

## Authentication Endpoints

### User Registration

**Endpoint**: `POST /auth/register`
**Auth Required**: No
**Rate Limit**: 3000/min

**Request**:
```json
{
  "email": "user@example.com",
  "username": "john_doe",
  "password": "SecurePass@123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CANDIDATE"  // CANDIDATE, HR, HR_MANAGER, ADMIN
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "USER_REGISTERED",
  "data": "OTP has been sent to your email for verification"
}
```

**Errors**:
- `400`: Email already exists, invalid format, weak password
- `422`: Validation failed (missing fields, invalid role)

### OTP Verification

**Endpoint**: `POST /auth/verify-otp`
**Auth Required**: No

**Request**:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Account verified"
}
```

**Errors**:
- `400`: Invalid or expired OTP
- `404`: User not found

### User Login

**Endpoint**: `POST /auth/login`
**Auth Required**: No
**Rate Limit**: 5000/min (high due to typical login patterns)

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass@123"
}
```

**Headers**:
```
X-Device-Id: optional-device-id  // For session tracking
```

**Response** (200 OK - No 2FA):
```json
{
  "success": true,
  "message": "TOKENS_ISSUED",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900,
    "username": "john_doe",
    "roles": ["CANDIDATE"],
    "companyId": null
  }
}
```

**Headers Set**:
```
Set-Cookie: refreshToken={token}; HttpOnly; Secure; SameSite=Strict; Path=/
```

**Response** (200 OK - 2FA Required):
```json
{
  "success": true,
  "message": "2FA verification required",
  "data": {
    "tempToken": "temp-jwt-token",
    "userId": "user-uuid",
    "method": "TOTP"  // or EMAIL, SMS
  }
}
```

**Errors**:
- `400`: Invalid credentials
- `401`: Account not verified
- `429`: Too many login attempts

### Verify 2FA Login

**Endpoint**: `POST /auth/verify-2fa-login`
**Auth Required**: No (uses temp token)

**Request**:
```json
{
  "userId": "user-uuid",
  "tempToken": "temp-jwt-token",
  "code": "123456"  // TOTP code or OTP
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "TOKENS_ISSUED",
  "data": {
    "accessToken": "...",
    "expiresIn": 900,
    "username": "john_doe",
    "roles": ["CANDIDATE"]
  }
}
```

**Headers Set**:
```
Set-Cookie: refreshToken={token}; HttpOnly; Secure; SameSite=Strict; Path=/
```

### User Logout

**Endpoint**: `POST /auth/logout`
**Auth Required**: Yes (Bearer token)

**Headers**:
```
Authorization: Bearer {accessToken}
X-Device-Id: optional-device-id
```

**Request**: Empty body

**Response** (200 OK):
```json
{
  "success": true,
  "message": "LOGGED_OUT"
}
```

**Headers Set**:
```
Set-Cookie: refreshToken=; Max-Age=0; HttpOnly; Path=/
```

### Token Refresh

**Endpoint**: `POST /auth/refresh`
**Auth Required**: Yes (refresh token cookie)

**Cookies**:
```
Cookie: refreshToken={refreshToken}
```

**Headers**:
```
X-Device-Id: optional-device-id
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "TOKENS_REFRESHED",
  "data": {
    "accessToken": "new-jwt-token",
    "expiresIn": 900,
    "username": "john_doe",
    "roles": ["CANDIDATE"],
    "companyId": null
  }
}
```

**Headers Set**:
```
Set-Cookie: refreshToken={newToken}; HttpOnly; Secure; SameSite=Strict; Path=/
```

**Note**: Refresh token is rotated on each refresh.

### Get Current User

**Endpoint**: `GET /auth/me`
**Auth Required**: Yes

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Session info",
  "data": {
    "authenticated": true,
    "username": "john_doe",
    "userId": "user-uuid",
    "roles": ["CANDIDATE"],
    "permissions": ["candidate:read", "candidate:update"],
    "companyId": null,
    "email": "user@example.com"
  }
}
```

**Response** (200 OK - Not authenticated):
```json
{
  "success": true,
  "message": "Not authenticated",
  "data": {
    "authenticated": false
  }
}
```

## Password Management

### Change Password

**Endpoint**: `POST /auth/change-password`
**Auth Required**: Yes

**Request**:
```json
{
  "currentPassword": "OldPass@123",
  "newPassword": "NewPass@456",
  "confirmPassword": "NewPass@456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully. You have been logged out from all devices"
}
```

**Errors**:
- `400`: Current password incorrect, weak new password
- `422`: Passwords don't match

### Forgot Password

**Endpoint**: `POST /auth/forgot-password`
**Auth Required**: No

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset OTP sent",
  "data": {
    "email": "user@example.com",
    "expiresIn": 1800
  }
}
```

**Note**: OTP sent to email. Valid for 30 minutes.

### Verify Reset OTP

**Endpoint**: `POST /auth/verify-reset-otp`
**Auth Required**: No

**Request**:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "OTP verified",
  "data": {
    "resetToken": "reset-jwt-token",
    "expiresIn": 600
  }
}
```

### Reset Password

**Endpoint**: `POST /auth/reset-password`
**Auth Required**: No

**Request**:
```json
{
  "token": "reset-jwt-token",
  "newPassword": "NewPass@456",
  "confirmPassword": "NewPass@456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset successfully. Please login with your new password"
}
```

### Set Password (OAuth Users)

**Endpoint**: `POST /auth/set-password`
**Auth Required**: Yes (OAuth user)

**Request**:
```json
{
  "newPassword": "NewPass@456",
  "confirmPassword": "NewPass@456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password set successfully. You can now login with username and password"
}
```

## Session Management

### Get User Sessions

**Endpoint**: `GET /sessions`
**Auth Required**: Yes

**Response** (200 OK):
```json
[
  {
    "sessionId": "session-uuid",
    "deviceId": "device-1",
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.1",
    "location": "New York, USA",
    "createdAt": "2024-01-01T10:00:00Z",
    "lastActivityAt": "2024-01-01T10:30:00Z",
    "isCurrent": false
  },
  {
    "sessionId": "current-session-uuid",
    "deviceId": "device-2",
    "userAgent": "Chrome/120...",
    "ipAddress": "192.168.1.2",
    "location": "Los Angeles, USA",
    "createdAt": "2024-01-01T11:00:00Z",
    "lastActivityAt": "2024-01-01T12:00:00Z",
    "isCurrent": true
  }
]
```

### Delete Specific Session

**Endpoint**: `DELETE /sessions/{sessionId}`
**Auth Required**: Yes

**Response** (200 OK):
```json
{
  "message": "Session deleted successfully"
}
```

**Errors**:
- `404`: Session not found
- `403`: Cannot delete other user's session

### Delete All Other Sessions

**Endpoint**: `DELETE /sessions/all`
**Auth Required**: Yes

**Response** (200 OK):
```json
{
  "message": "All other sessions deleted successfully"
}
```

**Note**: Keeps current session active, logs out all other devices.

## Two-Factor Authentication

### Enable 2FA

**Endpoint**: `POST /auth/enable-2fa`
**Auth Required**: Yes

**Request**:
```json
{
  "method": "TOTP"  // or EMAIL, SMS
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "2FA enabled",
  "data": {
    "method": "TOTP",
    "qrCode": "data:image/png;base64,iVBORw0KG...",
    "secret": "JBSWY3DPEBLW64TMMQQ...",
    "backupCodes": [
      "1234-5678",
      "9876-5432"
    ],
    "enabled": false  // Requires verification first
  }
}
```

**Note**: For TOTP, user must scan QR code and verify before enabling.

### Disable 2FA

**Endpoint**: `POST /auth/disable-2fa`
**Auth Required**: Yes

**Request**:
```json
{
  "password": "CurrentPassword@123",
  "method": "TOTP"  // or EMAIL, SMS
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "2FA disabled for method: TOTP"
}
```

### Get 2FA Status

**Endpoint**: `GET /auth/2fa/status`
**Auth Required**: Yes

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totp": {
      "enabled": true,
      "method": "TOTP",
      "lastUsed": "2024-01-01T10:00:00Z"
    },
    "email": {
      "enabled": false
    },
    "sms": {
      "enabled": false
    }
  }
}
```

## Role & Permission Management (Admin Only)

### List Permissions

**Endpoint**: `GET /permissions`
**Auth Required**: Yes (ADMIN role + `perm:read` authority)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "PERMISSIONS_FETCHED",
  "data": [
    {
      "id": "perm-uuid",
      "name": "candidate:create",
      "description": "Create new candidate profiles"
    },
    {
      "id": "perm-uuid-2",
      "name": "candidate:read",
      "description": "Read candidate profiles"
    }
  ]
}
```

### Create Permission

**Endpoint**: `POST /permissions`
**Auth Required**: Yes (ADMIN + `perm:create`)

**Request**:
```json
{
  "name": "job:publish",
  "description": "Publish job postings"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "PERMISSION_CREATED",
  "data": {
    "id": "perm-uuid",
    "name": "job:publish",
    "description": "Publish job postings"
  }
}
```

### Update Permission

**Endpoint**: `PUT /permissions/{name}`
**Auth Required**: Yes (ADMIN + `perm:update`)

**Request**:
```json
{
  "description": "Updated description"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "PERMISSION_UPDATED",
  "data": {
    "name": "job:publish",
    "description": "Updated description"
  }
}
```

### Delete Permission

**Endpoint**: `DELETE /permissions/{name}`
**Auth Required**: Yes (ADMIN + `perm:delete`)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "PERMISSION_DELETED"
}
```

### List Roles

**Endpoint**: `GET /roles`
**Auth Required**: Yes (ADMIN + `role:read`)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "ROLES_FETCHED",
  "data": [
    {
      "id": "role-uuid",
      "name": "CANDIDATE",
      "description": "Job seeker role",
      "permissions": ["candidate:create", "candidate:read"]
    },
    {
      "id": "role-uuid-2",
      "name": "HR",
      "description": "HR specialist role",
      "permissions": ["hr:create", "hr:read", "job:publish"]
    }
  ]
}
```

### Create Role

**Endpoint**: `POST /roles`
**Auth Required**: Yes (ADMIN + `role:create`)

**Request**:
```json
{
  "name": "RECRUITER",
  "description": "Recruiting specialist"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "ROLE_CREATED",
  "data": {
    "id": "role-uuid",
    "name": "RECRUITER",
    "description": "Recruiting specialist",
    "permissions": []
  }
}
```

### Assign Permissions to Role

**Endpoint**: `POST /roles/{name}/permissions`
**Auth Required**: Yes (ADMIN + `role:update`)

**Request**:
```json
{
  "permissions": [
    "job:create",
    "job:read",
    "candidate:search"
  ]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "ROLE_UPDATED",
  "data": {
    "name": "RECRUITER",
    "permissions": ["job:create", "job:read", "candidate:search"]
  }
}
```

## Error Responses

All errors follow standard format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common Error Codes

| Code | Status | Message |
|------|--------|---------|
| `INVALID_CREDENTIALS` | 400 | Email/password incorrect |
| `ACCOUNT_NOT_VERIFIED` | 401 | OTP verification required |
| `USER_ALREADY_EXISTS` | 400 | Email already registered |
| `INVALID_TOKEN` | 401 | JWT expired or invalid |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |

---

**Last Updated**: 2026-03-07
**Main Controller**: `AuthController.java`
**Service**: `iAuthService.java`
