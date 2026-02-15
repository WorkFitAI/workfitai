"use client"

// Step 1 of forgot-password flow — enter email to receive OTP
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>Enter your email to receive a reset code</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="fp-email">Email</Label>
            <Input id="fp-email" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Code
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary underline">
            Back to Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
