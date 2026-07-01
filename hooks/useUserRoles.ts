"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { rolePermissionService } from "@/lib/admin/role-permission-service"

// Manages a single user's assigned roles — grant/revoke with batch diff
export function useUserRoles(username: string) {
  const [roles, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRoles = useCallback(async () => {
    if (!username) return
    try {
      setLoading(true)
      setError(null)
      const res = await rolePermissionService.getUserRoles(username)
      setRoles(res.data ?? [])
    } catch {
      setError("Failed to load user roles.")
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  // Diff original vs updated → batch grant/revoke in one call each
  const saveRoles = useCallback(
    async (originalRoles: string[], updatedRoles: string[]) => {
      const toGrant = updatedRoles.filter((r) => !originalRoles.includes(r))
      const toRevoke = originalRoles.filter((r) => !updatedRoles.includes(r))
      try {
        setSaving(true)
        if (toGrant.length > 0) {
          await rolePermissionService.grantRolesBatch(username, {
            roles: toGrant,
          })
        }
        if (toRevoke.length > 0) {
          await rolePermissionService.revokeRolesBatch(username, {
            roles: toRevoke,
          })
        }
        toast.success("User roles updated")
        await fetchRoles()
      } catch {
        toast.error("Failed to update user roles")
        await fetchRoles()
      } finally {
        setSaving(false)
      }
    },
    [username, fetchRoles],
  )

  return { roles, loading, saving, error, saveRoles, refresh: fetchRoles }
}
