"use client"

import { useEffect, useState } from "react"
import { Pencil, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUserRoles } from "@/hooks/useUserRoles"
import { UserRolesEditPicker } from "@/components/roles/user-roles-edit-picker"
import type { AdminUserRole } from "@/types/admin-user"

// Role badge color map (mirrors user-role-badge.tsx config)
const ROLE_BADGE_CLASSES: Record<string, string> = {
  CANDIDATE: "bg-blue-100 text-blue-700 ring-blue-200",
  HR: "bg-green-100 text-green-700 ring-green-200",
  HR_MANAGER: "bg-orange-100 text-orange-700 ring-orange-200",
  ADMIN: "bg-red-100 text-red-700 ring-red-200",
}

function RoleBadge({ name }: { name: string }) {
  const classes =
    ROLE_BADGE_CLASSES[name] ?? "bg-gray-100 text-gray-700 ring-gray-200"
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${classes}`}
    >
      {name}
    </span>
  )
}

interface UserRolesPanelProps {
  username: string
  isAdmin: boolean
  isHrManager: boolean
  /** Primary role of the target user — used to enforce HR_MANAGER restriction */
  targetUserRole: AdminUserRole
}

export function UserRolesPanel({
  username,
  isAdmin,
  isHrManager,
  targetUserRole,
}: UserRolesPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { roles: currentRoles, loading, saving, saveRoles } = useUserRoles(username)

  // HR_MANAGER can only edit roles for HR users
  const canEdit = isAdmin || (isHrManager && targetUserRole === "HR")

  // Reset edit mode when the panel becomes non-editable
  useEffect(() => {
    if (!canEdit) setIsEditing(false)
  }, [canEdit])

  const handleSave = async (localRoles: string[]) => {
    await saveRoles(currentRoles, localRoles)
    setIsEditing(false)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-gray-900">Assigned Roles</h2>
        {canEdit && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
        )}
      </div>

      <div className="px-5 py-4">
        {loading ? (
          <div className="flex items-center gap-2 py-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-gray-500">Loading roles…</span>
          </div>
        ) : !isEditing ? (
          /* View mode */
          currentRoles.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {currentRoles.map((r) => (
                <RoleBadge key={r} name={r} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No roles assigned.</p>
          )
        ) : (
          /* Edit mode — picker mounts here, fetching /auth/roles only on demand */
          <UserRolesEditPicker
            isAdmin={isAdmin}
            currentRoles={currentRoles}
            saving={saving}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </div>
    </div>
  )
}
