"use client"

import { useAuth } from "@/contexts/auth-context"
import { AdminDashboardClient } from "@/components/dashboard/admin/admin-dashboard-client"
import { HrmDashboardClient } from "@/components/dashboard/hrm/hrm-dashboard-client"
import { DashboardSkeleton } from "@/components/dashboard/shared/dashboard-skeleton"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <DashboardSkeleton />

  const roles = user?.roles ?? []

  if (roles.includes("ROLE_ADMIN")) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Dashboard</h1>
          <p className="text-sm text-muted-foreground">Full platform view across all companies</p>
        </div>
        <AdminDashboardClient />
      </div>
    )
  }

  if (roles.includes("ROLE_HR_MANAGER") || roles.includes("ROLE_HR")) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Company recruitment overview</p>
        </div>
        <HrmDashboardClient />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-24 text-muted-foreground">
      <p className="text-sm">No dashboard available for your role.</p>
    </div>
  )
}
