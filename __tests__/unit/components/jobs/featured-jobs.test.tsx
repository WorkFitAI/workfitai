import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FeaturedJobs from "@/components/jobs/featured-jobs";
import { jobService } from "@/lib/job/job-service";
import "@testing-library/jest-dom/vitest";
import { mockJobApiResponse } from "@/__tests__/mocks/jobs";

vi.mock("@/lib/job/job-service", () => ({
  jobService: {
    getFeaturedJobs: vi.fn(),
  },
}));

// Mock icon (OK rồi giữ nguyên)
vi.mock("lucide-react", () => ({
  ChevronLeft: () => <div data-testid="chevron-left" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
  MapPin: () => <svg data-testid="icon" />,
  Clock: () => <svg data-testid="icon" />,
  Briefcase: () => <svg data-testid="icon" />,
}));

const mockedJobService = vi.mocked(jobService);

describe("FeaturedJobs Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* =========================
     TITLE + API CALL
  ========================= */
  it("Should display title and call the API on mount", async () => {
    mockedJobService.getFeaturedJobs.mockResolvedValue(mockJobApiResponse);

    render(<FeaturedJobs />);

    expect(screen.getByText(/featured jobs/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedJobService.getFeaturedJobs).toHaveBeenCalledWith(1, 4);
    });
  });

  /* =========================
     RENDER LIST
  ========================= */
  it("Should render the correct list of jobs after fetch", async () => {
    mockedJobService.getFeaturedJobs.mockResolvedValue(mockJobApiResponse);

    render(<FeaturedJobs />);

    for (const job of mockJobApiResponse.data.result) {
      expect(await screen.findByText(job.title)).toBeInTheDocument();
    }
  });

  /* =========================
     PAGINATION NEXT
  ========================= */
  it("Should handle pagination when clicking Next", async () => {
    mockedJobService.getFeaturedJobs.mockResolvedValue(mockJobApiResponse);

    render(<FeaturedJobs />);

    // Đợi data render xong trước
    await screen.findByText(mockJobApiResponse.data.result[0].title);

    // tìm nút next bằng testid/icon
    const nextBtn = screen.getByTestId("chevron-right").closest("button");

    if (nextBtn) fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockedJobService.getFeaturedJobs).toHaveBeenCalledWith(2, 4);
    });
  });

  /* =========================
     PREVIOUS BUTTON
  ========================= */
  it("Should enable Previous button correctly", async () => {
    mockedJobService.getFeaturedJobs.mockResolvedValue(mockJobApiResponse);

    render(<FeaturedJobs />);

    await screen.findByText(mockJobApiResponse.data.result[0].title);

    const prevBtn = screen.getByTestId("chevron-left").closest("button");

    expect(prevBtn).not.toBeDisabled();
  });
});