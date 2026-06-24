"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, ChevronRight, Home, Search } from "lucide-react"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { controlNavItems } from "@/lib/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getDefaultRouteForRoles } from "@/lib/auth/default-route"

interface BreadcrumbSegment {
  label: string
  href: string
  isLast: boolean
}

function buildBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const segments = pathname.split("/").filter(Boolean)
  const crumbs: BreadcrumbSegment[] = []

  let accumulated = ""
  segments.forEach((seg, idx) => {
    accumulated += `/${seg}`
    // Try to resolve a friendly label from nav items
    const navMatch = controlNavItems.find((item) => item.href === accumulated)
    const label = navMatch
      ? navMatch.title
      : seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    crumbs.push({ label, href: accumulated, isLast: idx === segments.length - 1 })
  })

  return crumbs
}

export function ControlHeader() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const initials = user?.username?.charAt(0).toUpperCase() ?? "U"
  const breadcrumbs = buildBreadcrumbs(pathname)
  const homeHref = getDefaultRouteForRoles(user?.roles ?? [])

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 gap-4">
      {/* Left: Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 shrink-0 min-w-0">
        {/* Home anchor */}
        <Link
          href={homeHref}
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="Home"
        >
          <Home className="h-3.5 w-3.5" />
        </Link>

        {breadcrumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
            {crumb.isLast ? (
              <span className="text-sm font-semibold text-gray-900 truncate max-w-48">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors truncate max-w-32"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Right: Actions + Avatar */}
      <div className="flex items-center gap-1 shrink-0">
        <NotificationBell />

        {/* User avatar dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors ml-1"
              aria-label="User account"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={undefined} alt={user?.username} />
                <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-25 truncate">
                {user?.username ?? "Admin"}
              </span>
              <svg
                className="h-3.5 w-3.5 text-gray-400 hidden sm:block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold">{user?.username ?? "Admin"}</span>
                <span className="text-xs text-gray-500 truncate">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={logout}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
