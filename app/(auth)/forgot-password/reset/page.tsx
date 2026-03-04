"use client"

// Step 3 of forgot-password flow — set new password
// Reset token read from sessionStorage (set by verify page), cleared after use
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/auth/password-input'
import { authService } from '@/lib/auth/auth-service'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/schemas/auth-schemas'
import { RESET_TOKEN_SESSION_KEY } from '@/app/(auth)/forgot-password/verify/page'

/** Inner component — must be inside <Suspense> because it calls useSearchParams() */
function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Read and clear the reset token from sessionStorage on mount
  useEffect(() => {
    const token = sessionStorage.getItem(RESET_TOKEN_SESSION_KEY)
    if (!token || !email) {
      router.replace('/forgot-password')
      return
    }
    setResetToken(token)
    sessionStorage.removeItem(RESET_TOKEN_SESSION_KEY)
  }, [email, router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) })

  async function onSubmit(data: ResetPasswordFormValues) {
    if (!resetToken) return
    setIsLoading(true)
    try {
      const response = await authService.resetPassword({
        email,
        resetToken,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      if (response.success) {
        toast.success('Password reset successfully. Please sign in.')
        router.push('/login')
      } else {
        toast.error(response.message || 'Reset failed')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!resetToken) return null

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Set New Password</CardTitle>
        <CardDescription>Choose a strong password for your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <PasswordInput
            id="new-password"
            label="New Password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <PasswordInput
            id="confirm-password"
            label="Confirm Password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

/** Page export — wraps form in Suspense (required by Next.js for useSearchParams) */
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
