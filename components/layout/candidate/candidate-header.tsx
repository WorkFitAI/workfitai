"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { candidateNavItems } from "@/lib/navigation"
import { useAuth } from "@/contexts/auth-context"

/** Guest auth buttons — shown when user is not signed in */
function GuestButtons() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild className="text-sm">
        <Link href="/login">Sign In</Link>
      </Button>
      <Button asChild className="text-sm">
        <Link href="/register">Sign Up</Link>
      </Button>
    </div>
  )
}

/** Logged-in avatar dropdown — shown when user is authenticated */
function UserDropdown() {
  const { user, logout } = useAuth()
  const initials = user?.username?.charAt(0).toUpperCase() ?? "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{user?.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={logout}>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function CandidateHeader() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary">
          WorkfitAI
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {candidateNavItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn(
                "text-sm font-medium",
                (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)))
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Link href={item.href}>{item.title}</Link>
            </Button>
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
                  <Button
                    asChild
                    variant="ghost"
                    className={cn(
                      "justify-start text-sm font-medium",
                      (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)))
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Link href={item.href}>{item.title}</Link>
                  </Button>
                </SheetClose>
              ))}
            </nav>

            {/* Mobile auth section at bottom */}
            <div className="mt-auto border-t border-border pt-4">
              {isAuthenticated ? (
                <UserDropdown />
              ) : (
                <div className="flex flex-col gap-2">
                  <Button variant="ghost" asChild className="justify-start">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="justify-start">
                    <Link href="/register">Sign Up</Link>
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
