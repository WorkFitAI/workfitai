// Admin User Management — shared types for the control panel

export type AdminUserRole = "CANDIDATE" | "HR" | "HR_MANAGER" | "ADMIN"
export type AdminUserStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "BLOCKED"
  | "SUSPENDED"
  | "DEACTIVATED"
  | "WAIT_APPROVED"

export interface AdminUserSummary {
  userId: string
  username: string
  fullName: string
  email: string
  phoneNumber: string | null
  userRole: AdminUserRole
  userStatus: AdminUserStatus
  companyId: string | null
  companyName: string | null
  companyNo: string | null
  department: string | null
  address: string | null
  createdBy: string | null
  createdDate: string
  lastModifiedBy: string | null
  lastModifiedDate: string | null
  deleted: boolean
}

export interface AdminUserFullProfile extends AdminUserSummary {
  careerObjective: string | null
  summary: string | null
  totalExperience: number | null
  education: string | null
  certifications: string | null
  portfolioLink: string | null
  linkedinUrl: string | null
  githubUrl: string | null
  expectedPosition: string | null
  cvIds: string[]
  skills: string[]
}

// ─── Legacy paginated list (kept for detail page usage) ───────────────────

export interface AdminUsersPage {
  content: AdminUserSummary[]
  totalElements: number
  totalPages: number
  /** 0-indexed page number from API */
  number: number
  size: number
  first: boolean
  last: boolean
  numberOfElements: number
  empty: boolean
}

export interface AdminUsersListParams {
  keyword?: string
  page?: number   // 0-indexed
  size?: number
  role?: AdminUserRole | ""
}

// ─── Elasticsearch search ─────────────────────────────────────────────────

export interface EsSearchRequest {
  query?: string
  status?: AdminUserStatus | ""
  role?: AdminUserRole | ""
  blocked?: string          // "true" | "false" | ""
  includeDeleted?: string   // "true" | "false"
  from?: number
  size?: number
  sortField?: string
  sortOrder?: "asc" | "desc"
  includeAggregations?: boolean
}

export interface EsUserHit {
  userId: string
  username: string
  fullName: string
  email: string
  phoneNumber: string | null
  avatarUrl: string | null
  role: AdminUserRole
  status: AdminUserStatus
  blocked: boolean
  deleted: boolean
  createdAt: string
  updatedAt: string | null
  companyNo: string | null
  companyName: string | null
  score: string
  highlights: Record<string, string[]>
}

export interface EsSearchResult {
  hits: EsUserHit[]
  totalHits: number
  from: number
  size: number
  roleAggregations: Partial<Record<AdminUserRole, number>>
  statusAggregations: Partial<Record<AdminUserStatus, number>>
}
