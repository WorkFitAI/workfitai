"use client"

// Password input with show/hide toggle
import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const generatedId = useId()
    const inputId = id || generatedId

    return (
      <div className="space-y-1">
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <div className="relative">
          <Input
            {...props}
            id={inputId}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={cn('pr-10', className)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  },
)
PasswordInput.displayName = 'PasswordInput'
