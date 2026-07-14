import { describe, it, expect, beforeEach } from "vitest";
import { JobPreferences } from "@/types/job-preferences";

const STORAGE_KEY = "wfa:job-preferences";

const samplePrefs: JobPreferences = {
  experienceLevel: ["SENIOR", "MID"],
  employmentType: ["FULL_TIME"],
  skillNames: ["React", "Node.js"],
  categoryName: "Software Engineering",
  salaryMin: 20000000,
  currency: "VND",
};

beforeEach(() => {
  localStorage.clear();
});

describe("job-preferences-storage", () => {
  it("getStoredPreferences returns null when nothing stored", async () => {
    const { getStoredPreferences } = await import("@/lib/job/job-preferences-storage");
    expect(getStoredPreferences()).toBeNull();
  });

  it("savePreferences persists and round-trips via getDeclaredPreferences", async () => {
    const { savePreferences, getDeclaredPreferences } = await import(
      "@/lib/job/job-preferences-storage"
    );

    savePreferences(samplePrefs);

    expect(getDeclaredPreferences()).toEqual(samplePrefs);
  });

  it("savePreferences marks hasResponded true", async () => {
    const { savePreferences, hasResponded } = await import(
      "@/lib/job/job-preferences-storage"
    );

    savePreferences(samplePrefs);

    expect(hasResponded()).toBe(true);
  });

  it("dismissPreferences marks hasResponded true but declared prefs stay null", async () => {
    const { dismissPreferences, hasResponded, getDeclaredPreferences } = await import(
      "@/lib/job/job-preferences-storage"
    );

    dismissPreferences();

    expect(hasResponded()).toBe(true);
    expect(getDeclaredPreferences()).toBeNull();
  });

  it("getStoredPreferences returns null for corrupt JSON without throwing", async () => {
    localStorage.setItem(STORAGE_KEY, "{not-valid-json");

    const { getStoredPreferences } = await import("@/lib/job/job-preferences-storage");

    expect(() => getStoredPreferences()).not.toThrow();
    expect(getStoredPreferences()).toBeNull();
  });

  it("clearPreferences resets stored state", async () => {
    const { savePreferences, clearPreferences, getStoredPreferences } = await import(
      "@/lib/job/job-preferences-storage"
    );

    savePreferences(samplePrefs);
    clearPreferences();

    expect(getStoredPreferences()).toBeNull();
  });
});
