import { TrendWithStats } from "@/components/dashboard/shared/trend-with-stats"
import { SectionFallback } from "@/components/dashboard/shared/section-fallback"
import type { AdminApplicationStats } from "@/types/dashboard"

interface AdminTrendSectionProps {
  stats: AdminApplicationStats | null
}

export function AdminTrendSection({ stats }: AdminTrendSectionProps) {
  if (!stats) return <SectionFallback title="Application Volume" />

  return (
    <TrendWithStats
      data={stats.volumeTrend}
      title="Application volume — last 30 days"
      stats={{
        last7Days: stats.growthMetrics.last7Days,
        last30Days: stats.growthMetrics.last30Days,
        monthOverMonth: stats.growthMetrics.monthOverMonth,
        yearOverYear: stats.growthMetrics.yearOverYear,
      }}
    />
  )
}
