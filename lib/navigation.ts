import { Home, Briefcase, LayoutDashboard, Users2, Settings, FileText, ClipboardList, UserCog, ShieldCheck, ClipboardCheck, type LucideIcon } from "lucide-react"
import type { UserRole } from "@/types/auth"

export interface NavItem {
  title: string
  href: string
  icon?: LucideIcon
  /** Roles allowed to see this item. Undefined = visible to all control users. */
  roles?: UserRole[]
}

export const candidateNavItems: NavItem[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "Jobs List", href: "/jobs", icon: Briefcase },
  { title: "My Applications", href: "/applied-jobs", icon: FileText },
  { title: "My CVs", href: "/my-cvs", icon: FileText },
]

export const authNavItems = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
} as const

export const controlNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Users", href: "/users", icon: Users2, roles: ["ROLE_ADMIN"] },
  { title: "Job Posts", href: "/job-posts", icon: FileText, roles: ["ROLE_ADMIN", "ROLE_HR_MANAGER", "ROLE_HR"] },
  { title: "Applications", href: "/applications", icon: ClipboardList, roles: ["ROLE_ADMIN", "ROLE_HR_MANAGER", "ROLE_HR"] },
  { title: "HR Management", href: "/hr-management", icon: UserCog, roles: ["ROLE_ADMIN", "ROLE_HR_MANAGER"] },
  { title: "Roles & Permissions", href: "/roles-permissions", icon: ShieldCheck, roles: ["ROLE_ADMIN", "ROLE_HR_MANAGER"] },
  { title: "Audit Logs", href: "/audit-logs", icon: ClipboardCheck, roles: ["ROLE_ADMIN"] },
  { title: "Settings", href: "/settings", icon: Settings },
]
