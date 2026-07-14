import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { HomeJobsOfDay } from "@/components/home/home-jobs-of-day";
import { jobService } from "@/lib/job/job-service";
import type { Company } from "@/types/company";
import type { Job, JobRecommendation } from "@/types/job";

vi.mock("@/lib/job/job-service", () => ({
  jobService: {
    getJobs: vi.fn(),
    getRecommendedJobs: vi.fn(),
  },
}));

vi.mock("@/components/applications/apply-now-button", () => ({
  default: () => <button>Apply Now</button>,
}));

vi.mock("@/components/ui/lottie-loader", () => ({
  LottieLoader: () => <div data-testid="lottie-loader" />,
}));

vi.mock("lucide-react", () => ({
  MapPin: () => <svg data-testid="map-pin-icon" />,
  Sparkles: () => <svg data-testid="sparkles-icon" />,
}));

let authState: {
  isAuthenticated: boolean;
  user: { roles: string[] } | null;
  isLoading: boolean;
} = { isAuthenticated: false, user: null, isLoading: false };

vi.mock("@/contexts/auth-context", () => ({
  useAuth: () => authState,
}));

const mockedJobService = vi.mocked(jobService);

const company: Company = {
  companyNo: "C001",
  name: "FPT",
  description: "",
  address: "Hanoi",
  websiteUrl: null,
  logoUrl: "https://res.cloudinary.com/logo.png",
  size: null,
};

function mockJobsResponse(jobs: Partial<Job>[]) {
  return {
    data: {
      result: jobs as Job[],
      meta: { page: 0, pageSize: 12, pages: 1, total: jobs.length },
    },
  };
}

function mockRecommendation(title: string): JobRecommendation {
  return {
    job: {
      postId: `rec-${title}`,
      title,
      shortDescription: "Tuyển SENIOR Developer tham gia phát triển dự án.",
      employmentType: "FULL_TIME",
      experienceLevel: "SENIOR",
      salaryMin: 1000,
      salaryMax: 2000,
      expiresAt: "2026-06-29T16:22:57Z",
      skillNames: ["ReactJS"],
      jobCategoryName: "Frontend",
      company,
      createdDate: "2026-06-13T16:22:57Z",
      status: "PUBLISHED",
      deleted: false,
    },
    score: 0.9,
    rank: 1,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  authState = { isAuthenticated: false, user: null, isLoading: false };
});

describe("HomeJobsOfDay", () => {
  it("shows the loading gif while jobs are being fetched", () => {
    authState = { isAuthenticated: false, user: null, isLoading: false };
    mockedJobService.getJobs.mockReturnValue(new Promise(() => {}));

    render(<HomeJobsOfDay />);

    expect(screen.getByTestId("lottie-loader")).toBeInTheDocument();
  });

  it("uses recommendations for an authenticated CANDIDATE", async () => {
    authState = { isAuthenticated: true, user: { roles: ["ROLE_CANDIDATE"] }, isLoading: false };
    mockedJobService.getRecommendedJobs.mockResolvedValue({
      data: { recommendations: [mockRecommendation("Senior Frontend Developer")], totalResults: 1, processingTime: "N/A" },
    });

    render(<HomeJobsOfDay />);

    expect(await screen.findByText("Senior Frontend Developer")).toBeInTheDocument();
    expect(mockedJobService.getRecommendedJobs).toHaveBeenCalledWith(10);
    expect(mockedJobService.getJobs).not.toHaveBeenCalled();
    expect(screen.getByText("AI-Powered Picks For You")).toBeInTheDocument();
    // Component maps raw score through a sigmoid (score/4.0) before display,
    // so a 0.9 score renders as 56%, not a direct 90%.
    expect(screen.getByText("56% Match")).toBeInTheDocument();
  });

  it("falls back to the public jobs list when the candidate has no recommendations yet", async () => {
    authState = { isAuthenticated: true, user: { roles: ["ROLE_CANDIDATE"] }, isLoading: false };
    mockedJobService.getRecommendedJobs.mockResolvedValue({
      data: { recommendations: [], totalResults: 0, processingTime: "N/A" },
    });
    mockedJobService.getJobs.mockResolvedValue(
      mockJobsResponse([{ postId: "job-1", title: "Latest Backend Role", shortDescription: "Desc", salaryMin: 1, salaryMax: 2, skillNames: [], company }]),
    );

    render(<HomeJobsOfDay />);

    expect(await screen.findByText("Latest Backend Role")).toBeInTheDocument();
    // GET /job/public/jobs?page=0&size=10&sort=createdDate,desc
    expect(mockedJobService.getJobs).toHaveBeenCalledWith({ page: 1, pageSize: 10, sort: "desc" });
    expect(screen.queryByText("AI-Powered Picks For You")).not.toBeInTheDocument();
  });

  it("falls back to the public jobs list when the recommendations call errors", async () => {
    authState = { isAuthenticated: true, user: { roles: ["ROLE_CANDIDATE"] }, isLoading: false };
    mockedJobService.getRecommendedJobs.mockRejectedValue(new Error("no CV on file"));
    mockedJobService.getJobs.mockResolvedValue(
      mockJobsResponse([{ postId: "job-2", title: "Fallback Role", shortDescription: "Desc", salaryMin: 1, salaryMax: 2, skillNames: [], company }]),
    );

    render(<HomeJobsOfDay />);

    expect(await screen.findByText("Fallback Role")).toBeInTheDocument();
  });

  it("skips recommendations entirely for a non-candidate user", async () => {
    authState = { isAuthenticated: true, user: { roles: ["ROLE_HR"] }, isLoading: false };
    mockedJobService.getJobs.mockResolvedValue(
      mockJobsResponse([{ postId: "job-3", title: "HR-Visible Role", shortDescription: "Desc", salaryMin: 1, salaryMax: 2, skillNames: [], company }]),
    );

    render(<HomeJobsOfDay />);

    expect(await screen.findByText("HR-Visible Role")).toBeInTheDocument();
    expect(mockedJobService.getRecommendedJobs).not.toHaveBeenCalled();
  });

  it("skips recommendations for unauthenticated visitors", async () => {
    authState = { isAuthenticated: false, user: null, isLoading: false };
    mockedJobService.getJobs.mockResolvedValue(
      mockJobsResponse([{ postId: "job-4", title: "Public Role", shortDescription: "Desc", salaryMin: 1, salaryMax: 2, skillNames: [], company }]),
    );

    render(<HomeJobsOfDay />);

    await waitFor(() => expect(mockedJobService.getJobs).toHaveBeenCalled());
    expect(mockedJobService.getRecommendedJobs).not.toHaveBeenCalled();
  });

  it("caps the public jobs list at 10 cards even if the API returns more", async () => {
    authState = { isAuthenticated: false, user: null, isLoading: false };
    const elevenJobs = Array.from({ length: 11 }, (_, i) => ({
      postId: `job-extra-${i}`,
      title: `Extra Role ${i}`,
      shortDescription: "Desc",
      salaryMin: 1,
      salaryMax: 2,
      skillNames: [],
      company,
    }));
    mockedJobService.getJobs.mockResolvedValue(mockJobsResponse(elevenJobs));

    render(<HomeJobsOfDay />);

    await screen.findByText("Extra Role 0");
    expect(screen.queryByText("Extra Role 10")).not.toBeInTheDocument();
  });

  it("caps AI recommendations at 10 cards even if the API returns more", async () => {
    authState = { isAuthenticated: true, user: { roles: ["ROLE_CANDIDATE"] }, isLoading: false };
    const elevenRecommendations = Array.from({ length: 11 }, (_, i) =>
      mockRecommendation(`Recommended Role ${i}`),
    );
    mockedJobService.getRecommendedJobs.mockResolvedValue({
      data: { recommendations: elevenRecommendations, totalResults: 11, processingTime: "N/A" },
    });

    render(<HomeJobsOfDay />);

    await screen.findByText("Recommended Role 0");
    expect(screen.queryByText("Recommended Role 10")).not.toBeInTheDocument();
  });

  it("renders the job's shortDescription on the card", async () => {
    authState = { isAuthenticated: false, user: null, isLoading: false };
    mockedJobService.getJobs.mockResolvedValue(
      mockJobsResponse([
        {
          postId: "job-5",
          title: "Described Role",
          shortDescription: "Tuyển SENIOR Developer tham gia phát triển dự án hệ thống nội bộ.",
          salaryMin: 1,
          salaryMax: 2,
          skillNames: [],
          company,
        },
      ]),
    );

    render(<HomeJobsOfDay />);

    expect(
      await screen.findByText("Tuyển SENIOR Developer tham gia phát triển dự án hệ thống nội bộ."),
    ).toBeInTheDocument();
  });
});
