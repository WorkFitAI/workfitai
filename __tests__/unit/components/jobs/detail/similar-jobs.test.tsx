import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SimilarJobs from "@/components/jobs/detail/similar-jobs";
import { getSimilarJobs } from "@/app/api/job-api";
import { mockJobs } from "@/__tests__/mocks/jobs";

// Mock API
vi.mock("@/app/api/job-api", () => ({
  getSimilarJobs: vi.fn(),
}));

// Mock SimilarJobCard
vi.mock("@/components/jobs/detail/similar-jobs-card", () => ({
  default: ({ title }: { title: string }) => <div>{ title } </div>,
}));

describe("<SimilarJobs />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display loading state initially", () => {
    vi.mocked(getSimilarJobs).mockResolvedValue({ data: [] });

    render(<SimilarJobs jobId="job-123" />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should call API with correct jobId", async () => {
    vi.mocked(getSimilarJobs).mockResolvedValue({ data: mockJobs });

    render(<SimilarJobs jobId="job-123" />);

    await waitFor(() => {
      expect(getSimilarJobs).toHaveBeenCalledWith("job-123");
    });
  });

  it("should render similar jobs after fetch success", async () => {
    vi.mocked(getSimilarJobs).mockResolvedValue({ data: mockJobs });

    render(<SimilarJobs jobId="job-123" />);

    expect(await screen.findByText("Frontend Developer")).toBeInTheDocument();
    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
  });

  it("should handle API error gracefully", async () => {
    vi.mocked(getSimilarJobs).mockRejectedValue(new Error("API error"));

    render(<SimilarJobs jobId="job-123" />);

    await waitFor(() => {
      expect(getSimilarJobs).toHaveBeenCalled();
    });

    expect(screen.queryByText("Frontend Developer")).not.toBeInTheDocument();
  });
});