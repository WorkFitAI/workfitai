import { TopHorizontalBarChart } from "@/components/dashboard/shared/top-horizontal-bar-chart"
import { SectionFallback } from "@/components/dashboard/shared/section-fallback"
import type { HrmJobStats } from "@/types/dashboard"

interface HrmJobCategorySectionProps {
  stats: HrmJobStats | null
}

export function HrmJobCategorySection({ stats }: HrmJobCategorySectionProps) {
  if (!stats) return <SectionFallback title="Jobs by category" />

  const data = Object.entries(stats.byJobCategory ?? {})
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }))

  return (
    <TopHorizontalBarChart
      data={data}
      title="Jobs by category"
      valueLabel="jobs"
      maxItems={9}
      color="#0ea5e9"
    />
  )
}
