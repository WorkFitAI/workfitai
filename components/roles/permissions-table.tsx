"use client"

import { Fragment, useState } from "react"
import { Search, AlertCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePermissions } from "@/hooks/usePermissions"

// Derive namespace prefix from permission name (e.g. "auth:read" → "auth")
function getNamespace(name: string): string {
  const colon = name.indexOf(":")
  return colon !== -1 ? name.slice(0, colon) : "other"
}

export function PermissionsTable() {
  const { permissions, loading, error } = usePermissions()
  const [search, setSearch] = useState("")

  const filtered = search
    ? permissions.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase()),
      )
    : permissions

  // Group by namespace prefix
  const groups = filtered.reduce<Record<string, typeof filtered>>(
    (acc, p) => {
      const ns = getNamespace(p.name)
      acc[ns] = acc[ns] ? [...acc[ns], p] : [p]
      return acc
    },
    {},
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <span className="text-sm text-gray-500">Loading permissions…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <p className="text-sm text-gray-700">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          className="pl-9"
          placeholder="Search permissions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grouped table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-72">Permission</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.keys(groups).length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-10 text-sm text-gray-400">
                  No permissions found.
                </TableCell>
              </TableRow>
            ) : (
              Object.entries(groups).map(([ns, perms]) => (
                <Fragment key={ns}>
                  {/* Namespace group header */}
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableCell
                      colSpan={2}
                      className="py-1.5 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {ns}
                    </TableCell>
                  </TableRow>
                  {perms.map((p) => (
                    <TableRow key={p.name}>
                      <TableCell className="font-mono text-sm text-gray-900 py-2.5">
                        {p.name}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500 py-2.5">
                        {p.description || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
