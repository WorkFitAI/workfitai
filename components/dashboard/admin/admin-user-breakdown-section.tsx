"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusPieChart } from "@/components/dashboard/shared/status-pie-chart"
import { SectionFallback } from "@/components/dashboard/shared/section-fallback"
import type { AdminUserStats } from "@/types/dashboard"

interface AdminUserBreakdownSectionProps {
  stats: AdminUserStats | null
}

const ROLE_COLORS = ["#7c5cbf", "#3b82f6", "#06b6d4", "#f59e0b"]

const EDU_LABELS: Record<string, string> = {
  HIGH_SCHOOL: "High school",
  BACHELOR:    "Bachelor",
  MASTER:      "Master",
  PHD:         "PhD",
}

export function AdminUserBreakdownSection({ stats }: AdminUserBreakdownSectionProps) {
  if (!stats) return <SectionFallback title="User Breakdown" />

  const roleData = Object.entries(stats.totalByRole).map(([name, value]) => ({ name, value }))
  const eduEntries = Object.entries(stats.candidateByEducation)
  const maxEdu = Math.max(...eduEntries.map(([, v]) => v), 1)

  return (
    <Card className="gap-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">User breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <StatusPieChart
          data={roleData}
          title="By role"
          colors={ROLE_COLORS}
        />

        {/* {eduEntries.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              By education level
            </p>
            {eduEntries.map(([key, val]) => (
              <div key={key} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{EDU_LABELS[key] ?? key}</span>
                  <span className="font-medium">{val.toLocaleString()}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${(val / maxEdu) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )} */}
      </CardContent>
    </Card>
  )
}
