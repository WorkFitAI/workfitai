// Manages the non-HttpOnly `auth_session` cookie for Next.js middleware auth checks
import type { UserSession } from '@/types/auth'

const COOKIE_NAME = 'auth_session'

/** Sets the auth_session cookie readable by middleware and JS */
export function setSessionCookie(session: UserSession): void {
  const maxAge = Math.floor((session.expiresAt - Date.now()) / 1000)
  const value = encodeURIComponent(JSON.stringify(session))
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`
}

/** Clears the auth_session cookie */
export function clearSessionCookie(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
}

/** Reads and parses the auth_session cookie, returns null if missing or invalid */
export function getSessionCookie(): UserSession | null {
  if (typeof document === 'undefined') return null

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${COOKIE_NAME}=`))

  if (!match) return null

  try {
    const raw = decodeURIComponent(match.split('=').slice(1).join('='))
    return JSON.parse(raw) as UserSession
  } catch {
    return null
  }
}
