"use client"

// OTP verification page after registration
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OtpInput } from '@/components/auth/otp-input'
import { authService } from '@/lib/auth/auth-service'

const RESEND_COOLDOWN_SECONDS = 60

export default function VerifyOtpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [otp, setOtp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Guard: redirect back if email param is missing
  useEffect(() => {
    if (!email) router.replace('/register')
  }, [email, router])

  // Tick down resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  if (!email) return null

  async function handleSubmit() {
    if (otp.length < 6) return toast.error('Enter the 6-digit OTP')
    setIsSubmitting(true)
    try {
      const response = await authService.verifyOtp({ email, otp })
      if (response.success) {
        toast.success('Email verified! You can now sign in.')
        router.push('/login')
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
      await authService.resendOtp(email)
      toast.success('OTP resent to your email')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to resend OTP')
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Verify Your Email</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <OtpInput value={otp} onChange={setOtp} disabled={isSubmitting} />

        <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting || otp.length < 6}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify
        </Button>

        <Button
          variant="ghost"
          className="text-sm"
          onClick={handleResend}
          disabled={cooldown > 0}
        >
          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
        </Button>
      </CardContent>
    </Card>
  )
}
