"use client"

import { useCallback, useEffect, useState } from "react"
import { auditService, type AuditLogsParams } from "@/lib/audit/audit-service"
import type { AuditLog } from "@/types/audit"

export function useAuditLogs(params: AuditLogsParams) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await auditService.list(params)
      const page = res.data
      if (page) {
        setLogs(page.content ?? [])
        setTotalPages(page.totalPages || 1)
        setTotalElements(page.totalElements ?? 0)
      }
    } catch {
      setError("Failed to load audit logs. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [
    params.page,
    params.size,
    params.companyId,
    params.from,
    params.to,
    params.actorUsername,
    params.entityType,
    params.actorRole,
  ])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { logs, totalPages, totalElements, loading, error, refresh: fetch }
}
