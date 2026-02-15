# Auth Service API Reference

> **Base URL**: `http://localhost:9085`
> **Frontend Port**: 3000
> **Last Updated**: 2026-02-15

## Overview

The Auth Service handles user authentication, JWT token management, role-based access control, and OAuth2 integration. All endpoints are proxied through the API Gateway at port 8088.

**Authentication Pattern**:
- JWT Bearer tokens (RSA-2048 signed)
- 15-minute access token lifespan
- 7-day refresh token lifespan
- Refresh token stored in HttpOnly cookie
- Header format: `Authorization: Bearer {accessToken}`

**Response Format**:
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "message": "Operation completed",
  "timestamp": "2026-02-15T10:30:00Z"
}
```

---

## Authentication Headers

All authenticated endpoints require:
```javascript
const headers = {
  "Authorization": `Bearer ${accessToken}`,
  "Content-Type": "application/json"
};
```

For multipart requests (file uploads):
```javascript
const formData = new FormData();
formData.append("file", file);
// Don't set Content-Type; browser sets it with boundary
// But still include Authorization header
```

---

## Registration & Verification

### Register User

**`POST /auth/register`**

Register a new candidate or HR user with email verification.

**Request**:
```json
{
  "username": "string (3-50 chars, alphanumeric + underscore)",
  "email": "string (valid email format)",
  "password": "string (min 8 chars, 1 uppercase, 1 digit, 1 special)",
  "firstName": "string",
  "lastName": "string",
  "role": "enum (CANDIDATE | HR | HR_MANAGER)",
  "companyId": "string (UUID, required if role=HR or HR_MANAGER)"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "role": "string",
    "status": "PENDING_VERIFICATION",
    "message": "OTP sent to email"
  },
  "message": "Registration successful. Please verify your email."
}
```

**Error Codes**:
- `400` - Validation error (username exists, invalid password)
- `409` - Email already registered

---

### Verify OTP

**`POST /auth/verify-otp`**

Verify email OTP to complete registration.

**Request**:
```json
{
  "email": "string",
  "otp": "string (6 digits)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "status": "ACTIVE",
    "message": "Email verified successfully"
  },
  "message": "Your email has been verified"
}
```

**Error Codes**:
- `400` - Invalid or expired OTP
- `404` - Email not found

---

### Resend OTP

**`POST /auth/resend-otp`**

Request a new OTP if the previous one expired.

**Request**:
```json
{
  "email": "string"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "message": "OTP resent to email",
    "expiresIn": 300
  }
}
```

**Error Codes**:
- `404` - Email not found
- `429` - Too many requests (rate limited)

---

## Login & Sessions

### Login

**`POST /auth/login`**

Authenticate user and receive JWT access token.

**Request**:
```json
{
  "username": "string",
  "password": "string",
  "rememberMe": "boolean (optional, default false)",
  "deviceFingerprint": "string (optional, for session tracking)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-string",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "requiresTwoFactor": false,
    "user": {
      "userId": "uuid",
      "username": "string",
      "email": "string",
      "role": "string",
      "firstName": "string",
      "lastName": "string"
    }
  },
  "message": "Login successful"
}
```

**Note**: If user has 2FA enabled, `requiresTwoFactor: true` and next step is `POST /auth/verify-2fa-login`.

**Response Headers**:
- `Set-Cookie: refresh_token={token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`

**Error Codes**:
- `400` - Invalid credentials
- `401` - Account not verified
- `403` - Account blocked
- `429` - Too many login attempts (rate limited)

---

### Verify 2FA Login

**`POST /auth/verify-2fa-login`**

Complete login if 2FA is enabled.

**Request**:
```json
{
  "username": "string",
  "code": "string (6 digits from authenticator app)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-string",
    "tokenType": "Bearer",
    "expiresIn": 900
  }
}
```

**Error Codes**:
- `400` - Invalid or expired 2FA code
- `401` - 2FA verification failed

---

### Get Current User Session

**`GET /auth/me`**

Retrieve current authenticated user's session information.

**Auth**: Required (Bearer token)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "role": "string",
    "firstName": "string",
    "lastName": "string",
    "permissions": ["job:read", "job:create"],
    "lastLogin": "2026-02-15T08:00:00Z",
    "isActive": true
  }
}
```

**Error Codes**:
- `401` - Invalid or expired token

---

### Refresh Access Token

**`POST /auth/refresh`**

Request a new access token using refresh token from cookie.

**Request**: (No body needed; uses HttpOnly cookie)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-string",
    "tokenType": "Bearer",
    "expiresIn": 900
  }
}
```

**Response Headers**:
- `Set-Cookie: refresh_token={new-token}; HttpOnly; Secure; SameSite=Strict`

**Error Codes**:
- `401` - Invalid or expired refresh token

---

### Logout

**`POST /auth/logout`**

Revoke current session and clear refresh token.

**Auth**: Required (Bearer token)

**Request**: (No body)

**Response (200)**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Response Headers**:
- `Set-Cookie: refresh_token=; Path=/; Max-Age=0;`

---

## Password Management

### Change Password

**`POST /auth/change-password`**

Change password for authenticated user.

**Auth**: Required (Bearer token)

**Request**:
```json
{
  "oldPassword": "string",
  "newPassword": "string (min 8 chars, 1 uppercase, 1 digit, 1 special)",
  "confirmPassword": "string"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Codes**:
- `400` - Passwords don't match, old password incorrect
- `401` - Invalid token

---

### Forgot Password

**`POST /auth/forgot-password`**

Request password reset via email.

**Request**:
```json
{
  "email": "string"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "message": "Password reset OTP sent to email",
    "expiresIn": 1800
  }
}
```

**Error Codes**:
- `404` - Email not found
- `429` - Too many requests

---

### Verify Reset OTP

**`POST /auth/verify-reset-otp`**

Verify OTP before resetting password.

**Request**:
```json
{
  "email": "string",
  "otp": "string (6 digits)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "resetToken": "temporary-token-string",
    "expiresIn": 1800
  }
}
```

**Error Codes**:
- `400` - Invalid or expired OTP

---

### Reset Password

**`POST /auth/reset-password`**

Set new password using reset token.

**Request**:
```json
{
  "email": "string",
  "resetToken": "string (from verify-reset-otp)",
  "newPassword": "string (min 8 chars, 1 uppercase, 1 digit, 1 special)",
  "confirmPassword": "string"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Error Codes**:
- `400` - Invalid token, passwords don't match
- `401` - Reset token expired

---

### Set Password (OAuth Users)

**`POST /auth/set-password`**

Set password for OAuth-registered users (who don't have password).

**Auth**: Required (Bearer token)

**Request**:
```json
{
  "password": "string (min 8 chars, 1 uppercase, 1 digit, 1 special)",
  "confirmPassword": "string"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Password set successfully"
}
```

---

## Two-Factor Authentication (2FA)

### Enable 2FA

**`POST /auth/enable-2fa`**

Enable Google Authenticator two-factor authentication.

**Auth**: Required (Bearer token)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0...",
    "secret": "JBSWY3DPEBLW64TMMQ======",
    "message": "Scan QR code with authenticator app"
  }
}
```

**Frontend Implementation**:
```javascript
// 1. Display QR code to user
// 2. User scans with Google Authenticator
// 3. User enters 6-digit code to verify
const response = await fetch('http://localhost:9085/auth/verify-2fa', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ code: '123456' })
});
```

---

### Verify 2FA Setup

**`POST /auth/verify-2fa`**

Confirm 2FA is working by submitting a code.

**Auth**: Required (Bearer token)

**Request**:
```json
{
  "code": "string (6 digits from authenticator app)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "backupCodes": [
      "1234-5678-90AB",
      "2345-6789-0ABC"
    ],
    "message": "2FA enabled successfully. Save backup codes in secure location."
  }
}
```

---

### Disable 2FA

**`POST /auth/disable-2fa`**

Disable two-factor authentication.

**Auth**: Required (Bearer token)

**Request**:
```json
{
  "password": "string (confirm current password)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "2FA disabled successfully"
}
```

**Error Codes**:
- `400` - Invalid password

---

### Get 2FA Status

**`GET /auth/2fa/status`**

Check if 2FA is enabled for current user.

**Auth**: Required (Bearer token)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "method": "GOOGLE_AUTHENTICATOR",
    "lastUpdated": "2026-01-15T10:30:00Z"
  }
}
```

---

## Sessions Management

### List Active Sessions

**`GET /auth/sessions`**

Get all active sessions for current user.

**Auth**: Required (Bearer token)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "uuid",
        "deviceName": "Chrome on Windows",
        "ipAddress": "192.168.1.100",
        "location": "New York, USA",
        "createdAt": "2026-02-15T08:00:00Z",
        "lastActivity": "2026-02-15T10:30:00Z",
        "isCurrent": true
      }
    ],
    "totalSessions": 1
  }
}
```

---

### Revoke Session

**`DELETE /auth/sessions/{sessionId}`**

Logout from a specific device/session.

**Auth**: Required (Bearer token)

**Response (204)**: No content

**Error Codes**:
- `404` - Session not found

---

### Revoke All Sessions

**`DELETE /auth/sessions/all`**

Logout from all devices except current.

**Auth**: Required (Bearer token)

**Response (204)**: No content

---

## OAuth2 Integration

### Get OAuth Authorization URL

**`GET /auth/oauth/authorize/{provider}`**

Get authorization URL for OAuth provider.

**Parameters**:
- `provider`: `google` | `github`
- `redirectUri`: Frontend callback URL (URL-encoded)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
    "sessionId": "temporary-session-id"
  }
}
```

**Frontend Implementation**:
```javascript
// 1. Get authorization URL
const authUrl = await fetch(
  `http://localhost:9085/auth/oauth/authorize/google?redirectUri=${encodeURIComponent(window.location.origin + '/auth/callback')}`
);

// 2. Redirect user to provider
window.location.href = authUrl.data.authorizationUrl;
```

---

### OAuth Callback Handler

**`GET /auth/oauth/callback/{provider}`**

Backend OAuth callback endpoint (automatically handled by backend).

**Parameters**:
- `code`: Authorization code from OAuth provider
- `state`: State parameter for security

**Response**: Redirects to frontend with JWT in URL

---

### Exchange Session for Token

**`GET /auth/oauth/exchange?session={sessionId}`**

Exchange OAuth session for JWT access token.

**Query Parameters**:
- `session`: Session ID from authorization step
- `code`: Authorization code (if applicable)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-string",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "userId": "uuid",
      "username": "string",
      "email": "string",
      "role": "string"
    }
  }
}
```

---

### Link OAuth Account

**`POST /auth/oauth/link/{provider}`**

Link additional OAuth provider to existing account.

**Auth**: Required (Bearer token)

**Parameters**:
- `provider`: `google` | `github`
- `code`: Authorization code from provider

**Request**:
```json
{
  "code": "string (OAuth authorization code)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "provider": "google",
    "email": "user@gmail.com",
    "linkedAt": "2026-02-15T10:30:00Z"
  },
  "message": "OAuth account linked successfully"
}
```

---

### Unlink OAuth Account

**`DELETE /auth/oauth/unlink/{provider}`**

Remove OAuth provider from account.

**Auth**: Required (Bearer token)

**Parameters**:
- `provider`: `google` | `github`

**Response (200)**:
```json
{
  "success": true,
  "message": "OAuth account unlinked successfully"
}
```

**Error Codes**:
- `400` - Cannot unlink last authentication method

---

### Get Linked Accounts

**`GET /auth/oauth/linked-accounts`**

List all linked OAuth providers for current user.

**Auth**: Required (Bearer token)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "linkedProviders": [
      {
        "provider": "google",
        "email": "user@gmail.com",
        "linkedAt": "2026-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

### Get Auth Status

**`GET /auth/oauth/auth-status`**

Check available authentication methods.

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "availableMethods": [
      "username_password",
      "google",
      "github"
    ],
    "twoFactorEnabled": false
  }
}
```

---

## Admin Endpoints

### Get Pending HR Approvals

**`GET /auth/admin/pending-approvals`**

List HR users pending approval.

**Auth**: Required (Admin role only)

**Query Parameters**:
- `page`: Integer (0-indexed, default 0)
- `size`: Integer (default 20, max 100)
- `status`: `PENDING` | `APPROVED` | `REJECTED`

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "approvals": [
      {
        "userId": "uuid",
        "username": "hr_user_1",
        "email": "hr@company.com",
        "firstName": "John",
        "lastName": "Doe",
        "companyName": "TechCorp",
        "role": "HR",
        "status": "PENDING",
        "registeredAt": "2026-02-10T10:30:00Z",
        "reason": "New HR team member"
      }
    ],
    "totalElements": 5,
    "totalPages": 1,
    "currentPage": 0
  }
}
```

---

### Approve HR Manager

**`POST /auth/admin/approve-hr-manager/{userId}`**

Approve HR Manager registration.

**Auth**: Required (Admin role only)

**Parameters**:
- `userId`: User UUID to approve

**Request**:
```json
{
  "notes": "string (optional admin notes)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "status": "APPROVED",
    "approvedAt": "2026-02-15T10:30:00Z"
  },
  "message": "HR Manager approved successfully"
}
```

---

### Approve HR

**`POST /auth/admin/approve-hr/{userId}`**

Approve HR registration.

**Auth**: Required (Admin role only)

**Response (200)**:
```json
{
  "success": true,
  "message": "HR user approved successfully"
}
```

---

### Reject Registration

**`POST /auth/admin/reject/{userId}`**

Reject pending registration.

**Auth**: Required (Admin role only)

**Request**:
```json
{
  "reason": "string (required rejection reason)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Registration rejected successfully"
}
```

---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* error-specific details */ }
  },
  "timestamp": "2026-02-15T10:30:00Z"
}
```

### Common Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `INVALID_CREDENTIALS` | 401 | Username/password incorrect |
| `ACCOUNT_NOT_VERIFIED` | 401 | Email verification pending |
| `ACCOUNT_BLOCKED` | 403 | User account is blocked |
| `INVALID_TOKEN` | 401 | JWT token invalid or expired |
| `TOKEN_EXPIRED` | 401 | Access token expired (use refresh) |
| `EMAIL_ALREADY_EXISTS` | 409 | Email already registered |
| `USERNAME_ALREADY_EXISTS` | 409 | Username taken |
| `INVALID_OTP` | 400 | OTP code incorrect or expired |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `RESOURCE_NOT_FOUND` | 404 | User/session not found |
| `FORBIDDEN` | 403 | Permission denied |
| `VALIDATION_ERROR` | 400 | Request validation failed |

---

## TypeScript Types

```typescript
// Authentication Response
interface AuthResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: UserInfo;
}

// User Info
interface UserInfo {
  userId: string;
  username: string;
  email: string;
  role: "CANDIDATE" | "HR" | "HR_MANAGER" | "ADMIN";
  firstName: string;
  lastName: string;
  permissions?: string[];
}

// Session Info
interface SessionInfo {
  sessionId: string;
  deviceName: string;
  ipAddress: string;
  location: string;
  createdAt: string;
  lastActivity: string;
  isCurrent: boolean;
}

// Approval Request
interface ApprovalRequest {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  role: "HR" | "HR_MANAGER";
  status: "PENDING" | "APPROVED" | "REJECTED";
  registeredAt: string;
  reason?: string;
}

// JWT Payload (decoded)
interface JWTPayload {
  sub: string; // username
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
  scope: string; // space-separated permissions
  role: string;
  userId: string;
}

// OAuth Account
interface OAuthAccount {
  provider: "google" | "github";
  email: string;
  linkedAt: string;
}

// 2FA Setup Response
interface TwoFactorSetup {
  qrCode: string; // data:image/png;base64,...
  secret: string; // Base32 encoded secret
  backupCodes?: string[];
}
```

---

**API Version**: 1.0
**Last Updated**: 2026-02-15
**Gateway Route**: `/auth/**`
