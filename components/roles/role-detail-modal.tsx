"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Search, ShieldCheck } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRole } from "@/hooks/useRoles"
import { usePermissions } from "@/hooks/usePermissions"
import { ReadOnlyPermissions } from "@/components/roles/role-readonly-permissions"
import type { Permission, Role } from "@/types/role-permission"

const BUILT_IN_ROLES = ["CANDIDATE", "HR", "HR_MANAGER", "ADMIN"]

// Namespace → pill color (header row of each group)
const NS_COLORS: Record<string, string> = {
  application: "bg-violet-100 text-violet-800",
  job:         "bg-green-100  text-green-800",
  hr:          "bg-orange-100 text-orange-800",
  skill:       "bg-yellow-100 text-yellow-800",
  notification:"bg-blue-100   text-blue-800",
  candidate:   "bg-teal-100   text-teal-800",
  interview:   "bg-indigo-100 text-indigo-800",
  auth:        "bg-red-100    text-red-800",
  cv:          "bg-pink-100   text-pink-800",
  profile:     "bg-cyan-100   text-cyan-800",
  company:     "bg-amber-100  text-amber-800",
  role:        "bg-slate-100  text-slate-800",
}

const getNs     = (n: string) => n.includes(":") ? n.split(":")[0] : "general"
const getAction = (n: string) => n.includes(":") ? n.slice(n.indexOf(":") + 1) : n

// ── Per-namespace collapsible group with bulk-toggle ───────────────────────

interface PermGroupProps {
  ns: string; perms: Permission[]; checked: Set<string>
  onToggle: (name: string) => void
  onToggleAll: (perms: Permission[], allChecked: boolean) => void
}

function PermGroup({ ns, perms, checked, onToggle, onToggleAll }: PermGroupProps) {
  const headerRef = useRef<HTMLInputElement>(null)
  const checkedInNs = perms.filter(p => checked.has(p.name)).length
  const allChecked = checkedInNs === perms.length
  const someChecked = checkedInNs > 0 && !allChecked
  useEffect(() => {
    if (headerRef.current) headerRef.current.indeterminate = someChecked
  }, [someChecked])

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Namespace header row */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <input type="checkbox" ref={headerRef} checked={allChecked}
          onChange={() => onToggleAll(perms, allChecked)}
          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0" />
        <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${NS_COLORS[ns] ?? "bg-gray-100 text-gray-800"}`}>
          {ns}
        </span>
        <span className="ml-auto text-[10px] text-gray-400 tabular-nums">{checkedInNs}/{perms.length}</span>
      </div>
      {/* 2-column permission grid */}
      <div className="grid grid-cols-2 bg-white">
        {perms.map(p => {
          const on = checked.has(p.name)
          return (
            <label key={p.name} title={p.name}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors border-b border-r border-gray-100 ${on ? "bg-blue-50/50" : "hover:bg-gray-50"}`}>
              <input type="checkbox" checked={on} onChange={() => onToggle(p.name)}
                className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-mono font-medium text-gray-800 truncate">{getAction(p.name)}</p>
                {p.description && <p className="text-[10px] text-gray-400 truncate">{p.description}</p>}
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

// ── Main modal ─────────────────────────────────────────────────────────────

interface RoleDetailModalProps { role: Role; isAdmin: boolean; onClose: () => void }

export function RoleDetailModal({ role, isAdmin, onClose }: RoleDetailModalProps) {
  const isBuiltIn = BUILT_IN_ROLES.includes(role.name)
  const canEdit   = isAdmin && !isBuiltIn  // built-in roles are always read-only

  const { role: freshRole, loading, saving, savePermissions } = useRole(role.name)
  const { permissions: allPermissions, loading: permsLoading } = usePermissions()
  const [localPerms, setLocalPerms] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (freshRole) setLocalPerms(new Set(freshRole.permissions))
  }, [freshRole])

  const currentPerms = freshRole?.permissions ?? role.permissions
  const hasDiff = JSON.stringify([...localPerms].sort()) !== JSON.stringify([...currentPerms].sort())

  const togglePerm = (name: string) => setLocalPerms(prev => {
    const next = new Set(prev); next.has(name) ? next.delete(name) : next.add(name); return next
  })
  const toggleAll = (perms: Permission[], allChecked: boolean) => setLocalPerms(prev => {
    const next = new Set(prev)
    allChecked ? perms.forEach(p => next.delete(p.name)) : perms.forEach(p => next.add(p.name))
    return next
  })
  const handleSave = async () => {
    const ok = await savePermissions(currentPerms, [...localPerms])
    if (ok) onClose()
  }

  // Filter + group allPermissions for admin edit view
  const q = search.toLowerCase()
  const filteredPerms = !q ? allPermissions
    : allPermissions.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
  const grouped = filteredPerms.reduce<Record<string, Permission[]>>((acc, p) => {
    const ns = getNs(p.name); acc[ns] = acc[ns] ? [...acc[ns], p] : [p]; return acc
  }, {})

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl p-0 gap-0 overflow-hidden">
        {/* Header — description wraps, no truncate */}
        <DialogHeader className="px-5 py-4 border-b border-gray-200 space-y-0">
          <div className="pr-8">
            <div className="flex items-center gap-2 flex-wrap">
              <DialogTitle className="text-base font-semibold text-gray-900">{role.name}</DialogTitle>
              {isBuiltIn && (
                <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
                  built-in · read-only
                </span>
              )}
            </div>
            {role.description && (
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{role.description}</p>
            )}
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-5 py-4">
          {(loading || permsLoading) ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <span className="text-sm text-gray-500">Loading…</span>
            </div>
          ) : canEdit ? (
            /* Admin edit view (non-built-in only) */
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-gray-500 shrink-0">
                  <span className="font-semibold text-gray-900">{localPerms.size}</span>
                  {" / "}{allPermissions.length} selected
                  {search && <> · <span className="font-semibold text-gray-900">{filteredPerms.length}</span> shown</>}
                </p>
                <div className="relative w-56">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input type="search"
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-xs placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Filter permissions…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="max-h-[58vh] overflow-y-auto space-y-2 pr-0.5">
                {Object.keys(grouped).length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-400">No permissions match your search.</p>
                ) : (
                  Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([ns, perms]) => (
                    <PermGroup key={ns} ns={ns} perms={perms} checked={localPerms}
                      onToggle={togglePerm} onToggleAll={toggleAll} />
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Read-only: HR_MANAGER or any built-in role */
            <div>
              {isBuiltIn && isAdmin && (
                <div className="flex items-center gap-2 mb-2 rounded-lg border border-amber-400 bg-amber-100 px-2 py-2">
                  <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700">
                    Built-in roles are protected. Clone this role to customise its permissions.
                  </p>
                </div>
              )}
              <div className="max-h-[58vh] overflow-y-auto">
                <ReadOnlyPermissions perms={currentPerms} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-200 bg-gray-50">
          {canEdit ? (
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
