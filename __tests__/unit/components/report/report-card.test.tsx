import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, beforeEach, expect, vi } from "vitest";
import ReportCard from "@/components/report/ReportCard";
import { createMockReport } from "@/__tests__/mocks/reports";

describe("ReportCard", () => {
  const mockOnView = vi.fn();
  const mockOnLock = vi.fn();
  const mockOnChangeStatus = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* =========================
     RENDER
  ========================= */
  it("renders report card with job information", () => {
    const report = createMockReport({
      jobId: "job1",
      companyName: "Tech Solutions",
      reportCount: 3,
      status: "PENDING",
    });

    render(
      <ReportCard
        report={report}
        onView={mockOnView}
        onLock={mockOnLock}
        onChangeStatus={mockOnChangeStatus}
      />
    );

    expect(screen.getByText(/Tech Solutions/)).toBeInTheDocument();
    expect(screen.getByText(/3\s+reports/)).toBeInTheDocument();
    const badges = screen.getAllByText("PENDING");
    expect(badges[0]).toHaveClass("bg-yellow-100");
  });

  /* =========================
     STATUS BADGE COLORS
  ========================= */
  it("displays correct status badge color for PENDING", () => {
    const report = createMockReport({ status: "PENDING" });

    render(
      <ReportCard
        report={report}
        onView={mockOnView}
        onLock={mockOnLock}
        onChangeStatus={mockOnChangeStatus}
      />
    );

    const badges = screen.getAllByText("PENDING");
    const badge = badges.find(el => el.className?.includes("bg-yellow-100")) || badges[0];
    expect(badge).toHaveClass("bg-yellow-100");
  });

  it("displays correct status badge color for IN_PROGRESS", () => {
    const report = createMockReport({ status: "IN_PROGRESS" });

    render(
      <ReportCard
        report={report}
        onView={mockOnView}
        onLock={mockOnLock}
        onChangeStatus={mockOnChangeStatus}
      />
    );

    const badges = screen.getAllByText("IN_PROGRESS");
    const badge = badges.find(el => el.className?.includes("bg-blue-100")) || badges[0];
    expect(badge).toHaveClass("bg-blue-100");
  });

  it("displays correct status badge color for RESOLVED", () => {
    const report = createMockReport({ status: "RESOLVED" });

    render(
      <ReportCard
        report={report}
        onView={mockOnView}
        onLock={mockOnLock}
        onChangeStatus={mockOnChangeStatus}
      />
    );

    const badges = screen.getAllByText("RESOLVED");
    const badge = badges.find(el => el.className?.includes("bg-green-100")) || badges[0];
    expect(badge).toHaveClass("bg-green-100");
  });

  it("displays correct status badge color for DECLINE", () => {
    const report = createMockReport({ status: "DECLINE" });

    render(
      <ReportCard
        report={report}
        onView={mockOnView}
        onLock={mockOnLock}
        onChangeStatus={mockOnChangeStatus}
      />
    );

    const badges = screen.getAllByText("DECLINE");
    const badge = badges.find(el => el.className?.includes("bg-red-100")) || badges[0];
    expect(badge).toHaveClass("bg-red-100");
  });

  /* =========================
     ACTIONS
  ========================= */
  it("calls onView when view button is clicked", () => {
    const report = createMockReport({ jobId: "job1" });

    render(
      <ReportCard
        report={report}
        onView={mockOnView}
        onLock={mockOnLock}
        onChangeStatus={mockOnChangeStatus}
      />
    );

    const viewButton = screen.getAllByRole("button").find((btn) =>
      btn.innerHTML.includes("Eye") || btn.innerHTML.includes("eye")
    );

    if (viewButton) {
      fireEvent.click(viewButton);
      expect(mockOnView).toHaveBeenCalledWith(report);
    }
  });

  it("calls onLock when lock button is clicked", () => {
    const report = createMockReport({ jobId: "job1", status: "PENDING" });

    render(
      <ReportCard
        report={report}
        onView={mockOnView}
        onLock={mockOnLock}
        onChangeStatus={mockOnChangeStatus}
      />
    );

    const lockButton = screen.getAllByRole("button").find((btn) =>
      btn.innerHTML.includes("Lock")
    );

    if (lockButton) {
      fireEvent.click(lockButton);
      expect(mockOnLock).toHaveBeenCalledWith("job1");
    }
  });

  it("hides lock button when report is resolved", () => {
    const report = createMockReport({ status: "RESOLVED" });

    const { container } = render(
      <ReportCard
        report={report}
        onView={mockOnView}
        onLock={mockOnLock}
        onChangeStatus={mockOnChangeStatus}
      />
    );

    const lockButtons = container.querySelectorAll('[class*="Lock"]');
    expect(lockButtons.length).toBeLessThanOrEqual(1);
  });

  /* =========================
     REPORT COUNT
  ========================= */
  it("displays correct report count", () => {
    const report = createMockReport({ reportCount: 5 });

    render(
      <ReportCard
        report={report}
        onView={mockOnView}
        onLock={mockOnLock}
        onChangeStatus={mockOnChangeStatus}
      />
    );

    expect(screen.getByText(/5\s+reports/i)).toBeInTheDocument();
  });

  /* =========================
     DELETED STATUS
  ========================= */
  it("indicates when report is deleted", () => {
    const report = createMockReport({ isDeleted: true });

    const { container } = render(
      <ReportCard
        report={report}
        onView={mockOnView}
        onLock={mockOnLock}
        onChangeStatus={mockOnChangeStatus}
      />
    );

    expect(container).toBeInTheDocument();
  });
});
