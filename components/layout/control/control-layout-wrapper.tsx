"use client"

import { useState } from "react"
import { ControlSidebar } from "./control-sidebar"
import { ControlHeader } from "./control-header"

export function ControlLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen">
      <ControlSidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      <div className="flex flex-1 flex-col">
        <ControlHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
