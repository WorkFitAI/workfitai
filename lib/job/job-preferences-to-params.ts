import { JobPreferences } from "@/types/job-preferences";

const FILTER_PARAM_KEYS = [
  "experienceLevel",
  "employmentType",
  "skillNames",
  "categoryName",
  "salaryMin",
  "salaryMax",
  "title",
  "location",
] as const;

export function applyPreferencesToParams(
  prefs: JobPreferences,
  base?: URLSearchParams
): URLSearchParams {
  const params = new URLSearchParams(base?.toString());

  const setMulti = (key: string, values: string[]) => {
    if (values.length > 0) {
      params.set(key, values.join(","));
    } else {
      params.delete(key);
    }
  };

  setMulti("experienceLevel", prefs.experienceLevel);
  setMulti("employmentType", prefs.employmentType);
  setMulti("skillNames", prefs.skillNames);

  if (prefs.categoryName) {
    params.set("categoryName", prefs.categoryName);
  } else {
    params.delete("categoryName");
  }

  if (prefs.salaryMin !== undefined) {
    params.set("salaryMin", String(prefs.salaryMin));
    params.set("currency", prefs.currency);
  } else {
    params.delete("salaryMin");
    params.delete("currency");
  }

  params.set("page", "1");
  params.set("size", "12");

  return params;
}

export function hasAnyFilterParams(params: URLSearchParams): boolean {
  return FILTER_PARAM_KEYS.some((key) => !!params.get(key));
}
