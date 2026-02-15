import { Home, Briefcase, LayoutDashboard, Users, Settings, FileText, type LucideIcon } from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon?: LucideIcon
}

export const candidateNavItems: NavItem[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "Jobs", href: "/jobs", icon: Briefcase },
]

export const authNavItems = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
} as const

export const controlNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Candidates", href: "/candidates", icon: Users },
  { title: "Job Posts", href: "/job-posts", icon: FileText },
  { title: "Settings", href: "/settings", icon: Settings },
]
