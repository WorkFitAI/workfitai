"use client"

import { Loader2, AlertTriangle, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import type { Role } from "@/types/role-permission"

interface DeleteRoleConfirmProps {
  role: Role
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteRoleConfirm({
  role,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteRoleConfirmProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Delete Role</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            This will permanently delete{" "}
            <span className="font-semibold text-gray-900">{role.name}</span>{" "}
            and remove it from all assigned users.
          </p>
          <p className="text-xs font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
            This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete Role
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
