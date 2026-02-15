// Base fetch wrapper with 401 refresh interceptor and concurrent refresh deduplication
import { getAccessToken, setAccessToken, clearAccessToken } from '@/lib/auth/token-store'
import { getDeviceId } from '@/lib/auth/device-fingerprint'
import { setSessionCookie } from '@/lib/auth/session-cookie'
import type { UserSession } from '@/types/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9085'

/** Error for non-2xx API responses */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/** Error for 401s after a failed refresh attempt */
export class AuthError extends ApiError {
  constructor(message = 'Session expired', status = 401) {
    super(message, status)
    this.name = 'AuthError'
  }
}

// Deduplication lock: one refresh at a time
let refreshPromise: Promise<boolean> | null = null

/** Attempts a silent token refresh; deduplicates concurrent calls */
async function attemptRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const deviceId = getDeviceId()
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'X-Device-Id': deviceId },
      })
      if (!response.ok) {
        clearAccessToken()
        return false
      }
      const json = await response.json()
      const { accessToken, expiryInMinutes, username, roles } = json.data
      setAccessToken(accessToken, expiryInMinutes)
      // Keep auth_session cookie in sync so middleware reflects the refreshed session
      if (username && roles) {
        const session: UserSession = {
          username,
          roles: roles as UserSession['roles'],
          expiresAt: Date.now() + expiryInMinutes * 60 * 1000,
        }
        setSessionCookie(session)
      }
      return true
    } catch {
      clearAccessToken()
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

/** Core fetch with auth headers, credentials, and 401 → refresh → retry */
async function fetchWithAuth<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  const deviceId = getDeviceId()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Device-Id': deviceId,
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  // Silent refresh on 401
  if (response.status === 401 && token) {
    const refreshed = await attemptRefresh()
    if (refreshed) {
      return fetchWithAuth<T>(path, options)
    }
    throw new AuthError()
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new ApiError(error.message || 'Request failed', response.status, error)
  }

  return response.json() as Promise<T>
}

export const apiClient = {
  get<T>(path: string, options?: RequestInit): Promise<T> {
    return fetchWithAuth<T>(path, { ...options, method: 'GET' })
  },
  post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return fetchWithAuth<T>(path, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  },
  put<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return fetchWithAuth<T>(path, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  },
  delete<T>(path: string, options?: RequestInit): Promise<T> {
    return fetchWithAuth<T>(path, { ...options, method: 'DELETE' })
  },
}
