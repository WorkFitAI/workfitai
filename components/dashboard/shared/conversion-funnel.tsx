import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const LABEL_MAP: Record<string, string> = {
  APPLIED_TO_REVIEWING: "Applied → Reviewing",
  REVIEWING_TO_INTERVIEW: "Reviewing → Interview",
  INTERVIEW_TO_OFFER: "Interview → Offer",
  OFFER_TO_HIRED: "Offer → Hired",
}

// Render stages in top-to-bottom funnel order regardless of server key order
const FUNNEL_ORDER = [
  "APPLIED_TO_REVIEWING",
  "REVIEWING_TO_INTERVIEW",
  "INTERVIEW_TO_OFFER",
  "OFFER_TO_HIRED",
]

interface ConversionFunnelProps {
  rates: Record<string, number>
  title?: string
}

function barColor(pct: number) {
  if (pct >= 50) return "bg-green-500"
  if (pct >= 10) return "bg-amber-400"
  return "bg-red-400"
}

function textColor(pct: number) {
  if (pct >= 50) return "text-green-700"
  if (pct >= 10) return "text-amber-600"
  return "text-red-500"
}

export function ConversionFunnel({
  rates,
  title = "Conversion Funnel",
}: ConversionFunnelProps) {
  // Sort by funnel order, appending unknown keys at end
  const keys = [
    ...FUNNEL_ORDER.filter((k) => k in rates),
    ...Object.keys(rates).filter((k) => !FUNNEL_ORDER.includes(k)),
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {keys.length === 0 && (
          <p className="text-sm text-muted-foreground">No data.</p>
        )}
        {keys.map((key) => {
          const pct = Math.min(100, Math.max(0, (rates[key] ?? 0) * 100))
          const label = LABEL_MAP[key] ?? key
          return (
            <div key={key} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn("font-semibold tabular-nums min-w-[48px] text-right", textColor(pct))}>
                  {pct.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", barColor(pct))}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
