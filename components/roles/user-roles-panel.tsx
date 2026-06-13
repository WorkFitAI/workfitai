"use client"

import { useEffect, useState } from "react"
import { Pencil, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useUserRoles } from "@/hooks/useUserRoles"
import { UserRolesEditPicker } from "@/components/roles/user-roles-edit-picker"
import type { AdminUserRole } from "@/types/admin-user"

// Role badge color map (mirrors user-role-badge.tsx)
const ROLE_BADGE_CLASSES: Record<string, string> = {
  CANDIDATE:  "bg-blue-100   text-blue-700   ring-blue-200",
  HR:         "bg-green-100  text-green-700  ring-green-200",
  HR_MANAGER: "bg-orange-100 text-orange-700 ring-orange-200",
  ADMIN:      "bg-red-100    text-red-700    ring-red-200",
}

function RoleBadge({ name }: { name: string }) {
  const classes = ROLE_BADGE_CLASSES[name] ?? "bg-gray-100 text-gray-700 ring-gray-200"
  return (
    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${classes}`}>
      {name}
    </span>
  )
}

interface UserRolesPanelProps {
  username: string
  isAdmin: boolean
  isHrManager: boolean
  /** Primary role of the target user — used for edit permission guard + locked role in picker */
  targetUserRole: AdminUserRole
}

export function UserRolesPanel({ username, isAdmin, isHrManager, targetUserRole }: UserRolesPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { roles: currentRoles, loading, saving, saveRoles } = useUserRoles(username)

  // HR_MANAGER may only edit roles for HR users
  const canEdit = isAdmin || (isHrManager && targetUserRole === "HR")

  // Close modal if edit permission is lost
  useEffect(() => {
    if (!canEdit) setIsModalOpen(false)
  }, [canEdit])

  const handleSave = async (localRoles: string[]) => {
    await saveRoles(currentRoles, localRoles)
    setIsModalOpen(false)
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-gray-900">Assigned Roles</h2>
          {canEdit && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"
              onClick={() => setIsModalOpen(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Manage Roles
            </Button>
          )}
        </div>

        {/* View */}
        <div className="px-5 py-4">
          {loading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-500">Loading roles…</span>
            </div>
          ) : currentRoles.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {currentRoles.map(r => <RoleBadge key={r} name={r} />)}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No roles assigned.</p>
          )}
        </div>
      </div>

      {/* Role management modal — UserRolesEditPicker mounts only when open */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && setIsModalOpen(false)}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-5 py-4 border-b border-gray-200 space-y-0">
            <div className="pr-8">
              <DialogTitle className="text-base font-semibold text-gray-900">
                Manage Roles
              </DialogTitle>
              <p className="text-xs text-gray-500 mt-0.5">@{username}</p>
            </div>
          </DialogHeader>
          <div className="px-5 py-4">
            {/* Picker only renders (and fetches /auth/roles) while the modal is open */}
            {isModalOpen && (
              <UserRolesEditPicker
                isAdmin={isAdmin}
                primaryRole={targetUserRole}
                currentRoles={currentRoles}
                saving={saving}
                onSave={handleSave}
                onCancel={() => setIsModalOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
