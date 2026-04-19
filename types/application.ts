// Application domain types for Candidate-facing applied-jobs pages

export type ApplicationStatus =
  | "DRAFT"
  | "APPLIED"
  | "REVIEWING"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_COMPLETED"
  | "OFFER"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

/** Single item returned by GET /application/my */
export interface Application {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  appliedAt: string;
  lastUpdated: string;
}

/** Paginated list response from GET /application/my */
export interface ApplicationListData {
  applications: Application[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/** Job snapshot embedded in application detail */
export interface JobSnapshot {
  title: string;
  description: string;
  companyName: string;
  location: string;
  employmentType: string;
  salaryMin: number;
  salaryMax: number;
}

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

/** Full application detail from GET /application/{applicationId} */
export interface ApplicationDetail {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyId: string;
  status: ApplicationStatus;
  appliedAt: string;
  cvFileName: string;
  coverLetter?: string;
  jobSnapshot: JobSnapshot;
  statusHistory: StatusHistoryItem[];
  candidateVisibleNotes: CandidateNote[];
}

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
