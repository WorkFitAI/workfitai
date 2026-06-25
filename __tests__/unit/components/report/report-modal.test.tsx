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

    expect(screen.getByText(/Senior Developer/i)).toBeInTheDocument();
    expect(screen.getByText(/Tech Corp/i)).toBeInTheDocument();
  });

  /* =========================
     HEADER
  ========================= */
  it("displays report details title", () => {
    const report = createMockReport();

    render(<ReportModal report={report} onClose={mockOnClose} />);

    expect(screen.getByText(/Senior Developer/i)).toBeInTheDocument();
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
    expect(screen.getByText("by user123")).toBeInTheDocument();
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
    expect(screen.getByText(/by user1/i)).toBeInTheDocument();
    expect(screen.getByText(/by user2/i)).toBeInTheDocument();
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

    const formattedDate = testDate.toLocaleString("vi-VN");
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

    const scrollableDivs = container.querySelectorAll("[class*='overflow-y-auto']");
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

    expect(screen.getByText(/Senior Developer/i)).toBeInTheDocument();
  });

  /* =========================
     JOB SNAPSHOT DETAILS
  ========================= */
  it("displays job snapshot details (title, location, salary)", () => {
    const report = createMockReport({
      snapshot: {
        title: "Senior Developer",
        location: "San Francisco, CA",
        salaryMin: 120000,
        salaryMax: 180000,
        skills: "React, Node.js, TypeScript",
        description: "A challenging role for experienced developers",
        requirements: "5+ years experience",
        benefits: "Health insurance, 401k",
        responsibilities: "Lead development",
        snapshotId: "snapshot1",
        shortDescription: "Full-time position",
        currency: "USD",
        educationLevel: "Bachelor's",
        experienceLevel: "Senior",
        requiredExperience: "5 years",
        employmentType: "Full-time",
        companyName: "Tech Corp",
        reportedAt: new Date().toISOString(),
      },
    });

    render(<ReportModal report={report} onClose={mockOnClose} />);

    expect(screen.getByText(/Senior Developer/i)).toBeInTheDocument();
    expect(screen.getByText(/San Francisco, CA/i)).toBeInTheDocument();
    expect(screen.getByText(/\$120000 - \$180000/)).toBeInTheDocument();
    expect(screen.getByText(/React, Node.js, TypeScript/)).toBeInTheDocument();
  });

  it("displays all job details sections", () => {
    const report = createMockReport();

    render(<ReportModal report={report} onClose={mockOnClose} />);

    expect(screen.getByText(/Skills/i)).toBeInTheDocument();
    expect(screen.getByText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Requirements/i)).toBeInTheDocument();
    expect(screen.getByText(/Benefits/i)).toBeInTheDocument();
    expect(screen.getByText(/Responsibilities/i)).toBeInTheDocument();
  });

  it("displays activity count in report thread", () => {
    const report = createMockReport({
      reportCount: 3,
      reports: [
        createMockReportDetail({ reportId: "report1" }),
        createMockReportDetail({ reportId: "report2" }),
        createMockReportDetail({ reportId: "report3" }),
      ],
    });

    render(<ReportModal report={report} onClose={mockOnClose} />);

    expect(screen.getByText(/Activity \(3\)/)).toBeInTheDocument();
  });
});
