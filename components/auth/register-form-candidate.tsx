"use client"

// Candidate registration form
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/auth/password-input'
import { authService } from '@/lib/auth/auth-service'
import { candidateRegisterSchema, type CandidateRegisterFormValues } from '@/lib/schemas/auth-schemas'

export function RegisterFormCandidate() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateRegisterFormValues>({ resolver: zodResolver(candidateRegisterSchema) })

  async function onSubmit(data: CandidateRegisterFormValues) {
    setIsLoading(true)
    try {
      const response = await authService.register({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        role: 'CANDIDATE',
      })
      if (response.success) {
        toast.success('Account created! Check your email for the OTP.')
        router.push(`/register/verify-otp?email=${encodeURIComponent(data.email)}`)
      } else {
        toast.error(response.message || 'Registration failed')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="c-fullName">Full Name</Label>
        <Input id="c-fullName" placeholder="Jane Doe" {...register('fullName')} />
        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="c-email">Email</Label>
        <Input id="c-email" type="email" placeholder="you@example.com" {...register('email')} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="c-phone">Phone Number</Label>
        <Input id="c-phone" type="tel" placeholder="+1234567890" {...register('phoneNumber')} />
        {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
      </div>

      <PasswordInput id="c-password" label="Password" error={errors.password?.message} {...register('password')} />
      <PasswordInput id="c-confirm" label="Confirm Password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>
    </form>
  )
}
