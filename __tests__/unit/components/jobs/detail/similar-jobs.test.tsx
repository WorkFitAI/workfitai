import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SimilarJobs from "@/components/jobs/detail/similar-jobs";
import { jobService } from "@/lib/job/job-service";
import { mockJobs } from "@/__tests__/mocks/jobs";

vi.mock("@/lib/job/job-service", () => ({
  jobService: {
    getSimilarJobs: vi.fn(),
  },
}));

// mock card
vi.mock("@/components/jobs/detail/similar-jobs-card", () => ({
  default: ({ title }: { title: string }) => <div>{title}</div>,
}));

const mockedJobService = vi.mocked(jobService);

describe("<SimilarJobs />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  /* =========================
     LOADING
  ========================= */
  it("should display loading state initially", () => {
    // Promise không resolve → giữ loading
    mockedJobService.getSimilarJobs.mockReturnValue(
      new Promise(() => {})
    );

    render(<SimilarJobs jobId="job-123" />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  /* =========================
     CALL API
  ========================= */
  it("should call API with correct jobId", async () => {
    mockedJobService.getSimilarJobs.mockResolvedValue({
      data: mockJobs,
    });

    render(<SimilarJobs jobId="job-123" />);

    await waitFor(() => {
      expect(mockedJobService.getSimilarJobs).toHaveBeenCalledWith("job-123");
    });
  });

  /* =========================
     SUCCESS
  ========================= */
  it("should render similar jobs after fetch success", async () => {
    mockedJobService.getSimilarJobs.mockResolvedValue({
      data: mockJobs,
    });

    render(<SimilarJobs jobId="job-123" />);

    expect(await screen.findByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
  });

  /* =========================
     ERROR
  ========================= */
  it("should handle API error gracefully", async () => {
    mockedJobService.getSimilarJobs.mockRejectedValue(
      new Error("API error")
    );

    render(<SimilarJobs jobId="job-123" />);

    await waitFor(() => {
      expect(mockedJobService.getSimilarJobs).toHaveBeenCalled();
    });

    // không render data khi lỗi
    expect(screen.queryByText("Frontend Developer")).not.toBeInTheDocument();
  });
});