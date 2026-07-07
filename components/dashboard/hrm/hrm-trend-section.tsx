import { TrendWithStats, type StatPill } from "@/components/dashboard/shared/trend-with-stats"
import { SectionFallback } from "@/components/dashboard/shared/section-fallback"
import type { HrmApplicationStats } from "@/types/dashboard"

interface HrmTrendSectionProps {
  stats: HrmApplicationStats | null
}

function sumCount(points: { count: number }[]) {
  return points.reduce((total, p) => total + p.count, 0)
}

function buildPills(stats: HrmApplicationStats): StatPill[] {
  const trend = stats.volumeTrend ?? []
  const last7 = sumCount(trend.slice(-7))
  const prev7 = sumCount(trend.slice(-14, -7))
  const last30 = sumCount(trend.slice(-30))
  const wow = prev7 > 0 ? (last7 - prev7) / prev7 : null

  const byStatus = stats.byStatus ?? {}
  const inPipeline =
    (byStatus.REVIEWING ?? 0) + (byStatus.INTERVIEW ?? 0) + (byStatus.OFFER ?? 0)
  const hired = byStatus.HIRED ?? 0

  return [
    {
      label: "Last 7d",
      value: last7.toLocaleString(),
      sub:
        wow === null
          ? undefined
          : `${wow >= 0 ? "+" : ""}${(wow * 100).toFixed(1)}% WoW`,
      subTone: wow === null ? undefined : wow >= 0 ? "up" : "down",
    },
    { label: "Last 30d", value: last30.toLocaleString(), sub: "total", subTone: "up" },
    { label: "In pipeline", value: inPipeline.toLocaleString(), sub: "total", subTone: "up" },
    { label: "Hired", value: hired.toLocaleString(), sub: "total", subTone: "up" },
  ]
}

export function HrmTrendSection({ stats }: HrmTrendSectionProps) {
  if (!stats) return <SectionFallback title="Application Volume" />

  return (
    <TrendWithStats
      data={stats.volumeTrend}
      title="Application volume — last 30 days"
      pills={buildPills(stats)}
    />
  )
}
