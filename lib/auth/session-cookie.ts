// Manages the non-HttpOnly `auth_session` cookie for Next.js middleware auth checks.
// Domain is configured via NEXT_PUBLIC_COOKIE_DOMAIN (e.g. ".workfitai.uk" in production,
// empty in dev so cookies scope to localhost only).
import type { UserSession } from '@/types/auth'

const COOKIE_NAME = 'auth_session'

function buildCookieAttrs(maxAge: number): string {
  const isHttps = typeof location !== 'undefined' && location.protocol === 'https:'
  const secure = isHttps ? '; Secure' : ''
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN
  const domain = cookieDomain ? `; Domain=${cookieDomain}` : ''
  return `path=/; max-age=${maxAge}; SameSite=Lax${domain}${secure}`
}

/** Sets the auth_session cookie readable by middleware and JS */
export function setSessionCookie(session: UserSession): void {
  const maxAge = Math.floor((session.expiresAt - Date.now()) / 1000)
  const value = encodeURIComponent(JSON.stringify(session))
  document.cookie = `${COOKIE_NAME}=${value}; ${buildCookieAttrs(maxAge)}`
}

/** Clears the auth_session cookie — must use same Domain as setSessionCookie */
export function clearSessionCookie(): void {
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN
  const domain = cookieDomain ? `; Domain=${cookieDomain}` : ''
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax${domain}`
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
