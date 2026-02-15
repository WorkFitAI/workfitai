# Frontend API Integration Guide

**Last Updated**: 2025-12-08
**Version**: 0.0.1-SNAPSHOT
**Project**: WorkFitAI Platform

## Overview

This guide provides complete API endpoint reference for frontend developers integrating with the WorkFitAI backend services. All endpoints are routed through the API Gateway at `http://localhost:9085` (development).

## Base URLs

### Development Environment
- **API Gateway**: `http://localhost:9085`

### Production Environment
- **API Gateway**: `https://api.workfitai.com` (TBD)

**IMPORTANT**: Always use the API Gateway URL in production. Direct service URLs are for development/debugging only.

---

## Authentication & Authorization

### Authentication Header

All protected endpoints require JWT authentication:

```typescript
headers: {
  'Authorization': `Bearer ${opaqueToken}`,
  'X-Device-Id': deviceId // Optional but recommended for refresh token rotation
}
```

### Token Management

#### Access Token
- **Lifetime**: 15 minutes
- **Format**: JWT (RSA-2048 signed)
- **Storage**: Memory or sessionStorage (NEVER localStorage for security)
- **Claims**: `sub` (username), `roles`, `exp`, `iat`

#### Refresh Token
- **Lifetime**: 7 days
- **Format**: Opaque token
- **Storage**: HttpOnly cookie (automatic, handled by browser)
- **Rotation**: New refresh token issued on each refresh

---

## API Endpoints Reference

### 1. Authentication Service (`/auth`)

#### 1.1 Register User

**Endpoint**: `POST /auth/register`
**Access**: Public
**Purpose**: Register new user (Candidate, HR, or HR_MANAGER)

**Request Body**:
```typescript
interface RegisterRequest {
  email: string;               // Required, valid email format
  password: string;            // Required, min 8 chars, max 128 chars
  role: 'CANDIDATE' | 'HR' | 'HR_MANAGER' | 'ADMIN'; // Required
  fullName: string;            // Required, 3-255 chars
  phoneNumber: string;         // Required, format: +84xxxxxxxxxx or 10 digits
  hrProfile?: {                // Required for HR and HR_MANAGER
    department: string;
    hrManagerEmail: string; // Required for HR only
    address: string;
  };
  company?: {                  // Required for HR_MANAGER only
    name: string;
    logoUrl?: string;
    websiteUrl?: string;
    description?: string;
    address: string;
    size?: string;
  };
}
```

**Response** (200 OK):
```typescript
interface RegisterResponse {
  success: boolean;
  message: string;  // "OTP has been sent to your email for verification"
  data: string;
}
```

**Validation Rules**:
- Email must be valid format and unique
- Password minimum 8 characters
- Phone number format: `+84xxxxxxxxxx` or 10 digits
- Full name between 3-255 characters
- HR and HR_MANAGER require `hrProfile`
- HR_MANAGER requires `company` object

---

#### 1.2 Verify OTP

**Endpoint**: `POST /auth/verify-otp`
**Access**: Public
**Purpose**: Verify email with OTP sent during registration

**Request Body**:
```typescript
interface VerifyOtpRequest {
  email: string;
  otp: string;
}
```

**Response** (200 OK):
```typescript
interface VerifyOtpResponse {
  success: boolean;
  message: string;  // "Account verified"
  data: null;
}
```

---

#### 1.3 Login

**Endpoint**: `POST /auth/login`
**Access**: Public
**Purpose**: Authenticate user and receive JWT tokens

**Request Body**:
```typescript
interface LoginRequest {
  usernameOrEmail: string;   // Can be username or email
  password: string;          // Min 8 chars
}
```

**Request Headers**:
```typescript
{
  'X-Device-Id': string;     // Optional, for refresh token rotation
}
```

**Response** (200 OK):
```typescript
interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;       // JWT access token
    expiryInMinutes: number;   // Token expiry (typically 900000ms = 15 min)
    username: string;          // User's username
    roles: string[];           // Array of roles (e.g., ["ROLE_CANDIDATE"])
  };
}
```

**Response Headers**:
```
Set-Cookie: refreshToken={token}; HttpOnly; Path=/; Max-Age=604800
```

**Error Responses**:
- **401 Unauthorized**: Invalid credentials
- **403 Forbidden**: Account pending approval (HR/HR_MANAGER)

---

#### 1.4 Refresh Token

**Endpoint**: `POST /auth/refresh`
**Access**: Public (requires refresh token cookie)
**Purpose**: Get new access token using refresh token

**Request Headers**:
```typescript
{
  'X-Device-Id': string;  // Same device ID from login
}
```

**Request Cookies** (automatic):
```
RT={token}
```

**Response** (200 OK):
```typescript
interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    expiryInMinutes: number;
    username: string;
    roles: string[];
  };
}
```

**Response Headers**:
```
Set-Cookie: refreshToken={newToken}; HttpOnly; Path=/; Max-Age=604800
```

**Error Responses**:
- **401 Unauthorized**: Invalid or expired refresh token

---

#### 1.5 Logout

**Endpoint**: `POST /auth/logout`
**Access**: Protected (requires JWT)
**Purpose**: Invalidate tokens and clear session

**Request Headers**:
```typescript
{
  'Authorization': `Bearer ${accessToken}`,
  'X-Device-Id': string
}
```

**Response** (200 OK):
```typescript
interface LogoutResponse {
  success: boolean;
  message: string;  // "Logged out successfully"
  data: null;
}
```

**Response Headers**:
```
Set-Cookie: refreshToken=; HttpOnly; Path=/; Max-Age=0  // Clears cookie
```

---

### 2. User Service (`/users`)

#### 2.1 Get User by Email

**Endpoint**: `GET /users/by-email?email={email}`
**Access**: Protected (internal service calls)
**Purpose**: Fetch user information by email

**Query Parameters**:
- `email` (required): User's email address

**Response** (200 OK):
```typescript
interface UserResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;             // UUID
    username: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    userRole: 'CANDIDATE' | 'HR' | 'HR_MANAGER' | 'ADMIN';
    userStatus: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'WAIT_APPROVED';
    lastLogin: string;          // ISO 8601 timestamp
    createdBy: string;
    createdDate: string;
    lastModifiedBy: string;
    lastModifiedDate: string;
    isDeleted: boolean;
  };
}
```

---

#### 2.2 Get User by Username

**Endpoint**: `GET /user/by-username?username={username}`
**Access**: Protected
**Purpose**: Fetch user information by username

**Query Parameters**:
- `username` (required): User's username

**Response**: Same as Get User by Email

---

### 3. Job Service (`/job`)

#### 3.1 Get Published Jobs (Public)

**Endpoint**: `GET /public/jobs`
**Access**: Public
**Purpose**: Browse published job listings with filtering and pagination

**Query Parameters**:
```typescript
{
  page?: number;              // Default: 0
  size?: number;              // Default: 20, max: 100
  sort?: string;              // Example: 'createdDate,desc'
  filter?: string;            // Spring Filter syntax for complex queries
}
```

**Filter Examples**:
```typescript
// Filter by employment type
filter: "employmentType:'FULL_TIME'"

// Filter by experience level
filter: "experienceLevel:'MID_LEVEL'"

// Filter by salary range
filter: "salaryMin>50000 and salaryMax<100000"

// Filter by company
filter: "company.name~'Tech'"

// Combined filters
filter: "employmentType:'FULL_TIME' and experienceLevel:'SENIOR' and status:'PUBLISHED'"
```

**Response** (200 OK):
```typescript
interface JobListResponse {
  success: boolean;
  message: string;
  data: {
    result: Job[];
    meta: {
      page: number;
      pageSize: number;
      pages: number;
      total: number;
    };
  };
}

interface Job {
  postId: string;              // UUID
  title: string;
  description: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'REMOTE';
  experienceLevel: 'ENTRY' | 'MID_LEVEL' | 'SENIOR' | 'LEAD';
  salaryMin: number;
  salaryMax: number;
  currency: string;            // e.g., 'VND', 'USD'
  expiresAt: string;           // ISO 8601 timestamp
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  educationLevel: string;
  skillNames: string[];
  company: {
    companyId: string;
    name: string;
    logoUrl: string;
    websiteUrl: string;
    description: string;
    address: string;
    size: string;
    industry: string;
  };
  createdDate: string;
  createdBy: string;           // HR username
}
```

---

#### 3.2 Get Job by ID (Public)

**Endpoint**: `GET /public/jobs/{id}`
**Access**: Public
**Purpose**: Get detailed information about a specific job

**Path Parameters**:
- `id` (required): Job UUID

**Response** (200 OK):
```typescript
interface JobDetailsResponse {
  success: boolean;
  message: string;
  data: Job;  // Same structure as Job above
}
```

**Error Responses**:
- **404 Not Found**: Job does not exist

**Example**:
```typescript
const jobId = '550e8400-e29b-41d4-a716-446655440000';
const response = await fetch(`http://localhost:9085/public/jobs/${jobId}`);
```

---

#### 3.3 Create Job (HR Only)

**Endpoint**: `POST /hr/jobs`
**Access**: Protected (HR, HR_MANAGER, ADMIN)
**Purpose**: Create a new job posting

**Request Headers**:
```typescript
{
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

**Request Body**:
```typescript
interface CreateJobRequest {
  title: string;               // Required
  description: string;         // Required
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'REMOTE';
  experienceLevel: 'ENTRY' | 'MID_LEVEL' | 'SENIOR' | 'LEAD';
  salaryMin: number;
  salaryMax: number;
  currency: string;            // Default: 'VND'
  expiresAt: string;           // ISO 8601 date
  educationLevel?: string;
  skillIds: string[];          // Array of skill UUIDs
  companyId: string;           // Company UUID
}
```

**Response** (201 Created):
```typescript
interface CreateJobResponse {
  success: boolean;
  message: string;
  data: {
    postId: string;            // UUID of created job
    title: string;
    status: 'DRAFT';           // New jobs start as DRAFT
    createdBy: string;
    createdDate: string;
  };
}
```

---

#### 3.4 Update Job Status (HR Only)

**Endpoint**: `PUT /hr/jobs/{id}/{status}`
**Access**: Protected (HR, HR_MANAGER, ADMIN)
**Purpose**: Change job status (DRAFT → PUBLISHED → CLOSED)

**Path Parameters**:
- `id`: Job UUID
- `status`: 'DRAFT' | 'PUBLISHED' | 'CLOSED'

**Response** (200 OK):
```typescript
interface UpdateStatusResponse {
  success: boolean;
  message: string;
  data: {
    postId: string;
    status: string;
    updatedDate: string;
  };
}
```

---

### 4. Application Service (`/application`)

#### 4.1 Submit Application (Candidate Only)

**Endpoint**: `POST /applications`
**Access**: Protected (CANDIDATE only)
**Purpose**: Submit job application with CV upload

**Request Headers**:
```typescript
{
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'multipart/form-data'
}
```

**Request Body** (multipart/form-data):
```typescript
interface CreateApplicationRequest {
  jobId: string;               // Required, UUID
  email: string;               // Required, valid email
  cvPdfFile: File;             // Required, PDF only, max 5MB
  coverLetter?: string;        // Optional, max 5000 chars
}
```

**Response** (201 Created):
```typescript
interface ApplicationResponse {
  success: boolean;
  message: string;
  data: {
    id: string;                // Application ID (MongoDB ObjectId)
    username: string;
    email: string;
    jobId: string;
    jobSnapshot: {
      title: string;
      companyName: string;
      location: string;
      employmentType: string;
      experienceLevel: string;
      snapshotAt: string;
    };
    cvFileUrl: string;         // MinIO URL
    cvFileName: string;
    coverLetter: string;
    status: 'APPLIED';
    createdAt: string;
    updatedAt: string;
  };
}
```

**Validation Rules**:
- CV file must be PDF format
- CV file size max 5MB
- Cover letter max 5000 characters
- Cannot apply twice to same job (duplicate check)
- Job must be in PUBLISHED status

**Error Responses**:
- **400 Bad Request**: Invalid file, duplicate application
- **404 Not Found**: Job not found
- **409 Conflict**: Already applied to this job

---

#### 4.2 Get My Applications (Candidate)

**Endpoint**: `GET /application/my`
**Access**: Protected (CANDIDATE)
**Purpose**: Retrieve candidate's own applications with pagination

**Query Parameters**:
```typescript
{
  status?: 'APPLIED' | 'REVIEWING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';
  page?: number;              // Default: 0
  size?: number;              // Default: 10, max: 100
}
```

**Response** (200 OK):
```typescript
interface MyApplicationsResponse {
  success: boolean;
  message: string;
  data: {
    result: Application[];
    meta: {
      page: number;
      pageSize: number;
      pages: number;
      total: number;
    };
  };
}
```

---

#### 4.3 Get Application by ID

**Endpoint**: `GET /applications/{id}`
**Access**: Protected (owner or HR)
**Purpose**: Get detailed application information

**Path Parameters**:
- `id`: Application ID (MongoDB ObjectId)

**Response** (200 OK):
```typescript
interface ApplicationDetailsResponse {
  success: boolean;
  message: string;
  data: Application;
}
```

**Error Responses**:
- **403 Forbidden**: Not authorized to view this application
- **404 Not Found**: Application not found

---

#### 4.4 Get Applications by Job (HR Only)

**Endpoint**: `GET /application/job/{jobId}`
**Access**: Protected (HR, HR_MANAGER, ADMIN)
**Purpose**: Get all applications for a specific job

**Path Parameters**:
- `jobId`: Job UUID

**Query Parameters**:
```typescript
{
  status?: ApplicationStatus;
  page?: number;
  size?: number;
}
```

**Response**: Same as Get My Applications

---

#### 4.5 Update Application Status (HR Only)

**Endpoint**: `PUT /application/{id}/status?status={status}`
**Access**: Protected (HR, HR_MANAGER, ADMIN)
**Purpose**: Change application status in hiring pipeline

**Path Parameters**:
- `id`: Application ID

**Query Parameters**:
- `status`: 'APPLIED' | 'REVIEWING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED'

**Response** (200 OK):
```typescript
interface UpdateStatusResponse {
  success: boolean;
  message: string;
  data: Application;  // Updated application
}
```

---

#### 4.6 Withdraw Application (Candidate Only)

**Endpoint**: `DELETE /application/{id}`
**Access**: Protected (owner only)
**Purpose**: Withdraw application and delete CV

**Path Parameters**:
- `id`: Application ID

**Response** (204 No Content)

**Error Responses**:
- **403 Forbidden**: Not the application owner
- **404 Not Found**: Application not found

---

#### 4.7 Check if Applied

**Endpoint**: `GET /application/check?jobId={jobId}`
**Access**: Protected (CANDIDATE)
**Purpose**: Check if user has already applied to a job

**Query Parameters**:
- `jobId`: Job UUID

**Response** (200 OK):
```typescript
interface CheckAppliedResponse {
  success: boolean;
  message: string;
  data: {
    applied: boolean;
  };
}
```

---

#### 4.8 Get My Application Count

**Endpoint**: `GET /application/my/count`
**Access**: Protected (CANDIDATE)
**Purpose**: Get total number of applications submitted

**Response** (200 OK):
```typescript
interface CountResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
  };
}
```

---

## Error Handling

### Standard Error Response

All API errors follow this format:

```typescript
interface ErrorResponse {
  success: false;
  error: string;               // Error code
  message: string;             // Human-readable message
  timestamp: string;           // ISO 8601 timestamp
  path?: string;               // Request path
  details?: any;               // Additional error details
}
```

### Common HTTP Status Codes

- **200 OK**: Successful GET, PUT, POST
- **201 Created**: Successful resource creation
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Validation error, invalid input
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Authenticated but not authorized
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate resource (e.g., already applied)
- **500 Internal Server Error**: Server-side error

### Error Codes

```typescript
enum ErrorCode {
  // Authentication
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  ACCOUNT_PENDING_APPROVAL = 'ACCOUNT_PENDING_APPROVAL',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_FILE = 'INVALID_FILE',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',

  // Business Logic
  DUPLICATE_APPLICATION = 'DUPLICATE_APPLICATION',
  JOB_NOT_FOUND = 'JOB_NOT_FOUND',
  JOB_NOT_PUBLISHED = 'JOB_NOT_PUBLISHED',
  APPLICATION_NOT_FOUND = 'APPLICATION_NOT_FOUND',

  // Authorization
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS'
}
```

### Example Error Handling

```typescript
try {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json();

    switch (error.error) {
      case 'INVALID_CREDENTIALS':
        showError('Invalid username or password');
        break;
      case 'TOKEN_EXPIRED':
        await refreshToken();
        // Retry request
        break;
      case 'DUPLICATE_APPLICATION':
        showError('You have already applied to this job');
        break;
      default:
        showError(error.message);
    }

    throw new Error(error.message);
  }

  return await response.json();
} catch (err) {
  console.error('API Error:', err);
  throw err;
}
```

---

## Pagination

### Request Parameters

```typescript
{
  page: number;      // 0-indexed page number
  size: number;      // Items per page (max: 100)
  sort?: string;     // Format: 'field,direction' e.g., 'createdAt,desc'
}
```

### Response Format

```typescript
interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    result: T[];
    meta: {
      page: number;        // Current page (0-indexed)
      pageSize: number;    // Items per page
      pages: number;       // Total pages
      total: number;       // Total items
    };
  };
}
```

## File Upload

### Multipart Form Data

For endpoints that accept file uploads (e.g., application submission):

```typescript
const formData = new FormData();
formData.append('jobId', jobId);
formData.append('email', email);
formData.append('cvPdfFile', fileInput.files[0]);
formData.append('coverLetter', coverLetterText);

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    // DO NOT set Content-Type - browser will set it with boundary
  },
  body: formData
});
```

### File Validation

**CV File Requirements**:
- Format: PDF only (`application/pdf`)
- Max Size: 10MB
- Required: Yes

**Client-Side Validation**:
```typescript
function validateCVFile(file: File): string | null {
  if (!file) return 'CV file is required';
  if (file.type !== 'application/pdf') return 'CV must be a PDF file';
  if (file.size > 5 * 1024 * 1024) return 'CV file must be under 5MB';
  return null;
}
```

---

## CORS Configuration

### Allowed Origins (Development)
- `http://localhost:3000` (React)

### Allowed Headers
- `Authorization`
- `Content-Type`
- `X-Device-Id`

### Allowed Methods
- GET, POST, PUT, DELETE, OPTIONS

### Credentials
- `credentials: 'include'` required for cookie-based authentication

---

## Rate Limiting (Planned)

**Current Status**: Not implemented
**Future Implementation**:
- 100 requests per minute per IP
- 1000 requests per hour per user
- Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

## Testing & Development

### Sample Seeded Data

**Admin Account**:
- usernameOrEmail: `admin@workfitai.com`
- password: `admin123`

**HR Manager**:
- usernameOrEmail: `hrmanager@techcorp.com`
- password: `hrmanager123`

**HR Staff**:
- usernameOrEmail: `hr@techcorp.com`
- password: `hr123`

---

## Best Practices

### 1. Error Handling

```typescript
class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
  }
}

// Usage
try {
  const jobs = await apiClient.get('/public/jobs');
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        handleValidationError(error.details);
        break;
      default:
        showNotification(error.message);
    }
  }
}
```

---

## Summary

This API integration guide provides:
- Complete endpoint reference for all services
- Request/response TypeScript interfaces
- Authentication and authorization patterns
- Error handling strategies
- File upload specifications
- Pagination and filtering examples
- Best practices for API integration

**Next Steps**:
1. Review authentication flows in `AUTH-FLOWS.md`
2. Study application workflows in `APPLICATION-FLOWS.md`
3. Implement role-based UI using `ROLE-BASED-UI-SPECS.md`
