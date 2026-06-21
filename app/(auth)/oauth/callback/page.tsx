"use client"

// OAuth callback handler — exchanges session ID for access token and redirects
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LottieLoader } from '@/components/ui/lottie-loader'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api-client'
import { setAccessToken } from '@/lib/auth/token-store'
import { setSessionCookie } from '@/lib/auth/session-cookie'
import { useAuth } from '@/contexts/auth-context'
import type { LoginResponse, UserSession } from '@/types/auth'

const CONTROL_ROLES = ['ROLE_HR', 'ROLE_HR_MANAGER', 'ROLE_ADMIN']

/** Inner component — must be inside <Suspense> because it calls useSearchParams() */
function OAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session') ?? ''
  const { loginWithSession } = useAuth()

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('Missing session ID. Please try signing in again.')
      return
    }

    async function exchangeSession() {
      try {
        const response = await apiClient.get<LoginResponse>(
          `/auth/oauth/exchange?session=${encodeURIComponent(sessionId)}`,
        )
        if (response.data?.accessToken) {
          const { accessToken, expiryInMs, username, roles } = response.data
          setAccessToken(accessToken, expiryInMs)
          const normalizedRoles = (roles as string[]).map((r) =>
            r.startsWith('ROLE_') ? r : `ROLE_${r}`,
          ) as UserSession['roles']
          const session: UserSession = {
            username,
            roles: normalizedRoles,
            expiresAt: Date.now() + expiryInMs,
          }
          setSessionCookie(session)
          // Sync auth state into React/Redux context without a page reload
          loginWithSession(session)
          const isControlUser = normalizedRoles.some((r) => CONTROL_ROLES.includes(r))
          router.replace(isControlUser ? '/dashboard' : '/')
        } else {
          setError('Authentication failed. Please try again.')
        }
      } catch {
        setError('Authentication failed. Please try again.')
      }
    }

    exchangeSession()
  }, [sessionId, router, loginWithSession])

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">
          {error ? 'Authentication Failed' : 'Signing you in…'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {error ? (
          <>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button asChild variant="outline">
              <Link href="/login">Back to Sign In</Link>
            </Button>
          </>
        ) : (
          <LottieLoader size={110} />
        )}
      </CardContent>
    </Card>
  )
}

/** Page export — wraps content in Suspense (required by Next.js for useSearchParams) */
export default function OAuthCallbackPage() {
  return (
    <Suspense>
      <OAuthCallbackContent />
    </Suspense>
  )
}
