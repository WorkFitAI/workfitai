"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Box, ChevronDown, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { candidateNavItems } from "@/lib/navigation"
import { useAuth } from "@/contexts/auth-context"

/** Guest auth buttons — Register text link + filled Sign In button */
function GuestButtons() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/register"
        className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary"
      >
        <User className="h-4 w-4" />
        Register
      </Link>
      <Button asChild size="sm" className="gap-1 bg-primary text-white hover:bg-primary/90">
        <Link href="/login">
          <User className="h-4 w-4" />
          Sign In
        </Link>
      </Button>
    </div>
  )
}

/** Logged-in avatar dropdown — avatar + name + chevron */
function UserDropdown() {
  const { user, logout } = useAuth()
  const initials = user?.username?.charAt(0).toUpperCase() ?? "U"
  const firstName = user?.username?.split(" ")[0] ?? "User"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full outline-none">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-white">{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium md:block">Hi, {firstName}...</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
        <DropdownMenuItem asChild>
          <Link href="/saved-jobs">Saved Jobs</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/applied-jobs">Applied Jobs</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account-settings">Account Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={logout}>
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function CandidateHeader() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <Box className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">WorkfitAI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 md:flex">
          {candidateNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-0.5 text-sm font-medium transition-colors",
                pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                  ? "font-semibold text-primary"
                  : "text-foreground/80 hover:text-primary"
              )}
            >
              {item.title}
              <ChevronDown className="ml-0.5 inline h-3 w-3" />
            </Link>
          ))}
        </nav>

        {/* Desktop account section */}
        <div className="hidden md:flex">
          {isAuthenticated ? <UserDropdown /> : <GuestButtons />}
        </div>

        {/* Mobile hamburger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex w-64 flex-col">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <nav className="mt-8 flex flex-col gap-2">
              {candidateNavItems.map((item) => (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                        ? "font-semibold text-primary"
                        : "text-foreground/80 hover:text-primary"
                    )}
                  >
                    {item.title}
                  </Link>
                </SheetClose>
              ))}
            </nav>

            {/* Mobile auth section at bottom */}
            <div className="mt-auto border-t border-border pt-4">
              {isAuthenticated ? (
                <UserDropdown />
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/register" className="text-sm font-medium text-foreground hover:text-primary">
                    Register
                  </Link>
                  <Button asChild size="sm" className="gap-1 bg-primary text-white">
                    <Link href="/login">
                      <User className="h-4 w-4" />
                      Sign In
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
