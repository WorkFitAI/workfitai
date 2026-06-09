"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { CheckCircle2, XCircle, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SectionFallback } from "@/components/dashboard/shared/section-fallback"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminRecentAuditEvents } from "@/hooks/use-admin-recent-audit-events"
import { cn } from "@/lib/utils"

function EventIcon({ success }: { success: boolean }) {
  if (success) return <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
  return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
}

function EventSkeleton() {
  return (
    <div className="flex items-start gap-2 py-2">
      <Skeleton className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

function relativeTime(iso: string) {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
  } catch {
    return iso
  }
}

export function AdminRecentEventsSection() {
  const { events, loading, error } = useAdminRecentAuditEvents()

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent audit events</CardTitle>
          <Link href="/audit" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Full log →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading && (
          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => <EventSkeleton key={i} />)}
          </div>
        )}
        {!loading && (error || events.length === 0) && (
          <SectionFallback title="Recent Events" />
        )}
        {!loading && events.length > 0 && (
          <div className="divide-y">
            {events.map((ev) => (
              <div key={ev.eventId} className="flex items-start gap-2 py-2">
                <EventIcon success={ev.success} />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-xs font-semibold truncate", !ev.success && "text-red-600")}>
                    {ev.action}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {ev.actorUsername} · {ev.actorRole}
                    {ev.actorIp ? ` · ${ev.actorIp}` : ""}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                  {relativeTime(ev.occurredAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
