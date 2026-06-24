"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { ChevronDown, Menu, User } from "lucide-react"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { userService } from "@/lib/user/user-service"

function visibleNavItems(roles: string[] | undefined) {
  return candidateNavItems.filter(
    (item) => !item.hideForRoles || !item.hideForRoles.some((r) => roles?.includes(r))
  )
}

/** Guest auth buttons — Register text link + filled Sign In button */
function GuestButtons({ scrolled }: { scrolled: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/register"
        className={cn(
          "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
          scrolled ? "text-foreground" : "text-foreground/80"
        )}
      >
        Register
      </Link>
      <Button asChild size="sm" className="gap-1 bg-primary text-white hover:bg-primary/90">
        <Link href="/login">
          Sign in
        </Link>
      </Button>
    </div>
  )
}

/** Logged-in avatar dropdown */
function UserDropdown() {
  const { user, logout } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const initials = user?.username?.charAt(0).toUpperCase() ?? "U"
  const firstName = user?.username?.split(" ")[0] ?? "User"
  const roles = user?.roles ?? []
  const isAdminOrHrm = roles.includes("ROLE_ADMIN") || roles.includes("ROLE_HR_MANAGER")
  const isHr = roles.includes("ROLE_HR") && !isAdminOrHrm

  useEffect(() => {
    if (!user) return
    userService.getAvatar()
      .then((res) => setAvatarUrl(res.data?.avatarUrl ?? null))
      .catch(() => {})
  }, [user])

  return (
    <div className="flex items-center gap-2">
      <NotificationBell />
      {/* Avatar → direct link to account settings */}
      <Link href="/account-settings" className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <Avatar className="h-8 w-8">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={user?.username ?? "avatar"} />}
          <AvatarFallback className="bg-primary text-white text-xs">{initials}</AvatarFallback>
        </Avatar>
      </Link>

      {/* Name + chevron → dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1 rounded-md px-1 outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span className="hidden text-sm font-medium md:block">{firstName}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg">
          <DropdownMenuItem asChild>
            <Link href="/account-settings">Account Settings</Link>
          </DropdownMenuItem>
          {isAdminOrHrm && (
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </DropdownMenuItem>
          )}
          {isHr && (
            <DropdownMenuItem asChild>
              <Link href="/applications/my">Back to Applications</Link>
            </DropdownMenuItem>
          )}
          {!isAdminOrHrm && !isHr && (
            <DropdownMenuItem asChild>
              <Link href="/applied-jobs">Applied Jobs</Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={logout}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function CandidateHeader() {
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const navItems = visibleNavItems(user?.roles)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isHome = pathname === "/"

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        // At top on homepage: fully transparent, no border
        // Scrolled or not on homepage: solid white with shadow
        scrolled || !isHome
          ? "border-b border-border bg-white shadow-sm"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/imgs/template/workfitai.png"
            alt="WorkfitAI logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
          <span className="text-xl font-bold text-[#1a2140]">WorkfitAI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "font-semibold text-primary" : "text-foreground/80"
                )}
              >
                {item.title}
              </Link>
            )
          })}
        </nav>

        {/* Desktop account section */}
        <div className="hidden md:flex">
          {isAuthenticated ? <UserDropdown /> : <GuestButtons scrolled={scrolled} />}
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
              {navItems.map((item) => (
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
            <div className="mt-auto border-t border-border pt-4">
              {isAuthenticated ? (
                <UserDropdown />
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/register" className="text-sm font-medium text-foreground hover:text-primary">
                    Register
                  </Link>
                  <Button asChild size="sm" className="bg-primary text-white">
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
