"use client"

// Login form with email/username + password, validation, and error handling
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { PasswordInput } from '@/components/auth/password-input'
import { useAuth } from '@/contexts/auth-context'
import { loginSchema, type LoginFormValues } from '@/lib/schemas/auth-schemas'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9085'

export function LoginForm() {
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    try {
      await login(data)
      toast.success('Signed in successfully')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="usernameOrEmail">Username or Email</Label>
        <Input
          id="usernameOrEmail"
          placeholder="you@example.com"
          autoComplete="username"
          {...register('usernameOrEmail')}
        />
        {errors.usernameOrEmail && (
          <p className="text-sm text-destructive">{errors.usernameOrEmail.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-xs text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>

      <div className="relative my-2">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          or
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => { window.location.href = `${API_BASE}/auth/oauth2/google` }}
        >
          Continue with Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => { window.location.href = `${API_BASE}/auth/oauth2/github` }}
        >
          Continue with GitHub
        </Button>
      </div>
    </form>
  )
}
