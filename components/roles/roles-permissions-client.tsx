"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RolesTable } from "@/components/roles/roles-table"
import { PermissionsTable } from "@/components/roles/permissions-table"

interface RolesPermissionsClientProps {
  isAdmin: boolean
}

export function RolesPermissionsClient({ isAdmin }: RolesPermissionsClientProps) {
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles")

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Roles &amp; Permissions
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage system roles and their associated permissions
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "roles" | "permissions")}
      >
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-4">
          <RolesTable isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          <PermissionsTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
