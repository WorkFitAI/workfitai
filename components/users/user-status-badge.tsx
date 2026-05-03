import { cn } from "@/lib/utils"
import type { AdminUserStatus } from "@/types/admin-user"

const STATUS_CONFIG: Record<
  AdminUserStatus,
  { label: string; classes: string }
> = {
  ACTIVE: { label: "Active", classes: "bg-green-100 text-green-700 ring-green-200" },
  INACTIVE: { label: "Inactive", classes: "bg-gray-100 text-gray-600 ring-gray-200" },
  BLOCKED: { label: "Blocked", classes: "bg-red-100 text-red-700 ring-red-200" },
  SUSPENDED: { label: "Suspended", classes: "bg-orange-100 text-orange-700 ring-orange-200" },
  DEACTIVATED: { label: "Deactivated", classes: "bg-yellow-100 text-yellow-700 ring-yellow-200" },
  WAIT_APPROVED: { label: "Pending", classes: "bg-amber-100 text-amber-700 ring-amber-200" },
}

interface UserStatusBadgeProps {
  status: AdminUserStatus
  className?: string
}

export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.INACTIVE
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        config.classes,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
