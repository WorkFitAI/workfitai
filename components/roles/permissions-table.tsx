"use client"

import { Fragment, useState } from "react"
import { Search, AlertCircle, Loader2, Key } from "lucide-react"
import { usePermissions } from "@/hooks/usePermissions"

const getNs     = (n: string) => n.includes(":") ? n.split(":")[0] : "general"
const getAction = (n: string) => n.includes(":") ? n.slice(n.indexOf(":") + 1) : n

// Consistent namespace color palette — badge pill + tinted row background
const NS_COLORS: Record<string, { badge: string; row: string }> = {
  application: { badge: "bg-violet-100 text-violet-800", row: "bg-violet-50/50"  },
  job:         { badge: "bg-green-100  text-green-800",  row: "bg-green-50/50"   },
  hr:          { badge: "bg-orange-100 text-orange-800", row: "bg-orange-50/50"  },
  skill:       { badge: "bg-yellow-100 text-yellow-800", row: "bg-yellow-50/50"  },
  notification:{ badge: "bg-blue-100   text-blue-800",   row: "bg-blue-50/50"    },
  candidate:   { badge: "bg-teal-100   text-teal-800",   row: "bg-teal-50/50"    },
  interview:   { badge: "bg-indigo-100 text-indigo-800", row: "bg-indigo-50/50"  },
  auth:        { badge: "bg-red-100    text-red-800",    row: "bg-red-50/50"     },
  cv:          { badge: "bg-pink-100   text-pink-800",   row: "bg-pink-50/50"    },
  profile:     { badge: "bg-cyan-100   text-cyan-800",   row: "bg-cyan-50/50"    },
  company:     { badge: "bg-amber-100  text-amber-800",  row: "bg-amber-50/50"   },
  role:        { badge: "bg-slate-100  text-slate-800",  row: "bg-slate-50/50"   },
}
const DEFAULT_NS = { badge: "bg-gray-100 text-gray-700", row: "bg-gray-50/50" }

export function PermissionsTable() {
  const { permissions, loading, error } = usePermissions()
  const [search, setSearch]   = useState("")
  const [activeNs, setActiveNs] = useState<string | null>(null)

  // Sorted list of all namespaces present in data
  const allNamespaces = [...new Set(permissions.map(p => getNs(p.name)))].sort()

  const filtered = permissions.filter(p => {
    const matchNs     = !activeNs || getNs(p.name) === activeNs
    const q           = search.toLowerCase()
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    return matchNs && matchSearch
  })

  const groups = filtered.reduce<Record<string, typeof filtered>>((acc, p) => {
    const ns = getNs(p.name); acc[ns] = acc[ns] ? [...acc[ns], p] : [p]; return acc
  }, {})

  const toggleNs = (ns: string) => setActiveNs(prev => prev === ns ? null : ns)

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500 shrink-0">
            {loading
              ? "Loading…"
              : `${filtered.length} permission${filtered.length !== 1 ? "s" : ""}${
                  !loading && allNamespaces.length ? ` · ${allNamespaces.length} namespaces` : ""
                }`}
          </p>
          <div className="relative sm:ml-auto w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input type="search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search permissions…"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" />
          </div>
        </div>

        {/* Namespace quick-filter chips */}
        {!loading && allNamespaces.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setActiveNs(null)}
              className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                !activeNs ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}>
              All
            </button>
            {allNamespaces.map(ns => {
              const c = NS_COLORS[ns] ?? DEFAULT_NS
              const active = activeNs === ns
              return (
                <button key={ns} onClick={() => toggleNs(ns)}
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                    active ? `${c.badge} outline outline-1 outline-current` : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                  {ns}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-700 bg-red-50 border-b border-red-100">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
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
                  {(search || activeNs) && (
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search or namespace filter</p>
                  )}
                </td>
              </tr>
            ) : (
              Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([ns, perms]) => {
                const c = NS_COLORS[ns] ?? DEFAULT_NS
                return (
                  <Fragment key={ns}>
                    {/* Namespace separator row */}
                    <tr className={c.row}>
                      <td colSpan={2} className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${c.badge}`}>
                            {ns}
                          </span>
                          <span className="text-xs text-gray-400">
                            {perms.length} permission{perms.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {/* Permission rows: action prominent, full name as sub-label */}
                    {perms.map(p => (
                      <tr key={p.name} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2.5 pl-6">
                          <p className="font-mono text-xs font-medium text-gray-900">{getAction(p.name)}</p>
                          <p className="font-mono text-[10px] text-gray-400 mt-0.5">{p.name}</p>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-500 leading-relaxed">
                          {p.description || <span className="text-gray-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
