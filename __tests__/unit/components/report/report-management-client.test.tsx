import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, beforeEach, expect, vi } from "vitest";
import React from "react";
import ReportManagementClient from "@/components/report/ReportManagementClient";
import { reportService } from "@/lib/report/report-service";
import { jobService } from "@/lib/job/job-service";
import { useSearchParams, useRouter } from "next/navigation";
import { createMockReportData, createMockReportResponse } from "@/__tests__/mocks/reports";

// ================= MOCK =================
vi.mock("next/navigation");
vi.mock("@/lib/report/report-service");
vi.mock("@/lib/job/job-service");

vi.mock("@/components/report/ReportCard", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ report, onView, onLock, onChangeStatus }: any) =>
    React.createElement("div", { "data-testid": `report-card-${report.jobId}` }),
}));

vi.mock("@/components/report/Pagination", () => ({
  default: () => React.createElement("div", { "data-testid": "pagination" }),
}));

vi.mock("@/components/report/ReportModal", () => ({
  default: () => React.createElement("div", { "data-testid": "report-modal" }),
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

const mockedReportService = vi.mocked(reportService);
const mockedJobService = vi.mocked(jobService);
const mockedUseRouter = vi.mocked(useRouter);
const mockedUseSearchParams = vi.mocked(useSearchParams);

describe("ReportManagementClient", () => {
  const mockRouter = {
    push: vi.fn(),
  };

  const mockSearchParams = {
    get: vi.fn(),
    toString: vi.fn().mockReturnValue(""),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseRouter.mockReturnValue(mockRouter as unknown as ReturnType<typeof useRouter>);
    mockedUseSearchParams.mockReturnValue(mockSearchParams as unknown as ReturnType<typeof useSearchParams>);

    mockSearchParams.get.mockImplementation((key: string) => {
      const params: Record<string, string> = {
        page: "1",
        keyword: "",
        status: "",
      };
      return params[key] || null;
    });
  });

  /* =========================
     RENDER
  ========================= */
  it("renders report management header", async () => {
    mockedReportService.getReports.mockResolvedValue(
      createMockReportResponse({ data: createMockReportData({ result: [] }) })
    );

    render(<ReportManagementClient />);

    expect(await screen.findByText("Report Management")).toBeInTheDocument();
    expect(screen.getByText("Monitor and handle user reports")).toBeInTheDocument();
  });

  /* =========================
     FETCH REPORTS
  ========================= */
  it("fetches and displays reports on mount", async () => {
    const mockData = createMockReportData({
      result: [
        {
          jobId: "job1",
          reportCount: 2,
          companyName: "Company A",
          status: "PENDING",
          isDeleted: false,
          reports: [],
          snapshot: {
            snapshotId: "snapshot1",
            title: "Senior Developer",
            description: "A challenging role",
            shortDescription: "Full-time position",
            location: "San Francisco, CA",
            currency: "USD",
            salaryMin: 120000,
            salaryMax: 180000,
            requirements: "5+ years experience",
            benefits: "Health insurance, 401k",
            responsibilities: "Lead development",
            educationLevel: "Bachelor's",
            experienceLevel: "Senior",
            requiredExperience: "5 years",
            employmentType: "Full-time",
            skills: "React, Node.js",
            companyName: "Company A",
            reportedAt: new Date().toISOString(),
          }
        },
      ],
    });

    mockedReportService.getReports.mockResolvedValue(
      createMockReportResponse({ data: mockData })
    );

    render(<ReportManagementClient />);

    await waitFor(() => {
      expect(mockedReportService.getReports).toHaveBeenCalledWith("", "", 1);
    });
  });

  /* =========================
     EMPTY STATE
  ========================= */
  it("shows empty state when no reports found", async () => {
    mockedReportService.getReports.mockResolvedValue(
      createMockReportResponse({ data: createMockReportData({ result: [] }) })
    );

    render(<ReportManagementClient />);

    await waitFor(() => {
      expect(screen.getByText("No reports found")).toBeInTheDocument();
    });
  });

  /* =========================
     SEARCH
  ========================= */
  it("updates URL when searching", async () => {
    mockedReportService.getReports.mockResolvedValue(
      createMockReportResponse({ data: createMockReportData({ result: [] }) })
    );

    render(<ReportManagementClient />);

    const searchInput = screen.getByPlaceholderText("Search reports...");
    fireEvent.change(searchInput, { target: { value: "spam" } });

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalled();
    });
  });

  /* =========================
     FILTER BY STATUS
  ========================= */
  it("filters reports by status", async () => {
    mockedReportService.getReports.mockResolvedValue(
      createMockReportResponse({ data: createMockReportData({ result: [] }) })
    );

    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === "status") return "RESOLVED";
      return null;
    });

    render(<ReportManagementClient />);

    await waitFor(() => {
      expect(mockedReportService.getReports).toHaveBeenCalledWith(
        "",
        "RESOLVED",
        expect.any(Number)
      );
    });
  });

  /* =========================
     RESET FILTERS
  ========================= */
  it("resets filters when reset button clicked", async () => {
    mockedReportService.getReports.mockResolvedValue(
      createMockReportResponse({ data: createMockReportData({ result: [] }) })
    );

    render(<ReportManagementClient />);

    const resetButton = screen.getAllByRole("button").find(btn => btn.querySelector('svg[class*="RotateCcw"]') || btn.querySelector('svg[class*="rotate-ccw"]'));
    fireEvent.click(resetButton!);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith("/report");
    });
  });

  /* =========================
     LOCK JOB
  ========================= */
  it("locks job and resolves report when lock button clicked", async () => {
    const mockData = createMockReportData({
      result: [
        {
          jobId: "job1",
          reportCount: 1,
          companyName: "Company A",
          status: "PENDING",
          isDeleted: false,
          reports: [],
          snapshot: { 
            snapshotId: "snapshot1",
            title: "Senior Developer",
            description: "A challenging role",
            shortDescription: "Full-time position",
            location: "San Francisco, CA",
            currency: "USD",
            salaryMin: 120000,
            salaryMax: 180000,
            requirements: "5+ years experience",
            benefits: "Health insurance, 401k",
            responsibilities: "Lead development",
            educationLevel: "Bachelor's",
            experienceLevel: "Senior",
            requiredExperience: "5 years",
            employmentType: "Full-time",
            skills: "React, Node.js, TypeScript",
            companyName: "Tech Corp",
            reportedAt: new Date().toISOString(),
          },
        },
      ],
    });

    mockedReportService.getReports.mockResolvedValue(
      createMockReportResponse({ data: mockData })
    );
    mockedJobService.softDeleteForAdmin.mockResolvedValue(undefined);
    mockedReportService.updateReportStatus.mockResolvedValue({
      status: 200,
      message: "Status updated",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<ReportManagementClient />);

    await waitFor(() => {
      expect(screen.getByText("Senior Developer")).toBeInTheDocument();
      expect(screen.getByText("Company A")).toBeInTheDocument();
    });
  });

  /* =========================
     UPDATE STATUS
  ========================= */
  it("updates report status when status changed", async () => {
    mockedReportService.getReports.mockResolvedValue(
      createMockReportResponse({ data: createMockReportData({ result: [] }) })
    );
    mockedReportService.updateReportStatus.mockResolvedValue({
      status: 200,
      message: "Status updated",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    render(<ReportManagementClient />);

    await waitFor(() => {
      expect(mockedReportService.getReports).toHaveBeenCalled();
    });
  });

  /* =========================
     SEARCH & FILTER
  ========================= */
  it("refetches reports when keyword changes", async () => {
    mockedReportService.getReports.mockResolvedValue(
      createMockReportResponse({ data: createMockReportData({ result: [] }) })
    );

    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === "keyword") return "inappropriate";
      return null;
    });

    render(<ReportManagementClient />);

    await waitFor(() => {
      expect(mockedReportService.getReports).toHaveBeenCalledWith(
        "inappropriate",
        "",
        expect.any(Number)
      );
    });
  });

  /* =========================
     ERROR HANDLING
  ========================= */
  it("handles fetch error gracefully", async () => {
    mockedReportService.getReports.mockRejectedValue(
      new Error("Network error")
    );

    render(<ReportManagementClient />);

    await waitFor(() => {
      expect(mockedReportService.getReports).toHaveBeenCalled();
    });
  });

  it("handles lock error gracefully", async () => {
    mockedReportService.getReports.mockResolvedValue(
      createMockReportResponse({ data: createMockReportData({ result: [] }) })
    );
    mockedJobService.softDeleteForAdmin.mockRejectedValue(
      new Error("Permission denied")
    );

    render(<ReportManagementClient />);

    await waitFor(() => {
      expect(mockedReportService.getReports).toHaveBeenCalled();
    });
  });

  /* =========================
     PAGINATION
  ========================= */
  it("respects pagination from URL params", async () => {
    mockedReportService.getReports.mockResolvedValue(
      createMockReportResponse({ data: createMockReportData({ result: [] }) })
    );

    mockSearchParams.get.mockImplementation((key: string) => {
      if (key === "page") return "2";
      return null;
    });

    render(<ReportManagementClient />);

    await waitFor(() => {
      expect(mockedReportService.getReports).toHaveBeenCalledWith("", "", 2);
    });
  });

  /* =========================
     MULTIPLE REPORTS
  ========================= */
  it("displays multiple reports in list", async () => {
    const mockData = createMockReportData({
      result: [
        {
          jobId: "job1",
          reportCount: 2,
          companyName: "Company A",
          status: "PENDING",
          isDeleted: false,
          reports: [],
          snapshot: {
            snapshotId: "snapshot1",
            title: "Senior Developer",
            description: "A challenging role",
            shortDescription: "Full-time position",
            location: "San Francisco, CA",
            currency: "USD",
            salaryMin: 120000,
            salaryMax: 180000,
            requirements: "5+ years experience",
            benefits: "Health insurance",
            responsibilities: "Lead development",
            educationLevel: "Bachelor's",
            experienceLevel: "Senior",
            requiredExperience: "5 years",
            employmentType: "Full-time",
            skills: "React, Node.js",
            companyName: "Company A",
            reportedAt: new Date().toISOString(),
          },
        },
        {
          jobId: "job2",
          reportCount: 1,
          companyName: "Company B",
          status: "IN_PROGRESS",
          isDeleted: false,
          reports: [],
          snapshot: {
            snapshotId: "snapshot2",
            title: "Frontend Engineer",
            description: "Frontend role",
            shortDescription: "Contract position",
            location: "New York, NY",
            currency: "USD",
            salaryMin: 100000,
            salaryMax: 150000,
            requirements: "3+ years experience",
            benefits: "Remote work",
            responsibilities: "Build UI",
            educationLevel: "Bachelor's",
            experienceLevel: "Mid-level",
            requiredExperience: "3 years",
            employmentType: "Contract",
            skills: "React, Vue",
            companyName: "Company B",
            reportedAt: new Date().toISOString(),
          },
        },
      ],
    });

    mockedReportService.getReports.mockResolvedValue(
      createMockReportResponse({ data: mockData })
    );

    render(<ReportManagementClient />);

    await waitFor(() => {
      expect(screen.getByText("Senior Developer")).toBeInTheDocument();
      expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
      expect(screen.getByText("Company A")).toBeInTheDocument();
      expect(screen.getByText("Company B")).toBeInTheDocument();
    });
  });
});
