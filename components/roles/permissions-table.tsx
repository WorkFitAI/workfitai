"use client"

import { Fragment, useState } from "react"
import { Search, AlertCircle, Loader2, Key } from "lucide-react"
import { usePermissions } from "@/hooks/usePermissions"

// Derive namespace prefix from permission name (e.g. "auth:read" → "auth")
function getNamespace(name: string): string {
  const colon = name.indexOf(":")
  return colon !== -1 ? name.slice(0, colon) : "general"
}

// Consistent color per namespace prefix
const NS_COLORS: Record<string, string> = {
  auth: "bg-blue-50 text-blue-700 ring-blue-200",
  user: "bg-purple-50 text-purple-700 ring-purple-200",
  job: "bg-green-50 text-green-700 ring-green-200",
  application: "bg-orange-50 text-orange-700 ring-orange-200",
  company: "bg-yellow-50 text-yellow-700 ring-yellow-200",
  admin: "bg-red-50 text-red-700 ring-red-200",
  general: "bg-gray-50 text-gray-600 ring-gray-200",
}

function NsBadge({ ns }: { ns: string }) {
  const cls = NS_COLORS[ns] ?? NS_COLORS.general
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-inset ${cls}`}>
      {ns}
    </span>
  )
}

export function PermissionsTable() {
  const { permissions, loading, error } = usePermissions()
  const [search, setSearch] = useState("")

  const filtered = search
    ? permissions.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase()),
      )
    : permissions

  // Group by namespace prefix
  const groups = filtered.reduce<Record<string, typeof filtered>>((acc, p) => {
    const ns = getNamespace(p.name)
    acc[ns] = acc[ns] ? [...acc[ns], p] : [p]
    return acc
  }, {})

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 border-b border-gray-200">
        <p className="text-sm text-gray-500 shrink-0">
          {loading
            ? "Loading…"
            : `${filtered.length} permission${filtered.length !== 1 ? "s" : ""}${search ? " found" : ""}`}
        </p>
        <div className="relative sm:ml-auto w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search permissions…"
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-700 bg-red-50 border-b border-red-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-72">
                Permission
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={2} className="py-16 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading permissions…</p>
                </td>
              </tr>
            ) : Object.keys(groups).length === 0 ? (
              <tr>
                <td colSpan={2} className="py-16 text-center">
                  <Key className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-500">No permissions found</p>
                  {search && (
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
                  )}
                </td>
              </tr>
            ) : (
              Object.entries(groups).map(([ns, perms]) => (
                <Fragment key={ns}>
                  {/* Namespace separator row */}
                  <tr className="bg-gray-50 hover:bg-gray-50">
                    <td colSpan={2} className="px-4 py-2">
                      <NsBadge ns={ns} />
                      <span className="ml-2 text-xs text-gray-400">
                        {perms.length} permission{perms.length !== 1 ? "s" : ""}
                      </span>
                    </td>
                  </tr>
                  {perms.map((p) => (
                    <tr key={p.name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 pl-6">
                        <span className="font-mono text-xs text-gray-800">{p.name}</span>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-500">
                        {p.description || <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
