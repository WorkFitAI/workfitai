"use client"

import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { controlNavItems } from "@/lib/navigation"

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

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{getPageTitle(pathname)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Avatar className="h-8 w-8" aria-label="User account">
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </header>
  )
}
