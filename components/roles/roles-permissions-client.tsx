"use client"

import { useState } from "react"
import { ShieldCheck, Key } from "lucide-react"
import { RolesTable } from "@/components/roles/roles-table"
import { PermissionsTable } from "@/components/roles/permissions-table"

type Tab = "roles" | "permissions"

const TABS: { value: Tab; label: string; icon: React.ElementType }[] = [
  { value: "roles", label: "Roles", icon: ShieldCheck },
  { value: "permissions", label: "Permissions", icon: Key },
]

interface RolesPermissionsClientProps {
  isAdmin: boolean
}

export function RolesPermissionsClient({ isAdmin }: RolesPermissionsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("roles")

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Roles &amp; Permissions</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage system roles and their associated permissions
          </p>
        </div>
      </div>

      {/* Tab strip */}
      <div className="flex gap-1.5">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setActiveTab(value)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "roles" ? (
        <RolesTable isAdmin={isAdmin} />
      ) : (
        <PermissionsTable />
      )}
    </div>
  )
}
