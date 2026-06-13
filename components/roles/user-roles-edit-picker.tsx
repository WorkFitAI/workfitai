"use client"

// Lazy sub-component: only mounts (and fetches /auth/roles) when edit modal is open
import { useState } from "react"
import { Loader2, AlertCircle, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useRoles } from "@/hooks/useRoles"

// Sorted longest-first so "HR_MANAGER" is tested before "HR"
const BUILT_IN_ROLES = ["HR_MANAGER", "ADMIN", "CANDIDATE", "HR"]

/**
 * Resolves the built-in scope of any role name.
 * "HR_MANAGER_SENIOR" → "HR_MANAGER"
 * "HR_CUSTOM"         → "HR"
 * "ADMIN"             → "ADMIN"
 * Unknown prefix      → null
 */
function getRoleScope(roleName: string): string | null {
  if (BUILT_IN_ROLES.includes(roleName)) return roleName
  for (const bi of BUILT_IN_ROLES) {   // already longest-first
    if (roleName.startsWith(bi + "_")) return bi
  }
  return null
}

interface UserRolesEditPickerProps {
  isAdmin: boolean
  /** User's primary role — defines assignable scope + always locked, cannot be removed */
  primaryRole: string
  currentRoles: string[]
  saving: boolean
  onSave: (localRoles: string[]) => void
  onCancel: () => void
}

export function UserRolesEditPicker({
  isAdmin,
  primaryRole,
  currentRoles,
  saving,
  onSave,
  onCancel,
}: UserRolesEditPickerProps) {
  const { roles: allRoles, loading: rolesLoading } = useRoles()

  // Always seed primaryRole as checked — guards against it being absent from currentRoles
  const [localRoles, setLocalRoles] = useState<string[]>(() => {
    const base = [...currentRoles]
    if (primaryRole && !base.includes(primaryRole)) base.push(primaryRole)
    return base
  })

  // Scope-based filter: only roles whose scope matches the target user's primary role.
  // This prevents cross-scope assignments (e.g. ADMIN roles on a CANDIDATE user).
  // Backend must also enforce this — frontend is UX-only guard.
  const editableRoles = allRoles.filter(r => getRoleScope(r.name) === primaryRole)

  const hasDiff =
    JSON.stringify([...localRoles].sort()) !== JSON.stringify([...currentRoles].sort())

  // Primary role is immutable — silently drop toggle attempts
  const toggleRole = (name: string) => {
    if (name === primaryRole) return
    setLocalRoles(prev =>
      prev.includes(name) ? prev.filter(r => r !== name) : [...prev, name],
    )
  }

  return (
    <div className="space-y-3">
      {isAdmin && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded px-3 py-2">
          Changes take effect on the user&apos;s next login.
        </p>
      )}
      {rolesLoading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm text-gray-500">Loading available roles…</span>
        </div>
      ) : editableRoles.length === 0 ? (
        <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          No additional roles in the <span className="font-medium mx-1">{primaryRole}</span> scope.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
          {editableRoles.map(role => {
            const isLocked  = role.name === primaryRole
            const isChecked = localRoles.includes(role.name)
            return (
              <label key={role.name}
                className={`flex items-start gap-3 px-4 py-2.5 transition-colors ${
                  isLocked ? "bg-gray-50/80 cursor-default" : "hover:bg-gray-50 cursor-pointer"
                }`}>
                <Checkbox
                  checked={isLocked || isChecked}
                  onCheckedChange={() => toggleRole(role.name)}
                  className="mt-0.5"
                  disabled={saving || isLocked}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className={`text-sm font-medium ${isLocked ? "text-gray-500" : "text-gray-900"}`}>
                      {role.name}
                    </p>
                    {isLocked && (
                      <span className="inline-flex items-center gap-0.5 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400">
                        <Lock className="h-2.5 w-2.5" />
                        primary · locked
                      </span>
                    )}
                  </div>
                  {role.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{role.description}</p>
                  )}
                </div>
              </label>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button size="sm" onClick={() => onSave(localRoles)} disabled={!hasDiff || saving}>
          {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}
