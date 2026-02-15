// In-memory token cache backed by sessionStorage
// Access token is opaque -- never decoded/parsed

const SESSION_KEY_TOKEN = 'wfa_access_token'
const SESSION_KEY_EXPIRY = 'wfa_token_expiry'

let cachedToken: string | null = null
let cachedExpiry: number | null = null

/** Returns the access token from memory, falling back to sessionStorage */
export function getAccessToken(): string | null {
  if (cachedToken) return cachedToken
  if (typeof window === 'undefined') return null

  const stored = sessionStorage.getItem(SESSION_KEY_TOKEN)
  const expiry = sessionStorage.getItem(SESSION_KEY_EXPIRY)
  if (stored && expiry) {
    cachedToken = stored
    cachedExpiry = Number(expiry)
  }
  return cachedToken
}

/** Stores the access token in memory + sessionStorage with computed expiry */
export function setAccessToken(token: string, expiryInMinutes: number): void {
  const expiresAt = Date.now() + expiryInMinutes * 60 * 1000
  cachedToken = token
  cachedExpiry = expiresAt

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY_TOKEN, token)
    sessionStorage.setItem(SESSION_KEY_EXPIRY, String(expiresAt))
  }
}

/** Clears the access token from memory and sessionStorage */
export function clearAccessToken(): void {
  cachedToken = null
  cachedExpiry = null

  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY_TOKEN)
    sessionStorage.removeItem(SESSION_KEY_EXPIRY)
  }
}

/** Returns the token expiry timestamp (unix ms) or null */
export function getTokenExpiry(): number | null {
  if (cachedExpiry) return cachedExpiry
  if (typeof window === 'undefined') return null

  const expiry = sessionStorage.getItem(SESSION_KEY_EXPIRY)
  return expiry ? Number(expiry) : null
}

/** Returns true if the current token has expired */
export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry()
  if (!expiry) return true
  return Date.now() >= expiry
}
