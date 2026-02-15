# WorkFitAI Frontend Documentation Index

**Last Updated**: 2026-02-15
**Version**: 0.0.1-SNAPSHOT
**Project**: WorkFitAI Platform

## Overview

This is the central index for all frontend development documentation for the WorkFitAI platform. Comprehensive API documentation for all microservices with detailed endpoint specifications, request/response examples, TypeScript types, and error handling guides.

---

## Service API Documentation

### 1. [Auth Service API](./auth-service-api.md) ✅
**Purpose**: Authentication, JWT tokens, OAuth2, 2FA, session management

**Key Coverage**:
- User registration with email OTP verification
- Login/logout with JWT access tokens and refresh tokens
- Password management (change, reset, forgot password)
- Two-factor authentication (Google Authenticator)
- Multi-device session management
- OAuth2 integration (Google, GitHub)
- Admin approval workflows (HR, HR Manager)
- 35+ endpoints with full specifications

**Base URL**: `http://localhost:9085/auth/**`

**Use this for**:
- User registration and email verification
- Login authentication with 2FA
- OAuth provider integration
- Session management
- Token refresh mechanisms

**Key Endpoints**:
- `POST /auth/register` - User registration
- `POST /auth/login` - Authentication
- `POST /auth/refresh` - Token refresh
- `GET /auth/me` - Current user info
- `POST /auth/enable-2fa` - 2FA setup
- `GET /auth/oauth/authorize/{provider}` - OAuth login

---

### 2. [User Service API](./user-service-api.md) ✅
**Purpose**: User profile management, CRUD operations, role-specific profiles

**Key Coverage**:
- Profile retrieval (Candidate, HR, Admin role-specific)
- Profile updates (first/last name, phone, bio, job title, etc.)
- Avatar upload/download management
- Notification settings (email preferences)
- Privacy settings (profile visibility, data sharing)
- Account deactivation and deletion requests
- Public user lookup (by email, username)
- Candidate management (search, update, delete)
- HR management (search, approval workflows)
- Admin functions (block/unblock, full profile view)
- 25+ endpoints

**Base URL**: `http://localhost:9085/users/**`

**Use this for**:
- Building user profile pages
- Account settings and preferences
- User search/lookup functionality
- HR user management dashboards
- Admin user administration

**Key Endpoints**:
- `GET /users/profile/me` - Current user profile
- `PUT /users/profile/candidate` - Update candidate
- `POST /users/profile/avatar` - Upload avatar
- `GET /users/candidates` - Search candidates
- `GET /users/by-email` - Public user lookup

---

### 3. [CV Service API](./cv-service-api.md) ✅
**Purpose**: CV/Resume file storage, metadata, and download management

**Key Coverage**:
- CV file upload (PDF format, max 5MB)
- CV metadata management (filename, template type)
- CV listing and retrieval (paginated)
- CV download with pre-signed URLs
- CV template types (UPLOAD, GENERAL, TECH, CREATIVE)
- MinIO object storage integration
- File access control and permissions
- 6+ endpoints

**Base URL**: `http://localhost:9085/cv/**`

**Storage Details**:
- Bucket: `cvs-files` (MinIO)
- Path format: `{username}/{applicationId}/{uuid}_{filename}`
- Max size: 5MB per file
- Format: PDF only

**Use this for**:
- CV upload in application submission
- CV selection during application
- CV preview and download
- CV file management

**Key Endpoints**:
- `POST /cv/upload` - Upload new CV
- `GET /cv/candidate/{username}` - List CVs
- `GET /cv/{cvId}` - Get CV details
- `GET /cv/candidate/download/{objectName}` - Download CV
- `DELETE /cv/candidate/{cvId}` - Delete CV

---

### 4. [Job Service API](./job-service-api.md) ✅
**Purpose**: Job postings, company management, skills catalog

**Key Coverage**:
- Public job browsing (search, filter, pagination)
- Job details with view tracking
- Featured jobs listing
- Similar jobs recommendation
- Company browsing and details
- Skills catalog and search
- HR job creation and management (CRUD)
- Job status workflow (DRAFT → PUBLISHED → CLOSED)
- Banner/image upload for jobs
- Company and skill management
- Advanced filtering (salary, location, employment type, skills)
- 20+ endpoints

**Base URL**: `http://localhost:9085/job/**`

**Enumerations**:
- **Employment Type**: FULL_TIME, PART_TIME, CONTRACT, TEMPORARY
- **Experience Level**: ENTRY_LEVEL, MID_LEVEL, SENIOR, LEAD, EXECUTIVE
- **Job Status**: DRAFT, PUBLISHED, CLOSED
- **Remote Work**: ON_SITE, HYBRID, REMOTE

**Use this for**:
- Job listing and search pages
- Job detail pages
- Company browsing
- HR job posting management
- Skill/requirement selection

**Key Endpoints**:
- `GET /job/public/jobs` - Browse jobs
- `GET /job/public/jobs/{id}` - Job details
- `GET /job/public/companies` - Browse companies
- `POST /job/hr/jobs` - Create job (HR)
- `PUT /job/hr/jobs/{id}/{status}` - Update status (HR)

---

### 5. [Application Service API](./application-service-api.md) ✅
**Purpose**: Job applications, draft workflow, status tracking, analytics

**Key Coverage**:
- Application submission with Saga pattern (atomic, reliable)
- Draft applications (save incomplete applications)
- Application status tracking and history
- HR notes (internal and candidate-visible)
- Company isolation and HR assignment
- Advanced search with multiple filters
- Bulk status updates
- Analytics and reporting (HR, Manager, Admin)
- CSV/Excel export (rate-limited)
- Audit logging for compliance
- 40+ endpoints across all roles

**Base URL**: `http://localhost:9085/api/v1/applications/**`

**Application Status Flow**:
- DRAFT → APPLIED → REVIEWING → INTERVIEW_SCHEDULED → INTERVIEW_COMPLETED → OFFER → HIRED/REJECTED/WITHDRAWN

**Key Features**:
- **Saga Pattern**: Ensures reliable application submission with CV upload
- **Draft Workflow**: Save incomplete applications, submit later
- **Job Snapshot**: Preserves job details at application time
- **Status History**: Tracks all status changes with reasons
- **HR Notes**: Internal notes and candidate-visible messages
- **Company Isolation**: Applications isolated by company
- **HR Assignment**: Assign applications to specific HR users

**Use this for**:
- Application submission workflow
- Application tracking (candidate view)
- HR application review
- HR analytics and dashboards
- Admin reporting

**Key Endpoints - Candidate**:
- `POST /api/v1/applications` - Submit application
- `GET /api/v1/applications/my` - My applications
- `POST /api/v1/applications/draft` - Create draft
- `DELETE /api/v1/applications/{id}` - Withdraw

**Key Endpoints - HR**:
- `GET /api/v1/applications/job/{jobId}` - Job applications
- `PUT /api/v1/applications/{id}/status` - Update status
- `POST /api/v1/applications/{id}/notes` - Add note
- `GET /api/v1/applications/hr/dashboard` - Dashboard stats

**Key Endpoints - HR Manager**:
- `GET /api/v1/applications/company/{companyId}` - Company apps
- `PUT /api/v1/applications/{id}/assign` - Assign to HR
- `GET /api/v1/applications/manager/stats` - Manager stats
- `GET /api/v1/applications/export` - Export to CSV/Excel

**Key Endpoints - Admin**:
- `GET /api/v1/applications/admin/all` - All applications
- `GET /api/v1/applications/admin/stats` - System stats
- `GET /api/v1/applications/admin/audit` - Audit logs

---

## Reference Documentation

### 6. [Authentication Flows](./AUTH-FLOWS.md) ✅
**Purpose**: Detailed authentication and authorization patterns

**Use this for**: Understanding user flows, role-based routing, permission checks

---

### 7. [API Integration Guide](./API-INTEGRATION-GUIDE.md) ✅
**Purpose**: General API patterns and best practices

**Use this for**: HTTP patterns, error handling, pagination, response formats

---

## Quick Start Guide

### Setup Authentication
1. Read [Auth Service API](./auth-service-api.md) for registration/login
2. Implement JWT token storage (access + refresh tokens)
3. Set up API interceptor to attach `Authorization: Bearer {token}` header
4. Handle token refresh on 401 responses

### Build Job Listing
1. Use [Job Service API](./job-service-api.md) public endpoints
2. `GET /job/public/jobs` for browsing
3. `GET /job/public/jobs/{id}` for details
4. Implement filtering by employment type, experience level, salary, skills

### Build Application Submission
1. Use [CV Service API](./cv-service-api.md) for CV management
2. Use [Application Service API](./application-service-api.md) for submission
3. `POST /api/v1/applications/draft` to create draft
4. `PUT /api/v1/applications/{id}/draft` to update
5. `POST /api/v1/applications/{id}/submit` to submit
6. Monitor application status with `GET /api/v1/applications/{id}`

### Build HR Dashboard
1. Use [Application Service API](./application-service-api.md) HR endpoints
2. `GET /api/v1/applications/job/{jobId}` for applications
3. `GET /api/v1/applications/job/{jobId}/stats` for analytics
4. `PUT /api/v1/applications/{id}/status` to update status
5. `POST /api/v1/applications/{id}/notes` for notes

---

## Authentication Pattern

All authenticated endpoints require JWT Bearer token:

```javascript
const headers = {
  "Authorization": `Bearer ${accessToken}`,
  "Content-Type": "application/json"
};
```

**Token Management**:
- Access token: 15 minutes validity
- Refresh token: 7 days validity
- Refresh token stored in HttpOnly cookie
- Use `POST /auth/refresh` when access token expires
- Logout with `POST /auth/logout` to revoke tokens

---

## Error Handling Pattern

All APIs follow standard error format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  },
  "timestamp": "2026-02-15T10:30:00Z"
}
```

**Common HTTP Status Codes**:
- `200` - Success
- `201` - Created
- `204` - No content (success with no body)
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (duplicate, invalid state)
- `413` - Payload too large (file size)
- `429` - Rate limit exceeded
- `500` - Server error

---

## File Upload Pattern

For multipart/form-data uploads (CV, avatar, banner):

```javascript
const formData = new FormData();
formData.append("file", fileObject);
formData.append("otherField", "value");

const response = await fetch('http://localhost:9085/endpoint', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
    // Don't set Content-Type; browser sets with boundary
  },
  body: formData
});
```

---

## Pagination Pattern

List endpoints support pagination:

```javascript
GET /api/endpoint?page=0&size=20&sortBy=createdAt&sortDirection=DESC
```

**Response**:
```json
{
  "data": [ /* items */ ],
  "totalElements": 250,
  "totalPages": 13,
  "currentPage": 0,
  "pageSize": 20
}
```

---

## Response Format

All successful responses follow:

```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "message": "Operation completed",
  "timestamp": "2026-02-15T10:30:00Z"
}
```

---

## Support and Resources

**Documentation Files**:
1. [Auth Service API](./auth-service-api.md) - 35+ authentication endpoints
2. [User Service API](./user-service-api.md) - 25+ user management endpoints
3. [CV Service API](./cv-service-api.md) - 6+ CV/file endpoints
4. [Job Service API](./job-service-api.md) - 20+ job & company endpoints
5. [Application Service API](./application-service-api.md) - 40+ application endpoints
6. [Authentication Flows](./AUTH-FLOWS.md) - Flow diagrams and patterns
7. [API Integration Guide](./API-INTEGRATION-GUIDE.md) - General patterns

**External Resources**:
- Postman Collections: `/api-docs/*.postman_collection.json`
- Backend Documentation: `/docs/`
- System Architecture: `/docs/system-architecture.md`
- Codebase Summary: `/docs/codebase-summary.md`

**For Questions**:
1. Check the specific service API documentation
2. Review existing code examples
3. Check Postman collections for real requests
4. Review backend source code DTOs and validation

---

## Summary

This frontend documentation provides:

✅ **5 Comprehensive Service APIs** - 125+ endpoints documented
✅ **Detailed Request/Response Schemas** - Real-world examples
✅ **TypeScript Type Definitions** - Copy-paste ready interfaces
✅ **Authentication & Authorization** - Secure token management
✅ **Error Handling** - Consistent error formats
✅ **File Upload Patterns** - CV, avatar, banner uploads
✅ **Pagination & Filtering** - Advanced query support
✅ **Role-Based Access** - Candidate, HR, Manager, Admin
✅ **Analytics & Reporting** - Dashboard data endpoints
✅ **Saga Pattern** - Reliable application submission

**Frontend developers can now**:
- Implement complete authentication flows
- Integrate all 125+ API endpoints
- Build role-specific UIs and dashboards
- Handle file uploads securely
- Implement advanced search and filtering
- Create analytics dashboards
- Handle errors gracefully
- Manage application state effectively

**Expected Implementation Timeline**:
- Authentication: 1-2 days
- Job browsing: 2-3 days
- Application submission: 3-4 days
- HR dashboard: 3-4 days
- User profiles: 2 days
- Total: 2-3 weeks for full platform

---

**API Version**: 1.0
**Last Updated**: 2026-02-15
**Gateway**: `http://localhost:9085`
**Frontend Port**: 3000
