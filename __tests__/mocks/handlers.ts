import { http, HttpResponse } from "msw";
import type {
  Application,
  ApplicationDetail,
  ApplicationStatus,
  PaginationMeta,
  StatusHistoryItem,
  SubmitApplicationData,
  HRJobItem,
  HRCandidateItem,
  CandidateDetail,
} from "@/types/application";
import type { CVMetadata, CVListResponse } from "@/types/cv";

const API = "https://api.workfitai.uk";

/** Like apiSuccess but with a `status` field — required by services that check res.status */
export function apiStatusSuccess<T>(data: T, message = "OK") {
  return HttpResponse.json({ status: 200, message, data });
}

// ── Application fixtures ────────────────────────────────────────────────────

export function mockPaginationMeta(
  overrides: Partial<PaginationMeta> = {},
): PaginationMeta {
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
  };
}

export function mockApplication(
  overrides: Partial<Application> = {},
): Application {
  return {
    id: "app-001",
    username: "testuser",
    email: "testuser@example.com",
    jobId: "job-001",
    cvFileName: "resume.pdf",
    cvContentType: "application/pdf",
    cvFileSize: 102400,
    status: "APPLIED" as ApplicationStatus,
    createdAt: "2026-01-15T08:00:00Z",
    updatedAt: "2026-01-15T08:00:00Z",
    companyId: "company-001",
    assignedTo: "",
    assignedAt: "",
    assignedBy: "",
    jobSnapshot: {
      postId: "job-001",
      title: "Frontend Engineer",
      shortDescription: "Build great UIs",
      description: "We are looking for a skilled frontend engineer.",
      employmentType: "FULL_TIME",
      experienceLevel: "Mid",
      educationLevel: "Bachelor",
      requiredExperience: "2 years",
      salaryMin: 2000,
      salaryMax: 4000,
      currency: "USD",
      location: "Ho Chi Minh City",
      quantity: 2,
      totalApplications: 5,
      createdDate: "2026-01-01T00:00:00Z",
      lastModifiedDate: "2026-01-10T00:00:00Z",
      expiresAt: "2026-06-01T00:00:00Z",
      status: "OPEN",
      skillNames: ["React", "TypeScript"],
      bannerUrl: null,
      createdBy: "hr@company.com",
      companyNo: "C001",
      companyName: "Acme Corp",
      companyDescription: "A great company.",
      companyAddress: "123 Main St",
      companyWebsiteUrl: null,
      companyLogoUrl: null,
      companySize: 50,
      snapshotAt: "2026-01-15T08:00:00Z",
    },
    ...overrides,
  };
}

export function mockApplicationDetail(
  overrides: Partial<ApplicationDetail> = {},
): ApplicationDetail {
  const base = mockApplication();
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
  };
}

export function mockStatusHistoryItem(
  overrides: Partial<StatusHistoryItem> = {},
): StatusHistoryItem {
  return {
    previousStatus: null,
    newStatus: "APPLIED",
    changedBy: "system",
    changedAt: "2026-01-15T08:00:00Z",
    ...overrides,
  };
}

export function mockSubmitApplicationData(
  overrides: Partial<SubmitApplicationData> = {},
): SubmitApplicationData {
  return {
    applicationId: "app-001",
    jobId: "job-001",
    jobTitle: "Frontend Engineer",
    companyName: "Acme Corp",
    status: "APPLIED",
    appliedAt: "2026-01-15T08:00:00Z",
    cvFileName: "resume.pdf",
    message: "Application submitted successfully.",
    ...overrides,
  };
}

/** Helper — build a successful login response */
export function loginSuccess(roles: string[] = ["CANDIDATE"]) {
  return HttpResponse.json({
    status: 200,
    message: "Tokens issued",
    data: {
      accessToken: "test-access-token",
      expiryInMs: 900_000,
      username: "testuser",
      roles,
      companyId: null,
    },
  });
}

/** Helper — build a standard ApiResponse success */
export function apiSuccess<T>(data: T, message = "OK") {
  return HttpResponse.json({ success: true, message, data });
}

/** Helper — build a standard ApiResponse error */
export function apiError(message: string, status: number) {
  return HttpResponse.json({ success: false, message, data: null }, { status });
}

export function mockHRUser(
  overrides: Partial<{
    userId: string;
    username: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    userRole: "HR_MANAGER" | "HR";
    userStatus: string;
    companyId: string;
    companyName: string;
    companyNo: string;
  }> = {},
) {
  return {
    userId: "hr-user-001",
    username: "hrtest1",
    fullName: "HR Test User 1",
    email: "hrtest1@gmail.com",
    phoneNumber: "+84900000001",
    userRole: "HR" as const,
    userStatus: "ACTIVE",
    companyId: "company-001",
    companyName: "Acme Corp",
    companyNo: "C001",
    ...overrides,
  };
}

export function mockApplicationNote(
  overrides: Partial<{
    id: string;
    author: string;
    content: string;
    candidateVisible: boolean;
    createdAt: string;
    updatedAt: string | null;
  }> = {},
) {
  return {
    id: "note-001",
    author: "hrtest1",
    content: "This candidate looks promising.",
    candidateVisible: false,
    createdAt: "2026-01-15T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
    ...overrides,
  };
}

export function mockHRJobItem(overrides: Partial<HRJobItem> = {}): HRJobItem {
  return {
    jobId: "job-001",
    title: "Frontend Engineer",
    shortDescription: "Build great UIs",
    location: "Ho Chi Minh City",
    employmentType: "FULL_TIME",
    experienceLevel: "Mid",
    salaryMin: 2000,
    salaryMax: 4000,
    currency: "USD",
    expiresAt: "2026-06-01T00:00:00Z",
    jobStatus: "OPEN",
    skillNames: ["React", "TypeScript"],
    totalApplicants: 5,
    statusBreakdown: { APPLIED: 3, REVIEWING: 2 },
    ...overrides,
  };
}

export function mockHRCandidateItem(
  overrides: Partial<HRCandidateItem> = {},
): HRCandidateItem {
  return {
    username: "candidate1",
    fullName: "Candidate One",
    email: "candidate1@example.com",
    phoneNumber: "+84900000001",
    userStatus: "ACTIVE",
    applicationCount: 2,
    latestStatus: "APPLIED" as ApplicationStatus,
    latestApplicationDate: "2026-01-15T08:00:00Z",
    appliedJobTitles: ["Frontend Engineer", "Backend Developer"],
    ...overrides,
  };
}

export function mockCandidateDetail(
  overrides: Partial<CandidateDetail> = {},
): CandidateDetail {
  return {
    username: "candidate1",
    userId: "user-001",
    fullName: "Candidate One",
    email: "candidate1@example.com",
    phoneNumber: "+84900000001",
    userStatus: "ACTIVE",
    applications: [mockApplication()],
    totalApplications: 1,
    ...overrides,
  };
}

export function mockCompanyApplication(
  overrides: Partial<{
    id: string;
    username: string;
    fullName: string;
    email: string;
    jobId: string;
    status: string;
    createdAt: string;
    companyId: string;
    assignedTo: string;
  }> = {},
) {
  return {
    id: "app-001",
    username: "candidate1",
    fullName: "Candidate One",
    email: "candidate1@gmail.com",
    jobId: "job-001",
    status: "APPLIED",
    createdAt: "2026-01-15T08:00:00Z",
    companyId: "company-001",
    assignedTo: "",
    ...overrides,
  };
}

// ── CV fixtures ───────────────────────────────────────────────────────────────

export function mockCVMetadata(
  overrides: Partial<CVMetadata> = {},
): CVMetadata {
  return {
    cvId: "cv-001",
    objectName: "abc123-resume.pdf",
    headline: null,
    summary: "",
    pdfUrl: "http://minio:9000/cvs-files/abc123-resume.pdf",
    belongTo: "testuser",
    templateType: "UPLOAD",
    sections: {
      skills: [],
      projects: [],
      education: [],
      languages: [],
      experience: [],
    },
    createdAt: "2026-01-15 08:00:00 AM",
    createdBy: "testuser@example.com",
    updatedAt: "2026-01-15 08:00:00 AM",
    updatedBy: "testuser@example.com",
    exist: true,
    ...overrides,
  };
}

export function mockCVListResponse(
  overrides: Partial<CVListResponse> = {},
): CVListResponse {
  return {
    result: [mockCVMetadata()],
    meta: { page: 0, pageSize: 10, pages: 1, total: 1 },
    ...overrides,
  };
}

// ── Job fixtures ──────────────────────────────────────────────────────────────

export function mockJobItem(
  overrides: Partial<{
    postId: string;
    title: string;
    company: {
      name: string;
      address: string;
      logoUrl: string | null;
      companyNo: string;
      description: string;
      websiteUrl: string;
      size: number;
    };
    employmentType: string;
    experienceLevel: string;
    skillNames: string[];
    salaryMin: number;
    salaryMax: number;
    currency: string;
    location: string;
    status: string;
    createdDate: string;
    createdBy: string;
    lastModifiedDate: string;
    lastModifiedBy: string;
  }> = {},
) {
  return {
    postId: "job-001",
    title: "Frontend Developer",
    shortDescription: "Build great UIs",
    company: {
      companyNo: "C001",
      name: "Tech Corp",
      description: "A tech company",
      address: "123 Innovation St, Hanoi",
      websiteUrl: "https://techcorp.com",
      logoUrl: null,
      size: 50,
    },
    employmentType: "Full-time",
    experienceLevel: "Senior",
    createdDate: "2026-01-15T08:00:00Z",
    createdBy: "hr@techcorp.com",
    skillNames: ["React", "TypeScript"],
    salaryMin: 2000,
    salaryMax: 5000,
    currency: "USD",
    location: "Hanoi",
    status: "PUBLISHED",
    lastModifiedDate: "2026-01-16T08:00:00Z",
    lastModifiedBy: "hr@techcorp.com",
    ...overrides,
  };
}

export const handlers = [
  // ── Registration ──────────────────────────────────────────────────
  http.post(`${API}/auth/register`, () =>
    apiSuccess(
      {
        userId: "mock-uid",
        status: "PENDING_VERIFICATION",
        message: "OTP sent",
      },
      "Registration successful",
    ),
  ),

  http.post(`${API}/auth/verify-otp`, () =>
    apiSuccess({
      userId: "mock-uid",
      status: "ACTIVE",
      message: "Email verified",
    }),
  ),

  http.post(`${API}/auth/resend-otp`, () =>
    apiSuccess({ message: "OTP resent", expiresIn: 300 }),
  ),

  // ── Login ─────────────────────────────────────────────────────────
  http.post(`${API}/auth/login`, () => loginSuccess(["CANDIDATE"])),

  // ── Password reset ────────────────────────────────────────────────
  http.post(`${API}/auth/forgot-password`, () =>
    apiSuccess({ message: "Password reset OTP sent", expiresIn: 1800 }),
  ),

  http.post(`${API}/auth/verify-reset-otp`, () =>
    apiSuccess({ resetToken: "test-reset-token", expiresIn: 1800 }),
  ),

  http.post(`${API}/auth/reset-password`, () =>
    HttpResponse.json({
      success: true,
      message: "Password reset successfully",
    }),
  ),

  // ── Session ───────────────────────────────────────────────────────
  http.post(`${API}/auth/logout`, () =>
    HttpResponse.json({ success: true, message: "Logout successful" }),
  ),

  http.post(`${API}/auth/refresh`, () =>
    HttpResponse.json({
      status: 200,
      data: {
        accessToken: "new-token",
        expiryInMs: 900_000,
        username: "testuser",
        roles: ["CANDIDATE"],
      },
    }),
  ),

  // ── Application ───────────────────────────────────────────────────
  // NOTE: /application/check and /application/my/count must be registered
  // before /application/:id to prevent the wildcard from matching them first.

  http.get(`${API}/application/my`, () =>
    apiSuccess({ items: [mockApplication()], meta: mockPaginationMeta() }),
  ),

  http.get(`${API}/application/my/count`, () =>
    apiSuccess({ totalApplications: 1 }),
  ),

  // Specific paths before wildcard /:id
  http.get(`${API}/application/check`, () => apiSuccess({ applied: false })),

  http.get(`${API}/application/:id/history`, () =>
    apiSuccess([mockStatusHistoryItem()]),
  ),

  http.get(`${API}/application/:id/notes`, () => apiSuccess({ notes: [] })),

  http.get(`${API}/application/:id`, () => apiSuccess(mockApplicationDetail())),

  http.delete(`${API}/application/:id`, () =>
    HttpResponse.json({ success: true, message: "Withdrawn" }),
  ),

  http.post(`${API}/application`, () =>
    apiSuccess(
      mockSubmitApplicationData(),
      "Application submitted successfully.",
    ),
  ),

  // ── HR Jobs & Candidates ──────────────────────────────────────────────────
  http.get(`${API}/application/hr/jobs`, () =>
    apiSuccess({ items: [mockHRJobItem()], meta: mockPaginationMeta() }),
  ),

  // More-specific path registered before the wildcard variant
  http.get(`${API}/application/hr/candidates/:username`, () =>
    apiSuccess(mockCandidateDetail()),
  ),

  http.get(`${API}/application/hr/candidates`, () =>
    apiSuccess({ items: [mockHRCandidateItem()], meta: mockPaginationMeta() }),
  ),

  // ── HRM Company Applications ──────────────────────────────────────────
  http.get(`${API}/application/company/:companyNo/hr-users`, () =>
    apiSuccess([mockHRUser()]),
  ),

  http.get(`${API}/application/company/:companyNo/jobs`, () =>
    apiSuccess({ items: [mockHRJobItem()], meta: mockPaginationMeta() }),
  ),

  // More-specific path registered before the wildcard variant
  http.get(`${API}/application/company/:companyNo/candidates/:username`, () =>
    apiSuccess(mockCandidateDetail()),
  ),

  http.get(`${API}/application/company/:companyNo/candidates`, () =>
    apiSuccess({ items: [mockHRCandidateItem()], meta: mockPaginationMeta() }),
  ),

  http.get(`${API}/application/company/:companyNo`, () =>
    apiSuccess({
      items: [mockCompanyApplication()],
      meta: mockPaginationMeta(),
    }),
  ),

  // ── HR Assigned Applications ──────────────────────────────────────────
  http.get(`${API}/application/assigned/:hrUsername`, () =>
    apiSuccess({
      items: [mockCompanyApplication({ assignedTo: "hrtest1" })],
      meta: mockPaginationMeta(),
    }),
  ),

  // ── Application status update ─────────────────────────────────────────
  http.put(`${API}/application/:id/status`, () =>
    apiSuccess({ id: "app-001", status: "REVIEWING" }),
  ),

  // ── Application assignment ────────────────────────────────────────────
  http.put(`${API}/application/:id/assign`, () =>
    apiSuccess({ id: "app-001", assignedTo: "hrtest1" }),
  ),

  // ── Application notes CRUD ────────────────────────────────────────────
  http.post(`${API}/application/:id/notes`, () =>
    apiSuccess(mockApplicationNote()),
  ),

  http.put(`${API}/application/:id/notes/:noteId`, () =>
    apiSuccess(mockApplicationNote({ content: "Updated note content" })),
  ),

  http.delete(`${API}/application/:id/notes/:noteId`, () =>
    HttpResponse.json({ success: true, message: "Note deleted" }),
  ),

  // ── Skills (public) ──────────────────────────────────────────────────────
  http.get(`${API}/job/public/skills`, () => apiStatusSuccess({ result: [] })),

  // ── Jobs (public) ─────────────────────────────────────────────────────────
  // Uses apiStatusSuccess because jobService.getJobs checks res.status
  http.get(`${API}/job/public/jobs`, () =>
    apiStatusSuccess({
      result: [
        mockJobItem(),
        mockJobItem({ postId: "job-002", title: "Backend Engineer" }),
      ],
      meta: { page: 0, pageSize: 12, pages: 1, total: 2 },
    }),
  ),

  http.get(`${API}/job/public/jobs/:id`, () => apiStatusSuccess(mockJobItem())),

  // ── CVs (candidate) ───────────────────────────────────────────────────────
  http.get(`${API}/cv/candidate/:username`, () =>
    HttpResponse.json({ data: mockCVListResponse() }),
  ),

  http.post(`${API}/cv/candidate/upload`, () =>
    HttpResponse.json({
      data: { cvId: "cv-new-001", objectName: "new-resume.pdf" },
    }),
  ),

  http.delete(`${API}/cv/candidate/:cvId`, () =>
    HttpResponse.json({ success: true, message: "CV deleted" }),
  ),
];
