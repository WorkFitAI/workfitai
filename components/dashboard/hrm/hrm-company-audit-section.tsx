import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionFallback } from "@/components/dashboard/shared/section-fallback"
import { cn } from "@/lib/utils"
import type { AuditStats } from "@/types/dashboard"

interface HrmCompanyAuditSectionProps {
  auditStats: AuditStats | null
}

export function HrmCompanyAuditSection({ auditStats }: HrmCompanyAuditSectionProps) {
  if (!auditStats) return <SectionFallback title="Company Audit" />

  const successPct = (auditStats.successRate * 100).toFixed(1)
  const topActions = Object.entries(auditStats.byAction)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Company audit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 2-stat mini grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/50 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Events</p>
            <p className="text-xl font-bold">{auditStats.totalEvents.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Success</p>
            <p className={cn("text-xl font-bold", parseFloat(successPct) >= 95 ? "text-green-600" : "text-amber-600")}>
              {successPct}%
            </p>
          </div>
        </div>

        {/* Top actions from byAction */}
        {topActions.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Top actions
            </p>
            {topActions.map(([action, count]) => (
              <div key={action} className="flex justify-between text-xs">
                <span className="text-muted-foreground truncate">{action}</span>
                <span className="font-medium ml-2 flex-shrink-0">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* View log button */}
        <Link
          href="/audit"
          className="block w-full text-center text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg py-2 transition-colors border border-violet-200"
        >
          View company audit log →
        </Link>
      </CardContent>
    </Card>
  )
}
