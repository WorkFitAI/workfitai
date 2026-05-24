---
phase: 2
title: "React Hooks"
status: completed
priority: P1
effort: "1.5h"
dependencies: [1]
---

# Phase 2: React Hooks

## Overview
Implement three custom hooks following the existing `useAdminUsers` pattern in `hooks/useAdminUsers.ts`: plain `useState`/`useCallback`/`useEffect` — no React Query. Hooks wrap `rolePermissionService` and expose data, loading, error, and action functions to components.

## Related Code Files
- Reuse pattern: `hooks/useAdminUsers.ts` (useState/useCallback/useEffect + toast)
- Reuse: `hooks/useDebounce.ts` (not needed here — no search)
- Depends on: `lib/admin/role-permission-service.ts` (Phase 1)
- Depends on: `types/role-permission.ts` (Phase 1)
- Create: `hooks/useRoles.ts`
- Create: `hooks/usePermissions.ts`
- Create: `hooks/useUserRoles.ts`

## Architecture

```
hooks/useRoles.ts
  ├─ useRoles()              → list all roles, refresh
  ├─ useRole(name)           → single role detail + permission edit actions
  └─ useCloneRole()          → clone action with loading state

hooks/usePermissions.ts
  └─ usePermissions()        → list all permissions (read-only)

hooks/useUserRoles.ts
  └─ useUserRoles(username)  → get/grant/revoke user roles
```

## Implementation Steps

### Step 1 — Create `hooks/useRoles.ts`

Three exports:

**`useRoles()`** — loads full roles list, exposes delete action (Admin only enforced at UI layer):
```typescript
export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingName, setDeletingName] = useState<string | null>(null)

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const res = await rolePermissionService.getAllRoles()
      setRoles(res.data ?? [])
    } catch { setError("Failed to load roles.") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  const deleteRole = useCallback(async (roleName: string) => {
    try {
      setDeletingName(roleName)
      await rolePermissionService.deleteRole(roleName)
      toast.success(`Role "${roleName}" deleted`)
      await fetchRoles()
    } catch { toast.error(`Failed to delete role "${roleName}"`) }
    finally { setDeletingName(null) }
  }, [fetchRoles])

  return { roles, loading, error, deletingName, deleteRole, refresh: fetchRoles }
}
```

**`useRole(name)`** — single role with permission batch editing:
```typescript
export function useRole(name: string) {
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRole = useCallback(async () => {
    if (!name) return
    try {
      setLoading(true); setError(null)
      const res = await rolePermissionService.getRole(name)
      setRole(res.data ?? null)
    } catch { setError("Failed to load role.") }
    finally { setLoading(false) }
  }, [name])

  useEffect(() => { fetchRole() }, [fetchRole])

  // Diff current vs original permissions → batch add/remove in one round-trip
  const savePermissions = useCallback(async (
    originalPerms: string[],
    updatedPerms: string[]
  ) => {
    const toAdd = updatedPerms.filter(p => !originalPerms.includes(p))
    const toRemove = originalPerms.filter(p => !updatedPerms.includes(p))
    try {
      setSaving(true)
      if (toAdd.length > 0)
        await rolePermissionService.addPermissionsBatch(name, { permissions: toAdd })
      if (toRemove.length > 0)
        await rolePermissionService.removePermissionsBatch(name, { permissions: toRemove })
      toast.success("Permissions updated")
      await fetchRole()
    } catch { toast.error("Failed to save permissions") }
    finally { setSaving(false) }
  }, [name, fetchRole])

  return { role, loading, saving, error, savePermissions, refresh: fetchRole }
}
```

**`useCloneRole()`** — stateless clone action, refreshes parent list via callback:
```typescript
export function useCloneRole(onSuccess: () => void) {
  const [cloning, setCloning] = useState(false)

  const cloneRole = useCallback(async (
    sourceName: string,
    newName: string,
    description: string
  ) => {
    try {
      setCloning(true)
      await rolePermissionService.cloneRole(sourceName, { name: newName, description })
      toast.success(`Role "${newName}" created`)
      onSuccess()
    } catch { toast.error("Failed to clone role") }
    finally { setCloning(false) }
  }, [onSuccess])

  return { cloning, cloneRole }
}
```

### Step 2 — Create `hooks/usePermissions.ts`

Simple list-only hook (no mutations on the permissions themselves):
```typescript
export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const res = await rolePermissionService.getAllPermissions()
      setPermissions(res.data ?? [])
    } catch { setError("Failed to load permissions.") }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPermissions() }, [fetchPermissions])

  return { permissions, loading, error, refresh: fetchPermissions }
}
```

### Step 3 — Create `hooks/useUserRoles.ts`

Manages a single user's assigned roles — grant/revoke with optimistic feedback:
```typescript
export function useUserRoles(username: string) {
  const [roles, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRoles = useCallback(async () => {
    if (!username) return
    try {
      setLoading(true); setError(null)
      const res = await rolePermissionService.getUserRoles(username)
      setRoles(res.data ?? [])
    } catch { setError("Failed to load user roles.") }
    finally { setLoading(false) }
  }, [username])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  // Diff original vs updated → batch grant/revoke in one call
  const saveRoles = useCallback(async (
    originalRoles: string[],
    updatedRoles: string[]
  ) => {
    const toGrant = updatedRoles.filter(r => !originalRoles.includes(r))
    const toRevoke = originalRoles.filter(r => !updatedRoles.includes(r))
    try {
      setSaving(true)
      if (toGrant.length > 0)
        await rolePermissionService.grantRolesBatch(username, { roles: toGrant })
      if (toRevoke.length > 0)
        await rolePermissionService.revokeRolesBatch(username, { roles: toRevoke })
      toast.success("User roles updated")
      await fetchRoles()
    } catch { toast.error("Failed to update user roles") }
    finally { setSaving(false) }
  }, [username, fetchRoles])

  return { roles, loading, saving, error, saveRoles, refresh: fetchRoles }
}
```

## Success Criteria
- [ ] `hooks/useRoles.ts` exports `useRoles`, `useRole`, `useCloneRole`
- [ ] `hooks/usePermissions.ts` exports `usePermissions`
- [ ] `hooks/useUserRoles.ts` exports `useUserRoles`
- [ ] All hooks handle loading/error states consistently
- [ ] Batch diff logic in `useRole.savePermissions` and `useUserRoles.saveRoles` correctly computes add/remove sets
- [ ] TypeScript compiles without errors

## Risk Assessment
- If permission/role names contain special characters, `encodeURIComponent` in service is critical — already handled in Phase 1.
- `useRole.savePermissions` makes up to 2 API calls sequentially; if the first succeeds and second fails, partial state occurs. Accept this trade-off (backend atomic batch not available); surface toast error + refresh to show current server state.
