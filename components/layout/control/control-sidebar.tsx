"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { PanelLeftClose, PanelLeftOpen, ShieldCheck, UserCog, User, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { controlNavItems } from "@/lib/navigation"
import { useAuth } from "@/contexts/auth-context"
import type { UserRole } from "@/types/auth"

// Map the highest-priority role to badge data
function getRoleBadge(
  roles: UserRole[]
): { abbr: string; label: string; icon: LucideIcon; abbrClasses: string; pillClasses: string } | null {
  if (roles.includes("ROLE_ADMIN"))
    return {
      abbr: "AD",
      label: "Admin",
      icon: ShieldCheck,
      abbrClasses: "bg-red-600 text-white",
      pillClasses: "bg-red-50 text-red-700 ring-red-200",
    }
  if (roles.includes("ROLE_HR_MANAGER"))
    return {
      abbr: "HRM",
      label: "HR Manager",
      icon: UserCog,
      abbrClasses: "bg-orange-500 text-white",
      pillClasses: "bg-orange-50 text-orange-700 ring-orange-200",
    }
  if (roles.includes("ROLE_HR"))
    return {
      abbr: "HR",
      label: "HR",
      icon: User,
      abbrClasses: "bg-green-600 text-white",
      pillClasses: "bg-green-50 text-green-700 ring-green-200",
    }
  return null
}

interface ControlSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export function ControlSidebar({ isCollapsed, onToggle }: ControlSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const roleBadge = user?.roles ? getRoleBadge(user.roles) : null

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-gray-200 bg-white transition-all duration-300 shadow-sm",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-gray-200 px-4 gap-3">
        {/* Favicon logo mark */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/favicon.ico"
            alt="WorkfitAI logo"
            className="h-8 w-8 object-contain"
          />
        </div>
        {!isCollapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl font-bold text-gray-900 tracking-tight">WorkfitAI</span>
            {roleBadge && (
              <span
                className={cn(
                  "inline-flex items-center rounded-sm text-[10px] font-semibold ring-1 ring-inset shrink-0",
                  roleBadge.pillClasses
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-lg px-1.5 py-0 text-[10px] font-bold leading-4 tracking-tight",
                    roleBadge.abbrClasses
                  )}
                >
                  <roleBadge.icon className="h-3.5 w-3.5 shrink-0 py-0.5" />
                  {roleBadge.abbr}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-0.5 p-3">
        {controlNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.title : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isCollapsed && "justify-center px-2",
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              {Icon && <Icon className="h-4.5 w-4.5 shrink-0" />}
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={onToggle}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex w-full items-center rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-150",
            isCollapsed && "justify-center px-2"
          )}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4.5 w-4.5" />
          ) : (
            <>
              <PanelLeftClose className="h-4.5 w-4.5 mr-3" />
              Collapse
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
