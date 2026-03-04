"use client"

// OAuth callback handler — exchanges session ID for access token and redirects
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api-client'
import { setAccessToken } from '@/lib/auth/token-store'
import { setSessionCookie } from '@/lib/auth/session-cookie'
import type { LoginResponse, UserSession } from '@/types/auth'

const CONTROL_ROLES = ['ROLE_HR', 'ROLE_HR_MANAGER', 'ROLE_ADMIN']

export default function OAuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session') ?? ''

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
          const session: UserSession = {
            username,
            roles: roles as UserSession['roles'],
            expiresAt: Date.now() + expiryInMs,
          }
          setSessionCookie(session)
          const isControlUser = roles.some((r) => CONTROL_ROLES.includes(r))
          router.replace(isControlUser ? '/dashboard' : '/')
        } else {
          setError('Authentication failed. Please try again.')
        }
      } catch {
        setError('Authentication failed. Please try again.')
      }
    }

    exchangeSession()
  }, [sessionId, router])

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
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        )}
      </CardContent>
    </Card>
  )
}
