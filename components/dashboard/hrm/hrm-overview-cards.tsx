import { FileText, HandshakeIcon, AlertCircle, Briefcase } from "lucide-react"
import { DashboardStatCard } from "@/components/dashboard/shared/dashboard-stat-card"
import { SectionFallback } from "@/components/dashboard/shared/section-fallback"
import type { HrmApplicationStats, HrmJobStats } from "@/types/dashboard"

interface HrmOverviewCardsProps {
  applicationStats: HrmApplicationStats | null
  jobStats: HrmJobStats | null
}

export function HrmOverviewCards({ applicationStats, jobStats }: HrmOverviewCardsProps) {
  if (!applicationStats && !jobStats) {
    return <SectionFallback title="Dashboard Stats" className="col-span-4" />
  }

  const totalOffers = applicationStats
    ? applicationStats.offerAcceptedCount + applicationStats.offerRejectedCount
    : 0
  const acceptanceRate = totalOffers > 0 && applicationStats
    ? ((applicationStats.offerAcceptedCount / totalOffers) * 100).toFixed(1)
    : null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <DashboardStatCard
        title="Total Applications"
        value={applicationStats ? applicationStats.totalApplications.toLocaleString() : "—"}
        icon={<FileText className="w-5 h-5" />}
      />
      <DashboardStatCard
        title="Offer Acceptance"
        value={acceptanceRate !== null ? `${acceptanceRate}%` : "—"}
        icon={<HandshakeIcon className="w-5 h-5" />}
      />
      <DashboardStatCard
        title="Stuck Applications"
        value={applicationStats ? applicationStats.stuckApplicationsCount : "—"}
        icon={<AlertCircle className="w-5 h-5" />}
        variant={applicationStats && applicationStats.stuckApplicationsCount > 0 ? "warning" : "default"}
      />
      <DashboardStatCard
        title="Active Jobs"
        value={jobStats ? jobStats.totalPublished : "—"}
        icon={<Briefcase className="w-5 h-5" />}
        subtitle={
          jobStats && jobStats.expiringInWeek > 0 ? (
            <span className="text-xs text-amber-600">
              {jobStats.expiringInWeek} expiring in 7d
            </span>
          ) : undefined
        }
      />
    </div>
  )
}
