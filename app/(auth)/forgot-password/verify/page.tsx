"use client"

// Step 2 of forgot-password flow — verify OTP sent to email
// Reset token is stored in sessionStorage (never exposed in URL)
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OtpInput } from '@/components/auth/otp-input'
import { authService } from '@/lib/auth/auth-service'

const RESEND_COOLDOWN_SECONDS = 60
// sessionStorage key for the reset token — avoids exposing it in the URL
export const RESET_TOKEN_SESSION_KEY = 'wfa_reset_token'

export default function ForgotPasswordVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [otp, setOtp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Guard: redirect back if email is missing
  useEffect(() => {
    if (!email) router.replace('/forgot-password')
  }, [email, router])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function handleSubmit() {
    if (otp.length < 6) return toast.error('Enter the 6-digit code')
    setIsSubmitting(true)
    try {
      const response = await authService.verifyResetOtp({ email, otp })
      if (response.success) {
        // Store reset token in sessionStorage — cleared on use in reset page
        sessionStorage.setItem(RESET_TOKEN_SESSION_KEY, response.data.resetToken)
        router.push(`/forgot-password/reset?email=${encodeURIComponent(email)}`)
      } else {
        toast.error(response.message || 'Invalid OTP')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResend() {
    try {
      await authService.forgotPassword({ email })
      toast.success('Reset code resent to your email')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend')
    }
  }

  if (!email) return null

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Enter Reset Code</CardTitle>
        <CardDescription>
          Enter the code sent to <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <OtpInput value={otp} onChange={setOtp} disabled={isSubmitting} />

        <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting || otp.length < 6}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify Code
        </Button>

        <Button variant="ghost" className="text-sm" onClick={handleResend} disabled={cooldown > 0}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
        </Button>
      </CardContent>
    </Card>
  )
}
