"use client"

import { useEffect, useState } from "react"
import { Loader2, Search, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRole } from "@/hooks/useRoles"
import { usePermissions } from "@/hooks/usePermissions"
import { ReadOnlyPermissions } from "@/components/roles/role-readonly-permissions"
import type { Role } from "@/types/role-permission"

interface RoleDetailModalProps {
  role: Role
  isAdmin: boolean
  onClose: () => void
}

export function RoleDetailModal({ role, isAdmin, onClose }: RoleDetailModalProps) {
  const { role: freshRole, loading, saving, savePermissions } = useRole(role.name)
  const { permissions: allPermissions, loading: permsLoading } = usePermissions()
  const [localPerms, setLocalPerms] = useState<string[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (freshRole) setLocalPerms(freshRole.permissions)
  }, [freshRole])

  const currentPerms = freshRole?.permissions ?? role.permissions
  const hasDiff =
    JSON.stringify([...localPerms].sort()) !== JSON.stringify([...currentPerms].sort())

  const togglePerm = (name: string) =>
    setLocalPerms((prev) => prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name])

  const handleSave = async () => {
    const ok = await savePermissions(currentPerms, localPerms)
    if (ok) onClose()
  }

  const filtered = allPermissions.filter(
    (p) => !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-gray-200 space-y-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold text-gray-900">{role.name}</DialogTitle>
              {role.description && <p className="text-xs text-gray-500 mt-0.5 truncate">{role.description}</p>}
            </div>
            <button onClick={onClose} className="shrink-0 rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors mt-0.5">
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-5 py-4">
          {(loading || permsLoading) ? (
            <div className="flex items-center justify-center py-12 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-sm text-gray-500">Loading…</span>
            </div>
          ) : isAdmin ? (
            <div className="space-y-3">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-gray-500 shrink-0">
                  <span className="font-semibold text-gray-900">{localPerms.length}</span>
                  {" / "}{allPermissions.length} selected
                </p>
                <div className="relative w-52">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input type="search"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-xs placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Filter permissions…" value={search}
                    onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
              {/* Checkbox list */}
              <div className="max-h-[52vh] overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400">No permissions match your search.</p>
                ) : (
                  filtered.map((p) => {
                    const checked = localPerms.includes(p.name)
                    return (
                      <label key={p.name}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${checked ? "bg-blue-50/60" : "hover:bg-gray-50"}`}>
                        <input type="checkbox" checked={checked} onChange={() => togglePerm(p.name)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-mono font-medium text-gray-900 truncate">{p.name}</p>
                          {p.description && <p className="text-xs text-gray-400 truncate mt-0.5">{p.description}</p>}
                        </div>
                      </label>
                    )
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="max-h-[52vh] overflow-y-auto">
              <ReadOnlyPermissions perms={currentPerms} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-200 bg-gray-50">
          {isAdmin ? (
            <>
              <button onClick={onClose} disabled={saving}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={!hasDiff || saving}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </>
          ) : (
            <button onClick={onClose}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Close
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
