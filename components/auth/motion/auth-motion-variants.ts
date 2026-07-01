// Shared framer-motion variants for auth pages.
// All presets are reduced-motion aware via useAuthMotion() — when the user
// prefers reduced motion, variants collapse to instant/zero-distance so there
// is no movement and no layout shift.
import { useReducedMotion, type Variants } from "framer-motion"

// Container that staggers its children's entrance.
export const containerStagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
}

// Standard item: fade + small upward slide. Used for fields, links, buttons.
export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
}

// Pop entrance for cards, badges, selectable tiles.
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
}

// Instant variants (no movement) returned when reduced motion is preferred.
const instantContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0, delayChildren: 0 } },
}
const instantItem: Variants = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { duration: 0 } },
}

export interface AuthMotion {
  reduced: boolean
  container: Variants
  item: Variants
  pop: Variants
}

/**
 * Pick the right variant set based on the user's reduced-motion preference.
 * Components should read variants from here rather than importing presets
 * directly, so accessibility is handled in one place.
 */
export function useAuthMotion(): AuthMotion {
  const reduced = useReducedMotion() ?? false
  if (reduced) {
    return {
      reduced: true,
      container: instantContainer,
      item: instantItem,
      pop: instantItem,
    }
  }
  return {
    reduced: false,
    container: containerStagger,
    item: fadeSlideUp,
    pop: popIn,
  }
}
