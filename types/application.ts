// Application domain types for Candidate-facing applied-jobs pages

export type ApplicationStatus =
  | "DRAFT"
  | "APPLIED"
  | "REVIEWING"
  | "INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

// ---------------------------------------------------------------------------
// Job snapshot embedded in list items and detail
// ---------------------------------------------------------------------------
export interface JobSnapshot {
  postId: string;
  title: string;
  shortDescription: string;
  description: string;
  employmentType: string;
  experienceLevel: string;
  educationLevel: string;
  requiredExperience: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  location: string;
  quantity: number;
  totalApplications: number;
  createdDate: string;
  lastModifiedDate: string;
  expiresAt: string;
  status: string;
  skillNames: string[];
  bannerUrl: string | null;
  createdBy: string;
  companyNo: string;
  companyName: string;
  companyDescription: string;
  companyAddress: string;
  companyWebsiteUrl: string | null;
  companyLogoUrl: string | null;
  companySize: number | null;
  snapshotAt: string;
}

// ---------------------------------------------------------------------------
// Paginated list — GET /application/my
// ---------------------------------------------------------------------------

/** Single item returned by GET /application/my */
export interface Application {
  /** MongoDB _id  (was applicationId in old API docs) */
  id: string;
  username: string;
  email: string;
  jobId: string;
  cvFileName: string;
  cvContentType: string;
  cvFileSize: number;
  status: ApplicationStatus;
  coverLetter?: string;
  /** ISO datetime — backend field is createdAt (not appliedAt) */
  createdAt: string;
  updatedAt: string;
  jobSnapshot: JobSnapshot;
  companyId: string;
  assignedTo: string;
  assignedAt: string;
  assignedBy: string;
}

/** Pagination meta block */
export interface PaginationMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

/** Paginated list response from GET /application/my */
export interface ApplicationListData {
  items: Application[];
  meta: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Application detail — GET /application/{id}
// ---------------------------------------------------------------------------

/** Single entry in status history */
export interface StatusHistoryItem {
  previousStatus: ApplicationStatus | null;
  newStatus: ApplicationStatus;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

/** HR note visible to candidate */
export interface CandidateNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

/** Full application detail from GET /application/{id} */
export interface ApplicationDetail {
  id: string;
  username: string;
  email: string;
  jobId: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  cvFileName: string;
  cvContentType?: string;
  cvFileSize?: number;
  coverLetter?: string;
  jobSnapshot: JobSnapshot;
  companyId: string;
  statusHistory?: StatusHistoryItem[];
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

/** GET /application/my/count */
export interface ApplicationCount {
  totalApplications: number;
}

/** GET /application/check?jobId= */
export interface ApplicationCheck {
  applied: boolean;
  applicationId?: string;
  status?: ApplicationStatus;
}

/** POST /application — response data after submitting an application */
export interface SubmitApplicationData {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  appliedAt: string;
  cvFileName: string;
  coverLetter?: string;
  message: string;
}

// ---------------------------------------------------------------------------
// HRM / HR management types
// ---------------------------------------------------------------------------

/** HR user within a company — GET /application/company/:companyNo/hr-users */
export interface HRUser {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  userRole: "HR_MANAGER" | "HR";
  userStatus: string;
  companyId: string;
  companyName?: string;
  companyNo?: string;
  department?: string;
  address?: string;
  createdBy?: string;
  createdDate?: string;
}

/** HR note on an application — GET /application/:id/notes */
export interface ApplicationNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  candidateVisible: boolean;
}

/** PUT /application/:id/assign body */
export interface AssignApplicationRequest {
  assignedTo: string; // HR username
}

/** POST/PUT /application/:id/notes body */
export interface NoteUpsertRequest {
  content: string;
  candidateVisible: boolean;
}

/** GET /application/job/:jobId/count response data */
export interface JobApplicationCount {
  count: number;
}

// ---------------------------------------------------------------------------
// HR/HRM jobs & candidates views (new structured endpoints)
// ---------------------------------------------------------------------------

/** Single job item from GET /application/hr/jobs or /application/company/:no/jobs */
export interface HRJobItem {
  jobId: string;
  title: string;
  shortDescription: string;
  location: string;
  employmentType: string;
  experienceLevel: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  expiresAt: string;
  jobStatus: string;
  skillNames: string[];
  totalApplicants: number;
  statusBreakdown: Record<string, number>;
}

/** Candidate summary from GET /application/hr/candidates or /application/company/:no/candidates */
export interface HRCandidateItem {
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  userStatus: string;
  applicationCount: number;
  latestStatus: ApplicationStatus;
  latestApplicationDate: string;
  appliedJobTitles: string[];
}

/** Candidate detail from GET /application/hr/candidates/:username or /application/company/:no/candidates/:username */
export interface CandidateDetail {
  username: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  userStatus: string;
  applications: Application[];
  totalApplications: number;
}

/** Paginated jobs list response */
export interface HRJobListData {
  items: HRJobItem[];
  meta: PaginationMeta;
}

/** Paginated candidates list response */
export interface CandidateListData {
  items: HRCandidateItem[];
  meta: PaginationMeta;
}

// ---------------------------------------------------------------------------
// AI CV Ranking — GET /application/job/{jobId}/cv-ranking
// ---------------------------------------------------------------------------

/** Single ranked entry returned by the AI CV ranking endpoint */
export interface CvRankedApplication {
  application: Application;
  ranked: boolean;
  rank: number | null;
  score: number | null;
  label: string | null;
  explanation: string | null;
  similarityScore: number | null;
  crossScore: number | null;
}

/** Response `data` block from the AI CV ranking endpoint */
export interface CvRankingData {
  applications: CvRankedApplication[];
  job_id: string;
  job_overview: string;
  total_candidates: number;
  ranked_count: number;
  unranked_count: number;
  processing_time_ms: number;
}
