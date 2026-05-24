"use client"

import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Copy, Info } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCloneRole } from "@/hooks/useRoles"
import type { Role } from "@/types/role-permission"

// Sorted longest-first so "HR_MANAGER" is matched before "HR"
const BUILT_IN_ROLES = ["HR_MANAGER", "ADMIN", "CANDIDATE", "HR"]

/**
 * Returns the built-in scope for any role name.
 * "HR_MANAGER_SENIOR" → "HR_MANAGER"
 * "HR_CUSTOM"         → "HR"
 * "ADMIN"             → "ADMIN"
 */
function getRoleScope(roleName: string): string {
  if (BUILT_IN_ROLES.includes(roleName)) return roleName
  for (const bi of BUILT_IN_ROLES) {          // already longest-first
    if (roleName.startsWith(bi + "_")) return bi
  }
  return roleName                              // unknown: use name itself as scope
}

type CloneRoleFormValues = { name: string; description: string }

interface CloneRoleModalProps {
  sourceRole: Role
  onClose: () => void
  onSuccess: () => void
}

export function CloneRoleModal({ sourceRole, onClose, onSuccess }: CloneRoleModalProps) {
  const { cloning, cloneRole } = useCloneRole(onSuccess)
  const scopePrefix = getRoleScope(sourceRole.name)  // e.g. "HR_MANAGER"
  const namePrefix  = scopePrefix + "_"              // e.g. "HR_MANAGER_"

  // Schema is stable for this modal's lifetime (sourceRole.name doesn't change while open)
  const schema = useMemo(() => z.object({
    name: z
      .string()
      .regex(/^[A-Z_]+$/, "Uppercase letters and underscores only")
      .refine(
        (v) => v.startsWith(namePrefix) && v.length > namePrefix.length,
        { message: `Name must start with "${namePrefix}" followed by a suffix` },
      ),
    description: z.string().min(5, "At least 5 characters"),
  }), [namePrefix])

  const { register, handleSubmit, formState: { errors } } = useForm<CloneRoleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: namePrefix, description: "" },
  })

  const onSubmit = async (data: CloneRoleFormValues) => {
    const ok = await cloneRole(sourceRole.name, data.name, data.description)
    if (ok) onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-gray-200 space-y-0">
          <DialogTitle className="text-base font-semibold text-gray-900 pr-8">Clone Role</DialogTitle>
        </DialogHeader>

        {/* Source info banner */}
        <div className="flex items-center gap-3 mx-5 mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <Copy className="h-4 w-4 text-gray-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">
              Cloning from <span className="font-semibold text-gray-800">{sourceRole.name}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {sourceRole.permissions.length} permission{sourceRole.permissions.length !== 1 ? "s" : ""} will be copied
            </p>
          </div>
        </div>

        {/* Scope constraint banner */}
        <div className="flex items-start gap-2.5 mx-5 mt-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
          <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            New role belongs to the{" "}
            <span className="font-semibold">{scopePrefix}</span> scope — name must start with{" "}
            <span className="font-mono font-semibold">{namePrefix}</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Role Name</label>
            <input
              {...register("name")}
              disabled={cloning}
              placeholder={`${namePrefix}CUSTOM`}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-mono placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              {...register("description")}
              disabled={cloning}
              placeholder="Describe the purpose of this role"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
            />
            {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} disabled={cloning}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={cloning}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {cloning && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Role
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
