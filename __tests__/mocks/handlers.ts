import { http, HttpResponse } from 'msw'
import type {
  Application,
  ApplicationDetail,
  ApplicationStatus,
  PaginationMeta,
  StatusHistoryItem,
  SubmitApplicationData,
} from '@/types/application'

const API = 'http://localhost:9085'

// ── Application fixtures ────────────────────────────────────────────────────

export function mockPaginationMeta(overrides: Partial<PaginationMeta> = {}): PaginationMeta {
  return {
    page: 0,
    size: 10,
    totalElements: 1,
    totalPages: 1,
    first: true,
    last: true,
    hasNext: false,
    hasPrevious: false,
    ...overrides,
  }
}

export function mockApplication(overrides: Partial<Application> = {}): Application {
  return {
    id: 'app-001',
    username: 'testuser',
    email: 'testuser@example.com',
    jobId: 'job-001',
    cvFileName: 'resume.pdf',
    cvContentType: 'application/pdf',
    cvFileSize: 102400,
    status: 'APPLIED' as ApplicationStatus,
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z',
    companyId: 'company-001',
    assignedTo: '',
    assignedAt: '',
    assignedBy: '',
    jobSnapshot: {
      postId: 'job-001',
      title: 'Frontend Engineer',
      shortDescription: 'Build great UIs',
      description: 'We are looking for a skilled frontend engineer.',
      employmentType: 'FULL_TIME',
      experienceLevel: 'Mid',
      educationLevel: 'Bachelor',
      requiredExperience: '2 years',
      salaryMin: 2000,
      salaryMax: 4000,
      currency: 'USD',
      location: 'Ho Chi Minh City',
      quantity: 2,
      totalApplications: 5,
      createdDate: '2026-01-01T00:00:00Z',
      lastModifiedDate: '2026-01-10T00:00:00Z',
      expiresAt: '2026-06-01T00:00:00Z',
      status: 'OPEN',
      skillNames: ['React', 'TypeScript'],
      bannerUrl: null,
      createdBy: 'hr@company.com',
      companyNo: 'C001',
      companyName: 'Acme Corp',
      companyDescription: 'A great company.',
      companyAddress: '123 Main St',
      companyWebsiteUrl: null,
      companyLogoUrl: null,
      companySize: 50,
      snapshotAt: '2026-01-15T08:00:00Z',
    },
    ...overrides,
  }
}

export function mockApplicationDetail(overrides: Partial<ApplicationDetail> = {}): ApplicationDetail {
  const base = mockApplication()
  return {
    id: base.id,
    username: base.username,
    email: base.email,
    jobId: base.jobId,
    status: base.status,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
    cvFileName: base.cvFileName,
    cvContentType: base.cvContentType,
    cvFileSize: base.cvFileSize,
    jobSnapshot: base.jobSnapshot,
    companyId: base.companyId,
    statusHistory: [],
    ...overrides,
  }
}

export function mockStatusHistoryItem(overrides: Partial<StatusHistoryItem> = {}): StatusHistoryItem {
  return {
    previousStatus: null,
    newStatus: 'APPLIED',
    changedBy: 'system',
    changedAt: '2026-01-15T08:00:00Z',
    ...overrides,
  }
}

export function mockSubmitApplicationData(overrides: Partial<SubmitApplicationData> = {}): SubmitApplicationData {
  return {
    applicationId: 'app-001',
    jobId: 'job-001',
    jobTitle: 'Frontend Engineer',
    companyName: 'Acme Corp',
    status: 'APPLIED',
    appliedAt: '2026-01-15T08:00:00Z',
    cvFileName: 'resume.pdf',
    message: 'Application submitted successfully.',
    ...overrides,
  }
}

/** Helper — build a successful login response */
export function loginSuccess(roles: string[] = ['CANDIDATE']) {
  return HttpResponse.json({
    status: 200,
    message: 'Tokens issued',
    data: {
      accessToken: 'test-access-token',
      expiryInMs: 900_000,
      username: 'testuser',
      roles,
      companyId: null,
    },
  })
}

/** Helper — build a standard ApiResponse success */
export function apiSuccess<T>(data: T, message = 'OK') {
  return HttpResponse.json({ success: true, message, data })
}

/** Helper — build a standard ApiResponse error */
export function apiError(message: string, status: number) {
  return HttpResponse.json({ success: false, message, data: null }, { status })
}

export const handlers = [
  // ── Registration ──────────────────────────────────────────────────
  http.post(`${API}/auth/register`, () =>
    apiSuccess({ userId: 'mock-uid', status: 'PENDING_VERIFICATION', message: 'OTP sent' }, 'Registration successful')
  ),

  http.post(`${API}/auth/verify-otp`, () =>
    apiSuccess({ userId: 'mock-uid', status: 'ACTIVE', message: 'Email verified' })
  ),

  http.post(`${API}/auth/resend-otp`, () =>
    apiSuccess({ message: 'OTP resent', expiresIn: 300 })
  ),

  // ── Login ─────────────────────────────────────────────────────────
  http.post(`${API}/auth/login`, () => loginSuccess(['CANDIDATE'])),

  // ── Password reset ────────────────────────────────────────────────
  http.post(`${API}/auth/forgot-password`, () =>
    apiSuccess({ message: 'Password reset OTP sent', expiresIn: 1800 })
  ),

  http.post(`${API}/auth/verify-reset-otp`, () =>
    apiSuccess({ resetToken: 'test-reset-token', expiresIn: 1800 })
  ),

  http.post(`${API}/auth/reset-password`, () =>
    HttpResponse.json({ success: true, message: 'Password reset successfully' })
  ),

  // ── Session ───────────────────────────────────────────────────────
  http.post(`${API}/auth/logout`, () =>
    HttpResponse.json({ success: true, message: 'Logout successful' })
  ),

  http.post(`${API}/auth/refresh`, () =>
    HttpResponse.json({
      status: 200,
      data: { accessToken: 'new-token', expiryInMs: 900_000, username: 'testuser', roles: ['CANDIDATE'] },
    })
  ),

  // ── Application ───────────────────────────────────────────────────
  // NOTE: /application/check and /application/my/count must be registered
  // before /application/:id to prevent the wildcard from matching them first.

  http.get(`${API}/application/my`, () =>
    apiSuccess({ items: [mockApplication()], meta: mockPaginationMeta() })
  ),

  http.get(`${API}/application/my/count`, () =>
    apiSuccess({ totalApplications: 1 })
  ),

  // Specific paths before wildcard /:id
  http.get(`${API}/application/check`, () =>
    apiSuccess({ applied: false })
  ),

  http.get(`${API}/application/:id/history`, () =>
    apiSuccess([mockStatusHistoryItem()])
  ),

  http.get(`${API}/application/:id/notes`, () =>
    apiSuccess({ notes: [] })
  ),

  http.get(`${API}/application/:id`, () =>
    apiSuccess(mockApplicationDetail())
  ),

  http.delete(`${API}/application/:id`, () =>
    HttpResponse.json({ success: true, message: 'Withdrawn' })
  ),

  http.post(`${API}/application`, () =>
    apiSuccess(mockSubmitApplicationData(), 'Application submitted successfully.')
  ),
]
