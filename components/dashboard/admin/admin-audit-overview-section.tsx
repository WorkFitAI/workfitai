import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionFallback } from "@/components/dashboard/shared/section-fallback"
import { cn } from "@/lib/utils"
import type { AuditStats } from "@/types/dashboard"

interface AdminAuditOverviewSectionProps {
  stats: AuditStats | null
}

const SERVICE_LABELS: Record<string, string> = {
  "app-service":         "App service",
  "application-service": "Application",
  "job-service":         "Job service",
  "auth-service":        "Auth service",
  "user-service":        "User service",
}

export function AdminAuditOverviewSection({ stats }: AdminAuditOverviewSectionProps) {
  if (!stats) return <SectionFallback title="Audit Overview" />

  const successPct = (stats.successRate * 1).toFixed(1)
  const serviceEntries = Object.entries(stats.byService).slice(0, 4)
  const maxSvc = Math.max(...serviceEntries.map(([, v]) => v), 1)

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

        {/* Service bars */}
        {serviceEntries.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Events by service
            </p>
            {serviceEntries.map(([key, val]) => (
              <div key={key} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{SERVICE_LABELS[key] ?? key}</span>
                  <span className="font-medium">{val.toLocaleString()}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${(val / maxSvc) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

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
