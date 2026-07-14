import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useJobPreferences } from "@/hooks/useJobPreferences";
import { JobPreferences } from "@/types/job-preferences";

const samplePrefs: JobPreferences = {
  experienceLevel: ["SENIOR"],
  employmentType: ["FULL_TIME"],
  skillNames: ["React"],
  categoryName: "Software Engineering",
  salaryMin: 2000,
  currency: "USD",
};

beforeEach(() => {
  localStorage.clear();
});

describe("useJobPreferences", () => {
  it("becomes ready with hasResponded false when storage is empty", async () => {
    const { result } = renderHook(() => useJobPreferences());

    await waitFor(() => expect(result.current.isReady).toBe(true));

    expect(result.current.hasResponded).toBe(false);
    expect(result.current.declaredPrefs).toBeNull();
  });

  it("save persists preferences, closes the modal, and marks hasResponded", async () => {
    const { result } = renderHook(() => useJobPreferences());

    await waitFor(() => expect(result.current.isReady).toBe(true));

    act(() => result.current.openModal());
    expect(result.current.isModalOpen).toBe(true);

    act(() => result.current.save(samplePrefs));

    expect(result.current.hasResponded).toBe(true);
    expect(result.current.declaredPrefs).toEqual(samplePrefs);
    expect(result.current.isModalOpen).toBe(false);
  });

  it("dismiss marks hasResponded true without declaring preferences", async () => {
    const { result } = renderHook(() => useJobPreferences());

    await waitFor(() => expect(result.current.isReady).toBe(true));

    act(() => result.current.openModal());
    act(() => result.current.dismiss());

    expect(result.current.hasResponded).toBe(true);
    expect(result.current.declaredPrefs).toBeNull();
    expect(result.current.isModalOpen).toBe(false);
  });

  it("closeModal after save leaves declared preferences untouched (edit-cancel must not wipe data)", async () => {
    const { result } = renderHook(() => useJobPreferences());

    await waitFor(() => expect(result.current.isReady).toBe(true));

    act(() => result.current.save(samplePrefs));
    act(() => result.current.openModal());
    act(() => result.current.closeModal());

    expect(result.current.isModalOpen).toBe(false);
    expect(result.current.hasResponded).toBe(true);
    expect(result.current.declaredPrefs).toEqual(samplePrefs);
  });

  it("a fresh hook instance picks up previously saved preferences from storage", async () => {
    const first = renderHook(() => useJobPreferences());
    await waitFor(() => expect(first.result.current.isReady).toBe(true));
    act(() => first.result.current.save(samplePrefs));

    const second = renderHook(() => useJobPreferences());
    await waitFor(() => expect(second.result.current.isReady).toBe(true));

    expect(second.result.current.hasResponded).toBe(true);
    expect(second.result.current.declaredPrefs).toEqual(samplePrefs);
  });
});
