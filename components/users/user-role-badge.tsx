import { cn } from "@/lib/utils"
import type { AdminUserRole } from "@/types/admin-user"

const ROLE_CONFIG: Record<AdminUserRole, { label: string; classes: string }> = {
  CANDIDATE: { label: "Candidate", classes: "bg-blue-100 text-blue-700 ring-blue-200" },
  HR: { label: "HR", classes: "bg-green-100 text-green-700 ring-green-200" },
  HR_MANAGER: { label: "HR Manager", classes: "bg-orange-100 text-orange-700 ring-orange-200" },
  ADMIN: { label: "Admin", classes: "bg-red-100 text-red-700 ring-red-200" },
}

interface UserRoleBadgeProps {
  role: AdminUserRole
  className?: string
}

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.CANDIDATE
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
