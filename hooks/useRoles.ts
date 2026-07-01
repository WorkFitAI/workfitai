"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { rolePermissionService } from "@/lib/admin/role-permission-service"
import type { Role } from "@/types/role-permission"

// ── List hook ─────────────────────────────────────────────────────────────────

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingName, setDeletingName] = useState<string | null>(null)

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await rolePermissionService.getAllRoles()
      setRoles(res.data ?? [])
    } catch {
      setError("Failed to load roles.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const deleteRole = useCallback(
    async (roleName: string) => {
      try {
        setDeletingName(roleName)
        await rolePermissionService.deleteRole(roleName)
        toast.success(`Role "${roleName}" deleted`)
        await fetchRoles()
      } catch {
        toast.error(`Failed to delete role "${roleName}"`)
      } finally {
        setDeletingName(null)
      }
    },
    [fetchRoles],
  )

  return { roles, loading, error, deletingName, deleteRole, refresh: fetchRoles }
}

// ── Single role + permission batch edit hook ───────────────────────────────────

export function useRole(name: string) {
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRole = useCallback(async () => {
    if (!name) return
    try {
      setLoading(true)
      setError(null)
      const res = await rolePermissionService.getRole(name)
      setRole(res.data ?? null)
    } catch {
      setError("Failed to load role.")
    } finally {
      setLoading(false)
    }
  }, [name])

  useEffect(() => {
    fetchRole()
  }, [fetchRole])

  // Diff current vs original permissions → batch add/remove in one round-trip.
  // Returns true on success so callers can decide whether to close the modal.
  const savePermissions = useCallback(
    async (originalPerms: string[], updatedPerms: string[]): Promise<boolean> => {
      const toAdd = updatedPerms.filter((p) => !originalPerms.includes(p))
      const toRemove = originalPerms.filter((p) => !updatedPerms.includes(p))
      try {
        setSaving(true)
        if (toAdd.length > 0) {
          await rolePermissionService.addPermissionsBatch(name, {
            permissions: toAdd,
          })
        }
        if (toRemove.length > 0) {
          await rolePermissionService.removePermissionsBatch(name, {
            permissions: toRemove,
          })
        }
        toast.success("Permissions updated")
        await fetchRole()
        return true
      } catch {
        // Refresh to show current server state after partial failure
        toast.error("Failed to save permissions")
        await fetchRole()
        return false
      } finally {
        setSaving(false)
      }
    },
    [name, fetchRole],
  )

  return { role, loading, saving, error, savePermissions, refresh: fetchRole }
}

// ── Clone action hook ─────────────────────────────────────────────────────────

export function useCloneRole(onSuccess: () => void) {
  const [cloning, setCloning] = useState(false)

  // Returns true on success so callers can decide whether to close the modal.
  const cloneRole = useCallback(
    async (sourceName: string, newName: string, description: string): Promise<boolean> => {
      try {
        setCloning(true)
        await rolePermissionService.cloneRole(sourceName, {
          name: newName,
          description,
        })
        toast.success(`Role "${newName}" created`)
        onSuccess()
        return true
      } catch {
        toast.error("Failed to clone role")
        return false
      } finally {
        setCloning(false)
      }
    },
    [onSuccess],
  )

  return { cloning, cloneRole }
}
