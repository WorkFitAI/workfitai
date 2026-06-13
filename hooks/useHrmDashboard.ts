"use client"

import { useCallback, useEffect, useState } from "react"
import { monitoringService } from "@/lib/monitoring/monitoring-service"
import type { HrmDashboardData } from "@/types/dashboard"

export function useHrmDashboard() {
  const [data, setData] = useState<HrmDashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await monitoringService.getHrmDashboard()
      setData(res.data ?? null)
    } catch {
      setError("Failed to load dashboard.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}
