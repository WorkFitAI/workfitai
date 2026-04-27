// Next.js Edge middleware for route protection based on auth_session cookie
import { NextRequest, NextResponse } from 'next/server'

// Routes requiring HR/Admin roles
const CONTROL_ROUTES = ['/dashboard', '/candidates', '/job-posts', '/settings']
// Routes that require any authenticated user (CANDIDATE)
const CANDIDATE_ROUTES = ['/applied-jobs', '/saved-jobs', '/my-cvs', '/account-settings']
// Auth pages that authenticated users should be redirected away from
const AUTH_ROUTES = ['/login', '/register', '/forgot-password']
// Roles that can access control (HR) routes
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

  // Protect control (HR/Admin) routes
  if (CONTROL_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const hasControlRole = session!.roles.some((r) => CONTROL_ROLES.includes(r))
    if (!hasControlRole) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protect candidate-only routes (any authenticated user)
  if (CANDIDATE_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect authenticated users away from auth pages
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    if (isAuthenticated) {
      const isControlUser = session!.roles.some((r) => CONTROL_ROLES.includes(r))
      const dest = isControlUser ? '/dashboard' : '/'
      return NextResponse.redirect(new URL(dest, request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/candidates/:path*',
    '/job-posts/:path*',
    '/settings/:path*',
    '/applied-jobs/:path*',
    '/saved-jobs/:path*',
    '/my-cvs/:path*',
    '/account-settings/:path*',
    '/login',
    '/register',
    '/register/:path*',
    '/forgot-password',
    '/forgot-password/:path*',
  ],
}
