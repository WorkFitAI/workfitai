"use client"

// Animated wrapper around the decorative auth SVGs.
// - Hot air balloon gently floats up/down (desktop only)
// - City silhouette drifts in from the bottom-left on mount
// Motion is disabled when the user prefers reduced motion.
import { motion, useReducedMotion } from "framer-motion"
import {
  CitySilhouetteSvg,
  HotAirBalloonSvg,
} from "@/components/auth/auth-page-illustration"

export function AnimatedIllustration() {
  const reduced = useReducedMotion() ?? false

  return (
    <>
      {/* Hot air balloon — top right, slow vertical float */}
      <motion.div
        className="pointer-events-none absolute right-16 top-24 hidden lg:block"
        aria-hidden="true"
        initial={reduced ? false : { opacity: 0, y: -8 }}
        animate={
          reduced
            ? { opacity: 1 }
            : { opacity: 1, y: [0, -14, 0] }
        }
        transition={
          reduced
            ? { duration: 0 }
            : {
                opacity: { duration: 0.6, ease: "easeOut" },
                y: { duration: 6, ease: "easeInOut", repeat: Infinity },
              }
        }
      >
        <HotAirBalloonSvg />
      </motion.div>

      {/* City silhouette — bottom left, drift in on mount */}
      <motion.div
        className="pointer-events-none absolute bottom-0 left-0 hidden lg:block"
        aria-hidden="true"
        initial={reduced ? false : { opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.7, ease: "easeOut" }}
      >
        <CitySilhouetteSvg />
      </motion.div>
    </>
  )
}
