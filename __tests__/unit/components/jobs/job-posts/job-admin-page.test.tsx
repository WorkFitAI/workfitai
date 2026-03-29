import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, beforeEach, expect, vi } from "vitest";

import { useJobs } from "@/hooks/useJobs";
import { useJobFilters } from "@/hooks/useJobFilters";
import { jobService } from "@/lib/job/job-service";
import JobAdminPage from "@/components/jobs/job-post-client";
import { createMockJob } from "@/__tests__/mocks/jobs";

import userEvent from "@testing-library/user-event";

import { toast } from "sonner";


// ================= MOCK =================
vi.mock("@/hooks/useJobs");
vi.mock("@/hooks/useJobFilters");

vi.mock("@/lib/job/job-service", () => ({
  jobService: {
    getAllSkills: vi.fn(),
    getJobByIdFromHr: vi.fn(),
    updateJob: vi.fn(),
    createJob: vi.fn(),
    softDelete: vi.fn(),
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

// ================= TEST =================
describe("JobAdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseJobFilters.mockReturnValue({
      page: 1,
      pageSize: 10,
      filters: {
        experienceLevel: [],
        employmentType: [],
        skillNames: [],
        salaryMin: undefined,
        salaryMax: undefined,
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
  it("renders job list", async () => {
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
    });

    render(<JobAdminPage />);

    expect(await screen.findByText("Frontend Dev")).toBeInTheDocument();
    expect(screen.getByText("React job")).toBeInTheDocument();
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
    });

    render(<JobAdminPage />);

    expect(
      screen.getByText(/Fetching your job posts/i)
    ).toBeInTheDocument();
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
    });

    render(<JobAdminPage />);

    expect(screen.getByText(/No jobs/i)).toBeInTheDocument();
  });

  /* =========================
     OPEN CREATE
  ========================= */
  it("opens create dialog when clicking button", () => {
    mockedUseJobs.mockReturnValue({
      jobs: [createMockJob()],
      page: 1,
      pageSize: 10,
      totalPages: 1,
      total: 1,
      loading: false,
    });

    render(<JobAdminPage />);

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
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

    render(<JobAdminPage />);

    const editBtn = screen
      .getAllByRole("button")
      .find((btn) => btn.innerHTML.includes("pencil"));

    if (editBtn) fireEvent.click(editBtn);

    await waitFor(() => {
      expect(mockedJobService.getJobByIdFromHr).toHaveBeenCalledWith("1");
    });
  });
});