// In-memory token cache backed by localStorage (shared across tabs)
// Access token is opaque -- never decoded/parsed

const STORAGE_KEY_TOKEN = 'wfa_access_token'
const STORAGE_KEY_EXPIRY = 'wfa_token_expiry'

let cachedToken: string | null = null
let cachedExpiry: number | null = null

/** Returns the access token from memory, falling back to localStorage */
export function getAccessToken(): string | null {
  if (cachedToken) return cachedToken
  if (typeof window === 'undefined') return null

  const stored = localStorage.getItem(STORAGE_KEY_TOKEN)
  const expiry = localStorage.getItem(STORAGE_KEY_EXPIRY)
  if (stored && expiry) {
    cachedToken = stored
    cachedExpiry = Number(expiry)
  }
  return cachedToken
}

/** Stores the access token in memory + localStorage with computed expiry */
export function setAccessToken(token: string, expiryInMs: number): void {
  const expiresAt = Date.now() + expiryInMs
  cachedToken = token
  cachedExpiry = expiresAt

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_TOKEN, token)
    localStorage.setItem(STORAGE_KEY_EXPIRY, String(expiresAt))
  }
}

/** Clears the access token from memory and localStorage */
export function clearAccessToken(): void {
  cachedToken = null
  cachedExpiry = null

  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_TOKEN)
    localStorage.removeItem(STORAGE_KEY_EXPIRY)
  }
}

/** Returns the token expiry timestamp (unix ms) or null */
export function getTokenExpiry(): number | null {
  if (cachedExpiry) return cachedExpiry
  if (typeof window === 'undefined') return null

  const expiry = localStorage.getItem(STORAGE_KEY_EXPIRY)
  return expiry ? Number(expiry) : null
}

/** Returns true if the current token has expired */
export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry()
  if (!expiry) return true
  return Date.now() >= expiry
}
