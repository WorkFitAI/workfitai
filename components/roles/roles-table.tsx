"use client"

import { useState } from "react"
import { Eye, Copy, Trash2, AlertCircle, Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRoles } from "@/hooks/useRoles"
import { RoleDetailModal } from "@/components/roles/role-detail-modal"
import { CloneRoleModal } from "@/components/roles/clone-role-modal"
import { DeleteRoleConfirm } from "@/components/roles/delete-role-confirm"
import type { Role } from "@/types/role-permission"

// Roles that cannot be deleted — protected built-ins
const BUILT_IN_ROLES = ["CANDIDATE", "HR", "HR_MANAGER", "ADMIN"]

interface RolesTableProps {
  isAdmin: boolean
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell><Skeleton className="h-5 w-12 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-8 w-24" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function RolesTable({ isAdmin }: RolesTableProps) {
  const { roles, loading, error, deletingName, deleteRole, refresh } = useRoles()
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [cloneSource, setCloneSource] = useState<Role | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <p className="text-sm text-gray-700">{error}</p>
        <Button variant="outline" size="sm" onClick={refresh}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-48">Role</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-32">Permissions</TableHead>
              <TableHead className="w-44 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableSkeleton />
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-12 text-sm text-gray-400"
                >
                  No roles found.
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => {
                const isBuiltIn = BUILT_IN_ROLES.includes(role.name)
                const isDeleting = deletingName === role.name
                return (
                  <TableRow key={role.name}>
                    <TableCell className="font-semibold text-gray-900 text-sm">
                      {role.name}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {role.description || "—"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
                        {role.permissions.length}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => setSelectedRole(role)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => setCloneSource(role)}
                          >
                            <Copy className="h-3.5 w-3.5 mr-1" />
                            Clone
                          </Button>
                        )}
                        {isAdmin && !isBuiltIn && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setDeleteTarget(role)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                            )}
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      {selectedRole && (
        <RoleDetailModal
          role={selectedRole}
          isAdmin={isAdmin}
          onClose={() => setSelectedRole(null)}
        />
      )}
      {cloneSource && (
        <CloneRoleModal
          sourceRole={cloneSource}
          onClose={() => setCloneSource(null)}
          onSuccess={() => {
            setCloneSource(null)
            refresh()
          }}
        />
      )}
      {deleteTarget && (
        <DeleteRoleConfirm
          role={deleteTarget}
          isDeleting={deletingName === deleteTarget.name}
          onConfirm={() => {
            deleteRole(deleteTarget.name)
            setDeleteTarget(null)
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}
