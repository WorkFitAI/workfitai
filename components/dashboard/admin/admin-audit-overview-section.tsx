import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionFallback } from "@/components/dashboard/shared/section-fallback"
import { cn } from "@/lib/utils"
import type { AuditStats, AuditEventItem } from "@/types/dashboard"

interface AdminAuditOverviewSectionProps {
  stats: AuditStats | null
  recentAuditErrors?: AuditEventItem[]
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export function AdminAuditOverviewSection({ stats, recentAuditErrors = [] }: AdminAuditOverviewSectionProps) {
  if (!stats) return <SectionFallback title="Audit Overview" />

  const successPct = (stats.successRate * 1).toFixed(1)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Audit overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 2-stat mini grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/50 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total events</p>
            <p className="text-xl font-bold">{stats.totalEvents.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Success rate</p>
            <p className={cn("text-xl font-bold", parseFloat(successPct) >= 95 ? "text-green-600" : "text-amber-600")}>
              {successPct}%
            </p>
          </div>
        </div>

        {/* Recent error logs */}
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Recent errors ({stats.failedEvents} total)
          </p>
          {recentAuditErrors.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 text-center">No recent errors</p>
          ) : (
            <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-0.5">
              {recentAuditErrors.map((evt) => (
                <div
                  key={evt.eventId}
                  className="rounded-md border border-destructive/20 bg-destructive/5 px-2.5 py-1.5 space-y-0.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-semibold truncate">{evt.actorUsername}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(evt.occurredAt)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">{evt.action}</p>
                  {evt.errorMessage && (
                    <p className="text-[10px] text-destructive leading-tight line-clamp-2">{evt.errorMessage}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
          <span>{stats.uniqueActors} unique actors · {stats.failedEvents} failed</span>
          <Link href="/audit-logs" className="hover:text-foreground transition-colors">
            View logs →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
