import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useJobFilters } from "@/hooks/useJobFilters";

vi.mock("next/navigation", () => ({
  useSearchParams: () =>
    new URLSearchParams(
      "page=2&size=20&experienceLevel=Senior,Junior&employmentType=Full-time&skillNames=React,Next&salaryMin=2000&salaryMax=5000"
    ),
}));

describe("useJobFilters", () => {
  it("should parse page and pageSize correctly", () => {
    const { result } = renderHook(() => useJobFilters());

    expect(result.current.page).toBe(2);
    expect(result.current.pageSize).toBe(20);
  });

  it("should parse filters correctly", () => {
    const { result } = renderHook(() => useJobFilters());

    expect(result.current.filters.experienceLevel).toEqual([
      "Senior",
      "Junior",
    ]);

    expect(result.current.filters.employmentType).toEqual(["Full-time"]);

    expect(result.current.filters.skillNames).toEqual(["React", "Next"]);

    expect(result.current.filters.salaryMin).toBe(2000);
    expect(result.current.filters.salaryMax).toBe(5000);
  });

  it("should build correct url for pagination", () => {
    const { result } = renderHook(() => useJobFilters());

    const url = result.current.buildUrl(3);

    expect(url).toContain("page=3");
    expect(url).toContain("size=20");
  });

  it("should update pageSize when provided", () => {
    const { result } = renderHook(() => useJobFilters());

    const url = result.current.buildUrl(1, 50);

    expect(url).toContain("page=1");
    expect(url).toContain("size=50");
  });
});