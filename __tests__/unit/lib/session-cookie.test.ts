import { describe, it, expect, beforeEach } from 'vitest'
import { setSessionCookie, getSessionCookie, clearSessionCookie } from '@/lib/auth/session-cookie'
import type { UserSession } from '@/types/auth'

const makeSession = (offsetMs = 3_600_000): UserSession => ({
  username: 'testuser',
  roles: ['ROLE_USER'] as UserSession['roles'],
  expiresAt: Date.now() + offsetMs,
})

beforeEach(() => {
  // Clear all cookies
  document.cookie.split(';').forEach((c) => {
    document.cookie = c.trim().split('=')[0] + '=; max-age=0; path=/'
  })
})

describe('session-cookie', () => {
  it('getSessionCookie returns null when no cookie set', () => {
    expect(getSessionCookie()).toBeNull()
  })

  it('setSessionCookie + getSessionCookie round-trip preserves session', () => {
    const session = makeSession()
    setSessionCookie(session)
    const result = getSessionCookie()
    expect(result).not.toBeNull()
    expect(result!.username).toBe('testuser')
    expect(result!.roles).toEqual(['ROLE_USER'])
    expect(result!.expiresAt).toBe(session.expiresAt)
  })

  it('clearSessionCookie removes the cookie', () => {
    const session = makeSession()
    setSessionCookie(session)
    clearSessionCookie()
    expect(getSessionCookie()).toBeNull()
  })

  it('getSessionCookie returns null for malformed cookie', () => {
    document.cookie = 'auth_session=not-valid-json; path=/'
    expect(getSessionCookie()).toBeNull()
  })

  it('setSessionCookie serializes multi-role sessions correctly', () => {
    const session: UserSession = {
      username: 'admin',
      roles: ['ROLE_ADMIN', 'ROLE_HR'] as UserSession['roles'],
      expiresAt: Date.now() + 3_600_000,
    }
    setSessionCookie(session)
    const result = getSessionCookie()
    expect(result!.roles).toContain('ROLE_ADMIN')
    expect(result!.roles).toContain('ROLE_HR')
  })
})
