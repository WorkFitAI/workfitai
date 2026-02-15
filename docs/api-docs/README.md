# WorkFitAI Frontend Development Documentation

**Last Updated**: 2025-12-08
**Version**: 0.0.1-SNAPSHOT
**Project**: WorkFitAI Platform

## Quick Start

This directory contains comprehensive frontend development documentation for the WorkFitAI recruitment platform.

---

## 📚 Documentation Files

| File | Purpose | Status |
|------|---------|--------|
| [README.md](./README.md) | This file - quick start guide | ✅ |
| [FRONTEND-DOCUMENTATION-INDEX.md](./FRONTEND-DOCUMENTATION-INDEX.md) | Central index with all specs and examples | ✅ |
| [API-INTEGRATION-GUIDE.md](./API-INTEGRATION-GUIDE.md) | Complete API endpoint reference | ✅ |
| [AUTH-FLOWS.md](./AUTH-FLOWS.md) | Authentication and authorization flows | ✅ |

---

## 🎯 What's Included

### 1. API Integration Guide
Complete reference for all backend API endpoints:
- Authentication endpoints (register, login, logout, refresh)
- User management endpoints
- Job service endpoints (public and HR)
- Application service endpoints
- Request/response TypeScript interfaces
- Error handling patterns
- Pagination and filtering
- File upload specifications

**Start here** if you need to make API calls.

---

### 2. Authentication Flows
Detailed authentication implementation guide:
- User roles (CANDIDATE, HR, HR_MANAGER, ADMIN)
- Registration flows (with OTP verification)
- Login and token management
- Token refresh mechanism
- Role-based access control
- Route guards implementation
- Security best practices

**Start here** if you need to implement authentication.

---

### 3. Frontend Documentation Index
Comprehensive guide covering:
- Complete TypeScript type definitions
- Role-based UI specifications
- State management recommendations
- UI component catalog
- Application workflows
- Routing structure
- Testing checklist
- Deployment guidelines

**Start here** for overall project setup.

---

## 🚀 Quick Implementation Guide

### Step 1: Set Up Project

```bash
# Create React app (example)
npm create vite@latest workfitai-frontend -- --template react-ts

# Install dependencies
cd workfitai-frontend
npm install axios react-router-dom @reduxjs/toolkit react-redux

# For UI components
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
```

### Step 2: Configure Environment

```bash
# .env.development
VITE_API_GATEWAY_URL=http://localhost:8088
VITE_API_TIMEOUT=30000
```

### Step 3: Create Core Services

**AuthService** (`src/services/AuthService.ts`):
```typescript
class AuthService {
  async login(credentials: LoginRequest): Promise<TokensResponse> {
    // See AUTH-FLOWS.md for complete implementation
  }

  async refreshToken(): Promise<void> {
    // See AUTH-FLOWS.md for complete implementation
  }

  async logout(): Promise<void> {
    // See AUTH-FLOWS.md for complete implementation
  }
}
```

**ApiClient** (`src/services/ApiClient.ts`):
```typescript
class ApiClient {
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // See API-INTEGRATION-GUIDE.md for complete implementation
  }
}
```

### Step 4: Set Up Routing

```typescript
// See FRONTEND-DOCUMENTATION-INDEX.md for complete routing structure
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />

  <Route path="/candidate/*" element={<ProtectedRoute roles={['CANDIDATE']} />}>
    <Route index element={<CandidateDashboard />} />
    {/* More candidate routes */}
  </Route>

  <Route path="/hr/*" element={<ProtectedRoute roles={['HR', 'HR_MANAGER']} />}>
    <Route index element={<HRDashboard />} />
    {/* More HR routes */}
  </Route>
</Routes>
```

### Step 5: Implement Authentication Pages

1. **LoginPage**: Email/password form → API call → Store tokens → Redirect
2. **RegisterPage**: Multi-step form → Submit → OTP verification
3. **OTPVerificationPage**: 6-digit input → Verify → Success message

See `AUTH-FLOWS.md` for detailed implementations.

### Step 6: Build Role-Specific Dashboards

**Candidate Dashboard**:
- Application statistics
- Recent applications
- Recommended jobs
- Profile completion

**HR Dashboard**:
- Active jobs count
- Applications today/week
- Applications by status
- Recent applications

See `FRONTEND-DOCUMENTATION-INDEX.md` for complete UI specs.

---

## 📋 User Roles and Permissions

| Role | Key Features |
|------|--------------|
| **CANDIDATE** | Browse jobs, submit applications, track status |
| **HR** | Create jobs, review applications, update status |
| **HR_MANAGER** | All HR features + approve HR staff + company management |
| **ADMIN** | Full platform access, approve HR managers, user management |

See `AUTH-FLOWS.md` for complete permissions matrix.

---

## 🔗 API Endpoints Quick Reference

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/verify-otp` - Verify email OTP
- `POST /auth/login` - Login and get tokens
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout and invalidate tokens

### Jobs
- `GET /public/jobs` - Browse published jobs (public)
- `GET /public/jobs/{id}` - Get job details (public)
- `POST /hr/jobs` - Create job posting (HR)
- `PUT /hr/jobs/{id}/{status}` - Update job status (HR)

### Applications
- `POST /api/v1/applications` - Submit application (Candidate)
- `GET /api/v1/applications/my` - Get my applications (Candidate)
- `GET /api/v1/applications/job/{jobId}` - Get applications for job (HR)
- `PUT /api/v1/applications/{id}/status` - Update application status (HR)

See `API-INTEGRATION-GUIDE.md` for complete endpoint reference.

---

## 📦 TypeScript Types

All TypeScript interfaces are provided in `FRONTEND-DOCUMENTATION-INDEX.md`:

```typescript
// Authentication
interface LoginRequest { ... }
interface TokensResponse { ... }
interface RegisterRequest { ... }

// Users
interface UserBaseResponse { ... }
type UserRole = 'CANDIDATE' | 'HR' | 'HR_MANAGER' | 'ADMIN';

// Jobs
interface Job { ... }
interface Company { ... }
interface CreateJobRequest { ... }
type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

// Applications
interface Application { ... }
interface CreateApplicationRequest { ... }
type ApplicationStatus = 'APPLIED' | 'REVIEWING' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';

// API Responses
interface ApiResponse<T> { ... }
interface PaginatedResponse<T> { ... }
interface ApiError { ... }
```

---

## ✅ Development Checklist

### Phase 1: Authentication
- [ ] Implement AuthService
- [ ] Create login page
- [ ] Create registration page (with role selection)
- [ ] Implement OTP verification
- [ ] Set up token refresh mechanism
- [ ] Create protected route component
- [ ] Implement logout functionality

### Phase 2: Public Features
- [ ] Landing page
- [ ] Public job browsing page
- [ ] Job details page
- [ ] Job filtering and search

### Phase 3: Candidate Features
- [ ] Candidate dashboard
- [ ] Job application submission
- [ ] My applications page
- [ ] Application status tracking
- [ ] Profile management

### Phase 4: HR Features
- [ ] HR dashboard
- [ ] Create job posting
- [ ] Edit job posting
- [ ] View job applications
- [ ] Review application details
- [ ] Update application status

### Phase 5: Admin Features
- [ ] Admin dashboard
- [ ] User management
- [ ] Pending approvals (HR Manager)
- [ ] System analytics

---

## 🧪 Testing

### Manual Testing
Use the Postman collections in `/api-docs` directory:
- `Auth-Service.postman_collection.json`
- `Application-Service.postman_collection.json`
- `WorkFitAI-Dev.postman_environment.json`

### Test Accounts (Seeded)
```
**Admin Account**:
- usernameOrEmail: `admin@workfitai.com`
- password: `admin123`

**HR Manager**:
- usernameOrEmail: `hrmanager@techcorp.com`
- password: `hrmanager123`

**HR Staff**:
- usernameOrEmail: `hr@techcorp.com`
- password: `hr123`
```

### Testing Checklist
See `FRONTEND-DOCUMENTATION-INDEX.md` for complete testing checklist.

---

## 🔒 Security Considerations

1. **Token Storage**:
   - ✅ Store access token in memory or sessionStorage
   - ✅ Use HttpOnly cookies for refresh tokens (automatic)
   - ❌ NEVER store tokens in localStorage (XSS risk)

2. **API Calls**:
   - Always include `Authorization: Bearer {token}` header
   - Use `credentials: 'include'` for cookie-based auth
   - Handle 401 errors with automatic token refresh

3. **Input Validation**:
   - Validate on both frontend and backend
   - Sanitize user inputs
   - Use TypeScript for type safety

4. **File Uploads**:
   - Validate file type (PDF only)
   - Validate file size (max 5MB)
   - Show user-friendly error messages

See `AUTH-FLOWS.md` for detailed security best practices.

---

## 📖 Common Workflows

### Workflow 1: User Registration (Candidate)
1. Fill registration form → `POST /auth/register`
2. Receive OTP via email
3. Enter OTP → `POST /auth/verify-otp`
4. Account activated automatically
5. Redirect to login page
6. Login → Redirect to candidate dashboard

### Workflow 2: Job Application
1. Browse jobs → `GET /public/jobs`
2. Click job → View details
3. Click "Apply Now"
4. Check if already applied → `GET /api/v1/applications/check?jobId={id}`
5. Upload CV + cover letter
6. Submit → `POST /api/v1/applications`
7. Receive confirmation email
8. Track status on "My Applications" page

### Workflow 3: HR Review Applications
1. Login as HR
2. View company jobs → `GET /hr/jobs`
3. Select job → View applications → `GET /api/v1/applications/job/{jobId}`
4. Click application → View details
5. Download/preview CV
6. Update status → `PUT /api/v1/applications/{id}/status?status=REVIEWING`
7. Candidate receives status update email

See `FRONTEND-DOCUMENTATION-INDEX.md` for detailed flow diagrams.

---

## 🛠️ Troubleshooting

### Issue: 401 Unauthorized
**Solution**: Token expired. Implement automatic token refresh (see `AUTH-FLOWS.md`).

### Issue: 403 Forbidden
**Possible causes**:
1. User account pending approval (HR/HR_MANAGER)
2. Insufficient permissions for the action
**Solution**: Check user role and account status.

### Issue: CORS Error
**Solution**: Ensure API Gateway CORS is configured for your origin. In development, use `http://localhost:3000`.

### Issue: File Upload Fails
**Possible causes**:
1. File not PDF format
2. File exceeds 5MB
3. Missing Content-Type header
**Solution**: Validate file on client-side before upload.

---

## 📞 Support

**Documentation**:
- Start with this README for overview
- Use `FRONTEND-DOCUMENTATION-INDEX.md` for comprehensive guide
- Refer to `API-INTEGRATION-GUIDE.md` for API details
- Check `AUTH-FLOWS.md` for authentication implementation

**Backend Documentation**:
- System Architecture: `/docs/system-architecture.md`
- Application Flow: `/docs/APPLICATION_FLOW.md`
- Registration Flow: `/docs/REGISTRATION_FLOW.md`

**API Testing**:
- Import Postman collections from `/api-docs/`
- Use seeded test accounts for development

---

## 🎓 Learning Path

**New to the project?**
1. Read this README (you are here)
2. Review `FRONTEND-DOCUMENTATION-INDEX.md` for overall architecture
3. Study `AUTH-FLOWS.md` to understand authentication
4. Refer to `API-INTEGRATION-GUIDE.md` when making API calls
5. Build one feature at a time (start with authentication)

**Ready to code?**
1. Set up project with chosen framework
2. Implement AuthService and ApiClient
3. Create authentication pages (login, register, OTP)
4. Build protected routes
5. Implement role-specific dashboards
6. Add job browsing and application features

---

## 📝 Summary

This frontend documentation provides everything needed to build the WorkFitAI platform UI:

✅ **Complete API Reference** - All endpoints with TypeScript examples
✅ **Authentication Flows** - Registration, login, token management
✅ **TypeScript Types** - Ready-to-use interfaces and types
✅ **UI Specifications** - Role-based component requirements
✅ **State Management** - Recommended structure and patterns
✅ **Workflows** - Step-by-step user flows with diagrams
✅ **Testing Guide** - Comprehensive testing checklist
✅ **Security Best Practices** - Token storage, validation, CORS

**Start building immediately** - all information frontend developers need is here.

---

**Version**: 0.0.1-SNAPSHOT
**Last Updated**: 2025-12-08
**Maintained by**: WorkFitAI Development Team
