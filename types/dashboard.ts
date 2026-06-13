// ── Shared primitives ──────────────────────────────────────────────────────

export interface VolumeTrendPoint {
  date: string // "2026-06-03"
  count: number
}

export interface AuditStats {
  totalEvents: number
  failedEvents: number
  successRate: number
  uniqueActors: number
  byService: Record<string, number>
  byAction: Record<string, number>
  byActor: Record<string, number>
}

// ── Admin Dashboard ────────────────────────────────────────────────────────

export interface AdminPlatformTotals {
  totalApplications: number
  totalDeleted: number
  totalCompanies: number
  totalJobs: number
}

export interface AdminCompanyRow {
  companyId: string
  companyName: string
  applications: number
  activeJobs: number
  avgTimeToHire: number
}

export interface AdminTopJob {
  jobId: string
  jobTitle: string
  companyName: string
  applications: number
  hires: number
}

export interface AdminTopJobByViews {
  jobId: string
  title: string
  companyName: string
  views: number
}

export interface HrsByCompanyRow {
  companyNo: string
  companyName: string
  hrCount: number
  hrManagerCount: number
}

export interface AdminGrowthMetrics {
  last7Days: number
  last30Days: number
  monthOverMonth: number
  yearOverYear: number
}

export interface AdminApplicationStats {
  platformTotals: AdminPlatformTotals
  byCompany: AdminCompanyRow[]
  byStatus: Record<string, number>
  growthMetrics: AdminGrowthMetrics
  topJobs: AdminTopJob[]
  avgTimeToHire: number
  platformConversionRates: Record<string, number>
  volumeTrend: VolumeTrendPoint[]
  offerAcceptedCount: number
  offerRejectedCount: number
}

export interface AdminUserStats {
  totalByRole: Record<string, number>
  totalActive: number
  totalPending: number
  totalBlocked: number
  totalDeleted: number
  candidateByEducation: Record<string, number>
  candidateByExperience: { level: string; count: number }[]
  hrsByCompany: HrsByCompanyRow[]
}

export interface AdminJobStats {
  totalJobsByStatus: Record<string, number>
  totalCompanies: number
  jobsExpiringSoon: number
  totalJobViews: number
  pendingReports: number
  byEmploymentType: Record<string, number>
  byJobCategory: Record<string, number>
  byExperienceLevel: Record<string, number>
  topJobsByViews: AdminTopJobByViews[]
}

export interface TopSkill {
  skillId: string
  skillName: string
  jobCount: number
}

export interface AdminDashboardData {
  applicationStats: AdminApplicationStats | null
  userStats: AdminUserStats | null
  jobStats: AdminJobStats | null
  topSkills: TopSkill[]
  auditStats: AuditStats | null
}

// ── HRM Dashboard ──────────────────────────────────────────────────────────

export interface HrmTeamPerformanceRow {
  hrUsername: string
  assigned: number
  reviewed: number
  avgTimeToReviewDays: number
  conversionRate: number
}

export interface HrmTopJob {
  jobId: string
  jobTitle: string
  applicantCount: number
}

export interface HrmTopJobByViews {
  jobId: string
  title: string
  companyName: string
  views: number
}

export interface HrmApplicationStats {
  totalApplications: number
  byStatus: Record<string, number>
  teamPerformance: HrmTeamPerformanceRow[]
  topJobs: HrmTopJob[]
  stuckApplicationsCount: number
  conversionRates: Record<string, number>
  volumeTrend: VolumeTrendPoint[]
  offerAcceptedCount: number
  offerRejectedCount: number
}

export interface HrmJobStats {
  totalPublished: number
  totalDraft: number
  totalClosed: number
  expiringInWeek: number
  pendingReports: number
  byEmploymentType: Record<string, number>
  byExperienceLevel: Record<string, number>
  topJobsByViews: HrmTopJobByViews[]
}

export interface HrmDashboardData {
  applicationStats: HrmApplicationStats | null
  jobStats: HrmJobStats | null
  auditStats: AuditStats | null
}

// ── Supplementary types (audit events + activity) ─────────────────────────

export interface AuditEventItem {
  eventId: string
  actorUsername: string
  actorRole: string
  companyId: string | null
  entityType: string
  entityId: string
  action: string
  occurredAt: string
  displayMessage: string
  success: boolean
  errorMessage: string | null
  actorIp: string | null
}

export interface AuditEventPage {
  content: AuditEventItem[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface ActivitySummary {
  activeUsers: number
  totalActions: number
  errorCount: number
  actionsByUser: Record<string, number>
  actionsByService: Record<string, number>
  topActions: Record<string, number>
}

export interface UserActivityResponse {
  total: number
  summary: ActivitySummary
}
