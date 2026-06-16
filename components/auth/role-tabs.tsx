"use client"

// Animated segmented control for the register role switcher.
// The active pill slides between options using a shared layoutId. The parent
// owns the active value and URL sync; this component is purely presentational.
import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface RoleTab<T extends string> {
  id: T
  label: string
}

interface RoleTabsProps<T extends string> {
  tabs: RoleTab<T>[]
  value: T
  onChange: (id: T) => void
  className?: string
}

export function RoleTabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: RoleTabsProps<T>) {
  const reduced = useReducedMotion() ?? false

  return (
    <div
      role="tablist"
      className={cn(
        "flex rounded-xl border border-border bg-muted/40 p-1",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = value === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="role-tab-pill"
                className="absolute inset-0 rounded-lg bg-background shadow-sm"
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 380, damping: 30 }
                }
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
