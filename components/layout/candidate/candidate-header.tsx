"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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

// UI stub: toggle to true to preview logged-in state
const IS_LOGGED_IN_STUB = false

// Stub user data for logged-in preview
const stubUser = { name: "Jane Doe", avatarUrl: "", initials: "JD" }

/** Guest auth buttons — shown when user is not signed in */
function GuestButtons() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild className="text-sm">
        <Link href="/sign-in">Sign In</Link>
      </Button>
      <Button asChild className="text-sm">
        <Link href="/sign-up">Sign Up</Link>
      </Button>
    </div>
  )
}

/** Logged-in avatar dropdown — shown when user is authenticated */
function UserDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={stubUser.avatarUrl} alt={stubUser.name} />
            <AvatarFallback>{stubUser.initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{stubUser.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">Sign Out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function CandidateHeader() {
  const pathname = usePathname()

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
                pathname === item.href
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
          {IS_LOGGED_IN_STUB ? <UserDropdown /> : <GuestButtons />}
        </div>

        {/* Mobile hamburger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex w-64 flex-col">
            <nav className="mt-8 flex flex-col gap-2">
              {candidateNavItems.map((item) => (
                <Button
                  key={item.href}
                  asChild
                  variant="ghost"
                  className={cn(
                    "justify-start text-sm font-medium",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Link href={item.href}>{item.title}</Link>
                </Button>
              ))}
            </nav>

            {/* Mobile auth section at bottom */}
            <div className="mt-auto border-t border-border pt-4">
              {IS_LOGGED_IN_STUB ? (
                <div className="flex items-center gap-3 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{stubUser.initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{stubUser.name}</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button variant="ghost" asChild className="justify-start">
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button asChild className="justify-start">
                    <Link href="/sign-up">Sign Up</Link>
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
