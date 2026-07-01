import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionFallback } from "@/components/dashboard/shared/section-fallback"
import { cn } from "@/lib/utils"
import type { HrmApplicationStats } from "@/types/dashboard"

interface HrmPipelineSectionProps {
  stats: HrmApplicationStats | null
}

const STATUS_CONFIG = [
  { key: "APPLIED",   label: "Applied",   color: "bg-violet-500" },
  { key: "REVIEWING", label: "Reviewing", color: "bg-blue-500"   },
  { key: "INTERVIEW", label: "Interview", color: "bg-sky-500"    },
  { key: "OFFER",     label: "Offer",     color: "bg-pink-500"   },
  { key: "HIRED",     label: "Hired",     color: "bg-green-500"  },
  { key: "REJECTED",  label: "Rejected",  color: "bg-red-500"    },
]

const PILL_RATES = [
  { key: "APPLIED_TO_REVIEWING",   label: "Applied→Review"    },
  { key: "REVIEWING_TO_INTERVIEW", label: "Review→Interview"  },
  { key: "INTERVIEW_TO_OFFER",     label: "Interview→Offer"   },
  { key: "OFFER_TO_HIRED",         label: "Offer→Hired"       },
]

function pillColor(pct: number) {
  if (pct >= 50) return "text-green-600"
  if (pct >= 25) return "text-blue-600"
  return "text-cyan-600"
}

export function HrmPipelineSection({ stats }: HrmPipelineSectionProps) {
  if (!stats) return <SectionFallback title="Application Pipeline" />

  const counts = STATUS_CONFIG.map(({ key }) => stats.byStatus[key] ?? 0)
  const maxCount = Math.max(...counts, 1)

  return (
    <Card>
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
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", color)}
                  style={{ width: `${(counts[i] / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 4 conversion rate pills */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {PILL_RATES.map(({ key, label }) => {
            const pct = (stats.conversionRates[key] ?? 0) * 100
            return (
              <div key={key} className="bg-muted/50 rounded-lg p-2 text-center">
                <p className={cn("text-base font-bold", pillColor(pct))}>
                  {pct.toFixed(0)}%
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
