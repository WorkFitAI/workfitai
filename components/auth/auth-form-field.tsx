"use client"

// Reusable labeled input for auth forms: left icon + Input + error message,
// wrapped as a framer-motion item so it participates in staggered entrance.
// Forwards the ref so it works with react-hook-form's register().
import { forwardRef } from "react"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fadeSlideUp } from "@/components/auth/motion/auth-motion-variants"
import { cn } from "@/lib/utils"

interface AuthFormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  icon?: LucideIcon
  error?: string
  /** Optional element rendered at the right edge (e.g. a validity check). */
  adornment?: React.ReactNode
}

export const AuthFormField = forwardRef<HTMLInputElement, AuthFormFieldProps>(
  ({ id, label, icon: Icon, error, adornment, className, ...inputProps }, ref) => {
    return (
      <motion.div variants={fadeSlideUp} className="space-y-1">
        <Label htmlFor={id}>{label}</Label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            id={id}
            ref={ref}
            className={cn(
              "h-12 rounded-lg focus-visible:ring-primary",
              Icon && "pl-10",
              adornment && "pr-10",
              className,
            )}
            {...inputProps}
          />
          {adornment && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {adornment}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </motion.div>
    )
  },
)
AuthFormField.displayName = "AuthFormField"
