"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionFallback } from "@/components/dashboard/shared/section-fallback"
import { useAdminLiveActivity } from "@/hooks/use-admin-live-activity"

export function AdminLiveActivitySection() {
  const { onlineUsers, summary, loading, error } = useAdminLiveActivity()

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Live activity (last 15 min)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !summary) return <SectionFallback title="Live Activity" />

  const topActions = Object.entries(summary.topActions).slice(0, 5)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">Live activity (last 15 min)</CardTitle>
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 2-stat mini grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/50 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Online users</p>
            <p className="text-xl font-bold text-green-600">{onlineUsers}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Actions / 24h</p>
            <p className="text-xl font-bold">{summary.totalActions.toLocaleString()}</p>
          </div>
        </div>

        {/* Top actions */}
        {topActions.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              Top actions (24h)
            </p>
            {topActions.map(([action, count]) => (
              <div key={action} className="flex justify-between text-xs">
                <span className="text-muted-foreground truncate">{action}</span>
                <span className="font-medium ml-2 flex-shrink-0">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {summary.errorCount > 0 && (
          <p className="text-xs font-medium text-red-600 border-t pt-2">
            {summary.errorCount} errors in last 24h
          </p>
        )}
      </CardContent>
    </Card>
  )
}
