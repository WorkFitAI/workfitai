// Next.js Edge middleware for route protection based on auth_session cookie
import { NextRequest, NextResponse } from 'next/server'
import { getDefaultRouteForRoles } from '@/lib/auth/default-route'

// Routes accessible to any control role (HR, HRM, Admin)
const CONTROL_ROUTES = ['/dashboard', '/job-posts', '/settings', '/applications']
// Routes restricted to HR Manager and Admin only
const HRM_ROUTES = ['/hr-management', '/audit-logs']
// Routes restricted to Admin only
const ADMIN_ROUTES = ['/users', '/roles-permissions']
// Routes that require any authenticated user
const CANDIDATE_ROUTES = ['/applied-jobs', '/my-cvs', '/account-settings']
// Candidate-only feature routes — control roles (HR/HRM/Admin) get sent to their own area instead
const CANDIDATE_ONLY_ROUTES = ['/applied-jobs', '/my-cvs']
// Auth pages that authenticated users should be redirected away from
const AUTH_ROUTES = ['/login', '/register', '/forgot-password']
// Roles that can access any control route
const CONTROL_ROLES = ['ROLE_HR', 'ROLE_HR_MANAGER', 'ROLE_ADMIN']

interface SessionPayload {
  username: string
  roles: string[]
  expiresAt: number
}

function parseSession(request: NextRequest): SessionPayload | null {
  const cookie = request.cookies.get('auth_session')
  if (!cookie?.value) return null

  try {
    const decoded = decodeURIComponent(cookie.value)
    const session = JSON.parse(decoded) as SessionPayload
    // Treat expired sessions as unauthenticated
    if (session.expiresAt < Date.now()) return null
    return session
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = parseSession(request)
  const isAuthenticated = session !== null
  const roles = session?.roles ?? []

  // Admin-only routes
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) return NextResponse.redirect(new URL('/login', request.url))
    if (!roles.includes('ROLE_ADMIN')) return NextResponse.redirect(new URL(getDefaultRouteForRoles(roles), request.url))
  }

  // HR Manager + Admin routes
  if (HRM_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) return NextResponse.redirect(new URL('/login', request.url))
    const allowed = roles.includes('ROLE_ADMIN') || roles.includes('ROLE_HR_MANAGER')
    if (!allowed) return NextResponse.redirect(new URL(getDefaultRouteForRoles(roles), request.url))
  }

  // Dashboard is unavailable to plain HR — they land on their assigned applications instead
  if (pathname.startsWith('/dashboard') && isAuthenticated) {
    const hasControlRole = roles.some((r) => CONTROL_ROLES.includes(r))
    if (hasControlRole) {
      const dest = getDefaultRouteForRoles(roles)
      if (dest !== '/dashboard') return NextResponse.redirect(new URL(dest, request.url))
    }
  }

  // General control routes (any HR/HRM/Admin)
  if (CONTROL_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) return NextResponse.redirect(new URL('/login', request.url))
    const hasControlRole = roles.some((r) => CONTROL_ROLES.includes(r))
    if (!hasControlRole) return NextResponse.redirect(new URL('/', request.url))
  }

  // Protect candidate-only routes (any authenticated user; control roles get sent to their own area)
  if (CANDIDATE_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    const hasControlRole = roles.some((r) => CONTROL_ROLES.includes(r))
    if (hasControlRole && CANDIDATE_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL(getDefaultRouteForRoles(roles), request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(getDefaultRouteForRoles(roles), request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/users',
    '/users/:path*',
    '/audit-logs',
    '/audit-logs/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/job-posts',
    '/job-posts/:path*',
    '/settings',
    '/settings/:path*',
    '/applied-jobs',
    '/applied-jobs/:path*',
    '/my-cvs',
    '/my-cvs/:path*',
    '/account-settings',
    '/account-settings/:path*',
    '/login',
    '/register',
    '/register/:path*',
    '/forgot-password',
    '/forgot-password/:path*',
    '/applications',
    '/applications/:path*',
    '/hr-management',
    '/hr-management/:path*',
    '/roles-permissions',
    '/roles-permissions/:path*',
  ],
}
