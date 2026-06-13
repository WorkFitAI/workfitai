import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { SectionFallback } from "@/components/dashboard/shared/section-fallback"
import { cn } from "@/lib/utils"
import type { HrmApplicationStats } from "@/types/dashboard"

interface HrmTeamSectionProps {
  stats: HrmApplicationStats | null
}

function conversionColor(rate: number) {
  if (rate >= 0.25) return "text-green-600"
  if (rate >= 0.15) return "text-amber-600"
  return "text-red-500"
}

function reviewBarColor(days: number) {
  if (days <= 2)   return "bg-green-500"
  if (days <= 3.5) return "bg-amber-500"
  return "bg-red-500"
}

export function HrmTeamSection({ stats }: HrmTeamSectionProps) {
  if (!stats) return <SectionFallback title="Team Performance" />

  const rows = stats.teamPerformance
  const maxDays = Math.max(...rows.map((r) => r.avgTimeToReviewDays), 1)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Team performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No team data available.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>HR</TableHead>
                  <TableHead className="text-right">Assigned</TableHead>
                  <TableHead className="text-right">Conv. %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.hrUsername}>
                    <TableCell className="font-medium truncate max-w-[120px]">
                      {row.hrUsername}
                    </TableCell>
                    <TableCell className="text-right">{row.assigned}</TableCell>
                    <TableCell className={cn("text-right font-semibold", conversionColor(row.conversionRate))}>
                      {(row.conversionRate * 100).toFixed(0)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="border-t pt-2 space-y-1.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Avg time to review
              </p>
              {rows.map((row) => (
                <div key={row.hrUsername} className="space-y-0.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground truncate">{row.hrUsername}</span>
                    <span className="font-medium ml-2">{row.avgTimeToReviewDays.toFixed(1)}d</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", reviewBarColor(row.avgTimeToReviewDays))}
                      style={{ width: `${(row.avgTimeToReviewDays / maxDays) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
