"use client"

import { useState } from "react"
import { Search, Eye, Copy, Trash2, AlertCircle, Loader2, ShieldCheck, RefreshCw } from "lucide-react"
import { useRoles } from "@/hooks/useRoles"
import { RoleDetailModal } from "@/components/roles/role-detail-modal"
import { CloneRoleModal } from "@/components/roles/clone-role-modal"
import { DeleteRoleConfirm } from "@/components/roles/delete-role-confirm"
import type { Role } from "@/types/role-permission"

const BUILT_IN_ROLES = ["CANDIDATE", "HR", "HR_MANAGER", "ADMIN"]
const AVATAR_BG: Record<string, string> = {
  ADMIN: "bg-red-600", HR_MANAGER: "bg-orange-500",
  HR: "bg-green-600", CANDIDATE: "bg-blue-600",
}

function RoleAvatar({ name }: { name: string }) {
  return (
    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold ${AVATAR_BG[name] ?? "bg-gray-500"}`}>
      {name.charAt(0)}
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gray-100 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3 w-24 rounded bg-gray-100 animate-pulse" />
            <div className="h-2.5 w-36 rounded bg-gray-100 animate-pulse" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3"><div className="h-5 w-10 rounded-full bg-gray-100 animate-pulse" /></td>
      <td className="px-4 py-3"><div className="h-3 w-16 rounded bg-gray-100 animate-pulse ml-auto" /></td>
    </tr>
  )
}

interface RolesTableProps { isAdmin: boolean }

export function RolesTable({ isAdmin }: RolesTableProps) {
  const { roles, loading, error, deletingName, deleteRole, refresh } = useRoles()
  const [search, setSearch] = useState("")
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [cloneSource, setCloneSource] = useState<Role | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)

  const filtered = search
    ? roles.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase()))
    : roles

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 border-b border-gray-200">
          <p className="text-sm text-gray-500 shrink-0">
            {loading ? "Loading…" : `${roles.length} role${roles.length !== 1 ? "s" : ""}`}
          </p>
          <div className="relative sm:ml-auto w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles…"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" />
          </div>
          <button onClick={refresh} disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors shrink-0">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-700 bg-red-50 border-b border-red-100">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Permissions</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-16 text-center">
                    <ShieldCheck className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-500">
                      {search ? "No roles match your search" : "No roles found"}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((role) => {
                  const isBuiltIn = BUILT_IN_ROLES.includes(role.name)
                  const isDeleting = deletingName === role.name
                  return (
                    <tr key={role.name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <RoleAvatar name={role.name} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {role.name}
                              {isBuiltIn && (
                                <span className="ml-2 text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                  built-in
                                </span>
                              )}
                            </p>
                            {role.description && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{role.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
                          {role.permissions.length}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2.5">
                          <button onClick={() => setSelectedRole(role)} title="View" className="text-blue-600 hover:text-blue-800 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          {isAdmin && (
                            <button onClick={() => setCloneSource(role)} title="Clone" className="text-gray-400 hover:text-gray-700 transition-colors">
                              <Copy className="h-4 w-4" />
                            </button>
                          )}
                          {isAdmin && !isBuiltIn && (
                            <button onClick={() => setDeleteTarget(role)} disabled={isDeleting} title="Delete"
                              className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50">
                              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRole && (
        <RoleDetailModal role={selectedRole} isAdmin={isAdmin} onClose={() => setSelectedRole(null)} />
      )}
      {cloneSource && (
        <CloneRoleModal sourceRole={cloneSource} onClose={() => setCloneSource(null)}
          onSuccess={() => { setCloneSource(null); refresh() }} />
      )}
      {deleteTarget && (
        <DeleteRoleConfirm role={deleteTarget} isDeleting={deletingName === deleteTarget.name}
          onConfirm={() => { deleteRole(deleteTarget.name); setDeleteTarget(null) }}
          onCancel={() => setDeleteTarget(null)} />
      )}
    </>
  )
}
