"use client"

// Shared layout shell for every auth page.
// Provides: centered single-column container, decorative animated illustration,
// an optional animated header (eyebrow / title / subtitle), and a staggered
// entrance for its children. This is the single source of truth for auth page
// layout — every page renders through it so the look stays consistent.
import { motion } from "framer-motion"
import { AnimatedIllustration } from "@/components/auth/animated-illustration"
import { useAuthMotion } from "@/components/auth/motion/auth-motion-variants"
import { cn } from "@/lib/utils"

interface AuthShellProps {
  eyebrow?: string
  title?: string
  subtitle?: React.ReactNode
  children: React.ReactNode
  /** Extra classes for the inner content column. */
  className?: string
}

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  className,
}: AuthShellProps) {
  const motionPreset = useAuthMotion()
  const hasHeader = Boolean(eyebrow || title || subtitle)

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16">
      <AnimatedIllustration />

      <motion.div
        className={cn("relative mx-auto w-full max-w-lg", className)}
        variants={motionPreset.container}
        initial="hidden"
        animate="show"
      >
        {hasHeader && (
          <div className="mb-8">
            {eyebrow && (
              <motion.p
                variants={motionPreset.item}
                className="mb-2 text-center text-sm font-semibold text-primary"
              >
                {eyebrow}
              </motion.p>
            )}
            {title && (
              <motion.h1
                variants={motionPreset.item}
                className="mb-1 text-center text-3xl font-bold text-foreground"
              >
                {title}
              </motion.h1>
            )}
            {subtitle && (
              <motion.p
                variants={motionPreset.item}
                className="text-center text-sm text-muted-foreground"
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        )}

        {children}
      </motion.div>
    </div>
  )
}
