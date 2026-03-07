# User Service API Documentation

User profile management, candidate/HR/admin CRUD operations, account settings, and privacy controls.

## Overview

**Service Name**: `user-service`
**Port**: 9081 (internal), 9005 (via gateway)
**Tech Stack**: Spring Boot, JPA, PostgreSQL, Elasticsearch, Cloudinary (media)

Manages user profiles across three main roles:
- **Candidate**: Job seekers with skill profiles
- **HR**: Human resources personnel in companies
- **Admin**: System administrators

## Authentication & Authorization

All endpoints require valid JWT token (Bearer token) except explicitly noted.

**Headers**:
```
Authorization: Bearer {accessToken}
X-Username: extracted by gateway
X-User-Id: extracted by gateway
X-Roles: extracted by gateway
X-Permissions: extracted by gateway
```

**Default Authorization**: Endpoints use `@PreAuthorize` annotations based on role and authority.

## User Profile Endpoints

### Get Current User Profile

**Endpoint**: `GET /profile/me`
**Auth Required**: Yes
**Authority**: `profile:read`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "PROFILE_FETCHED",
  "data": {
    "id": "user-uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CANDIDATE",
    "status": "ACTIVE",
    "profilePicture": "https://cdn.example.com/pic.jpg",
    "bio": "Experienced software engineer",
    "phone": "+1234567890",
    "location": "New York, USA",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

**Note**: Response shape varies by role (CANDIDATE, HR, ADMIN).

### Update Candidate Profile

**Endpoint**: `PUT /profile/candidate`
**Auth Required**: Yes
**Authority**: `candidate:read`

**Request**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "phone": "+1234567890",
  "location": "Los Angeles, USA",
  "yearsOfExperience": 5,
  "headline": "Senior Software Engineer",
  "currentJobTitle": "Tech Lead",
  "industry": "Technology",
  "skills": ["Java", "Spring Boot", "Kubernetes"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "CANDIDATE_PROFILE_UPDATED",
  "data": {
    "id": "user-uuid",
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "yearsOfExperience": 5,
    "headline": "Senior Software Engineer",
    "skills": ["Java", "Spring Boot", "Kubernetes"]
  }
}
```

### Update HR Profile

**Endpoint**: `PUT /profile/hr`
**Auth Required**: Yes
**Authority**: `hr:update`

**Request**:
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "jobTitle": "HR Manager",
  "department": "Human Resources",
  "company": "TechCorp",
  "phone": "+1234567890"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "HR_PROFILE_UPDATED",
  "data": {
    "id": "user-uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "jobTitle": "HR Manager",
    "department": "Human Resources",
    "company": "TechCorp"
  }
}
```

### Update Admin Profile

**Endpoint**: `PUT /profile/admin`
**Auth Required**: Yes
**Authority**: `admin:update`

**Request**:
```json
{
  "firstName": "Admin",
  "lastName": "User",
  "contactEmail": "admin@workfitai.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "ADMIN_PROFILE_UPDATED",
  "data": {
    "id": "user-uuid",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }
}
```

## Candidate Management

### Create Candidate

**Endpoint**: `POST /candidates`
**Auth Required**: Yes
**Authority**: `candidate:create`

**Request**:
```json
{
  "email": "candidate@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "yearsOfExperience": 3,
  "skills": ["JavaScript", "React", "Node.js"],
  "headline": "Full Stack Developer",
  "location": "San Francisco, USA"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "CANDIDATE_CREATED",
  "data": {
    "id": "candidate-uuid",
    "email": "candidate@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "yearsOfExperience": 3,
    "status": "ACTIVE"
  }
}
```

### Get Candidate by ID

**Endpoint**: `GET /candidates/{id}`
**Auth Required**: Yes
**Authority**: `candidate:read`
**Privacy Check**: Enabled (respects privacy settings)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "candidate-uuid",
    "email": "candidate@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "yearsOfExperience": 3,
    "skills": ["JavaScript", "React"],
    "headline": "Full Stack Developer",
    "currentJobTitle": "Senior Dev",
    "status": "ACTIVE",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

### Update Candidate

**Endpoint**: `PUT /candidates/{id}`
**Auth Required**: Yes
**Authority**: `candidate:update`

**Request**:
```json
{
  "firstName": "John",
  "yearsOfExperience": 4,
  "skills": ["JavaScript", "React", "Node.js", "Docker"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "CANDIDATE_UPDATED",
  "data": { ... }
}
```

### Delete Candidate

**Endpoint**: `DELETE /candidates/{id}`
**Auth Required**: Yes
**Authority**: `candidate:delete`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "CANDIDATE_DELETED"
}
```

### Search Candidates

**Endpoint**: `GET /candidates`
**Auth Required**: Yes
**Authority**: `candidate:search`
**Privacy Check**: Enabled

**Query Parameters**:
```
?keyword=javascript&page=0&size=20&sort=createdAt,desc
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "candidate-uuid-1",
        "firstName": "John",
        "yearsOfExperience": 3,
        "skills": ["JavaScript"]
      },
      {
        "id": "candidate-uuid-2",
        "firstName": "Jane",
        "yearsOfExperience": 5,
        "skills": ["JavaScript", "Python"]
      }
    ],
    "totalElements": 100,
    "totalPages": 5,
    "number": 0,
    "size": 20
  }
}
```

**Headers**:
```
X-Total-Count: 100
X-Page-Number: 0
X-Page-Size: 20
```

### Get Experience Statistics

**Endpoint**: `GET /candidates/stats/experience`
**Auth Required**: Yes
**Authority**: `candidate:read`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "0-2": 150,
    "2-5": 320,
    "5-10": 450,
    "10+": 280
  }
}
```

## HR Management

### Create HR

**Endpoint**: `POST /hr`
**Auth Required**: Yes
**Authority**: `hr:create`
**Roles**: HR, HR_MANAGER

**Request**:
```json
{
  "email": "hr@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "jobTitle": "HR Specialist",
  "department": "Human Resources",
  "company": "TechCorp"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "HR_CREATED",
  "data": {
    "id": "hr-uuid",
    "email": "hr@example.com",
    "firstName": "Jane",
    "jobTitle": "HR Specialist",
    "status": "PENDING"  // Requires manager approval
  }
}
```

### Get HR by ID

**Endpoint**: `GET /hr/{id}`
**Auth Required**: Yes
**Authority**: `hr:read`
**Roles**: HR, HR_MANAGER
**Privacy Check**: Enabled

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "hr-uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "jobTitle": "HR Specialist",
    "department": "Human Resources",
    "company": "TechCorp",
    "status": "ACTIVE"
  }
}
```

### Update HR

**Endpoint**: `PUT /hr/{id}`
**Auth Required**: Yes
**Authority**: `hr:update`
**Roles**: HR, HR_MANAGER

**Request**:
```json
{
  "firstName": "Jane",
  "jobTitle": "Senior HR Manager",
  "department": "Strategic HR"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "HR_UPDATED",
  "data": { ... }
}
```

### Delete HR

**Endpoint**: `DELETE /hr/{id}`
**Auth Required**: Yes
**Authority**: `hr:delete`
**Roles**: HR, HR_MANAGER

**Response** (200 OK):
```json
{
  "success": true,
  "message": "HR_DELETED"
}
```

### Search HR

**Endpoint**: `GET /hr`
**Auth Required**: Yes
**Authority**: `hr:search`
**Roles**: ADMIN, HR_MANAGER
**Privacy Check**: Enabled

**Query Parameters**:
```
?keyword=manager&page=0&size=20
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [ ... ],
    "totalElements": 50,
    "totalPages": 3,
    "number": 0,
    "size": 20
  }
}
```

### Get Department Statistics

**Endpoint**: `GET /hr/stats/department`
**Auth Required**: Yes

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "Human Resources": 25,
    "Marketing": 18,
    "Sales": 32,
    "Technology": 45
  }
}
```

### Approve HR by Admin

**Endpoint**: `POST /hr/{id}/approve-manager`
**Auth Required**: Yes
**Authority**: `admin:approve`
**Role**: ADMIN

**Headers**:
```
X-Approver-Id: admin-uuid
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "HR_APPROVED",
  "data": {
    "id": "hr-uuid",
    "status": "ACTIVE"
  }
}
```

### Approve HR by Manager

**Endpoint**: `POST /hr/{id}/approve`
**Auth Required**: Yes
**Authority**: `hr:approve`
**Role**: HR_MANAGER

**Response** (200 OK):
```json
{
  "success": true,
  "message": "HR_APPROVED",
  "data": {
    "id": "hr-uuid",
    "status": "ACTIVE"
  }
}
```

## Advanced User Search

### Search Users (Advanced)

**Endpoint**: `POST /hr/users/search`
**Auth Required**: Yes

**Request**:
```json
{
  "keywords": "javascript engineer",
  "filters": {
    "yearsOfExperience": {
      "min": 3,
      "max": 10
    },
    "location": "San Francisco",
    "skills": ["Java", "Spring Boot"],
    "status": "ACTIVE"
  },
  "pagination": {
    "page": 0,
    "size": 20
  },
  "sorting": {
    "field": "yearsOfExperience",
    "direction": "DESC"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "user-uuid",
        "firstName": "John",
        "yearsOfExperience": 5,
        "skills": ["Java", "Spring Boot"],
        "matchScore": 0.95
      }
    ],
    "totalResults": 250,
    "totalPages": 13
  }
}
```

## Account Management

### Deactivate Account

**Endpoint**: `POST /profile/deactivate`
**Auth Required**: Yes

**Request**:
```json
{
  "reason": "Taking a break from job search",
  "password": "CurrentPassword@123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Account deactivated",
  "data": {
    "username": "john_doe",
    "status": "INACTIVE",
    "reactivationDate": null
  }
}
```

**Note**: Account can be reactivated by logging in again within 90 days.

### Request Account Deletion

**Endpoint**: `POST /profile/delete-request`
**Auth Required**: Yes

**Request**:
```json
{
  "reason": "Leaving the platform",
  "password": "CurrentPassword@123",
  "feedback": "Optional feedback"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Account deletion requested",
  "data": {
    "username": "john_doe",
    "deletionDate": "2024-04-01T00:00:00Z",
    "daysRemaining": 30
  }
}
```

**Note**: Deletion is scheduled for 30 days later. User can cancel during grace period.

### Cancel Account Deletion

**Endpoint**: `POST /profile/cancel-deletion`
**Auth Required**: Yes

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Account deletion cancelled",
  "data": {
    "username": "john_doe",
    "status": "ACTIVE"
  }
}
```

## Privacy Settings

### Get Privacy Settings

**Endpoint**: `GET /profile/privacy-settings`
**Auth Required**: Yes

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "showEmail": true,
    "showPhone": false,
    "showLocation": true,
    "showBio": true,
    "allowMessages": true,
    "allowProfileView": true,
    "allowDataAnalytics": false,
    "profileVisibility": "PUBLIC"  // PUBLIC, PRIVATE, CONNECTIONS_ONLY
  }
}
```

### Update Privacy Settings

**Endpoint**: `PUT /profile/privacy-settings`
**Auth Required**: Yes

**Request**:
```json
{
  "showEmail": false,
  "showPhone": false,
  "showLocation": true,
  "profileVisibility": "CONNECTIONS_ONLY",
  "allowDataAnalytics": false
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Privacy settings updated",
  "data": {
    "showEmail": false,
    "profileVisibility": "CONNECTIONS_ONLY"
  }
}
```

## Notification Settings

### Get Notification Settings

**Endpoint**: `GET /profile/notification-settings`
**Auth Required**: Yes

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "emailNotifications": true,
    "jobAlerts": true,
    "messageNotifications": true,
    "weeklyDigest": true,
    "marketingEmails": false,
    "pushNotifications": true,
    "smsNotifications": false,
    "unsubscribeAll": false
  }
}
```

### Update Notification Settings

**Endpoint**: `PUT /profile/notification-settings`
**Auth Required**: Yes

**Request**:
```json
{
  "emailNotifications": true,
  "jobAlerts": true,
  "messageNotifications": false,
  "weeklyDigest": false,
  "marketingEmails": false,
  "pushNotifications": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Notification settings updated",
  "data": {
    "emailNotifications": true,
    "jobAlerts": true,
    "messageNotifications": false
  }
}
```

## Candidate Skills

### Add Skill

**Endpoint**: `POST /candidates/{candidateId}/skills`
**Auth Required**: Yes

**Request**:
```json
{
  "skillName": "Kubernetes",
  "level": "INTERMEDIATE",
  "endorsements": 5
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "skillId": "skill-uuid",
    "skillName": "Kubernetes",
    "level": "INTERMEDIATE"
  }
}
```

### Update Skill

**Endpoint**: `PUT /candidates/{candidateId}/skills/{skillId}`
**Auth Required**: Yes

**Request**:
```json
{
  "level": "ADVANCED",
  "endorsements": 10
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "skillId": "skill-uuid",
    "skillName": "Kubernetes",
    "level": "ADVANCED"
  }
}
```

### Delete Skill

**Endpoint**: `DELETE /candidates/{candidateId}/skills/{skillId}`
**Auth Required**: Yes

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Skill deleted"
}
```

## Avatar Management

### Upload Avatar

**Endpoint**: `POST /avatar/upload`
**Auth Required**: Yes
**Content-Type**: `multipart/form-data`

**Request**:
```
File: avatar.jpg
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.example.com/avatars/user-uuid.jpg",
    "publicId": "workfitai/user-uuid",
    "width": 200,
    "height": 200
  }
}
```

### Delete Avatar

**Endpoint**: `DELETE /avatar`
**Auth Required**: Yes

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Avatar deleted"
}
```

## Error Responses

Standard error format:

```json
{
  "success": false,
  "message": "User not found",
  "errors": [
    {
      "field": "id",
      "message": "User with given ID does not exist"
    }
  ]
}
```

### Common Error Codes

| Code | Status | Message |
|------|--------|---------|
| `USER_NOT_FOUND` | 404 | User does not exist |
| `INVALID_ROLE` | 400 | Invalid user role |
| `PERMISSION_DENIED` | 403 | Insufficient permissions |
| `INVALID_REQUEST` | 400 | Request validation failed |
| `ACCOUNT_INACTIVE` | 401 | Account is deactivated |
| `ACCOUNT_DELETED` | 401 | Account scheduled for deletion |

---

**Last Updated**: 2026-03-07
**Main Controllers**: `CandidateController.java`, `HRController.java`, `UserProfileController.java`
**Main Services**: `CandidateService.java`, `HRService.java`, `UserService.java`
