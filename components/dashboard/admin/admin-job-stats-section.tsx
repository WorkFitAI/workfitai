import { Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionFallback } from "@/components/dashboard/shared/section-fallback"
import { cn } from "@/lib/utils"
import type { AdminJobStats } from "@/types/dashboard"

interface AdminJobStatsSectionProps {
  stats: AdminJobStats | null
}

const STATUS_GRID = [
  { key: "PUBLISHED", label: "Published", color: "text-green-600",  bg: "bg-green-50"  },
  { key: "DRAFT",     label: "Draft",     color: "text-amber-600",  bg: "bg-amber-50"  },
  { key: "CLOSED",    label: "Closed",    color: "text-red-600",    bg: "bg-red-50"    },
  { key: "EXPIRED",   label: "Expired",   color: "text-violet-600", bg: "bg-violet-50" },
]

const EMPLOYMENT_LABELS: Record<string, string> = {
  FULL_TIME:   "Full-time",
  PART_TIME:   "Part-time",
  CONTRACT:    "Contract",
  INTERNSHIP:  "Internship",
}

export function AdminJobStatsSection({ stats }: AdminJobStatsSectionProps) {
  if (!stats) return <SectionFallback title="Job Statistics" />

  const empEntries = Object.entries(stats.byEmploymentType ?? {})
  const maxEmp = Math.max(...empEntries.map(([, v]) => v), 1)

  return (
    <Card className="gap-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Job statistics</CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="w-3.5 h-3.5" />
            <span>{stats.totalJobViews.toLocaleString()} views</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status grid */}
        <div className="grid grid-cols-2 gap-2">
          {STATUS_GRID.map(({ key, label, color, bg }) => (
            <div key={key} className={cn("rounded-lg p-2.5 space-y-0.5", bg)}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
              <p className={cn("text-xl font-bold", color)}>
                {(stats.totalJobsByStatus[key] ?? 0).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Employment type bars */}
        {empEntries.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              By employment type
            </p>
            {empEntries.map(([key, val]) => (
              <div key={key} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{EMPLOYMENT_LABELS[key] ?? key}</span>
                  <span className="font-medium">{val.toLocaleString()}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${(val / maxEmp) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
