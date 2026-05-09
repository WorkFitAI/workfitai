import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, beforeEach, expect, vi } from "vitest";
import React from "react";

import { useJobs } from "@/hooks/useJobs";
import { useJobFilters } from "@/hooks/useJobFilters";
import { jobService } from "@/lib/job/job-service";
import JobAdminPage from "@/components/jobs/job-post-client";
import { createMockJob } from "@/__tests__/mocks/jobs";
import { useRouter, useSearchParams } from "next/navigation";


// ================= MOCK =================
vi.mock("@/hooks/useJobs");
vi.mock("@/hooks/useJobFilters");
vi.mock("next/navigation");

vi.mock("@/components/jobs/job-filter-bar", () => ({
  default: () => React.createElement("div", { "data-testid": "job-filter-bar" }),
}));

vi.mock("@/lib/job/job-service", () => ({
  jobService: {
    getAllSkills: vi.fn(),
    getJobByIdFromHr: vi.fn(),
    updateJob: vi.fn(),
    createJob: vi.fn(),
    onClose: vi.fn(),
    softDeleteForAdmin: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

const mockedUseJobs = vi.mocked(useJobs);
const mockedUseJobFilters = vi.mocked(useJobFilters);
const mockedJobService = vi.mocked(jobService);
const mockedUseRouter = vi.mocked(useRouter);
const mockedUseSearchParams = vi.mocked(useSearchParams);

// ================= TEST =================
describe("JobAdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseRouter.mockReturnValue({
      push: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);

    mockedUseSearchParams.mockReturnValue({
      get: vi.fn().mockReturnValue(null),
    } as unknown as ReturnType<typeof useSearchParams>);

    mockedUseJobFilters.mockReturnValue({
      page: 1,
      pageSize: 10,
      filters: {
        experienceLevel: [],
        employmentType: [],
        skillNames: [],
        salaryMin: undefined,
        salaryMax: undefined,
        title: "",
        location: "",
        status: "",
        sort: "",
        hrName: "",
      },
      buildUrl: vi.fn(),
    });

    mockedJobService.getAllSkills.mockResolvedValue({
      data: {
        result: [{ skillId: 1, name: "React" }],
        meta: {
          page: 1,
          pages: 1,
          total: 1,
        },
      },
    });
  });

  /* =========================
     RENDER LIST
  ========================= */
  it("renders job list for HR manager", async () => {
    const jobs = [
      createMockJob({
        postId: "1",
        title: "Frontend Dev",
        shortDescription: "React job",
      }),
    ];

    mockedUseJobs.mockReturnValue({
      jobs,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      total: 1,
      loading: false,
      refetch: vi.fn(),
    });

    render(<JobAdminPage roles={["ROLE_HR"]} companyId="C1" />);

    expect(await screen.findByText("Frontend Dev")).toBeInTheDocument();
    expect(screen.getByText("React job")).toBeInTheDocument();
  });

  it("renders job list for admin", async () => {
    const jobs = [
      createMockJob({
        postId: "1",
        title: "Senior Developer",
        shortDescription: "Java role",
      }),
    ];

    mockedUseJobs.mockReturnValue({
      jobs,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      total: 1,
      loading: false,
      refetch: vi.fn(),
    });

    render(<JobAdminPage roles={["ROLE_ADMIN"]} companyId="C1" />);

    expect(await screen.findByText("Senior Developer")).toBeInTheDocument();
    expect(screen.getByText("Java role")).toBeInTheDocument();
  });

  /* =========================
     LOADING
  ========================= */
  it("shows loading state", () => {
    mockedUseJobs.mockReturnValue({
      jobs: [],
      page: 1,
      pageSize: 10,
      totalPages: 0,
      total: 0,
      loading: true,
      refetch: vi.fn(),
    });

    render(<JobAdminPage roles={["ROLE_HR"]} companyId="C1" />);

    expect(screen.getByText(/Fetching your job posts/i)).toBeInTheDocument();
  });

  /* =========================
     EMPTY
  ========================= */
  it("shows empty state", () => {
    mockedUseJobs.mockReturnValue({
      jobs: [],
      page: 1,
      pageSize: 10,
      totalPages: 0,
      total: 0,
      loading: false,
      refetch: vi.fn(),
    });

    render(<JobAdminPage roles={["ROLE_HR"]} companyId="C1" />);

    expect(screen.getByText(/No jobs/i)).toBeInTheDocument();
  });

  /* =========================
     OPEN CREATE
  ========================= */
  it("opens create dialog when clicking button for HR", () => {
    mockedUseJobs.mockReturnValue({
      jobs: [createMockJob()],
      page: 1,
      pageSize: 10,
      totalPages: 1,
      total: 1,
      loading: false,
      refetch: vi.fn(),
    });

    render(<JobAdminPage roles={["ROLE_HR"]} companyId="C1" />);

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("hides create button for admin", () => {
    mockedUseJobs.mockReturnValue({
      jobs: [createMockJob()],
      page: 1,
      pageSize: 10,
      totalPages: 1,
      total: 1,
      loading: false,
      refetch: vi.fn(),
    });

    render(<JobAdminPage roles={["ROLE_ADMIN"]} companyId="C1" />);

    expect(screen.queryByRole("button", { name: /create/i })).not.toBeInTheDocument();
  });

  /* =========================
     EDIT
  ========================= */
  it("fetches job detail when clicking edit", async () => {
    mockedUseJobs.mockReturnValue({
      jobs: [
        createMockJob({
          postId: "1",
        }),
      ],
      page: 1,
      pageSize: 10,
      totalPages: 1,
      total: 1,
      loading: false,
      refetch: vi.fn(),
    });

    mockedJobService.getJobByIdFromHr.mockResolvedValue({
      data: {
        postId: "1",
        title: "Frontend Dev",
        shortDescription: "",
        description: "",
        company: {
          companyNo: "C1",
          name: "Test Company",
          description: "",
          address: "",
          websiteUrl: "",
          logoUrl: "",
          size: 100,
        },
        bannerUrl: null,
        location: "",
        employmentType: "",
        experienceLevel: "",
        requiredExperience: "",
        educationLevel: "",
        salaryMin: 0,
        salaryMax: 0,
        currency: "USD",
        quantity: 1,
        responsibilities: "",
        requirements: "",
        benefits: "",
        skillNames: ["React"],
        status: "PUBLISHED",
        totalApplications: 0,
        expiresAt: new Date().toISOString(),
        createdBy: "admin",
        createdDate: new Date().toISOString(),
        lastModifiedDate: new Date().toISOString(),
      },
    });

    render(<JobAdminPage roles={["ROLE_HR"]} companyId="C1" />);

    const editBtn = screen
      .getAllByRole("button")
      .find((btn) => btn.innerHTML.includes("pencil"));

    if (editBtn) fireEvent.click(editBtn);

    await waitFor(() => {
      expect(mockedJobService.getJobByIdFromHr).toHaveBeenCalledWith("1");
    });
  });

  it("disables edit button for admin", () => {
    mockedUseJobs.mockReturnValue({
      jobs: [createMockJob({ postId: "1" })],
      page: 1,
      pageSize: 10,
      totalPages: 1,
      total: 1,
      loading: false,
      refetch: vi.fn(),
    });

    render(<JobAdminPage roles={["ROLE_ADMIN"]} companyId="C1" />);

    const editBtn = screen
      .getAllByRole("button")
      .find((btn) => btn.innerHTML.includes("pencil"));

    if (editBtn) {
      expect(editBtn).toHaveAttribute("disabled");
    }
  });

  /* =========================
     DELETE
  ========================= */
  it("calls softDeleteForAdmin when admin clicks delete", async () => {
    mockedUseJobs.mockReturnValue({
      jobs: [createMockJob({ postId: "1" })],
      page: 1,
      pageSize: 10,
      totalPages: 1,
      total: 1,
      loading: false,
      refetch: vi.fn(),
    });

    mockedJobService.softDeleteForAdmin.mockResolvedValue(undefined);

    render(<JobAdminPage roles={["ROLE_ADMIN"]} companyId="C1" />);

    const deleteBtn = screen
      .getAllByRole("button")
      .find((btn) => btn.innerHTML.includes("lock-open"));

    if (deleteBtn) fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockedJobService.softDeleteForAdmin).toHaveBeenCalledWith("1");
    });
  });

  /* =========================
     JOB STATUS
  ========================= */
  it("displays job status badge", async () => {
    mockedUseJobs.mockReturnValue({
      jobs: [
        createMockJob({
          postId: "1",
          title: "Test Job",
          status: "PUBLISHED",
        }),
      ],
      page: 1,
      pageSize: 10,
      totalPages: 1,
      total: 1,
      loading: false,
      refetch: vi.fn(),
    });

    render(<JobAdminPage roles={["ROLE_HR"]} companyId="C1" />);

    expect(await screen.findByText("PUBLISHED")).toBeInTheDocument();
  });

  /* =========================
     VIEW JOB POST LINK
  ========================= */
  it("renders view job post link on job title", async () => {
    mockedUseJobs.mockReturnValue({
      jobs: [createMockJob({ postId: "1", title: "Frontend Developer" })],
      page: 1,
      pageSize: 10,
      totalPages: 1,
      total: 1,
      loading: false,
      refetch: vi.fn(),
    });

    render(<JobAdminPage roles={["ROLE_HR"]} companyId="C1" />);

    const link = await screen.findByRole("link", { name: /Frontend Developer/i });
    expect(link).toHaveAttribute("href", "/jobs/1");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
