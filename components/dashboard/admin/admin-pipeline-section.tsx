import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionFallback } from "@/components/dashboard/shared/section-fallback"
import { cn } from "@/lib/utils"
import type { AdminApplicationStats } from "@/types/dashboard"

interface AdminPipelineSectionProps {
  stats: AdminApplicationStats | null
}

const STATUS_CONFIG = [
  { key: "APPLIED",    label: "Applied",    color: "bg-violet-500" },
  { key: "REVIEWING",  label: "Reviewing",  color: "bg-blue-500" },
  { key: "INTERVIEW",  label: "Interview",  color: "bg-sky-500" },
  { key: "OFFER",      label: "Offer",      color: "bg-pink-500" },
  { key: "HIRED",      label: "Hired",      color: "bg-green-500" },
  { key: "REJECTED",   label: "Rejected",   color: "bg-red-500" },
]

const RATE_LABELS: Record<string, string> = {
  APPLIED_TO_REVIEWING:   "Applied → Review",
  REVIEWING_TO_INTERVIEW: "Review → Interview",
  INTERVIEW_TO_OFFER:     "Interview → Offer",
  OFFER_TO_HIRED:         "Offer → Hired",
}

const RATE_ORDER = [
  "APPLIED_TO_REVIEWING",
  "REVIEWING_TO_INTERVIEW",
  "INTERVIEW_TO_OFFER",
  "OFFER_TO_HIRED",
]

function rateColor(pct: number) {
  if (pct >= 50) return "text-green-600"
  if (pct >= 25) return "text-amber-600"
  return "text-red-500"
}

export function AdminPipelineSection({ stats }: AdminPipelineSectionProps) {
  if (!stats) return <SectionFallback title="Application Pipeline" />

  const counts = STATUS_CONFIG.map(({ key }) => stats.byStatus[key] ?? 0)
  const maxCount = Math.max(...counts, 1)

  const rateKeys = RATE_ORDER.filter((k) => k in stats.platformConversionRates)

  return (
    <Card className="gap-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Application pipeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Funnel bars */}
        <div className="space-y-2">
          {STATUS_CONFIG.map(({ key, label, color }, i) => (
            <div key={key} className="space-y-0.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{label}</span>
                <span className="font-medium text-foreground">{counts[i].toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", color)}
                  style={{ width: `${(counts[i] / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-2" />

        {/* Conversion rates */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {rateKeys.map((key) => {
            const pct = (stats.platformConversionRates[key] ?? 0) * 100
            return (
              <div key={key} className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground truncate">{RATE_LABELS[key] ?? key}</span>
                <span className={cn("font-semibold ml-2 tabular-nums", rateColor(pct))}>
                  {pct.toFixed(0)}%
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
