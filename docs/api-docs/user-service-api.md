# User Service API Reference

> **Base URL**: `http://localhost:9085`
> **Frontend Port**: 3000
> **Last Updated**: 2026-02-15

## Overview

The User Service manages user profiles, CRUD operations for different roles (Candidate, HR, Admin), and user-specific settings. All endpoints are proxied through the API Gateway at port 8088.

**Role-Based Access**:
- **Candidate**: Own profile access, view HR profiles
- **HR**: Candidate search, approval workflows
- **HR_MANAGER**: User management, company-wide access
- **Admin**: Full system access to all users

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

## Authentication

All endpoints except public lookup require JWT Bearer token:

```javascript
const headers = {
  "Authorization": `Bearer ${accessToken}`,
  "Content-Type": "application/json"
};
```

---

## Profile Management

### Get My Profile

**`GET /users/profile/me`**

Retrieve current authenticated user's complete profile.

**Auth**: Required (Bearer token)

**Response (200)**:

**For Candidate**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phoneNumber": "string",
    "dateOfBirth": "2000-01-15",
    "address": "string",
    "bio": "string",
    "avatar": "url-or-null",
    "role": "CANDIDATE",
    "status": "ACTIVE",
    "createdAt": "2026-01-01T10:00:00Z",
    "updatedAt": "2026-02-15T10:30:00Z"
  }
}
```

**For HR**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phoneNumber": "string",
    "jobTitle": "string",
    "department": "string",
    "companyId": "uuid",
    "companyName": "string",
    "avatar": "url-or-null",
    "role": "HR",
    "status": "APPROVED",
    "createdAt": "2026-01-01T10:00:00Z",
    "updatedAt": "2026-02-15T10:30:00Z"
  }
}
```

**For Admin**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "ADMIN",
    "status": "ACTIVE",
    "lastLogin": "2026-02-15T08:00:00Z",
    "createdAt": "2026-01-01T10:00:00Z",
    "updatedAt": "2026-02-15T10:30:00Z"
  }
}
```

---

### Update Candidate Profile

**`PUT /users/profile/candidate`**

Update candidate-specific profile fields.

**Auth**: Required (CANDIDATE role only)

**Request**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string (optional)",
  "dateOfBirth": "date (YYYY-MM-DD, optional)",
  "address": "string (optional)",
  "bio": "string (optional, max 1000 chars)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phoneNumber": "string",
    "dateOfBirth": "2000-01-15",
    "address": "string",
    "bio": "string",
    "updatedAt": "2026-02-15T10:30:00Z"
  },
  "message": "Profile updated successfully"
}
```

**Error Codes**:
- `400` - Invalid input (invalid date format, phone number)
- `401` - Unauthorized
- `403` - Forbidden (not a candidate)

---

### Update HR Profile

**`PUT /users/profile/hr`**

Update HR-specific profile fields.

**Auth**: Required (HR role only)

**Request**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "jobTitle": "string",
  "department": "string"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phoneNumber": "string",
    "jobTitle": "string",
    "department": "string",
    "companyId": "uuid",
    "companyName": "string",
    "updatedAt": "2026-02-15T10:30:00Z"
  },
  "message": "Profile updated successfully"
}
```

---

### Update Admin Profile

**`PUT /users/profile/admin`**

Update admin profile fields.

**Auth**: Required (ADMIN role only)

**Request**:
```json
{
  "firstName": "string",
  "lastName": "string"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "updatedAt": "2026-02-15T10:30:00Z"
  }
}
```

---

### Upload Avatar

**`POST /users/profile/avatar`**

Upload user avatar image (multipart/form-data).

**Auth**: Required (Bearer token)

**Request**:
```javascript
const formData = new FormData();
formData.append("file", imageFile); // JPEG, PNG, WebP (max 5MB)

const response = await fetch('http://localhost:9085/users/profile/avatar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
    // Do NOT set Content-Type; browser handles it
  },
  body: formData
});
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "avatarUrl": "url-to-avatar-image",
    "uploadedAt": "2026-02-15T10:30:00Z"
  },
  "message": "Avatar uploaded successfully"
}
```

**Error Codes**:
- `400` - Invalid file format
- `413` - File too large (max 5MB)

---

### Get Avatar

**`GET /users/profile/avatar`**

Download user's avatar image.

**Auth**: Optional

**Response**: Image binary (JPEG/PNG/WebP)

**Status Codes**:
- `200` - Avatar found
- `404` - No avatar

---

### Delete Avatar

**`DELETE /users/profile/avatar`**

Remove user's avatar.

**Auth**: Required (Bearer token)

**Response (204)**: No content

---

### Get Notification Settings

**`GET /users/profile/notification-settings`**

Retrieve notification preferences.

**Auth**: Required (Bearer token)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "emailNotifications": true,
    "applicationUpdates": true,
    "jobRecommendations": true,
    "marketingEmails": false,
    "weeklyDigest": true,
    "updatedAt": "2026-02-15T10:30:00Z"
  }
}
```

---

### Update Notification Settings

**`PUT /users/profile/notification-settings`**

Modify notification preferences.

**Auth**: Required (Bearer token)

**Request**:
```json
{
  "emailNotifications": "boolean",
  "applicationUpdates": "boolean",
  "jobRecommendations": "boolean",
  "marketingEmails": "boolean",
  "weeklyDigest": "boolean"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "emailNotifications": true,
    "applicationUpdates": true,
    "jobRecommendations": true,
    "marketingEmails": false,
    "weeklyDigest": true,
    "updatedAt": "2026-02-15T10:30:00Z"
  },
  "message": "Notification settings updated"
}
```

---

### Get Privacy Settings

**`GET /users/profile/privacy-settings`**

Retrieve profile visibility and data privacy settings.

**Auth**: Required (Bearer token)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "profileVisibility": "PUBLIC",
    "showEmail": false,
    "showPhoneNumber": false,
    "searchEngineIndexed": true,
    "allowMessages": true,
    "updatedAt": "2026-02-15T10:30:00Z"
  }
}
```

---

### Update Privacy Settings

**`PUT /users/profile/privacy-settings`**

Modify profile privacy settings.

**Auth**: Required (Bearer token)

**Request**:
```json
{
  "profileVisibility": "enum (PUBLIC | PRIVATE | FRIENDS_ONLY)",
  "showEmail": "boolean",
  "showPhoneNumber": "boolean",
  "searchEngineIndexed": "boolean",
  "allowMessages": "boolean"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "profileVisibility": "PUBLIC",
    "showEmail": false,
    "showPhoneNumber": false,
    "searchEngineIndexed": true,
    "allowMessages": true,
    "updatedAt": "2026-02-15T10:30:00Z"
  }
}
```

---

### Deactivate Account

**`POST /users/profile/deactivate`**

Temporarily deactivate user account.

**Auth**: Required (Bearer token)

**Request**:
```json
{
  "password": "string (confirm current password)",
  "reason": "string (optional deactivation reason)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "status": "DEACTIVATED",
    "deactivatedAt": "2026-02-15T10:30:00Z",
    "message": "Account will be reactivated automatically after 30 days or upon login"
  }
}
```

---

### Request Account Deletion

**`POST /users/profile/delete-request`**

Request permanent account deletion (30-day waiting period).

**Auth**: Required (Bearer token)

**Request**:
```json
{
  "password": "string (confirm current password)",
  "reason": "string (optional deletion reason)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "deletionRequestedAt": "2026-02-15T10:30:00Z",
    "deletionScheduledFor": "2026-03-17T10:30:00Z",
    "message": "Account deletion scheduled. You can cancel within 30 days."
  }
}
```

---

### Cancel Account Deletion

**`POST /users/profile/cancel-deletion`**

Cancel pending account deletion.

**Auth**: Required (Bearer token)

**Response (200)**:
```json
{
  "success": true,
  "message": "Account deletion cancelled successfully"
}
```

---

## User Lookup (Public)

### Search by Email

**`GET /users/by-email?email={email}`**

Public lookup of user by email (returns limited info).

**Query Parameters**:
- `email`: User email address

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "avatar": "url-or-null",
    "role": "string"
  }
}
```

**Error Codes**:
- `404` - User not found

---

### Search by Username

**`GET /users/by-username?username={username}`**

Public lookup of user by username.

**Query Parameters**:
- `username`: User username

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "avatar": "url-or-null",
    "role": "string"
  }
}
```

---

### Check Username Availability

**`GET /users/exists/username?username={username}`**

Check if username is available (for registration).

**Query Parameters**:
- `username`: Username to check

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "available": true
  }
}
```

---

### Check Phone Number Availability

**`GET /users/exists/phone-number?phoneNumber={phone}`**

Check if phone number is registered.

**Query Parameters**:
- `phoneNumber`: Phone number to check

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "exists": false
  }
}
```

---

## Candidate Management

### Get Candidate by ID

**`GET /users/candidates/{id}`**

Retrieve candidate profile by ID.

**Auth**: Optional (more details if authenticated as HR)

**Parameters**:
- `id`: Candidate user ID (UUID)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phoneNumber": "string",
    "dateOfBirth": "2000-01-15",
    "address": "string",
    "bio": "string",
    "avatar": "url-or-null",
    "status": "ACTIVE",
    "createdAt": "2026-01-01T10:00:00Z"
  }
}
```

---

### Search Candidates

**`GET /users/candidates?keyword={keyword}&page=0&size=20`**

Search and list candidates with pagination.

**Query Parameters**:
- `keyword`: Search term (name, email, username)
- `page`: Page number (0-indexed, default 0)
- `size`: Results per page (default 20, max 100)
- `status`: Filter by status (optional)
- `sortBy`: Sort field (createdAt, firstName, etc.)
- `sortDirection`: ASC or DESC

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "candidates": [
      {
        "userId": "uuid",
        "username": "candidate_1",
        "email": "candidate@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "url-or-null",
        "createdAt": "2026-01-01T10:00:00Z"
      }
    ],
    "totalElements": 250,
    "totalPages": 13,
    "currentPage": 0,
    "pageSize": 20
  }
}
```

---

### Update Candidate (HR/Admin)

**`PUT /users/candidates/{id}`**

Update candidate profile (HR or Admin only).

**Auth**: Required (HR or ADMIN role)

**Parameters**:
- `id`: Candidate user ID

**Request**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "status": "enum (ACTIVE | INACTIVE | BLOCKED)",
  "notes": "string (admin notes, optional)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "firstName": "string",
    "lastName": "string",
    "status": "ACTIVE",
    "updatedAt": "2026-02-15T10:30:00Z"
  },
  "message": "Candidate updated successfully"
}
```

**Error Codes**:
- `403` - Insufficient permissions
- `404` - Candidate not found

---

### Delete Candidate (Admin)

**`DELETE /users/candidates/{id}`**

Permanently delete candidate account (Admin only).

**Auth**: Required (ADMIN role only)

**Parameters**:
- `id`: Candidate user ID

**Response (204)**: No content

**Error Codes**:
- `403` - Admin access required
- `404` - Candidate not found

---

## HR Management

### Get HR by ID

**`GET /users/hr/{id}`**

Retrieve HR profile by user ID.

**Auth**: Optional

**Parameters**:
- `id`: HR user ID (UUID)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "phoneNumber": "string",
    "jobTitle": "string",
    "department": "string",
    "companyId": "uuid",
    "companyName": "string",
    "status": "APPROVED",
    "createdAt": "2026-01-01T10:00:00Z"
  }
}
```

---

### Get HR by Username

**`GET /users/hr/username/{username}`**

Retrieve HR profile by username.

**Auth**: Optional

**Parameters**:
- `username`: HR username

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "companyId": "uuid",
    "companyName": "string",
    "status": "APPROVED",
    "createdAt": "2026-01-01T10:00:00Z"
  }
}
```

---

### List HR Users

**`GET /users/hr?keyword={keyword}&page=0&size=20`**

Search and list HR users with pagination.

**Query Parameters**:
- `keyword`: Search term (name, email)
- `page`: Page number (0-indexed, default 0)
- `size`: Results per page (default 20, max 100)
- `companyId`: Filter by company (optional)
- `status`: Filter by status (optional)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "hrUsers": [
      {
        "userId": "uuid",
        "username": "hr_user_1",
        "email": "hr@company.com",
        "firstName": "Jane",
        "lastName": "Smith",
        "companyName": "TechCorp",
        "status": "APPROVED",
        "createdAt": "2026-01-01T10:00:00Z"
      }
    ],
    "totalElements": 45,
    "totalPages": 3,
    "currentPage": 0,
    "pageSize": 20
  }
}
```

---

### Approve HR

**`POST /users/hr/{id}/approve`**

Approve pending HR user registration.

**Auth**: Required (HR_MANAGER role)

**Parameters**:
- `id`: HR user ID to approve

**Request**:
```json
{
  "notes": "string (optional approval notes)"
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
  "message": "HR user approved successfully"
}
```

---

### Approve HR by Username

**`POST /users/hr/username/{username}/approve`**

Approve HR by username.

**Auth**: Required (HR_MANAGER role)

**Parameters**:
- `username`: HR username to approve

**Request**:
```json
{
  "notes": "string (optional)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "HR user approved successfully"
}
```

---

## Admin Functions

### List All Users

**`GET /users/admins/all-users?keyword={keyword}&role={role}&page=0&size=20`**

List all system users (Admin only).

**Auth**: Required (ADMIN role)

**Query Parameters**:
- `keyword`: Search term
- `role`: Filter by role (CANDIDATE | HR | HR_MANAGER | ADMIN)
- `page`: Page number (0-indexed)
- `size`: Results per page
- `status`: Filter by status
- `sortBy`: Sort field

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": "uuid",
        "username": "string",
        "email": "string",
        "firstName": "string",
        "lastName": "string",
        "role": "CANDIDATE",
        "status": "ACTIVE",
        "createdAt": "2026-01-01T10:00:00Z",
        "lastLogin": "2026-02-15T08:00:00Z"
      }
    ],
    "totalElements": 1250,
    "totalPages": 63,
    "currentPage": 0
  }
}
```

---

### Block/Unblock User

**`PUT /users/admins/users/{id}/block?blocked=true`**

Block or unblock user account.

**Auth**: Required (ADMIN role)

**Parameters**:
- `id`: User ID
- `blocked`: true (block) | false (unblock)

**Request**:
```json
{
  "reason": "string (required if blocking)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "status": "BLOCKED",
    "blockedAt": "2026-02-15T10:30:00Z",
    "reason": "string"
  }
}
```

---

### Delete User

**`DELETE /users/admins/users/{id}`**

Permanently delete user account (Admin only).

**Auth**: Required (ADMIN role)

**Parameters**:
- `id`: User ID

**Response (204)**: No content

---

### Get Full User Profile

**`GET /users/admins/users/{id}/full-profile`**

Retrieve complete user profile with all details (Admin only).

**Auth**: Required (ADMIN role)

**Parameters**:
- `id`: User ID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "status": "string",
    "profile": {
      "phoneNumber": "string",
      "dateOfBirth": "date",
      "address": "string",
      "avatar": "url"
    },
    "createdAt": "2026-01-01T10:00:00Z",
    "updatedAt": "2026-02-15T10:30:00Z",
    "lastLogin": "2026-02-15T08:00:00Z",
    "applications": 5,
    "notes": "string (admin notes)"
  }
}
```

---

## Error Handling

### Standard Error Response

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
| `RESOURCE_NOT_FOUND` | 404 | User not found |
| `UNAUTHORIZED` | 401 | Invalid or missing token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `USERNAME_EXISTS` | 409 | Username already taken |
| `EMAIL_EXISTS` | 409 | Email already registered |
| `PHONE_EXISTS` | 409 | Phone number already used |
| `INVALID_FILE_FORMAT` | 400 | File type not supported |
| `FILE_TOO_LARGE` | 413 | File exceeds size limit |

---

## TypeScript Types

```typescript
// User Profile (Candidate)
interface CandidateProfile {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  bio?: string;
  avatar?: string;
  role: "CANDIDATE";
  status: "ACTIVE" | "INACTIVE" | "BLOCKED" | "DEACTIVATED";
  createdAt: string;
  updatedAt: string;
}

// User Profile (HR)
interface HRProfile {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  jobTitle: string;
  department: string;
  companyId: string;
  companyName: string;
  avatar?: string;
  role: "HR" | "HR_MANAGER";
  status: "PENDING" | "APPROVED" | "REJECTED" | "ACTIVE";
  createdAt: string;
  updatedAt: string;
}

// Notification Settings
interface NotificationSettings {
  emailNotifications: boolean;
  applicationUpdates: boolean;
  jobRecommendations: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
  updatedAt: string;
}

// Privacy Settings
interface PrivacySettings {
  profileVisibility: "PUBLIC" | "PRIVATE" | "FRIENDS_ONLY";
  showEmail: boolean;
  showPhoneNumber: boolean;
  searchEngineIndexed: boolean;
  allowMessages: boolean;
  updatedAt: string;
}

// Pagination Response
interface PaginatedResponse<T> {
  data: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// User Search Result
interface UserSearchResult {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  createdAt: string;
}
```

---

**API Version**: 1.0
**Last Updated**: 2026-02-15
**Gateway Route**: `/users/**`
