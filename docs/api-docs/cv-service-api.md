# CV Service API Reference

> **Base URL**: `http://localhost:9085`
> **Frontend Port**: 3000
> **Last Updated**: 2026-02-15

## Overview

The CV Service manages curriculum vitae (resume) file storage and metadata. All CVs are stored in MinIO (S3-compatible object storage) with metadata tracked in MongoDB. All endpoints are proxied through the API Gateway at port 8088.

**Supported Formats**: PDF only
**Max File Size**: 5MB
**Storage Format**: `{username}/{applicationId}/{uuid}_{filename}`

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

All CV endpoints require JWT Bearer token:

```javascript
const headers = {
  "Authorization": `Bearer ${accessToken}`,
  "Content-Type": "application/json"
};
```

For file uploads use multipart/form-data:
```javascript
const formData = new FormData();
formData.append("file", pdfFile);

fetch('http://localhost:9085/cv/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
    // Don't set Content-Type; browser handles multipart boundary
  },
  body: formData
});
```

---

## CV Upload

### Upload CV

**`POST /cv/upload`**

Upload a new CV file (PDF format).

**Auth**: Required (CANDIDATE role)

**Request**:
```javascript
const formData = new FormData();
formData.append("file", pdfFile); // PDF file object
formData.append("templateType", "UPLOAD"); // optional

const response = await fetch('http://localhost:9085/cv/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});
```

**Multipart Fields**:
- `file`: PDF file (required, max 5MB)
- `templateType`: CV template type (optional)
  - `UPLOAD` - Direct PDF upload (default)
  - `GENERAL` - General resume template
  - `TECH` - Technical/IT resume template
  - `CREATIVE` - Creative field resume template

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "cvId": "uuid-string",
    "filename": "resume.pdf",
    "originalFilename": "resume.pdf",
    "contentType": "application/pdf",
    "fileSize": 245680,
    "templateType": "UPLOAD",
    "objectName": "username/app123/550e8400_resume.pdf",
    "uploadedAt": "2026-02-15T10:30:00Z",
    "url": "http://localhost:9085/cv/{cvId}/download"
  },
  "message": "CV uploaded successfully"
}
```

**Error Codes**:
- `400` - Invalid file format (not PDF), invalid templateType
- `413` - File too large (max 5MB)
- `401` - Unauthorized
- `403` - Only candidates can upload CVs

---

## CV Retrieval

### Get CVs by Username

**`GET /cv/candidate/{username}?page=0&size=10`**

Retrieve all CVs for a candidate (paginated).

**Auth**: Required (Bearer token)

**Parameters**:
- `username`: Candidate username
- `page`: Page number (0-indexed, default 0)
- `size`: Results per page (default 10, max 50)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "cvs": [
      {
        "cvId": "uuid-string",
        "filename": "resume_v2.pdf",
        "contentType": "application/pdf",
        "fileSize": 251000,
        "templateType": "UPLOAD",
        "uploadedAt": "2026-02-15T10:30:00Z",
        "updatedAt": "2026-02-15T10:30:00Z",
        "url": "http://localhost:9085/cv/{cvId}/download"
      }
    ],
    "totalElements": 3,
    "totalPages": 1,
    "currentPage": 0,
    "pageSize": 10
  }
}
```

**Error Codes**:
- `404` - Candidate not found
- `401` - Unauthorized

---

### Get CV by ID

**`GET /cv/{cvId}`**

Retrieve CV metadata by ID.

**Auth**: Required (Bearer token)

**Parameters**:
- `cvId`: CV document ID (UUID)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "cvId": "uuid-string",
    "username": "candidate_john",
    "filename": "resume.pdf",
    "contentType": "application/pdf",
    "fileSize": 245680,
    "templateType": "UPLOAD",
    "objectName": "candidate_john/app456/550e8400_resume.pdf",
    "uploadedAt": "2026-02-15T10:30:00Z",
    "updatedAt": "2026-02-15T10:30:00Z",
    "isDefault": false,
    "url": "http://localhost:9085/cv/{cvId}/download"
  }
}
```

**Error Codes**:
- `404` - CV not found
- `401` - Unauthorized
- `403` - Forbidden (accessing other user's CV)

---

## CV Management

### Update CV Metadata

**`PATCH /cv/candidate/{cvId}`**

Update CV metadata (filename, template type, default status).

**Auth**: Required (CANDIDATE role)

**Parameters**:
- `cvId`: CV document ID

**Request**:
```json
{
  "filename": "string (optional, new filename)",
  "templateType": "enum (optional, UPLOAD | GENERAL | TECH | CREATIVE)",
  "isDefault": "boolean (optional, set as default CV)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "cvId": "uuid-string",
    "filename": "resume_updated.pdf",
    "templateType": "TECH",
    "isDefault": true,
    "updatedAt": "2026-02-15T10:35:00Z"
  },
  "message": "CV metadata updated successfully"
}
```

**Error Codes**:
- `400` - Invalid templateType
- `404` - CV not found
- `401` - Unauthorized
- `403` - Can only update own CVs

---

### Delete CV

**`DELETE /cv/candidate/{cvId}`**

Soft delete a CV (marks as deleted, preserves history).

**Auth**: Required (CANDIDATE role)

**Parameters**:
- `cvId`: CV document ID

**Response (204)**: No content

**Note**: File is also deleted from MinIO storage.

**Error Codes**:
- `404` - CV not found
- `401` - Unauthorized
- `403` - Can only delete own CVs

---

## CV Download

### Download CV File

**`GET /cv/candidate/download/{objectName}`**

Download CV file as binary PDF.

**Auth**: Required (Bearer token)

**Parameters**:
- `objectName`: Object name in MinIO (format: `{username}/{applicationId}/{uuid}_{filename}`)

**Response**: Binary PDF file

**Response Headers**:
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="resume.pdf"`
- `Content-Length: {file-size-bytes}`

**Status Codes**:
- `200` - File found and returned
- `404` - File not found in MinIO
- `401` - Unauthorized
- `403` - Forbidden (accessing other user's CV)

**Example Usage**:
```javascript
// Get download URL from CV metadata
const cvData = await fetch(`http://localhost:9085/cv/${cvId}`, {
  headers: { 'Authorization': `Bearer ${accessToken}` }
}).then(r => r.json());

// Download file
const response = await fetch(cvData.data.url, {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
const blob = await response.blob();

// Save or use file
const link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = cvData.data.filename;
link.click();
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
| `INVALID_FILE_FORMAT` | 400 | File is not PDF |
| `FILE_TOO_LARGE` | 413 | File exceeds 5MB |
| `INVALID_TEMPLATE_TYPE` | 400 | Unsupported template type |
| `RESOURCE_NOT_FOUND` | 404 | CV or file not found |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | No access to this CV |
| `DUPLICATE_DEFAULT` | 409 | Another CV already marked default |
| `STORAGE_ERROR` | 500 | MinIO or database error |

---

## CV Template Types

### Template Type Reference

```
UPLOAD
├── Description: Direct PDF upload from user
├── Use Case: User provides own resume/CV
└── Processing: Stored as-is, no parsing

GENERAL
├── Description: Standard resume format
├── Use Case: Most job applications
└── Fields: Contact, Summary, Experience, Education, Skills

TECH
├── Description: Technical/Software Engineering focus
├── Use Case: IT, Software, Tech roles
└── Fields: Contact, Technical Skills, Projects, Experience, Education

CREATIVE
├── Description: Creative industry format
├── Use Case: Design, Marketing, Media roles
└── Fields: Portfolio, Creative Skills, Projects, Education, Achievements
```

---

## CV Storage Architecture

### File Path Structure

CVs are stored in MinIO with the following path structure:

```
bucket: cvs-files
path: {username}/{applicationId}/{uuid}_{originalFilename}

Example:
cvs-files/candidate_john/app123/550e8400-e29b-41d4_resume_v2.pdf
├── username: candidate_john (Candidate's username)
├── applicationId: app123 (Associated job application ID)
├── uuid: 550e8400-e29b-41d4 (Unique identifier for this upload)
└── originalFilename: resume_v2.pdf (Original filename)
```

### Metadata Storage

CV metadata is stored in MongoDB with:

```json
{
  "_id": "ObjectId",
  "cvId": "UUID",
  "username": "string",
  "filename": "string (display name)",
  "originalFilename": "string (from upload)",
  "objectName": "string (MinIO path)",
  "contentType": "application/pdf",
  "fileSize": 245680,
  "templateType": "UPLOAD|GENERAL|TECH|CREATIVE",
  "isDefault": false,
  "uploadedAt": "Instant",
  "updatedAt": "Instant",
  "deletedAt": "Instant (null if active)"
}
```

---

## CV Integration with Applications

### Usage in Application Submission

When a candidate submits a job application:

1. **CV Selection** - Select from existing CVs or upload new one
2. **File Upload** - If new CV, upload to MinIO
3. **Metadata Storage** - Store CV metadata in MongoDB
4. **Application Linking** - Store CV reference in application document
5. **Download Access** - HR users can download via pre-signed URL

### Application Flow

```
Candidate submits application
├── 1. GET /cv/candidate/{username} - List available CVs
├── 2. POST /cv/upload (if new CV) - Upload new CV
├── 3. POST /applications - Submit application with CV reference
└── HR reviews application
    ├── GET /cv/{cvId} - Get CV metadata
    └── GET /cv/candidate/download/{objectName} - Download for review
```

---

## Security Considerations

### Access Control

- **Candidates**: Can upload, view, update, and delete own CVs only
- **HR**: Can download CVs associated with applications they're reviewing
- **Admin**: Can access all CVs for system administration
- **Public**: No access (all endpoints require authentication)

### File Validation

- **Format**: PDF only (MIME type: `application/pdf`)
- **Size**: Maximum 5MB
- **Scanning**: Virus scanning recommended at infrastructure level
- **Storage**: Encrypted at rest in MinIO

### Pre-signed URLs

For secure file downloads, the API generates pre-signed URLs:

```javascript
// URL format: MinIO pre-signed URL with 15-minute expiry
// http://minio:9000/cvs-files/...?X-Amz-Algorithm=...&X-Amz-Credential=...

// Expiry: 15 minutes from generation
// One-time use recommended for sensitive documents
```

---

## TypeScript Types

```typescript
// CV Metadata
interface CVMetadata {
  cvId: string;
  username: string;
  filename: string;
  originalFilename: string;
  contentType: "application/pdf";
  fileSize: number;
  templateType: "UPLOAD" | "GENERAL" | "TECH" | "CREATIVE";
  objectName: string;
  isDefault: boolean;
  uploadedAt: string;
  updatedAt: string;
  url: string;
}

// CV Upload Response
interface CVUploadResponse {
  cvId: string;
  filename: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;
  templateType: string;
  objectName: string;
  uploadedAt: string;
  url: string;
}

// CV List Response
interface CVListResponse {
  cvs: CVMetadata[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// CV Update Request
interface CVUpdateRequest {
  filename?: string;
  templateType?: "UPLOAD" | "GENERAL" | "TECH" | "CREATIVE";
  isDefault?: boolean;
}

// Paginated Query Parameters
interface CVQueryParams {
  page?: number;
  size?: number;
  sortBy?: "uploadedAt" | "filename" | "fileSize";
  sortDirection?: "ASC" | "DESC";
}
```

---

## Best Practices

### Frontend Implementation

**1. CV Upload**
```typescript
async function uploadCV(file: File, accessToken: string) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:9085/cv/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData
  });

  return response.json();
}
```

**2. List CVs**
```typescript
async function listMyCVs(username: string, accessToken: string) {
  const response = await fetch(
    `http://localhost:9085/cv/candidate/${username}?page=0&size=10`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  );

  return response.json();
}
```

**3. Download CV**
```typescript
async function downloadCV(cvId: string, accessToken: string) {
  // Get CV metadata first
  const metaResponse = await fetch(
    `http://localhost:9085/cv/${cvId}`,
    { headers: { 'Authorization': `Bearer ${accessToken}` } }
  );

  const { data } = await metaResponse.json();

  // Download file
  const fileResponse = await fetch(data.url, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  return fileResponse.blob();
}
```

### Validation

- **Client-side**: Validate file is PDF before upload
- **Server-side**: Verify MIME type and file extension
- **Size check**: Warn users if approaching 5MB limit

### Error Handling

```typescript
try {
  const response = await fetch(...);
  if (!response.ok) {
    const error = await response.json();
    console.error(error.error.code, error.error.message);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

---

**API Version**: 1.0
**Last Updated**: 2026-02-15
**Gateway Route**: `/cv/**`
**Bucket**: `cvs-files` (MinIO)
