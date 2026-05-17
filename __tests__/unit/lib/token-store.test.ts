import { describe, it, expect, beforeEach, vi } from 'vitest'

// Reset module state between tests (in-memory cache)
beforeEach(() => {
  vi.resetModules()
  sessionStorage.clear()
})

describe('token-store', () => {
  it('getAccessToken returns null when nothing stored', async () => {
    const { getAccessToken } = await import('@/lib/auth/token-store')
    expect(getAccessToken()).toBeNull()
  })

  it('getAccessToken loads from sessionStorage when in-memory cache is empty', async () => {
    // Populate sessionStorage directly (simulates a page reload where memory is cleared)
    sessionStorage.setItem('wfa_access_token', 'persisted_tok')
    sessionStorage.setItem('wfa_token_expiry', String(Date.now() + 900_000))
    const { getAccessToken } = await import('@/lib/auth/token-store')
    expect(getAccessToken()).toBe('persisted_tok')
  })

  it('setAccessToken stores token in sessionStorage', async () => {
    const { setAccessToken, getAccessToken } = await import('@/lib/auth/token-store')
    setAccessToken('tok_abc', 900_000)
    expect(getAccessToken()).toBe('tok_abc')
    expect(sessionStorage.getItem('wfa_access_token')).toBe('tok_abc')
  })

  it('setAccessToken stores computed expiry', async () => {
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const { setAccessToken, getTokenExpiry } = await import('@/lib/auth/token-store')
    setAccessToken('tok_abc', 900_000)
    expect(getTokenExpiry()).toBe(now + 900_000)
    vi.restoreAllMocks()
  })

  it('isTokenExpired returns true when no token', async () => {
    const { isTokenExpired } = await import('@/lib/auth/token-store')
    expect(isTokenExpired()).toBe(true)
  })

  it('isTokenExpired returns false for fresh token', async () => {
    const { setAccessToken, isTokenExpired } = await import('@/lib/auth/token-store')
    setAccessToken('tok_abc', 900_000)
    expect(isTokenExpired()).toBe(false)
  })

  it('isTokenExpired returns true for expired token', async () => {
    const past = Date.now() - 10_000
    vi.spyOn(Date, 'now').mockReturnValue(past)
    const { setAccessToken } = await import('@/lib/auth/token-store')
    setAccessToken('tok_abc', 0) // expiry = past + 0
    vi.restoreAllMocks()
    const { isTokenExpired } = await import('@/lib/auth/token-store')
    expect(isTokenExpired()).toBe(true)
  })

  it('clearAccessToken removes token from memory and sessionStorage', async () => {
    const { setAccessToken, clearAccessToken, getAccessToken } = await import('@/lib/auth/token-store')
    setAccessToken('tok_abc', 900_000)
    clearAccessToken()
    expect(getAccessToken()).toBeNull()
    expect(sessionStorage.getItem('wfa_access_token')).toBeNull()
  })
})
