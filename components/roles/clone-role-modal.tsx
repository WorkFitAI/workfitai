"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCloneRole } from "@/hooks/useRoles"
import type { Role } from "@/types/role-permission"

const cloneRoleSchema = z.object({
  name: z
    .string()
    .min(2, "At least 2 characters")
    .regex(/^[A-Z_]+$/, "Uppercase letters and underscores only"),
  description: z.string().min(5, "Description must be at least 5 characters"),
})

type CloneRoleFormValues = z.infer<typeof cloneRoleSchema>

interface CloneRoleModalProps {
  sourceRole: Role
  onClose: () => void
  onSuccess: () => void
}

export function CloneRoleModal({
  sourceRole,
  onClose,
  onSuccess,
}: CloneRoleModalProps) {
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
    // On failure: modal stays open so the user can retry without re-entering data
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Clone Role</DialogTitle>
        </DialogHeader>

        {/* Source role info */}
        <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-sm">
          <p className="text-gray-500">
            Cloning from:{" "}
            <strong className="text-gray-900">{sourceRole.name}</strong>
          </p>
          <p className="text-gray-400 text-xs mt-0.5">
            {sourceRole.permissions.length} permission
            {sourceRole.permissions.length !== 1 ? "s" : ""} will be copied
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="clone-name">Role Name</Label>
            <Input
              id="clone-name"
              placeholder="MY_NEW_ROLE"
              {...register("name")}
              disabled={cloning}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clone-description">Description</Label>
            <Input
              id="clone-description"
              placeholder="Describe the purpose of this role"
              {...register("description")}
              disabled={cloning}
            />
            {errors.description && (
              <p className="text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={cloning}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={cloning}>
              {cloning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
