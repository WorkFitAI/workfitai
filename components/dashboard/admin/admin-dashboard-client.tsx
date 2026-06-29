"use client"

import { useAdminDashboard } from "@/hooks/useAdminDashboard"
import { DashboardSkeleton } from "@/components/dashboard/shared/dashboard-skeleton"
import { DashboardError } from "@/components/dashboard/shared/dashboard-error"
import { AdminOverviewCards } from "./admin-overview-cards"
import { AdminTrendSection } from "./admin-trend-section"
import { AdminPipelineSection } from "./admin-pipeline-section"
import { AdminJobStatsSection } from "./admin-job-stats-section"
import { AdminUserBreakdownSection } from "./admin-user-breakdown-section"
import { AdminTopSkillsSection } from "./admin-top-skills-section"
import { AdminTopJobsSection } from "./admin-top-jobs-section"
import { AdminAuditOverviewSection } from "./admin-audit-overview-section"
import { AdminRecentEventsSection } from "./admin-recent-events-section"
import { AdminLiveActivitySection } from "./admin-live-activity-section"
import { AdminJobCategorySection } from "./admin-job-category-section"

export function AdminDashboardClient() {
  const { data, loading, error, refetch } = useAdminDashboard()

  if (loading) return <DashboardSkeleton />
  if (error) return <DashboardError message={error} onRetry={refetch} />
  if (!data) return null

  return (
    <div className="space-y-4">
      {/* Row 1: primary KPIs */}
      <AdminOverviewCards stats={data.applicationStats} userStats={data.userStats} jobStats={data.jobStats} />

      {/* Row 2: volume trend + pipeline funnel */}
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-3">
          <AdminTrendSection stats={data.applicationStats} />
        </div>
        <AdminJobStatsSection stats={data.jobStats} />
      </div>

      {/* Row 3: job stats / user breakdown / top skills */}
      <div className="grid grid-cols-8 gap-3">
        <div className="col-span-2">
          <AdminUserBreakdownSection stats={data.userStats} />
        </div>
        <div className="col-span-2">
          <AdminPipelineSection stats={data.applicationStats} />
        </div>
        <div className="col-span-2">
          <AdminTopSkillsSection skills={data.topSkills} />
        </div>
        <div className="col-span-2">
          <AdminJobCategorySection stats={data.jobStats} />
        </div>
      </div>

      {/* Row 4: top jobs + audit overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <AdminTopJobsSection stats={data.applicationStats} />
        </div>
        <AdminAuditOverviewSection stats={data.auditStats} recentAuditErrors={data.recentAuditErrors ?? []} />
      </div>
    </div>
  )
}
