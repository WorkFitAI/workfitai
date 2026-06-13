"use client"

import { useCallback, useEffect, useState } from "react"
import { monitoringService } from "@/lib/monitoring/monitoring-service"
import type { AuditEventItem } from "@/types/dashboard"

export function useAdminRecentAuditEvents() {
  const [events, setEvents] = useState<AuditEventItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await monitoringService.getRecentAuditEvents()
      setEvents(res.data?.content ?? [])
    } catch {
      setError("Failed to load recent audit events.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { events, loading, error, refetch: fetch }
}
