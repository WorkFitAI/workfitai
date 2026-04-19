# Application Service API Reference

> **Base URL**: `http://localhost:9085`
> **Frontend Port**: 3000
> **Last Updated**: 2026-02-15

## Overview

The Application Service manages job applications from submission through hiring/rejection. It uses the Saga pattern for distributed transactions and supports draft applications, status tracking, HR notes, and analytics. All endpoints are proxied through the API Gateway at port 8088.

**Key Features**:
- Draft application workflow (save and submit later)
- Saga pattern for reliable application submission
- CV upload and storage in MinIO
- Application status tracking and history
- HR notes (internal and candidate-visible)
- Company isolation and HR assignment
- Advanced search and bulk operations
- Analytics and reporting

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

All application endpoints require JWT Bearer token:

```javascript
const headers = {
  "Authorization": `Bearer ${accessToken}`,
  "Content-Type": "application/json"
};
```

For file uploads use multipart/form-data:
```javascript
const formData = new FormData();
formData.append("file", cvFile);
formData.append("jobId", jobId);
formData.append("coverLetter", "optional message");

fetch('http://localhost:9085/application', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
    // Don't set Content-Type for multipart
  },
  body: formData
});
```

---

## Candidate Endpoints

### Submit Application

**`POST /application`**

Submit job application with CV upload (multipart/form-data).

**Auth**: Required (CANDIDATE role)

**Request (multipart/form-data)**:
- `jobId`: Job ID (UUID, required)
- `file`: PDF CV file (required, max 5MB)
- `coverLetter`: Cover letter text (optional, max 5000 chars)

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "applicationId": "uuid",
    "jobId": "uuid",
    "jobTitle": "Senior Software Engineer",
    "companyName": "TechCorp Inc",
    "status": "APPLIED",
    "appliedAt": "2026-02-15T10:30:00Z",
    "cvFileName": "resume.pdf",
    "coverLetter": "string (max 5000 chars)",
    "message": "Application submitted successfully"
  }
}
```

**Saga Steps**:
1. Validate job exists and is published
2. Validate no duplicate application exists
3. Validate and upload CV to MinIO
4. Save application to MongoDB
5. Publish Kafka events (notification, job stats)

**Error Codes**:
- `400` - Invalid job ID, invalid file format, validation error
- `401` - Unauthorized
- `403` - Forbidden (not a candidate)
- `404` - Job not found
- `409` - Duplicate application (already applied to this job)
- `413` - File too large

---

### Get My Applications

**`GET /application/my?page=0&size=20&status=APPLIED`**

List all applications submitted by current candidate (paginated).

**Auth**: Required (CANDIDATE role)

**Query Parameters**:
- `page`: Page number (0-indexed, default 0)
- `size`: Results per page (default 20, max 100)
- `status`: Filter by status (optional)
- `sortBy`: createdAt, status (default createdAt)
- `sortDirection`: ASC or DESC

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "applicationId": "uuid",
        "jobId": "uuid",
        "jobTitle": "Senior Software Engineer",
        "companyName": "TechCorp Inc",
        "status": "APPLIED",
        "appliedAt": "2026-02-15T10:30:00Z",
        "lastUpdated": "2026-02-15T10:30:00Z"
      }
    ],
    "totalElements": 8,
    "totalPages": 1,
    "currentPage": 0,
    "pageSize": 20
  }
}
```

---

### Get Application Details

**`GET /application/{applicationId}`**

Get detailed application information.

**Auth**: Required (CANDIDATE role, must own application)

**Parameters**:
- `applicationId`: Application UUID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "applicationId": "uuid",
    "jobId": "uuid",
    "jobTitle": "Senior Software Engineer",
    "companyName": "TechCorp Inc",
    "companyId": "uuid",
    "status": "REVIEWING",
    "appliedAt": "2026-02-15T10:30:00Z",
    "cvFileName": "resume.pdf",
    "coverLetter": "string",
    "jobSnapshot": {
      "title": "Senior Software Engineer",
      "description": "string",
      "companyName": "TechCorp Inc",
      "location": "San Francisco, CA",
      "employmentType": "FULL_TIME",
      "salaryMin": 120000,
      "salaryMax": 180000
    },
    "statusHistory": [
      {
        "status": "APPLIED",
        "changedAt": "2026-02-15T10:30:00Z",
        "changedBy": "system"
      },
      {
        "status": "REVIEWING",
        "changedAt": "2026-02-15T12:00:00Z",
        "changedBy": "hr_user_1"
      }
    ],
    "candidateVisibleNotes": [
      {
        "id": "uuid",
        "author": "HR Team",
        "content": "We are reviewing your application",
        "createdAt": "2026-02-15T11:00:00Z"
      }
    ]
  }
}
```

---

### Check If Already Applied

**`GET /application/check?jobId={jobId}`**

Check if candidate has already applied to a job.

**Auth**: Required (CANDIDATE role)

**Query Parameters**:
- `jobId`: Job UUID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "applied": true,
    "applicationId": "uuid (if applied)",
    "status": "APPLIED (if applied)"
  }
}
```

---

### Get Application Count

**`GET /application/my/count`**

Get total count of candidate's applications.

**Auth**: Required (CANDIDATE role)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "totalApplications": 8
  }
}
```

---

### Withdraw Application

**`DELETE /application/{applicationId}`**

Withdraw submitted application (soft delete).

**Auth**: Required (CANDIDATE role, must own application)

**Parameters**:
- `applicationId`: Application UUID

**Response (204)**: No content

**Note**: Application marked as WITHDRAWN, not permanently deleted.

**Error Codes**:
- `404` - Application not found
- `403` - Cannot withdraw (wrong candidate)
- `409` - Application already withdrawn/closed

---

## Draft Application Workflow

### Create Draft Application

**`POST /application/draft`**

Create a draft application without CV (save for later).

**Auth**: Required (CANDIDATE role)

**Request**:
```json
{
  "jobId": "uuid (required)",
  "coverLetter": "string (optional, max 5000 chars)"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "applicationId": "uuid",
    "jobId": "uuid",
    "jobTitle": "Senior Software Engineer",
    "status": "DRAFT",
    "createdAt": "2026-02-15T10:30:00Z",
    "message": "Draft created. You can update and submit later."
  }
}
```

---

### Update Draft Application

**`PUT /application/{applicationId}/draft`**

Update draft application (CV, cover letter).

**Auth**: Required (CANDIDATE role, must own draft)

**Parameters**:
- `applicationId`: Draft application UUID

**Request (multipart/form-data)**:
- `file`: PDF CV file (optional)
- `coverLetter`: Cover letter text (optional)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "applicationId": "uuid",
    "jobId": "uuid",
    "status": "DRAFT",
    "hasCV": true,
    "coverLetter": "string",
    "updatedAt": "2026-02-15T10:35:00Z"
  },
  "message": "Draft updated"
}
```

**Error Codes**:
- `400` - Invalid CV file
- `404` - Draft not found
- `409` - Draft no longer in DRAFT status

---

### Submit Draft Application

**`POST /application/{applicationId}/submit`**

Submit draft application (triggers Saga workflow).

**Auth**: Required (CANDIDATE role)

**Parameters**:
- `applicationId`: Draft application UUID

**Request**:
```json
{
  "coverLetter": "string (optional, can update before submit)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "applicationId": "uuid",
    "status": "APPLIED",
    "appliedAt": "2026-02-15T10:40:00Z",
    "message": "Application submitted successfully"
  }
}
```

**Error Codes**:
- `400` - Draft incomplete (missing CV)
- `404` - Draft not found
- `409` - Job closed or no longer available

---

### List My Drafts

**`GET /application/drafts?page=0&size=20`**

Get all draft applications for candidate.

**Auth**: Required (CANDIDATE role)

**Query Parameters**:
- `page`: Page number
- `size`: Results per page (default 20)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "drafts": [
      {
        "applicationId": "uuid",
        "jobId": "uuid",
        "jobTitle": "Senior Software Engineer",
        "companyName": "TechCorp Inc",
        "hasCV": true,
        "hasCoverLetter": true,
        "createdAt": "2026-02-15T09:00:00Z",
        "updatedAt": "2026-02-15T10:30:00Z"
      }
    ],
    "totalElements": 3,
    "totalPages": 1,
    "currentPage": 0
  }
}
```

---

### View Status History

**`GET /application/{applicationId}/status-history`**

View all status changes for an application.

**Auth**: Required (CANDIDATE role, must own application)

**Parameters**:
- `applicationId`: Application UUID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "statusHistory": [
      {
        "previousStatus": null,
        "newStatus": "APPLIED",
        "changedBy": "system",
        "changedAt": "2026-02-15T10:30:00Z",
        "reason": "Application submitted"
      },
      {
        "previousStatus": "APPLIED",
        "newStatus": "REVIEWING",
        "changedBy": "hr_user_1",
        "changedAt": "2026-02-15T12:00:00Z",
        "reason": "Started review"
      }
    ]
  }
}
```

---

### View Candidate-Visible Notes

**`GET /application/{applicationId}/notes`**

Get notes visible to candidate.

**Auth**: Required (CANDIDATE role)

**Parameters**:
- `applicationId`: Application UUID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "uuid",
        "author": "HR Team",
        "content": "We are reviewing your application",
        "createdAt": "2026-02-15T11:00:00Z",
        "updatedAt": "2026-02-15T11:00:00Z"
      }
    ]
  }
}
```

---

## HR Endpoints

### Get Job Applications

**`GET /application/job/{jobId}?page=0&size=20&status=APPLIED`**

Get all applications for a specific job.

**Auth**: Required (HR role, creator of job)

**Parameters**:
- `jobId`: Job UUID
- `page`: Page number
- `size`: Results per page
- `status`: Filter by status (optional)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "applicationId": "uuid",
        "candidateName": "John Doe",
        "candidateEmail": "john@example.com",
        "status": "REVIEWING",
        "appliedAt": "2026-02-15T10:30:00Z",
        "cvFileName": "resume.pdf",
        "noteCount": 2
      }
    ],
    "totalElements": 25,
    "totalPages": 2,
    "currentPage": 0
  }
}
```

---

### Get Application Count for Job

**`GET /application/job/{jobId}/count`**

Get count of applications for job.

**Auth**: Required (HR role)

**Parameters**:
- `jobId`: Job UUID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "totalApplications": 25,
    "byStatus": {
      "APPLIED": 10,
      "REVIEWING": 5,
      "INTERVIEW": 3,
      "OFFER": 2,
      "REJECTED": 5
    }
  }
}
```

---

### Get Job Application Statistics

**`GET /application/job/{jobId}/stats`**

Get funnel metrics and statistics for job.

**Auth**: Required (HR role)

**Parameters**:
- `jobId`: Job UUID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "jobTitle": "Senior Software Engineer",
    "totalApplications": 25,
    "conversionRate": 8.5,
    "avgTimeToHire": 14,
    "funnel": {
      "APPLIED": 25,
      "REVIEWING": 18,
      "INTERVIEW": 8,
      "OFFER": 2,
      "HIRED": 1
    },
    "averageRating": 4.2,
    "topSkills": ["Java", "Spring Boot", "PostgreSQL"]
  }
}
```

---

### Update Application Status

**`PUT /application/{applicationId}/status?status={status}`**

Change application status.

**Auth**: Required (HR role)

**Parameters**:
- `applicationId`: Application UUID
- `status`: New status (APPLIED, REVIEWING, INTERVIEW_SCHEDULED, INTERVIEW_COMPLETED, OFFER, HIRED, REJECTED, WITHDRAWN)

**Request**:
```json
{
  "reason": "string (optional, required for REJECTED)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "applicationId": "uuid",
    "previousStatus": "REVIEWING",
    "newStatus": "INTERVIEW_SCHEDULED",
    "changedAt": "2026-02-15T10:35:00Z"
  }
}
```

---

### Download CV

**`GET /application/{applicationId}/cv/download`**

Download candidate's CV file (PDF).

**Auth**: Required (HR role)

**Parameters**:
- `applicationId`: Application UUID

**Response**: Binary PDF file

**Response Headers**:
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="resume.pdf"`

---

### Add Application Note

**`POST /application/{applicationId}/notes`**

Add a note to application (visible or internal).

**Auth**: Required (HR role)

**Parameters**:
- `applicationId`: Application UUID

**Request**:
```json
{
  "content": "string (required, max 2000 chars)",
  "candidateVisible": "boolean (default false)"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "noteId": "uuid",
    "author": "hr_user_1",
    "content": "string",
    "candidateVisible": false,
    "createdAt": "2026-02-15T10:30:00Z"
  }
}
```

---

### Update Note

**`PUT /application/{applicationId}/notes/{noteId}`**

Update existing note.

**Auth**: Required (HR role, note author)

**Parameters**:
- `applicationId`: Application UUID
- `noteId`: Note UUID

**Request**:
```json
{
  "content": "string (required, max 2000 chars)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "noteId": "uuid",
    "content": "string",
    "updatedAt": "2026-02-15T10:35:00Z"
  }
}
```

---

### Delete Note

**`DELETE /application/{applicationId}/notes/{noteId}`**

Delete note.

**Auth**: Required (HR role, note author)

**Response (204)**: No content

---

### Get All Notes for Application

**`GET /application/{applicationId}/notes`**

Get all notes (internal and visible).

**Auth**: Required (HR role)

**Parameters**:
- `applicationId`: Application UUID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "uuid",
        "author": "hr_user_1",
        "content": "string",
        "candidateVisible": false,
        "createdAt": "2026-02-15T11:00:00Z",
        "updatedAt": "2026-02-15T11:00:00Z"
      }
    ]
  }
}
```

---

### Get Public Notes Only

**`GET /application/{applicationId}/notes/public`**

Get notes visible to candidate.

**Auth**: Required (HR role)

**Parameters**:
- `applicationId`: Application UUID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "uuid",
        "author": "HR Team",
        "content": "string",
        "createdAt": "2026-02-15T11:00:00Z"
      }
    ]
  }
}
```

---

### Get Status History

**`GET /application/{applicationId}/history`**

Get full status change history.

**Auth**: Required (HR role)

**Parameters**:
- `applicationId`: Application UUID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "previousStatus": "APPLIED",
        "newStatus": "REVIEWING",
        "changedBy": "hr_user_1",
        "changedAt": "2026-02-15T12:00:00Z",
        "reason": "Started review"
      }
    ]
  }
}
```

---

### Advanced Search

**`GET /application/search?keyword={keyword}&status=REVIEWING&page=0&size=20`**

Search applications with advanced filters.

**Auth**: Required (HR role)

**Query Parameters**:
- `keyword`: Search candidate name, email
- `status`: Filter by status
- `jobId`: Filter by job
- `dateFrom`: Application date from (ISO 8601)
- `dateTo`: Application date to (ISO 8601)
- `assignedTo`: Filter by assigned HR username
- `page`: Page number
- `size`: Results per page
- `sortBy`: createdAt, status, candidateName
- `sortDirection`: ASC or DESC

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "applications": [ /* filtered results */ ],
    "totalElements": 12,
    "totalPages": 1,
    "currentPage": 0
  }
}
```

---

### Bulk Status Update

**`PUT /application/bulk/status`**

Update status for multiple applications.

**Auth**: Required (HR role)

**Request**:
```json
{
  "applicationIds": ["uuid1", "uuid2", "uuid3"],
  "newStatus": "INTERVIEW_SCHEDULED",
  "reason": "string (optional)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "updated": 3,
    "failed": 0,
    "message": "3 applications updated successfully"
  }
}
```

---

### HR Dashboard Statistics

**`GET /application/hr/dashboard`**

Get HR dashboard metrics and statistics.

**Auth**: Required (HR role)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "totalApplications": 150,
    "newApplicationsToday": 12,
    "pendingReview": 35,
    "inInterview": 8,
    "offers": 3,
    "avgTimeToHire": 14,
    "conversionRate": 8.5,
    "topJobs": [
      {
        "jobId": "uuid",
        "title": "Senior Software Engineer",
        "applications": 25
      }
    ],
    "recentApplications": [
      {
        "applicationId": "uuid",
        "candidateName": "Jane Doe",
        "jobTitle": "string",
        "appliedAt": "2026-02-15T10:30:00Z"
      }
    ]
  }
}
```

---

## HR Manager Endpoints

### Get Company Applications

**`GET /application/company/{companyId}?page=0&size=20`**

Get all applications for company's jobs.

**Auth**: Required (HR_MANAGER role)

**Parameters**:
- `companyId`: Company UUID
- `page`: Page number
- `size`: Results per page

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "applications": [ /* company applications */ ],
    "totalElements": 150,
    "totalPages": 8,
    "currentPage": 0
  }
}
```

---

### Assign Application to HR

**`PUT /application/{applicationId}/assign`**

Assign application to specific HR user.

**Auth**: Required (HR_MANAGER role)

**Parameters**:
- `applicationId`: Application UUID

**Request**:
```json
{
  "hrUsername": "string (HR user to assign to)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "applicationId": "uuid",
    "assignedTo": "hr_user_1",
    "assignedAt": "2026-02-15T10:30:00Z"
  }
}
```

---

### Unassign Application

**`DELETE /application/{applicationId}/assign`**

Remove HR assignment.

**Auth**: Required (HR_MANAGER role)

**Response (204)**: No content

---

### Get Assigned Applications

**`GET /application/assigned/{hrUsername}?page=0&size=20`**

Get applications assigned to specific HR user.

**Auth**: Required (HR_MANAGER role)

**Parameters**:
- `hrUsername`: HR user's username
- `page`: Page number
- `size`: Results per page

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "applications": [ /* assigned applications */ ],
    "totalElements": 45,
    "totalPages": 3,
    "currentPage": 0
  }
}
```

---

### Manager Statistics

**`GET /application/manager/stats?companyId={companyId}`**

Get manager-level analytics.

**Auth**: Required (HR_MANAGER role)

**Query Parameters**:
- `companyId`: Filter by company (optional)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "totalApplications": 150,
    "byStatus": {
      "APPLIED": 50,
      "REVIEWING": 40,
      "INTERVIEW": 30,
      "OFFER": 20,
      "HIRED": 10
    },
    "totalHires": 10,
    "averageTimeToHire": 14,
    "conversionRate": 6.67,
    "hrTeam": [
      {
        "username": "hr_user_1",
        "assignedCount": 45,
        "completedCount": 20
      }
    ]
  }
}
```

---

### Export Applications

**`GET /application/export?companyId={companyId}&format=CSV`**

Export applications to CSV or Excel.

**Auth**: Required (HR_MANAGER role)
**Rate Limit**: 5 exports per day per user

**Query Parameters**:
- `companyId`: Filter by company (optional)
- `format`: CSV or EXCEL (default CSV)
- `dateFrom`: From date (optional)
- `dateTo`: To date (optional)
- `status`: Filter by status (optional)

**Response**: Binary file (CSV or Excel)

**Response Headers**:
- `Content-Type: text/csv` or `application/vnd.ms-excel`
- `Content-Disposition: attachment; filename="applications_export.csv"`

---

## Admin Endpoints

### Get All Applications

**`GET /application/admin/all?page=0&size=20`**

View all system applications (Admin only).

**Auth**: Required (ADMIN role)

**Query Parameters**:
- `page`: Page number
- `size`: Results per page
- `keyword`: Search term
- `status`: Filter by status

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "applications": [ /* all applications */ ],
    "totalElements": 5000,
    "totalPages": 250,
    "currentPage": 0
  }
}
```

---

### System Statistics

**`GET /application/admin/stats`**

Get system-wide statistics.

**Auth**: Required (ADMIN role)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "totalApplications": 5000,
    "totalHires": 420,
    "totalRejections": 3500,
    "conversionRate": 8.4,
    "averageTimeToHire": 16,
    "totalCandidates": 2500,
    "totalJobs": 350,
    "totalCompanies": 85,
    "applicationsByMonth": [
      { "month": "2026-01", "count": 450 }
    ]
  }
}
```

---

### Query Audit Logs

**`GET /application/admin/audit?applicationId={id}&page=0&size=20`**

Query audit logs for compliance and debugging.

**Auth**: Required (ADMIN role)

**Query Parameters**:
- `applicationId`: Filter by application (optional)
- `action`: Filter by action type (optional)
- `userId`: Filter by user (optional)
- `dateFrom`: From date (optional)
- `dateTo`: To date (optional)
- `page`: Page number
- `size`: Results per page

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "logId": "uuid",
        "applicationId": "uuid",
        "action": "APPLICATION_CREATED",
        "userId": "user_id",
        "timestamp": "2026-02-15T10:30:00Z",
        "details": { /* action details */ }
      }
    ],
    "totalElements": 500,
    "totalPages": 25,
    "currentPage": 0
  }
}
```

---

### Create Application (Admin)

**`POST /application/admin/create`**

Manually create application (bypass Saga).

**Auth**: Required (ADMIN role)

**Request**:
```json
{
  "candidateUsername": "string (required)",
  "jobId": "uuid (required)",
  "status": "enum (default APPLIED)",
  "notes": "string (optional)"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "applicationId": "uuid",
    "status": "APPLIED",
    "createdAt": "2026-02-15T10:30:00Z"
  }
}
```

---

### Override Status

**`PUT /application/admin/{applicationId}/override-status`**

Force status change with audit trail.

**Auth**: Required (ADMIN role)

**Parameters**:
- `applicationId`: Application UUID

**Request**:
```json
{
  "newStatus": "enum",
  "reason": "string (required admin reason for override)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "applicationId": "uuid",
    "previousStatus": "REVIEWING",
    "newStatus": "HIRED",
    "overriddenAt": "2026-02-15T10:35:00Z",
    "overriddenBy": "admin_1"
  }
}
```

---

### Export Full System Data

**`GET /application/admin/export-full?format=CSV`**

Export all applications with full details.

**Auth**: Required (ADMIN role)
**Rate Limit**: 2 exports per day per admin

**Query Parameters**:
- `format`: CSV or EXCEL
- `dateFrom`: From date (optional)
- `dateTo`: To date (optional)

**Response**: Binary file (CSV or Excel)

---

### View Deleted Applications

**`GET /application/admin/deleted?page=0&size=20`**

View soft-deleted applications.

**Auth**: Required (ADMIN role)

**Query Parameters**:
- `page`: Page number
- `size`: Results per page
- `dateFrom`: Deleted from date
- `dateTo`: Deleted to date

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "deletedApplications": [
      {
        "applicationId": "uuid",
        "candidateName": "string",
        "jobTitle": "string",
        "status": "WITHDRAWN",
        "deletedAt": "2026-02-15T10:30:00Z",
        "deletedBy": "candidate_or_admin"
      }
    ],
    "totalElements": 150,
    "totalPages": 8,
    "currentPage": 0
  }
}
```

---

### Restore Deleted Application

**`PUT /application/admin/{applicationId}/restore`**

Restore previously deleted application.

**Auth**: Required (ADMIN role)

**Parameters**:
- `applicationId`: Application UUID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "applicationId": "uuid",
    "status": "APPLIED",
    "restoredAt": "2026-02-15T10:35:00Z",
    "restoredBy": "admin_1"
  }
}
```

---

## Application Status Enum

```
DRAFT                 - Saved but not submitted
APPLIED               - Application submitted
REVIEWING             - HR is reviewing
INTERVIEW_SCHEDULED   - Interview scheduled
INTERVIEW_COMPLETED   - Interview completed
OFFER                 - Offer extended
HIRED                 - Candidate hired
REJECTED              - Application rejected
WITHDRAWN             - Candidate withdrew
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
| `RESOURCE_NOT_FOUND` | 404 | Application or job not found |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | No access to application |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `DUPLICATE_APPLICATION` | 409 | Already applied to this job |
| `INVALID_FILE_FORMAT` | 400 | CV not PDF |
| `FILE_TOO_LARGE` | 413 | File exceeds 5MB |
| `JOB_CLOSED` | 410 | Job no longer accepting applications |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INVALID_STATUS_TRANSITION` | 400 | Cannot transition to that status |

---

## TypeScript Types

```typescript
// Application
interface Application {
  applicationId: string;
  jobId: string;
  username: string;
  email: string;
  companyId: string;
  status: ApplicationStatus;
  appliedAt: string;
  cvFileName?: string;
  coverLetter?: string;
  jobSnapshot: JobSnapshot;
  statusHistory: StatusChange[];
  notes: Note[];
  assignedTo?: string;
  assignedAt?: string;
}

// Job Snapshot (preserved at application time)
interface JobSnapshot {
  title: string;
  description: string;
  companyName: string;
  location: string;
  employmentType: string;
  salaryMin?: number;
  salaryMax?: number;
  snapshotAt: string;
}

// Status Change
interface StatusChange {
  previousStatus?: ApplicationStatus;
  newStatus: ApplicationStatus;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

// Application Note
interface Note {
  id: string;
  author: string;
  content: string;
  candidateVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

// Application Status
type ApplicationStatus =
  | "DRAFT"
  | "APPLIED"
  | "REVIEWING"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_COMPLETED"
  | "OFFER"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

// Pagination
interface PaginatedResponse<T> {
  data: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
```

---

**API Version**: 1.0
**Last Updated**: 2026-02-15
**Gateway Route**: `/application/**`
**Database**: MongoDB (application_db)
**File Storage**: MinIO (cvs-files bucket)
