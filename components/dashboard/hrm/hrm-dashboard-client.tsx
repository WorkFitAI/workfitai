"use client"

import { useHrmDashboard } from "@/hooks/useHrmDashboard"
import { DashboardSkeleton } from "@/components/dashboard/shared/dashboard-skeleton"
import { DashboardError } from "@/components/dashboard/shared/dashboard-error"
import { HrmOverviewCards } from "./hrm-overview-cards"
import { HrmCompanyScopeBanner } from "./hrm-company-scope-banner"
import { HrmPipelineSection } from "./hrm-pipeline-section"
import { HrmTeamSection } from "./hrm-team-section"
import { HrmJobBreakdownSection } from "./hrm-job-breakdown-section"
import { HrmTopJobsSection } from "./hrm-top-jobs-section"
import { HrmCompanyAuditSection } from "./hrm-company-audit-section"

export function HrmDashboardClient() {
  const { data, loading, error, refetch } = useHrmDashboard()

  if (loading) return <DashboardSkeleton />
  if (error) return <DashboardError message={error} onRetry={refetch} />
  if (!data) return null

  const jobWarnings = data.jobStats
    ? { expiringInWeek: data.jobStats.expiringInWeek, pendingReports: data.jobStats.pendingReports }
    : null

  return (
    <div className="space-y-4">
      {/* Company scope banner — always shown */}
      <HrmCompanyScopeBanner />

      {/* Row 1: KPI cards */}
      <HrmOverviewCards
        applicationStats={data.applicationStats}
        jobStats={data.jobStats}
      />

      {/* Row 2: pipeline funnel + team performance */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <HrmPipelineSection stats={data.applicationStats} />
        </div>
        <HrmTeamSection stats={data.applicationStats} />
      </div>

      {/* Row 3: job breakdown / top jobs / company audit */}
      <div className="grid grid-cols-3 gap-3">
        <HrmJobBreakdownSection stats={data.jobStats} />
        <HrmTopJobsSection stats={data.applicationStats} jobWarnings={jobWarnings} />
        <HrmCompanyAuditSection auditStats={data.auditStats} />
      </div>
    </div>
  )
}
