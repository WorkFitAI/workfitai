import { FileText, HandshakeIcon, Building2, Users, Flag } from "lucide-react"
import { DashboardStatCard } from "@/components/dashboard/shared/dashboard-stat-card"
import { SectionFallback } from "@/components/dashboard/shared/section-fallback"
import type { AdminApplicationStats, AdminUserStats, AdminJobStats } from "@/types/dashboard"

interface AdminOverviewCardsProps {
  stats: AdminApplicationStats | null
  userStats: AdminUserStats | null
  jobStats: AdminJobStats | null
}

export function AdminOverviewCards({ stats, userStats, jobStats }: AdminOverviewCardsProps) {
  if (!stats) {
    return <SectionFallback title="Application Stats" className="col-span-4" />
  }

  const totalOffers = stats.offerAcceptedCount + stats.offerRejectedCount
  const acceptanceRate = totalOffers > 0
    ? ((stats.offerAcceptedCount / totalOffers) * 100).toFixed(1)
    : "0.0"

  const totalUsers = userStats
    ? Object.values(userStats.totalByRole).reduce((s, v) => s + v, 0)
    : null
  const candidates = userStats?.totalByRole["CANDIDATE"] ?? 0
  const hrCount = userStats?.totalByRole["HR"] ?? 0
  const hrManagerCount = userStats?.totalByRole["HR_MANAGER"] ?? 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <DashboardStatCard
        title="Total Applications"
        value={stats.platformTotals.totalApplications.toLocaleString()}
        icon={<FileText className="w-5 h-5" />}
        trend={{ value: stats.growthMetrics.monthOverMonth * 100, label: "MoM" }}
      />
      <DashboardStatCard
        title="Active Companies"
        value={stats.platformTotals.totalCompanies.toLocaleString()}
        icon={<Building2 className="w-5 h-5" />}
        subtitle={
          <span className="text-xs text-muted-foreground">
            {stats.platformTotals.totalJobs} jobs posted
          </span>
        }
      />
      <DashboardStatCard
        title="Offer Acceptance"
        value={`${acceptanceRate}%`}
        icon={<HandshakeIcon className="w-5 h-5" />}
        subtitle={
          <span className="text-xs text-muted-foreground">
            {stats.offerAcceptedCount} accepted / {stats.offerRejectedCount} rejected
          </span>
        }
      />
      <DashboardStatCard
        title="Total Users"
        value={totalUsers !== null ? totalUsers.toLocaleString() : "—"}
        icon={<Users className="w-5 h-5" />}
        size="sm"
        subtitle={
          userStats ? (
            <span className="text-xs text-muted-foreground">
              {candidates} candidates · {hrCount} HRs · {hrManagerCount} HR Managers
            </span>
          ) : undefined
        }
      />
      <DashboardStatCard
        title="Pending Reports"
        value={jobStats ? jobStats.pendingReports : "—"}
        icon={<Flag className="w-5 h-5" />}
        size="sm"
        variant={jobStats && jobStats.pendingReports > 0 ? "danger" : "default"}
      />
    </div>
  )
}
