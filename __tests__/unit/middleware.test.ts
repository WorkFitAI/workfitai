import { describe, it, expect } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '@/middleware'

// Build a NextRequest with optional cookie
function makeRequest(pathname: string, cookie?: string): NextRequest {
  const url = `http://localhost:3000${pathname}`
  const req = new NextRequest(url)
  if (cookie) {
    req.cookies.set('auth_session', cookie)
  }
  return req
}

function makeSession(roles: string[], expiresAt = Date.now() + 3_600_000) {
  return encodeURIComponent(JSON.stringify({ username: 'u', roles, expiresAt }))
}

describe('middleware — route protection', () => {
  it('redirects unauthenticated user from /dashboard to /login', () => {
    const req = makeRequest('/dashboard')
    const res = middleware(req)
    expect(res?.headers.get('location')).toContain('/login')
  })

  it('redirects candidate (ROLE_USER) from /dashboard to /', () => {
    const req = makeRequest('/dashboard', makeSession(['ROLE_USER']))
    const res = middleware(req)
    expect(res?.headers.get('location')).toContain('/')
    expect(res?.headers.get('location')).not.toContain('/login')
  })

  it('allows ADMIN to access /dashboard', () => {
    const req = makeRequest('/dashboard', makeSession(['ROLE_ADMIN']))
    const res = middleware(req)
    // NextResponse.next() has no location header
    expect(res?.headers.get('location')).toBeNull()
  })

  it('allows ROLE_HR to access /dashboard', () => {
    const req = makeRequest('/dashboard', makeSession(['ROLE_HR']))
    const res = middleware(req)
    expect(res?.headers.get('location')).toBeNull()
  })

  it('treats expired session as unauthenticated', () => {
    const expired = encodeURIComponent(
      JSON.stringify({ username: 'u', roles: ['ROLE_ADMIN'], expiresAt: Date.now() - 1000 })
    )
    const req = makeRequest('/dashboard', expired)
    const res = middleware(req)
    expect(res?.headers.get('location')).toContain('/login')
  })
})

describe('middleware — admin routes (/users)', () => {
  it('redirects unauthenticated user from /users to /login', () => {
    const req = makeRequest('/users')
    const res = middleware(req)
    expect(res?.headers.get('location')).toContain('/login')
  })

  it('redirects authenticated non-admin (ROLE_HR) from /users to /dashboard', () => {
    const req = makeRequest('/users', makeSession(['ROLE_HR']))
    const res = middleware(req)
    expect(res?.headers.get('location')).toContain('/dashboard')
  })

  it('allows ROLE_ADMIN to access /users', () => {
    const req = makeRequest('/users', makeSession(['ROLE_ADMIN']))
    const res = middleware(req)
    expect(res?.headers.get('location')).toBeNull()
  })
})

describe('middleware — HRM routes (/hr-management)', () => {
  it('redirects unauthenticated user from /hr-management to /login', () => {
    const req = makeRequest('/hr-management')
    const res = middleware(req)
    expect(res?.headers.get('location')).toContain('/login')
  })

  it('redirects ROLE_HR (not HRM/Admin) from /hr-management to /dashboard', () => {
    const req = makeRequest('/hr-management', makeSession(['ROLE_HR']))
    const res = middleware(req)
    expect(res?.headers.get('location')).toContain('/dashboard')
  })

  it('allows ROLE_HR_MANAGER to access /hr-management', () => {
    const req = makeRequest('/hr-management', makeSession(['ROLE_HR_MANAGER']))
    const res = middleware(req)
    expect(res?.headers.get('location')).toBeNull()
  })

  it('allows ROLE_ADMIN to access /hr-management', () => {
    const req = makeRequest('/hr-management', makeSession(['ROLE_ADMIN']))
    const res = middleware(req)
    expect(res?.headers.get('location')).toBeNull()
  })
})

describe('middleware — candidate routes (/applied-jobs)', () => {
  it('redirects unauthenticated user from /applied-jobs to /login with callbackUrl', () => {
    const req = makeRequest('/applied-jobs')
    const res = middleware(req)
    const location = res?.headers.get('location') ?? ''
    expect(location).toContain('/login')
    expect(location).toContain('callbackUrl')
    expect(decodeURIComponent(location)).toContain('/applied-jobs')
  })

  it('allows authenticated user to access /applied-jobs', () => {
    const req = makeRequest('/applied-jobs', makeSession(['ROLE_USER']))
    const res = middleware(req)
    expect(res?.headers.get('location')).toBeNull()
  })
})

describe('middleware — auth page redirect', () => {
  it('redirects authenticated candidate from /login to /', () => {
    const req = makeRequest('/login', makeSession(['ROLE_USER']))
    const res = middleware(req)
    expect(res?.headers.get('location')).toContain('/')
  })

  it('redirects authenticated admin from /login to /dashboard', () => {
    const req = makeRequest('/login', makeSession(['ROLE_ADMIN']))
    const res = middleware(req)
    expect(res?.headers.get('location')).toContain('/dashboard')
  })

  it('allows unauthenticated user to access /login', () => {
    const req = makeRequest('/login')
    const res = middleware(req)
    expect(res?.headers.get('location')).toBeNull()
  })

  it('allows unauthenticated user to access /register', () => {
    const req = makeRequest('/register')
    const res = middleware(req)
    expect(res?.headers.get('location')).toBeNull()
  })
})
