import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionFallback } from "@/components/dashboard/shared/section-fallback"
import { cn } from "@/lib/utils"
import type { HrmJobStats } from "@/types/dashboard"

interface HrmJobBreakdownSectionProps {
  stats: HrmJobStats | null
}

const EXP_LABELS: Record<string, string> = {
  FRESHER: "Fresher",
  JUNIOR:  "Junior",
  MID:     "Mid",
  SENIOR:  "Senior",
  LEAD:    "Lead",
}

export function HrmJobBreakdownSection({ stats }: HrmJobBreakdownSectionProps) {
  if (!stats) return <SectionFallback title="Job Breakdown" />

  const expEntries = Object.entries(stats.byExperienceLevel ?? {})
  const maxExp = Math.max(...expEntries.map(([, v]) => v), 1)
  const topJob = stats.topJobsByViews?.[0]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Job breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 3-col status grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Published</p>
            <p className="text-lg font-bold text-green-600">{stats.totalPublished}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Draft</p>
            <p className="text-lg font-bold text-amber-600">{stats.totalDraft}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Closed</p>
            <p className="text-lg font-bold text-red-600">{stats.totalClosed}</p>
          </div>
        </div>

        {/* Experience level bars */}
        {expEntries.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              By experience level
            </p>
            {expEntries.map(([key, val]) => (
              <div key={key} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{EXP_LABELS[key] ?? key}</span>
                  <span className="font-medium">{val}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${(val / maxExp) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Top by views */}
        {topJob && (
          <p className="text-xs text-muted-foreground border-t pt-2">
            Top by views: <span className="font-medium text-foreground">{topJob.title}</span>
            {" "}— {topJob.views.toLocaleString()} views
          </p>
        )}

        {/* Warnings */}
        <div className="flex gap-2 flex-wrap">
          {stats.expiringInWeek > 0 && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 rounded px-1.5 py-0.5">
              {stats.expiringInWeek} expiring in 7d
            </span>
          )}
          {stats.pendingReports > 0 && (
            <span className="text-xs font-medium text-red-600 bg-red-50 rounded px-1.5 py-0.5">
              {stats.pendingReports} pending report{stats.pendingReports !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
