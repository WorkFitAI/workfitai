"use client"

import { useEffect, useState } from "react"
import { Loader2, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useRole } from "@/hooks/useRoles"
import { usePermissions } from "@/hooks/usePermissions"
import type { Role } from "@/types/role-permission"

interface RoleDetailModalProps {
  role: Role
  isAdmin: boolean
  onClose: () => void
}

// Read-only badge list for HR_MANAGER view
function PermissionBadgeList({ perms }: { perms: string[] }) {
  if (perms.length === 0)
    return <p className="text-sm text-gray-400">No permissions assigned.</p>
  return (
    <div className="flex flex-wrap gap-1.5">
      {perms.map((p) => (
        <span
          key={p}
          className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200"
        >
          {p}
        </span>
      ))}
    </div>
  )
}

export function RoleDetailModal({ role, isAdmin, onClose }: RoleDetailModalProps) {
  const { role: freshRole, loading, saving, savePermissions } = useRole(role.name)
  const { permissions: allPermissions, loading: permsLoading } = usePermissions()
  const [localPerms, setLocalPerms] = useState<string[]>([])
  const [search, setSearch] = useState("")

  // Sync local state when fresh role data arrives
  useEffect(() => {
    if (freshRole) setLocalPerms(freshRole.permissions)
  }, [freshRole])

  const currentPerms = freshRole?.permissions ?? role.permissions
  const hasDiff =
    JSON.stringify([...localPerms].sort()) !==
    JSON.stringify([...currentPerms].sort())

  const togglePerm = (name: string) =>
    setLocalPerms((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name],
    )

  const handleSave = async () => {
    const ok = await savePermissions(currentPerms, localPerms)
    if (ok) onClose()
    // On failure: modal stays open so the user can retry
  }

  const filtered = allPermissions.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Role: {role.name}</DialogTitle>
          {role.description && (
            <p className="text-sm text-gray-500 mt-1">{role.description}</p>
          )}
        </DialogHeader>

        {loading || permsLoading ? (
          <div className="flex items-center justify-center py-12 gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-sm text-gray-500">Loading…</span>
          </div>
        ) : isAdmin ? (
          /* Admin: editable checkbox list */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {localPerms.length} / {allPermissions.length} permissions selected
              </p>
              <div className="relative w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  className="pl-8 h-8 text-xs"
                  placeholder="Filter permissions…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-[52vh] overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
              {filtered.map((p) => (
                <label
                  key={p.name}
                  className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                >
                  <Checkbox
                    checked={localPerms.includes(p.name)}
                    onCheckedChange={() => togglePerm(p.name)}
                    className="mt-0.5"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    {p.description && (
                      <p className="text-xs text-gray-400">{p.description}</p>
                    )}
                  </div>
                </label>
              ))}
              {filtered.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-400">
                  No permissions match your search.
                </p>
              )}
            </div>
          </div>
        ) : (
          /* HR_MANAGER: read-only badge list */
          <div className="max-h-[52vh] overflow-y-auto py-2">
            <PermissionBadgeList perms={currentPerms} />
          </div>
        )}

        <DialogFooter>
          {isAdmin ? (
            <>
              <Button variant="outline" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!hasDiff || saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
