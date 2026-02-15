"use client"

// Six-box OTP input with auto-advance, backspace, and paste support
import { useRef, KeyboardEvent, ClipboardEvent } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function OtpInput({ length = 6, value, onChange, disabled, className }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Convert the flat string value into individual digit slots
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  function focusAt(index: number) {
    inputRefs.current[index]?.focus()
  }

  function handleChange(index: number, char: string) {
    const digit = char.replace(/\D/g, '').slice(-1)
    const next = digits.map((d, i) => (i === index ? digit : d)).join('')
    onChange(next)
    if (digit && index < length - 1) focusAt(index + 1)
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        // Clear current slot
        const next = digits.map((d, i) => (i === index ? '' : d)).join('')
        onChange(next)
      } else if (index > 0) {
        // Move to previous slot and clear it
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
    onChange(next)
    const lastFilled = Math.min(pasted.length, length - 1)
    focusAt(lastFilled)
  }

  return (
    <div className={cn('flex gap-2', className)}>
      {digits.map((digit, index) => (
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
          onFocus={(e) => e.target.select()}
          className="h-12 w-12 text-center text-lg font-semibold"
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  )
}
