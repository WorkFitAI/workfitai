"use client"

// Step 1 of forgot-password flow — enter email to receive OTP
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthPageIllustration } from '@/components/auth/auth-page-illustration'
import { authService } from '@/lib/auth/auth-service'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/schemas/auth-schemas'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) })

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsLoading(true)
    try {
      const response = await authService.forgotPassword(data)
      if (response.success) {
        toast.success('OTP sent to your email')
        router.push(`/forgot-password/verify?email=${encodeURIComponent(data.email)}`)
      } else {
        toast.error(response.message || 'Request failed')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-16">
      <AuthPageIllustration />
      <div className="relative mx-auto max-w-lg">
        <p className="mb-2 text-center text-sm font-semibold text-primary">Forgot Password?</p>
        <h1 className="mb-1 text-center text-3xl font-bold text-foreground">Reset your password.</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Enter your email and instructions will be sent to you!
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="fp-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="fp-email"
                type="email"
                placeholder="Email address"
                className="h-12 rounded-lg pl-10"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-lg bg-primary text-base text-white hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Password Reset Link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="text-foreground underline">
            Back to login page
          </Link>
        </p>
      </div>
    </div>
  )
}
