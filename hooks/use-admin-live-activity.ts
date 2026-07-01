"use client"

import { useCallback, useEffect, useState } from "react"
import { monitoringService } from "@/lib/monitoring/monitoring-service"
import type { ActivitySummary } from "@/types/dashboard"

interface LiveActivityState {
  onlineUsers: number
  summary: ActivitySummary | null
}

export function useAdminLiveActivity() {
  const [state, setState] = useState<LiveActivityState>({ onlineUsers: 0, summary: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [onlineRes, summaryRes] = await Promise.all([
        monitoringService.getOnlineUsers(15),
        monitoringService.getActivitySummary(24),
      ])
      setState({
        onlineUsers: onlineRes.data?.summary?.activeUsers ?? 0,
        summary: summaryRes.data ?? null,
      })
    } catch {
      setError("Failed to load live activity.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { ...state, loading, error, refetch: fetch }
}
