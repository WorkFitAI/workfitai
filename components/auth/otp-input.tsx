"use client"

// Six-box OTP input with auto-advance, backspace, paste, active/filled styling,
// an error shake, and an onComplete callback fired when all slots are filled.
import { useEffect, useRef, useState, KeyboardEvent, ClipboardEvent } from 'react'
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  /** Fired once when the value reaches `length` digits (e.g. auto-submit). */
  onComplete?: (value: string) => void
  /** When true, the boxes shake to signal an invalid code. */
  error?: boolean
  disabled?: boolean
  className?: string
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  error,
  disabled,
  className,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const controls = useAnimationControls()
  const reduced = useReducedMotion() ?? false

  // Convert the flat string value into individual digit slots
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  // Replay the shake whenever the parent flags an error.
  useEffect(() => {
    if (error && !reduced) {
      controls.start({
        x: [0, -8, 8, -6, 6, 0],
        transition: { duration: 0.4 },
      })
    }
  }, [error, reduced, controls])

  function focusAt(index: number) {
    inputRefs.current[index]?.focus()
  }

  function commit(next: string) {
    onChange(next)
    // All slots hold a single digit, so reaching `length` means complete.
    if (next.length === length && onComplete) {
      onComplete(next)
    }
  }

  function handleChange(index: number, char: string) {
    const digit = char.replace(/\D/g, '').slice(-1)
    const next = digits.map((d, i) => (i === index ? digit : d)).join('')
    commit(next)
    if (digit && index < length - 1) focusAt(index + 1)
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = digits.map((d, i) => (i === index ? '' : d)).join('')
        onChange(next)
      } else if (index > 0) {
        const next = digits.map((d, i) => (i === index - 1 ? '' : d)).join('')
        onChange(next)
        focusAt(index - 1)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusAt(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusAt(index + 1)
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    const next = Array.from({ length }, (_, i) => pasted[i] ?? '').join('')
    commit(next)
    const lastFilled = Math.min(pasted.length, length - 1)
    focusAt(lastFilled)
  }

  return (
    <motion.div className={cn('flex gap-2', className)} animate={controls}>
      {digits.map((digit, index) => {
        const isFilled = Boolean(digit)
        const isActive = focusedIndex === index
        return (
          <Input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => {
              setFocusedIndex(index)
              e.target.select()
            }}
            onBlur={() => setFocusedIndex(null)}
            className={cn(
              'h-12 w-12 text-center text-lg font-semibold transition-colors',
              isFilled && 'border-primary',
              isActive && 'ring-2 ring-primary',
              error && 'border-destructive',
            )}
            aria-label={`OTP digit ${index + 1}`}
            aria-invalid={error || undefined}
          />
        )
      })}
    </motion.div>
  )
}
