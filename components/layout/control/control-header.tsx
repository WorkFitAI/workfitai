"use client"

import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
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

// Derive a readable page title from the pathname by matching nav items or formatting the last segment
function getPageTitle(pathname: string): string {
  const match = controlNavItems.find((item) =>
    item.href !== "/" && pathname.startsWith(item.href)
  )
  if (match) return match.title
  const segment = pathname.split("/").filter(Boolean).pop() ?? "Dashboard"
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function ControlHeader() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const initials = user?.username?.charAt(0).toUpperCase() ?? "U"

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{getPageTitle(pathname)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full" aria-label="User account">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.username}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={logout}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
