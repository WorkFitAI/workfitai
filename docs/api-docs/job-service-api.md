# Job Service API Reference

> **Base URL**: `http://localhost:9085`
> **Frontend Port**: 3000
> **Last Updated**: 2026-02-15

## Overview

The Job Service manages job postings, companies, and skills. It provides public endpoints for job browsing and authenticated endpoints for HR job management. All endpoints are proxied through the API Gateway at port 8088.

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

## Public Endpoints (No Authentication)

### List Jobs

**`GET /job/public/jobs?keyword={keyword}&page=0&size=20`**

Browse all published job postings (paginated, filterable).

**Query Parameters**:
- `keyword`: Search term (job title, description, company)
- `page`: Page number (0-indexed, default 0)
- `size`: Results per page (default 20, max 100)
- `companyId`: Filter by company (UUID, optional)
- `employmentType`: Filter by type (FULL_TIME, PART_TIME, CONTRACT, TEMPORARY)
- `experienceLevel`: Filter by level (ENTRY_LEVEL, MID_LEVEL, SENIOR, LEAD, EXECUTIVE)
- `minSalary`: Minimum salary filter (optional)
- `maxSalary`: Maximum salary filter (optional)
- `location`: Location filter (string, optional)
- `skillIds`: Comma-separated skill IDs (optional)
- `status`: Job status (PUBLISHED, CLOSED - defaults to PUBLISHED)
- `sortBy`: Sort field (createdAt, salary, applicationCount, default: createdAt)
- `sortDirection`: ASC or DESC

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "jobId": "uuid",
        "title": "Senior Software Engineer",
        "description": "string (max 10000 chars)",
        "company": {
          "companyId": "uuid",
          "name": "TechCorp Inc",
          "logo": "url-or-null",
          "location": "San Francisco, CA"
        },
        "employmentType": "FULL_TIME",
        "experienceLevel": "SENIOR",
        "salaryMin": 120000,
        "salaryMax": 180000,
        "currency": "USD",
        "location": "San Francisco, CA",
        "skills": [
          { "skillId": "uuid", "name": "Java", "category": "Language" },
          { "skillId": "uuid", "name": "Spring Boot", "category": "Framework" }
        ],
        "status": "PUBLISHED",
        "totalApplications": 25,
        "totalViews": 1240,
        "postedDate": "2026-02-10T10:00:00Z",
        "deadline": "2026-03-15T23:59:59Z"
      }
    ],
    "totalElements": 350,
    "totalPages": 18,
    "currentPage": 0,
    "pageSize": 20
  }
}
```

**Status Codes**:
- `200` - Success
- `400` - Invalid query parameters

---

### Get Job Details

**`GET /job/public/jobs/{jobId}`**

Get detailed job posting (increments view counter).

**Parameters**:
- `jobId`: Job UUID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "title": "Senior Software Engineer",
    "description": "string (detailed job description)",
    "company": {
      "companyId": "uuid",
      "name": "TechCorp Inc",
      "description": "string",
      "logo": "url-or-null",
      "website": "https://techcorp.com",
      "address": "San Francisco, CA",
      "foundedYear": 2015,
      "employeeCount": 500
    },
    "employmentType": "FULL_TIME",
    "experienceLevel": "SENIOR",
    "salaryMin": 120000,
    "salaryMax": 180000,
    "currency": "USD",
    "location": "San Francisco, CA",
    "remoteWork": "HYBRID",
    "skills": [
      {
        "skillId": "uuid",
        "name": "Java",
        "category": "Programming Language",
        "proficiency": "EXPERT"
      },
      {
        "skillId": "uuid",
        "name": "Spring Boot",
        "category": "Framework",
        "proficiency": "ADVANCED"
      }
    ],
    "benefits": [
      "Health Insurance",
      "401k Match",
      "Unlimited PTO"
    ],
    "requirements": [
      "5+ years Java experience",
      "Spring Boot expertise"
    ],
    "status": "PUBLISHED",
    "totalApplications": 25,
    "totalViews": 1240,
    "postedDate": "2026-02-10T10:00:00Z",
    "deadline": "2026-03-15T23:59:59Z",
    "createdBy": "hr_user_1"
  }
}
```

**Note**: View count incremented on each successful request.

**Error Codes**:
- `404` - Job not found
- `410` - Job closed or deleted

---

### Get Featured Jobs

**`GET /job/public/jobs/featured?size=10`**

Get featured/highlighted job postings.

**Query Parameters**:
- `size`: Number of results (default 10, max 50)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "featuredJobs": [
      {
        "jobId": "uuid",
        "title": "string",
        "company": { /* company object */ },
        "employmentType": "string",
        "location": "string",
        "salaryMin": 0,
        "salaryMax": 0,
        "totalApplications": 0,
        "totalViews": 0,
        "postedDate": "2026-02-10T10:00:00Z"
      }
    ]
  }
}
```

---

### Get Similar Jobs

**`GET /job/public/jobs/similar/{jobId}?size=5`**

Get similar job postings based on skills, company, location.

**Parameters**:
- `jobId`: Reference job UUID
- `size`: Number of similar jobs (default 5, max 20)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "similarJobs": [ /* job array */ ]
  }
}
```

---

### List Companies

**`GET /job/public/companies?keyword={keyword}&page=0&size=20`**

Browse all companies (paginated, searchable).

**Query Parameters**:
- `keyword`: Search by company name
- `page`: Page number (0-indexed)
- `size`: Results per page (default 20, max 100)
- `sortBy`: createdAt, name, jobCount
- `sortDirection`: ASC or DESC

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "companyId": "uuid",
        "name": "TechCorp Inc",
        "description": "string",
        "logo": "url-or-null",
        "website": "https://techcorp.com",
        "address": "San Francisco, CA",
        "foundedYear": 2015,
        "employeeCount": 500,
        "totalJobs": 12,
        "createdAt": "2025-01-01T10:00:00Z"
      }
    ],
    "totalElements": 150,
    "totalPages": 8,
    "currentPage": 0,
    "pageSize": 20
  }
}
```

---

### Get Company Details

**`GET /job/public/companies/{companyId}`**

Get detailed company information.

**Parameters**:
- `companyId`: Company UUID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "companyId": "uuid",
    "name": "TechCorp Inc",
    "description": "string",
    "logo": "url-or-null",
    "website": "https://techcorp.com",
    "address": "San Francisco, CA",
    "foundedYear": 2015,
    "employeeCount": 500,
    "industry": "Software Development",
    "totalJobs": 12,
    "createdAt": "2025-01-01T10:00:00Z"
  }
}
```

---

### Get Company Jobs

**`GET /job/public/companies/{companyId}/jobs?page=0&size=20`**

Get all published jobs from a company.

**Parameters**:
- `companyId`: Company UUID
- `page`: Page number (0-indexed)
- `size`: Results per page (default 20, max 100)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "jobs": [ /* job array */ ],
    "totalElements": 12,
    "totalPages": 1,
    "currentPage": 0,
    "pageSize": 20
  }
}
```

---

### List Skills

**`GET /job/public/skills?keyword={keyword}&page=0&size=20`**

Browse all available skills (paginated).

**Query Parameters**:
- `keyword`: Search skill name
- `page`: Page number
- `size`: Results per page (default 20, max 100)
- `category`: Filter by category (optional)
- `sortBy`: name, category, jobCount

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "skills": [
      {
        "skillId": "uuid",
        "name": "Java",
        "category": "Programming Language",
        "description": "Java programming language",
        "jobCount": 450
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

### Get Skill Details

**`GET /job/public/skills/{skillId}`**

Get skill details and related jobs.

**Parameters**:
- `skillId`: Skill UUID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "skillId": "uuid",
    "name": "Java",
    "category": "Programming Language",
    "description": "string",
    "jobCount": 450,
    "salaryRange": {
      "min": 80000,
      "max": 250000,
      "currency": "USD"
    },
    "demandLevel": "HIGH",
    "trendingUp": true
  }
}
```

---

## HR Endpoints (Requires HR Role)

### Create Job

**`POST /job/hr/jobs`**

Create a new job posting.

**Auth**: Required (HR or HR_MANAGER role)

**Request**:
```json
{
  "title": "string (required, max 200 chars)",
  "description": "string (required, max 10000 chars)",
  "companyId": "uuid (required)",
  "employmentType": "enum (FULL_TIME, PART_TIME, CONTRACT, TEMPORARY)",
  "experienceLevel": "enum (ENTRY_LEVEL, MID_LEVEL, SENIOR, LEAD, EXECUTIVE)",
  "salaryMin": "number (optional, min 0)",
  "salaryMax": "number (optional, must be >= salaryMin)",
  "currency": "string (default USD)",
  "location": "string (required)",
  "remoteWork": "enum (ON_SITE, HYBRID, REMOTE)",
  "skillIds": ["uuid1", "uuid2"],
  "benefits": ["string"],
  "requirements": ["string"],
  "deadline": "2026-03-15T23:59:59Z (optional, ISO 8601)",
  "status": "enum (DRAFT, PUBLISHED)"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "title": "string",
    "status": "DRAFT",
    "createdBy": "string",
    "createdAt": "2026-02-15T10:30:00Z"
  },
  "message": "Job created successfully"
}
```

**Error Codes**:
- `400` - Validation error
- `401` - Unauthorized
- `403` - Insufficient permissions
- `404` - Company not found

---

### List HR's Jobs

**`GET /job/hr/jobs?page=0&size=20&status=PUBLISHED`**

List jobs created by current HR user.

**Auth**: Required (HR or HR_MANAGER role)

**Query Parameters**:
- `page`: Page number (0-indexed)
- `size`: Results per page
- `status`: Filter by status (DRAFT, PUBLISHED, CLOSED)
- `keyword`: Search term

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "jobId": "uuid",
        "title": "string",
        "companyId": "uuid",
        "status": "PUBLISHED",
        "totalApplications": 15,
        "createdAt": "2026-02-10T10:00:00Z"
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

### Get Job Details (HR View)

**`GET /job/hr/jobs/{jobId}`**

Get detailed job view for HR (includes analytics).

**Auth**: Required (HR or HR_MANAGER role)

**Parameters**:
- `jobId`: Job UUID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "title": "string",
    "description": "string",
    "company": { /* company object */ },
    "status": "PUBLISHED",
    "totalApplications": 25,
    "totalViews": 1240,
    "applicationsByStatus": {
      "APPLIED": 10,
      "REVIEWING": 5,
      "INTERVIEW": 3,
      "OFFER": 2
    },
    "createdAt": "2026-02-10T10:00:00Z",
    "publishedAt": "2026-02-10T10:00:00Z"
  }
}
```

---

### Update Job

**`PUT /job/hr/jobs`**

Update job posting details.

**Auth**: Required (HR or HR_MANAGER role)

**Request**:
```json
{
  "jobId": "uuid (required)",
  "title": "string (optional)",
  "description": "string (optional)",
  "salaryMin": "number (optional)",
  "salaryMax": "number (optional)",
  "location": "string (optional)",
  "deadline": "2026-03-15T23:59:59Z (optional)",
  "skillIds": ["uuid1", "uuid2"],
  "benefits": ["string"],
  "requirements": ["string"]
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "title": "string",
    "updatedAt": "2026-02-15T10:35:00Z"
  },
  "message": "Job updated successfully"
}
```

**Error Codes**:
- `400` - Validation error
- `404` - Job not found
- `403` - Only creator can update

---

### Update Job Status

**`PUT /job/hr/jobs/{jobId}/{status}`**

Change job status (DRAFT → PUBLISHED → CLOSED).

**Auth**: Required (HR or HR_MANAGER role)

**Parameters**:
- `jobId`: Job UUID
- `status`: Target status (DRAFT, PUBLISHED, CLOSED)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "status": "PUBLISHED",
    "previousStatus": "DRAFT",
    "changedAt": "2026-02-15T10:35:00Z"
  },
  "message": "Job status updated"
}
```

---

### Upload Job Banner

**`POST /job/hr/jobs/{jobId}/banner`**

Upload banner/cover image for job posting (multipart/form-data).

**Auth**: Required (HR role)

**Parameters**:
- `jobId`: Job UUID

**Request**:
```javascript
const formData = new FormData();
formData.append("file", imageFile); // JPEG, PNG, WebP (max 5MB)

fetch(`http://localhost:9085/job/hr/jobs/${jobId}/banner`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${accessToken}` },
  body: formData
});
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "bannerUrl": "url-to-banner-image",
    "uploadedAt": "2026-02-15T10:35:00Z"
  }
}
```

---

### List Companies (HR)

**`GET /job/hr/companies?page=0&size=20`**

List companies accessible to current HR user.

**Auth**: Required (HR role)

**Query Parameters**:
- `page`: Page number
- `size`: Results per page
- `keyword`: Search company name

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "companyId": "uuid",
        "name": "string",
        "totalJobs": 12,
        "totalApplications": 45,
        "createdAt": "2025-01-01T10:00:00Z"
      }
    ],
    "totalElements": 3,
    "totalPages": 1,
    "currentPage": 0
  }
}
```

---

### Create Company

**`POST /job/hr/companies`**

Create new company.

**Auth**: Required (HR or HR_MANAGER role)

**Request**:
```json
{
  "name": "string (required, unique)",
  "description": "string (optional)",
  "website": "url (optional)",
  "address": "string (optional)",
  "foundedYear": "number (optional)",
  "employeeCount": "number (optional)",
  "industry": "string (optional)"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "companyId": "uuid",
    "name": "string",
    "createdAt": "2026-02-15T10:30:00Z"
  },
  "message": "Company created successfully"
}
```

**Error Codes**:
- `400` - Validation error
- `409` - Company name already exists

---

### Update Company

**`PUT /job/hr/companies`**

Update company details.

**Auth**: Required (HR or HR_MANAGER role)

**Request**:
```json
{
  "companyId": "uuid (required)",
  "name": "string (optional)",
  "description": "string (optional)",
  "website": "url (optional)",
  "address": "string (optional)",
  "foundedYear": "number (optional)",
  "employeeCount": "number (optional)",
  "industry": "string (optional)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "companyId": "uuid",
    "name": "string",
    "updatedAt": "2026-02-15T10:35:00Z"
  },
  "message": "Company updated successfully"
}
```

---

### Create Skill

**`POST /job/hr/skills`**

Create new skill (Admin or HR_MANAGER only).

**Auth**: Required (HR_MANAGER or ADMIN role)

**Request**:
```json
{
  "name": "string (required, unique)",
  "category": "string (required)",
  "description": "string (optional)"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "skillId": "uuid",
    "name": "string",
    "category": "string",
    "createdAt": "2026-02-15T10:30:00Z"
  }
}
```

---

### Update Skill

**`PUT /job/hr/skills`**

Update skill details (Admin or HR_MANAGER only).

**Auth**: Required (HR_MANAGER or ADMIN role)

**Request**:
```json
{
  "skillId": "uuid (required)",
  "name": "string (optional)",
  "category": "string (optional)",
  "description": "string (optional)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "skillId": "uuid",
    "name": "string",
    "updatedAt": "2026-02-15T10:35:00Z"
  }
}
```

---

## Admin Endpoints

### Delete Job

**`DELETE /job/admin/jobs/{jobId}`**

Permanently delete job posting (Admin only).

**Auth**: Required (ADMIN role)

**Parameters**:
- `jobId`: Job UUID

**Response (204)**: No content

**Error Codes**:
- `403` - Admin access required
- `404` - Job not found

---

## Enumerations

### Employment Type
```
FULL_TIME       - Full-time position
PART_TIME       - Part-time position
CONTRACT        - Contract-based work
TEMPORARY       - Temporary position
```

### Experience Level
```
ENTRY_LEVEL     - 0-2 years experience
MID_LEVEL       - 2-5 years experience
SENIOR          - 5-10 years experience
LEAD            - 10+ years, leadership role
EXECUTIVE       - C-level position
```

### Job Status
```
DRAFT           - Not published, visible only to creator
PUBLISHED       - Published, visible to all
CLOSED          - Closed, not accepting applications
```

### Remote Work
```
ON_SITE         - Must work at office
HYBRID          - Mix of office and remote
REMOTE          - Work from anywhere
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
| `RESOURCE_NOT_FOUND` | 404 | Job, company, or skill not found |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `COMPANY_NOT_FOUND` | 404 | Company doesn't exist |
| `DUPLICATE_COMPANY` | 409 | Company name already exists |
| `INVALID_SALARY_RANGE` | 400 | Max salary < min salary |
| `INVALID_DEADLINE` | 400 | Deadline in past |
| `JOB_CLOSED` | 410 | Job is closed |

---

## TypeScript Types

```typescript
// Job Posting
interface Job {
  jobId: string;
  title: string;
  description: string;
  company: Company;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  location: string;
  remoteWork: RemoteWork;
  skills: Skill[];
  benefits?: string[];
  requirements?: string[];
  status: JobStatus;
  totalApplications: number;
  totalViews: number;
  postedDate: string;
  deadline?: string;
  createdBy: string;
}

// Company
interface Company {
  companyId: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  address?: string;
  foundedYear?: number;
  employeeCount?: number;
  industry?: string;
  totalJobs?: number;
  createdAt: string;
}

// Skill
interface Skill {
  skillId: string;
  name: string;
  category: string;
  description?: string;
  proficiency?: "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  jobCount?: number;
}

// Enums
type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY";
type ExperienceLevel = "ENTRY_LEVEL" | "MID_LEVEL" | "SENIOR" | "LEAD" | "EXECUTIVE";
type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED";
type RemoteWork = "ON_SITE" | "HYBRID" | "REMOTE";

// Pagination
interface PaginatedResponse<T> {
  data: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Query Filters
interface JobFilterParams {
  keyword?: string;
  page?: number;
  size?: number;
  companyId?: string;
  employmentType?: EmploymentType;
  experienceLevel?: ExperienceLevel;
  minSalary?: number;
  maxSalary?: number;
  location?: string;
  skillIds?: string[];
  status?: JobStatus;
  sortBy?: "createdAt" | "salary" | "applicationCount";
  sortDirection?: "ASC" | "DESC";
}
```

---

**API Version**: 1.0
**Last Updated**: 2026-02-15
**Gateway Route**: `/job/**`
**Database**: PostgreSQL (job_db)
