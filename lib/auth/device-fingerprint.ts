// Generates and persists a stable device ID for refresh token rotation
const STORAGE_KEY = 'wfa_device_id'

/** Returns the device ID, creating and persisting one if it doesn't exist */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server'

  const existing = localStorage.getItem(STORAGE_KEY)
  if (existing) return existing

  const newId = crypto.randomUUID()
  localStorage.setItem(STORAGE_KEY, newId)
  return newId
}
