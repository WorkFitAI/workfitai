import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useJobs } from "@/hooks/useJobs";
import { jobService } from "@/lib/job/job-service";
import { mockJobApiResponse } from "@/__tests__/mocks/jobs";

vi.mock("@/app/api/job-api", () => ({
  getJobs: vi.fn(),
}));

describe("useJobs hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch jobs on mount", async () => {
    vi.mocked(jobService.getJobs).mockResolvedValue(mockJobApiResponse);

    const { result } = renderHook(() => useJobs(1, 4));

    await waitFor(() => {
      expect(jobService.getJobs).toHaveBeenCalledTimes(1);
    });

    expect(result.current.jobs.length).toBe(2);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.total).toBe(10);
  });

  it("should set loading state correctly", async () => {
    vi.mocked(jobService.getJobs).mockResolvedValue(mockJobApiResponse);

    const { result } = renderHook(() => useJobs(1, 4));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should call API with correct params", async () => {
    vi.mocked(jobService.getJobs).mockResolvedValue(mockJobApiResponse);

    renderHook(() => useJobs(2, 5));

    await waitFor(() => {
      expect(jobService.getJobs).toHaveBeenCalledWith({
        page: 2,
        pageSize: 5,
        filter: "",
      });
    });
  });

  it("should apply filters correctly", async () => {
    vi.mocked(jobService.getJobs).mockResolvedValue(mockJobApiResponse);

    const filters = {
      experienceLevel: ["Senior"],
      employmentType: ["Full-time"],
      skillNames: ["React"],
      keyword: "Frontend",
      salaryMin: 2000,
      salaryMax: 5000,
    };

    renderHook(() => useJobs(1, 4, filters));

    await waitFor(() => {
      expect(jobService.getJobs).toHaveBeenCalled();
    });

    const args = vi.mocked(jobService.getJobs).mock.calls[0][0];

    expect(args.filter).toContain("experienceLevel:'Senior'");
    expect(args.filter).toContain("employmentType:'Full-time'");
    expect(args.filter).toContain("skills.name");
  });
});