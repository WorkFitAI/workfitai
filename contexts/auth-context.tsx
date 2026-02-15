"use client"

// Auth context — provides user session state and auth actions to all components
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '@/lib/auth/auth-service'
import { getAccessToken, isTokenExpired } from '@/lib/auth/token-store'
import { getSessionCookie } from '@/lib/auth/session-cookie'
import type { LoginRequest, UserSession } from '@/types/auth'

const BROADCAST_CHANNEL = 'wfa-auth-channel'
// Schedule next refresh 60s before token expiry
const REFRESH_BUFFER_MS = 60 * 1000

interface AuthContextValue {
  user: UserSession | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (data: LoginRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Cancellation flag: prevents refresh timer from setting state after logout
  const isLoggedOutRef = useRef(false)
  // Keep a stable ref to the router so timer callbacks don't stale-close over it
  const routerRef = useRef(router)
  useEffect(() => { routerRef.current = router }, [router])

  /** Schedule the next silent refresh 1 min before token expiry */
  const scheduleRefresh = useCallback((expiresAt: number) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)

    const delay = expiresAt - Date.now() - REFRESH_BUFFER_MS
    if (delay <= 0) return

    refreshTimerRef.current = setTimeout(async () => {
      // Abort if logout happened while timer was pending
      if (isLoggedOutRef.current) return

      try {
        const response = await authService.refresh()
        if (isLoggedOutRef.current) return // logout completed during async refresh

        if (response.success) {
          const { username, roles, expiryInMinutes } = response.data
          const newExpiresAt = Date.now() + expiryInMinutes * 60 * 1000
          setUser({ username, roles: roles as UserSession['roles'], expiresAt: newExpiresAt })
          scheduleRefresh(newExpiresAt)
        } else {
          setUser(null)
          routerRef.current.push('/login')
        }
      } catch {
        if (!isLoggedOutRef.current) {
          setUser(null)
          routerRef.current.push('/login')
        }
      }
    }, delay)
  }, []) // stable — uses refs for mutable values

  // On mount: restore session from token store + session cookie
  useEffect(() => {
    const restore = async () => {
      const token = getAccessToken()

      if (!token) {
        setIsLoading(false)
        return
      }

      if (isTokenExpired()) {
        // Attempt silent refresh when stored token has expired
        try {
          const response = await authService.refresh()
          if (response.success) {
            const { username, roles, expiryInMinutes } = response.data
            const expiresAt = Date.now() + expiryInMinutes * 60 * 1000
            setUser({ username, roles: roles as UserSession['roles'], expiresAt })
            scheduleRefresh(expiresAt)
          }
        } catch {
          // Refresh failed — stay unauthenticated
        }
      } else {
        // Token valid — try to restore from cookie first
        const session = getSessionCookie()
        if (session) {
          setUser(session)
          scheduleRefresh(session.expiresAt)
        } else {
          // Cookie missing (cleared by another tab, browser restart, etc.)
          // Call refresh to get user identity and a fresh session cookie
          try {
            const response = await authService.refresh()
            if (response.success) {
              const { username, roles, expiryInMinutes } = response.data
              const expiresAt = Date.now() + expiryInMinutes * 60 * 1000
              setUser({ username, roles: roles as UserSession['roles'], expiresAt })
              scheduleRefresh(expiresAt)
            }
          } catch {
            // Refresh failed — stay unauthenticated
          }
        }
      }

      setIsLoading(false)
    }

    restore()
  }, [scheduleRefresh])

  // Cross-tab logout sync via BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined') return

    let channel: BroadcastChannel
    try {
      channel = new BroadcastChannel(BROADCAST_CHANNEL)
      channel.onmessage = (event) => {
        if (event.data?.type === 'logout') {
          isLoggedOutRef.current = true
          setUser(null)
          routerRef.current.push('/login')
        }
      }
    } catch {
      // BroadcastChannel not supported in this environment
    }

    return () => {
      channel?.close()
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authService.login(data)
    if (response.success) {
      isLoggedOutRef.current = false // reset in case of re-login after logout
      const { username, roles, expiryInMinutes } = response.data
      const expiresAt = Date.now() + expiryInMinutes * 60 * 1000
      setUser({ username, roles: roles as UserSession['roles'], expiresAt })
      scheduleRefresh(expiresAt)
    }
  }, [scheduleRefresh])

  const logout = useCallback(async () => {
    isLoggedOutRef.current = true
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    await authService.logout()
    setUser(null)
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

/** Hook to access auth context — must be used inside AuthProvider */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
