import { JobPreferences, StoredJobPreferences } from "@/types/job-preferences";

const STORAGE_KEY = "wfa:job-preferences";

const isBrowser = () => typeof window !== "undefined";

export function getStoredPreferences(): StoredJobPreferences | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    return JSON.parse(raw) as StoredJobPreferences;
  } catch (error) {
    console.error("Failed to read job preferences:", error);
    return null;
  }
}

export function getDeclaredPreferences(): JobPreferences | null {
  const stored = getStoredPreferences();
  if (!stored || stored.status !== "declared") return null;

  return stored.prefs;
}

export function hasResponded(): boolean {
  return getStoredPreferences() !== null;
}

export function savePreferences(prefs: JobPreferences): void {
  if (!isBrowser()) return;

  const record: StoredJobPreferences = {
    status: "declared",
    prefs,
    declaredAt: Date.now(),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch (error) {
    console.error("Failed to save job preferences:", error);
  }
}

export function dismissPreferences(): void {
  if (!isBrowser()) return;

  const record: StoredJobPreferences = {
    status: "dismissed",
    prefs: null,
    declaredAt: Date.now(),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch (error) {
    console.error("Failed to dismiss job preferences:", error);
  }
}

export function clearPreferences(): void {
  if (!isBrowser()) return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear job preferences:", error);
  }
}
