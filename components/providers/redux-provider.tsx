"use client"

import { Provider } from "react-redux"
import { store } from "@/store"

/**
 * Client-side wrapper for the Redux Provider.
 * Needed because app/layout.tsx is a Server Component and cannot
 * import the store directly (which uses browser state).
 */
export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>
}
