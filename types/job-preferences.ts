export type PreferenceCurrency = "USD" | "VND";

export interface JobPreferences {
  experienceLevel: string[];
  employmentType: string[];
  skillNames: string[];
  categoryName?: string;
  salaryMin?: number;
  currency: PreferenceCurrency;
}

export type JobPreferencesStatus = "declared" | "dismissed";

export interface StoredJobPreferences {
  status: JobPreferencesStatus;
  prefs: JobPreferences | null;
  declaredAt: number;
}
