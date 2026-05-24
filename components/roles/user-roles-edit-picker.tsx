"use client"

// Lazy sub-component: only mounts (and fetches /auth/roles) when edit mode is active
import { useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useRoles } from "@/hooks/useRoles"

const HRM_RESTRICTED_ROLES = ["ADMIN", "HR_MANAGER", "CANDIDATE"]

interface UserRolesEditPickerProps {
  isAdmin: boolean
  currentRoles: string[]
  saving: boolean
  onSave: (localRoles: string[]) => void
  onCancel: () => void
}

export function UserRolesEditPicker({
  isAdmin,
  currentRoles,
  saving,
  onSave,
  onCancel,
}: UserRolesEditPickerProps) {
  const { roles: allRoles, loading: rolesLoading } = useRoles()
  const [localRoles, setLocalRoles] = useState<string[]>([...currentRoles])

  // HR_MANAGER must not grant ADMIN/HR_MANAGER/CANDIDATE (privilege escalation guard;
  // backend should also enforce this)
  const editableRoles = isAdmin
    ? allRoles
    : allRoles.filter((r) => !HRM_RESTRICTED_ROLES.includes(r.name))

  const hasDiff =
    JSON.stringify([...localRoles].sort()) !==
    JSON.stringify([...currentRoles].sort())

  const toggleRole = (name: string) =>
    setLocalRoles((prev) =>
      prev.includes(name) ? prev.filter((r) => r !== name) : [...prev, name],
    )

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
        <div className="flex items-center gap-2 py-2 text-sm text-gray-400">
          <AlertCircle className="h-4 w-4" />
          No roles available.
        </div>
      ) : (
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
          {editableRoles.map((role) => (
            <label
              key={role.name}
              className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
            >
              <Checkbox
                checked={localRoles.includes(role.name)}
                onCheckedChange={() => toggleRole(role.name)}
                className="mt-0.5"
                disabled={saving}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{role.name}</p>
                {role.description && (
                  <p className="text-xs text-gray-400">{role.description}</p>
                )}
              </div>
            </label>
          ))}
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
