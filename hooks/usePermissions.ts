"use client"

import { useCallback, useEffect, useState } from "react"
import { rolePermissionService } from "@/lib/admin/role-permission-service"
import type { Permission } from "@/types/role-permission"

// Read-only hook — permissions have no mutations in the UI layer
export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await rolePermissionService.getAllPermissions()
      setPermissions(res.data ?? [])
    } catch {
      setError("Failed to load permissions.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  return { permissions, loading, error, refresh: fetchPermissions }
}
