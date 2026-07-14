import { describe, it, expect, vi, beforeEach } from "vitest";
import { jobService } from "@/lib/job/job-service";
import { apiClient } from "@/lib/api-client";
import { mockJobs, mockJobDetail } from "@/__tests__/mocks/jobs";

vi.mock("@/lib/api-client");

const mockedApiClient = vi.mocked(apiClient);

const ok200 = (data: unknown) => ({ status: 200, message: "OK", data });
const err400 = { status: 400, message: "Bad request" };
const err500 = { status: 500, message: "Internal server error" };

const mockJobData = {
  result: mockJobs,
  meta: { page: 0, pageSize: 12, pages: 1, total: mockJobs.length },
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── getJobs ───────────────────────────────────────────────────────────────────

describe("jobService.getJobs", () => {
  it("calls public endpoint when no role given", async () => {
    mockedApiClient.get.mockResolvedValue(ok200(mockJobData));

    await jobService.getJobs({ page: 1, pageSize: 12 });

    const url: string = mockedApiClient.get.mock.calls[0][0] as string;
    expect(url).toContain("/job/public/jobs");
  });

  it("calls admin endpoint for admin role", async () => {
    mockedApiClient.get.mockResolvedValue(ok200(mockJobData));

    await jobService.getJobs({ page: 1, pageSize: 12, role: "admin" });

    const url: string = mockedApiClient.get.mock.calls[0][0] as string;
    expect(url).toContain("/job/admin/jobs");
  });

  it("calls HR endpoint for hr role", async () => {
    mockedApiClient.get.mockResolvedValue(ok200(mockJobData));

    await jobService.getJobs({ page: 1, pageSize: 12, role: "hr" });

    const url: string = mockedApiClient.get.mock.calls[0][0] as string;
    expect(url).toContain("/job/hr/jobs");
  });

  it("appends page, size, and sort to query string", async () => {
    mockedApiClient.get.mockResolvedValue(ok200(mockJobData));

    await jobService.getJobs({ page: 2, pageSize: 6, sort: "asc" });

    const url: string = mockedApiClient.get.mock.calls[0][0] as string;
    expect(url).toContain("page=1");
    expect(url).toContain("size=6");
    expect(url).toContain("sort=createdDate%2Casc");
  });

  it("appends filter to query string when provided", async () => {
    mockedApiClient.get.mockResolvedValue(ok200(mockJobData));

    await jobService.getJobs({ page: 1, pageSize: 12, filter: "experienceLevel:'Senior'" });

    const url: string = mockedApiClient.get.mock.calls[0][0] as string;
    expect(url).toContain("filter=");
  });

  it("throws when status >= 400", async () => {
    mockedApiClient.get.mockResolvedValue(err400);
    await expect(jobService.getJobs({ page: 1, pageSize: 12 })).rejects.toThrow("Failed to fetch jobs");
  });
});

// ── getAllSkills ───────────────────────────────────────────────────────────────

describe("jobService.getAllSkills", () => {
  it("calls /job/public/skills with default page and size", async () => {
    mockedApiClient.get.mockResolvedValue(ok200({ skills: [] }));
    await jobService.getAllSkills();
    expect(mockedApiClient.get).toHaveBeenCalledWith("/job/public/skills?page=0&size=10");
  });

  it("appends filter to query string when search is provided", async () => {
    mockedApiClient.get.mockResolvedValue(ok200({ skills: [] }));
    await jobService.getAllSkills(0, 50, "java");
    const url: string = mockedApiClient.get.mock.calls[0][0] as string;
    expect(url).toContain("page=0");
    expect(url).toContain("size=50");
    expect(url).toContain("filter=");
  });

  it("throws when status >= 400", async () => {
    mockedApiClient.get.mockResolvedValue(err400);
    await expect(jobService.getAllSkills()).rejects.toThrow("Failed to fetch skills");
  });
});

// ── getJobById ────────────────────────────────────────────────────────────────

describe("jobService.getJobById", () => {
  it("calls /job/public/jobs/:id", async () => {
    mockedApiClient.get.mockResolvedValue(ok200(mockJobDetail));
    await jobService.getJobById("job-001");
    expect(mockedApiClient.get).toHaveBeenCalledWith("/job/public/jobs/job-001");
  });

  it("throws when status >= 400", async () => {
    mockedApiClient.get.mockResolvedValue(err400);
    await expect(jobService.getJobById("job-001")).rejects.toThrow("Failed to fetch job details");
  });
});

// ── getJobByIdFromHr ──────────────────────────────────────────────────────────

describe("jobService.getJobByIdFromHr", () => {
  it("calls /job/hr/jobs/:id", async () => {
    mockedApiClient.get.mockResolvedValue(ok200(mockJobDetail));
    await jobService.getJobByIdFromHr("job-001");
    expect(mockedApiClient.get).toHaveBeenCalledWith("/job/hr/jobs/job-001");
  });

  it("throws when status >= 400", async () => {
    mockedApiClient.get.mockResolvedValue(err400);
    await expect(jobService.getJobByIdFromHr("job-001")).rejects.toThrow("Failed to fetch job details");
  });
});

// ── getSimilarJobs ────────────────────────────────────────────────────────────

describe("jobService.getSimilarJobs", () => {
  it("calls /job/public/jobs/similar/:id", async () => {
    mockedApiClient.get.mockResolvedValue(ok200(mockJobs));
    await jobService.getSimilarJobs("job-001");
    expect(mockedApiClient.get).toHaveBeenCalledWith("/job/public/jobs/similar/job-001");
  });

  it("throws when status >= 400", async () => {
    mockedApiClient.get.mockResolvedValue(err400);
    await expect(jobService.getSimilarJobs("job-001")).rejects.toThrow("Failed to fetch similar jobs");
  });
});

// ── getFeaturedJobs ───────────────────────────────────────────────────────────

describe("jobService.getFeaturedJobs", () => {
  it("calls featured endpoint with 0-indexed page", async () => {
    mockedApiClient.get.mockResolvedValue(ok200(mockJobData));
    await jobService.getFeaturedJobs(2, 4);
    expect(mockedApiClient.get).toHaveBeenCalledWith(
      expect.stringContaining("/job/public/jobs/featured?page=1&size=4"),
    );
  });

  it("throws when status >= 400", async () => {
    mockedApiClient.get.mockResolvedValue(err400);
    await expect(jobService.getFeaturedJobs(1, 4)).rejects.toThrow("Failed to fetch featured jobs");
  });
});

// ── createJob ─────────────────────────────────────────────────────────────────

describe("jobService.createJob", () => {
  it("POSTs to /job/hr/jobs", async () => {
    mockedApiClient.post.mockResolvedValue({ status: 201, message: "Created" });
    await jobService.createJob({ title: "Dev" } as never);
    expect(mockedApiClient.post).toHaveBeenCalledWith("/job/hr/jobs", { title: "Dev" });
  });

  it("throws when status >= 400", async () => {
    mockedApiClient.post.mockResolvedValue(err400);
    await expect(jobService.createJob({} as never)).rejects.toThrow("Failed to create job");
  });
});

// ── updateJob ─────────────────────────────────────────────────────────────────

describe("jobService.updateJob", () => {
  it("PUTs to /job/hr/jobs", async () => {
    mockedApiClient.put.mockResolvedValue({ status: 200, message: "Updated" });
    await jobService.updateJob({ title: "Dev Updated" } as never);
    expect(mockedApiClient.put).toHaveBeenCalledWith("/job/hr/jobs", { title: "Dev Updated" });
  });

  it("throws when status >= 400", async () => {
    mockedApiClient.put.mockResolvedValue(err400);
    await expect(jobService.updateJob({} as never)).rejects.toThrow("Failed to update job");
  });
});

// ── toggleJobStatus ───────────────────────────────────────────────────────────

describe("jobService.toggleJobStatus", () => {
  it("PUTs to /job/hr/jobs/:id/:status", async () => {
    mockedApiClient.put.mockResolvedValue({ status: 200, message: "OK" });
    await jobService.toggleJobStatus("job-001", "CLOSED");
    expect(mockedApiClient.put).toHaveBeenCalledWith("/job/hr/jobs/job-001/CLOSED");
  });

  it("throws when status >= 400", async () => {
    mockedApiClient.put.mockResolvedValue(err400);
    await expect(jobService.toggleJobStatus("job-001", "CLOSED")).rejects.toThrow("Failed to update job status");
  });
});

// ── softDeleteForAdmin ────────────────────────────────────────────────────────

describe("jobService.softDeleteForAdmin", () => {
  it("DELETEs /job/admin/jobs/:id", async () => {
    mockedApiClient.delete.mockResolvedValue({ status: 200, message: "Deleted" });
    await jobService.softDeleteForAdmin("job-001");
    expect(mockedApiClient.delete).toHaveBeenCalledWith("/job/admin/jobs/job-001");
  });

  it("throws when status >= 500", async () => {
    mockedApiClient.delete.mockResolvedValue(err500);
    await expect(jobService.softDeleteForAdmin("job-001")).rejects.toThrow("Failed to delete job");
  });
});
