import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FeaturedJobs from "@/components/jobs/featured-jobs";
import { getFeaturedJobs } from "@/app/api/job-api";
import "@testing-library/jest-dom/vitest";
import { mockJobApiResponse } from "@/__tests__/mocks/jobs";

// 1. Mock API
vi.mock("@/app/api/job-api", () => ({
  getFeaturedJobs: vi.fn(),
}));

// Mock Lucide Icons để tránh lỗi render SVG
vi.mock("lucide-react", () => ({
  ChevronLeft: () => <div data-testid="chevron-left" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
  MapPin: () => <svg data-testid="icon" />,
  Clock: () => <svg data-testid="icon" />,
  Briefcase: () => <svg data-testid="icon" />,
}));

describe("FeaturedJobs Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should display the correct title and call the API on mount", async () => {
    
    vi.mocked(getFeaturedJobs).mockResolvedValue(mockJobApiResponse);

    render(<FeaturedJobs />);

    expect(screen.getByText("Featured Jobs")).toBeInTheDocument();
    
    await waitFor(() => {
      expect(getFeaturedJobs).toHaveBeenCalledWith(1, 4);
    });
  });

  it("Should render the correct list of jobs after successful fetch", async () => {
    vi.mocked(getFeaturedJobs).mockResolvedValue(mockJobApiResponse);

    render(<FeaturedJobs />);
    for (const job of mockJobApiResponse.data.result) {
      expect(await screen.findByText(job.title)).toBeInTheDocument();
    }
  });

  it("Should handle pagination when clicking the Next button", async () => {
    vi.mocked(getFeaturedJobs).mockResolvedValue(mockJobApiResponse);

    render(<FeaturedJobs />);

    // Lấy nút Next (nút thứ 2 trong phần pagination)
    const buttons = screen.getAllByRole("button");
    const nextButton = buttons[1]; 
    
    fireEvent.click(nextButton);

    await waitFor(() => {
      // Kiểm tra API được gọi lại với page = 2
      expect(getFeaturedJobs).toHaveBeenCalledWith(2, 4);
    });
  });

  it("Should have the Previous button enabled based on the current page", async () => {
    vi.mocked(getFeaturedJobs).mockResolvedValue(mockJobApiResponse);
    
    render(<FeaturedJobs />);

    const buttons = screen.getAllByRole("button");
    const prevButton = buttons[0];

    // Với code hiện tại (page=1 và disabled={page === 0}), nút này sẽ KHÔNG bị disable
    expect(prevButton).not.toBeDisabled(); 
  });
});