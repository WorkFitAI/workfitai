import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useJobs } from "@/hooks/useJobs";
import { jobService } from "@/lib/job/job-service";
import { mockJobs } from "@/__tests__/mocks/jobs";

vi.mock("@/lib/job/job-service", () => ({
  jobService: {
    getJobs: vi.fn(),
  },
}));

const mockJobSvc = vi.mocked(jobService);

const mockJobData = {
  data: {
    result: mockJobs,
    meta: { page: 0, pageSize: 4, pages: 3, total: mockJobs.length },
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useJobs", () => {
  it("fetches jobs on mount and exposes them", async () => {
    mockJobSvc.getJobs.mockResolvedValue(mockJobData as never);

    const { result } = renderHook(() => useJobs(1, 4));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.jobs).toHaveLength(mockJobs.length);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.total).toBe(mockJobs.length);
  });

  it("starts with loading=true", async () => {
    mockJobSvc.getJobs.mockResolvedValue(mockJobData as never);
    const { result } = renderHook(() => useJobs(1, 4));
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("calls service with correct page and pageSize params", async () => {
    mockJobSvc.getJobs.mockResolvedValue(mockJobData as never);

    renderHook(() => useJobs(2, 5));

    await waitFor(() => expect(mockJobSvc.getJobs).toHaveBeenCalled());
    const args = mockJobSvc.getJobs.mock.calls[0][0];
    expect(args.page).toBe(2);
    expect(args.pageSize).toBe(5);
  });

  it("builds RSQL filter for experienceLevel and employmentType", async () => {
    mockJobSvc.getJobs.mockResolvedValue(mockJobData as never);

    renderHook(() =>
      useJobs(1, 4, { experienceLevel: ["Senior"], employmentType: ["Full-time"] }),
    );

    await waitFor(() => expect(mockJobSvc.getJobs).toHaveBeenCalled());
    const { filter } = mockJobSvc.getJobs.mock.calls[0][0];
    expect(filter).toContain("experienceLevel:'Senior'");
    expect(filter).toContain("employmentType:'Full-time'");
  });

  it("builds `in [...]` filter for multiple values", async () => {
    mockJobSvc.getJobs.mockResolvedValue(mockJobData as never);

    renderHook(() =>
      useJobs(1, 4, { experienceLevel: ["Junior", "Senior"] }),
    );

    await waitFor(() => expect(mockJobSvc.getJobs).toHaveBeenCalled());
    const { filter } = mockJobSvc.getJobs.mock.calls[0][0];
    expect(filter).toContain("experienceLevel in ['Junior','Senior']");
  });

  it("builds `skills.name in [...]` filter for skills", async () => {
    mockJobSvc.getJobs.mockResolvedValue(mockJobData as never);

    renderHook(() => useJobs(1, 4, { skillNames: ["React", "TypeScript"] }));

    await waitFor(() => expect(mockJobSvc.getJobs).toHaveBeenCalled());
    const { filter } = mockJobSvc.getJobs.mock.calls[0][0];
    expect(filter).toContain("skills.name in ['React','TypeScript']");
  });

  it("builds `skills.name in [...]` filter for a single skill (not equality)", async () => {
    mockJobSvc.getJobs.mockResolvedValue(mockJobData as never);

    renderHook(() => useJobs(1, 4, { skillNames: ["Java"] }));

    await waitFor(() => expect(mockJobSvc.getJobs).toHaveBeenCalled());
    const { filter } = mockJobSvc.getJobs.mock.calls[0][0];
    expect(filter).toBe("skills.name in ['Java']");
  });

  it("builds hrName filter using createdBy field", async () => {
    mockJobSvc.getJobs.mockResolvedValue(mockJobData as never);

    renderHook(() => useJobs(1, 4, { hrName: "john.doe" }));

    await waitFor(() => expect(mockJobSvc.getJobs).toHaveBeenCalled());
    const { filter } = mockJobSvc.getJobs.mock.calls[0][0];
    expect(filter).toContain("createdBy:'john.doe'");
  });

  it("builds salary range filter", async () => {
    mockJobSvc.getJobs.mockResolvedValue(mockJobData as never);

    renderHook(() => useJobs(1, 4, { salaryMin: 1000, salaryMax: 5000 }));

    await waitFor(() => expect(mockJobSvc.getJobs).toHaveBeenCalled());
    const { filter } = mockJobSvc.getJobs.mock.calls[0][0];
    expect(filter).toContain("salaryMin >: 1000");
    expect(filter).toContain("salaryMax :< 5000");
  });

  it("passes role to service call", async () => {
    mockJobSvc.getJobs.mockResolvedValue(mockJobData as never);

    renderHook(() => useJobs(1, 4, undefined, "hr-manager"));

    await waitFor(() => expect(mockJobSvc.getJobs).toHaveBeenCalled());
    const args = mockJobSvc.getJobs.mock.calls[0][0];
    expect(args.role).toBe("hr-manager");
  });

  it("does not throw when service rejects — jobs stay empty", async () => {
    mockJobSvc.getJobs.mockRejectedValue(new Error("Failed to fetch"));

    const { result } = renderHook(() => useJobs(1, 4));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.jobs).toEqual([]);
  });

  it("returns empty filter string when no filters provided", async () => {
    mockJobSvc.getJobs.mockResolvedValue(mockJobData as never);

    renderHook(() => useJobs(1, 4));

    await waitFor(() => expect(mockJobSvc.getJobs).toHaveBeenCalled());
    const { filter } = mockJobSvc.getJobs.mock.calls[0][0];
    expect(filter).toBe("");
  });
});
