"use client"

// Segmented password strength meter.
// Heuristic score (0-4) from length + character-class diversity. Segments use
// solid theme/utility colors only (no gradients) and animate their fill via
// framer-motion. Renders nothing until the user starts typing.
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PasswordStrengthMeterProps {
  value: string
  className?: string
}

const SEGMENTS = 4

// Solid colors per strength bucket — index by score (1..4).
const LEVELS = [
  { label: "", color: "" },
  { label: "Weak", color: "bg-destructive" },
  { label: "Fair", color: "bg-amber-500" },
  { label: "Good", color: "bg-primary" },
  { label: "Strong", color: "bg-green-500" },
] as const

// Lightweight heuristic — not a security control, only UX feedback.
function scorePassword(pw: string): number {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  // Short passwords can never read as "Strong".
  if (pw.length < 8) score = Math.min(score, 1)
  return Math.min(score, SEGMENTS)
}

export function PasswordStrengthMeter({
  value,
  className,
}: PasswordStrengthMeterProps) {
  if (!value) return null

  const score = scorePassword(value)
  const level = LEVELS[score]

  return (
    <div className={cn("space-y-1", className)} aria-live="polite">
      <div className="flex gap-1.5">
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const filled = i < score
          return (
            <div
              key={i}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
            >
              <motion.div
                className={cn("h-full rounded-full", filled ? level.color : "")}
                initial={false}
                animate={{ width: filled ? "100%" : "0%" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            </div>
          )
        })}
      </div>
      {level.label && (
        <p className="text-xs text-muted-foreground">
          Password strength:{" "}
          <span className="font-medium text-foreground">{level.label}</span>
        </p>
      )}
    </div>
  )
}
