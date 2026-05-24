"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Copy, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCloneRole } from "@/hooks/useRoles"
import type { Role } from "@/types/role-permission"

const cloneRoleSchema = z.object({
  name: z
    .string()
    .min(2, "At least 2 characters")
    .regex(/^[A-Z_]+$/, "Uppercase letters and underscores only"),
  description: z.string().min(5, "At least 5 characters"),
})

type CloneRoleFormValues = z.infer<typeof cloneRoleSchema>

interface CloneRoleModalProps {
  sourceRole: Role
  onClose: () => void
  onSuccess: () => void
}

export function CloneRoleModal({ sourceRole, onClose, onSuccess }: CloneRoleModalProps) {
  const { cloning, cloneRole } = useCloneRole(onSuccess)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CloneRoleFormValues>({
    resolver: zodResolver(cloneRoleSchema),
    defaultValues: { name: "", description: "" },
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
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-base font-semibold text-gray-900">
              Clone Role
            </DialogTitle>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        {/* Source info banner */}
        <div className="flex items-center gap-3 mx-5 mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <Copy className="h-4 w-4 text-gray-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">
              Cloning from{" "}
              <span className="font-semibold text-gray-800">{sourceRole.name}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {sourceRole.permissions.length} permission
              {sourceRole.permissions.length !== 1 ? "s" : ""} will be copied
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Role Name
            </label>
            <input
              {...register("name")}
              disabled={cloning}
              placeholder="MY_NEW_ROLE"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-mono placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              {...register("description")}
              disabled={cloning}
              placeholder="Describe the purpose of this role"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
            />
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={cloning}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={cloning}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {cloning && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Role
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
