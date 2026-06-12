import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, beforeEach, expect, vi } from "vitest";
import ReportModal from "@/components/report/ReportModal";
import { createMockReport, createMockReportDetail } from "@/__tests__/mocks/reports";

describe("ReportModal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* =========================
     RENDER
  ========================= */
  it("renders nothing when report is null", () => {
    const { container } = render(
      <ReportModal report={null} onClose={mockOnClose} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders modal when report is provided", () => {
    const report = createMockReport({
      companyName: "Tech Corp",
    });

    render(<ReportModal report={report} onClose={mockOnClose} />);

    expect(screen.getByText(/Report Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Tech Corp/i)).toBeInTheDocument();
  });

  /* =========================
     HEADER
  ========================= */
  it("displays report details title", () => {
    const report = createMockReport();

    render(<ReportModal report={report} onClose={mockOnClose} />);

    expect(screen.getByText(/Report Details/i)).toBeInTheDocument();
  });

  it("displays company name", () => {
    const report = createMockReport({
      companyName: "Innovation Inc",
    });

    render(<ReportModal report={report} onClose={mockOnClose} />);

    expect(screen.getByText(/Innovation Inc/i)).toBeInTheDocument();
  });

  /* =========================
     CLOSE BUTTON
  ========================= */
  it("calls onClose when close button clicked", () => {
    const report = createMockReport();

    render(<ReportModal report={report} onClose={mockOnClose} />);

    const closeButton = screen.getByRole("button");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  /* =========================
     REPORT DETAILS
  ========================= */
  it("displays single report detail", () => {
    const report = createMockReport({
      reports: [
        createMockReportDetail({
          reportId: "report1",
          reportContent: "This job posting is spam",
          createdBy: "user123",
        }),
      ],
    });

    render(<ReportModal report={report} onClose={mockOnClose} />);

    expect(screen.getByText("This job posting is spam")).toBeInTheDocument();
    expect(screen.getByText("Created by: user123")).toBeInTheDocument();
  });

  it("displays multiple report details", () => {
    const report = createMockReport({
      reports: [
        createMockReportDetail({
          reportContent: "First report",
          createdBy: "user1",
        }),
        createMockReportDetail({
          reportContent: "Second report",
          createdBy: "user2",
        }),
      ],
    });

    render(<ReportModal report={report} onClose={mockOnClose} />);

    expect(screen.getByText(/First report/i)).toBeInTheDocument();
    expect(screen.getByText(/Second report/i)).toBeInTheDocument();
    expect(screen.getByText(/Created by: user1/i)).toBeInTheDocument();
    expect(screen.getByText(/Created by: user2/i)).toBeInTheDocument();
  });

  /* =========================
     CREATED DATE
  ========================= */
  it("displays created date formatted", () => {
    const testDate = new Date("2024-04-29");
    const report = createMockReport({
      reports: [
        createMockReportDetail({
          createdDate: testDate.toISOString(),
        }),
      ],
    });

    render(<ReportModal report={report} onClose={mockOnClose} />);

    const formattedDate = testDate.toLocaleString();
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });

  /* =========================
     IMAGES
  ========================= */
  it("displays images when present", () => {
    const report = createMockReport({
      reports: [
        createMockReportDetail({
          imageUrls: [
            "https://example.com/image1.jpg",
            "https://example.com/image2.jpg",
          ],
        }),
      ],
    });

    render(<ReportModal report={report} onClose={mockOnClose} />);

    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThanOrEqual(2);
  });

  it("does not render empty image URLs", () => {
    const report = createMockReport({
      reports: [
        createMockReportDetail({
          imageUrls: [],
        }),
      ],
    });

    const { container } = render(
      <ReportModal report={report} onClose={mockOnClose} />
    );

    const images = container.querySelectorAll("img");
    expect(images.length).toBe(0);
  });

  /* =========================
     MODAL STYLING
  ========================= */
  it("renders with backdrop", () => {
    const report = createMockReport();

    const { container } = render(
      <ReportModal report={report} onClose={mockOnClose} />
    );

    const backdrop = container.querySelector(".fixed.inset-0");
    expect(backdrop).toBeInTheDocument();
  });

  it("renders scrollable content", () => {
    const report = createMockReport({
      reports: Array.from({ length: 10 }, (_, i) =>
        createMockReportDetail({
          reportId: `report${i}`,
          reportContent: `Report content ${i}`,
        })
      ),
    });

    const { container } = render(
      <ReportModal report={report} onClose={mockOnClose} />
    );

    const scrollableDivs = container.querySelectorAll("[class*='max-h']");
    expect(scrollableDivs.length).toBeGreaterThan(0);
  });

  /* =========================
     EMPTY REPORTS
  ========================= */
  it("handles empty reports array", () => {
    const report = createMockReport({
      reports: [],
    });

    render(<ReportModal report={report} onClose={mockOnClose} />);

    expect(screen.getByText(/Report Details/i)).toBeInTheDocument();
  });
});
