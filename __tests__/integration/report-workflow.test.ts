import { describe, it, beforeEach, expect, vi } from "vitest";
import { reportService } from "@/lib/report/report-service";
import { jobService } from "@/lib/job/job-service";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client");

const mockedApiClient = vi.mocked(apiClient);

describe("Report Management Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* =========================
     WORKFLOW: Submit and Review Report
  ========================= */
  describe("Report Submission and Review Workflow", () => {
    it("should complete full workflow: submit -> fetch -> update status -> resolve", async () => {
      // Step 1: Submit a report
      const mockFile = new File(["test"], "evidence.jpg", { type: "image/jpeg" });
      const submitResponse = {
        status: 200,
        message: "Report submitted",
        data: "report123",
      };

      mockedApiClient.upload.mockResolvedValue(submitResponse);

      const submitResult = await reportService.submitReport(
        "job1",
        "This job posting is inappropriate",
        [mockFile]
      );

      expect(submitResult.status).toBe(200);
      expect(mockedApiClient.upload).toHaveBeenCalled();

      // Step 2: Fetch reports to see the submitted report
      const fetchResponse = {
        status: 200,
        message: "Reports fetched",
        data: {
          result: [
            {
              jobId: "job1",
              reportCount: 1,
              companyName: "Test Company",
              status: "PENDING",
              isDeleted: false,
              reports: [
                {
                  reportId: "report123",
                  reportContent: "This job posting is inappropriate",
                  status: "PENDING",
                  jobId: "job1",
                  createdBy: "user1",
                  imageUrls: ["https://example.com/evidence.jpg"],
                  createdDate: new Date().toISOString(),
                },
              ],
            },
          ],
          meta: {
            page: 0,
            pageSize: 10,
            pages: 1,
            total: 1,
          },
        },
      };

      mockedApiClient.get.mockResolvedValue(fetchResponse);

      const reports = await reportService.getReports();
      expect(reports.data.result).toHaveLength(1);
      expect(reports.data.result[0].status).toBe("PENDING");

      // Step 3: Update report status to IN_PROGRESS
      const updateResponse = {
        status: 200,
        message: "Status updated",
        data: "success",
      };

      mockedApiClient.put.mockResolvedValue(updateResponse);

      await reportService.updateReportStatus("job1", "IN_PROGRESS");
      expect(mockedApiClient.put).toHaveBeenCalledWith(
        "/job/admin/reports/job1/status/IN_PROGRESS"
      );

      // Step 4: Resolve the report by locking the job
      const lockResponse = {
        status: 200,
        message: "Job locked",
      };

      mockedApiClient.put.mockResolvedValue(lockResponse);

      await reportService.updateReportStatus("job1", "RESOLVED");
      expect(mockedApiClient.put).toHaveBeenCalledWith(
        "/job/admin/reports/job1/status/RESOLVED"
      );
    });
  });

  /* =========================
     WORKFLOW: Multiple Reports on Same Job
  ========================= */
  describe("Multiple Reports on Same Job", () => {
    it("should handle multiple reports on the same job", async () => {
      const response = {
        status: 200,
        message: "Reports fetched",
        data: {
          result: [
            {
              jobId: "job1",
              reportCount: 3,
              companyName: "Company A",
              status: "IN_PROGRESS",
              isDeleted: false,
              reports: [
                {
                  reportId: "report1",
                  reportContent: "Reason 1",
                  status: "PENDING",
                  jobId: "job1",
                  createdBy: "user1",
                  imageUrls: [],
                  createdDate: new Date().toISOString(),
                },
                {
                  reportId: "report2",
                  reportContent: "Reason 2",
                  status: "PENDING",
                  jobId: "job1",
                  createdBy: "user2",
                  imageUrls: [],
                  createdDate: new Date().toISOString(),
                },
                {
                  reportId: "report3",
                  reportContent: "Reason 3",
                  status: "PENDING",
                  jobId: "job1",
                  createdBy: "user3",
                  imageUrls: [],
                  createdDate: new Date().toISOString(),
                },
              ],
            },
          ],
          meta: {
            page: 0,
            pageSize: 10,
            pages: 1,
            total: 1,
          },
        },
      };

      mockedApiClient.get.mockResolvedValue(response);

      const reports = await reportService.getReports();
      expect(reports.data.result[0].reportCount).toBe(3);
      expect(reports.data.result[0].reports).toHaveLength(3);
    });
  });

  /* =========================
     WORKFLOW: Search and Filter Reports
  ========================= */
  describe("Search and Filter Reports", () => {
    it("should filter reports by keyword and status", async () => {
      const response = {
        status: 200,
        message: "Reports fetched",
        data: {
          result: [
            {
              jobId: "job1",
              reportCount: 2,
              companyName: "Company A",
              status: "PENDING",
              isDeleted: false,
              reports: [],
            },
          ],
          meta: {
            page: 0,
            pageSize: 10,
            pages: 1,
            total: 1,
          },
        },
      };

      mockedApiClient.get.mockResolvedValue(response);

      // Search for "spam" with PENDING status
      await reportService.getReports("spam", "PENDING", 1, 10);

      // URLSearchParams encodes the filter value — verify the raw filter parts are present
      const calledUrl: string = mockedApiClient.get.mock.calls[0][0] as string;
      const urlParams = new URLSearchParams(calledUrl.split("?")[1]);
      expect(urlParams.get("filter")).toBe("reportContent~~'spam' and status:'PENDING'");
      expect(urlParams.get("page")).toBe("0");
      expect(urlParams.get("size")).toBe("10");
    });
  });

  /* =========================
     WORKFLOW: Status Transitions
  ========================= */
  describe("Report Status Transitions", () => {
    it("should handle valid status transitions", async () => {
      const statuses: Array<"PENDING" | "IN_PROGRESS" | "RESOLVED" | "DECLINE"> = [
        "PENDING",
        "IN_PROGRESS",
        "RESOLVED",
      ];

      mockedApiClient.put.mockResolvedValue({
        status: 200,
        message: "Status updated",
        data: "success",
      });

      for (const status of statuses) {
        await reportService.updateReportStatus("job1", status);
        expect(mockedApiClient.put).toHaveBeenCalledWith(
          `/job/admin/reports/job1/status/${status}`
        );
      }
    });

    it("should handle decline status", async () => {
      mockedApiClient.put.mockResolvedValue({
        status: 200,
        message: "Status updated",
        data: "success",
      });

      await reportService.updateReportStatus("job1", "DECLINE");

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        "/job/admin/reports/job1/status/DECLINE"
      );
    });
  });

  /* =========================
     WORKFLOW: Pagination
  ========================= */
  describe("Report Pagination", () => {
    it("should fetch reports with pagination", async () => {
      const response = {
        status: 200,
        message: "Reports fetched",
        data: {
          result: Array.from({ length: 10 }, (_, i) => ({
            jobId: `job${i}`,
            reportCount: 1,
            companyName: `Company ${i}`,
            status: "PENDING",
            isDeleted: false,
            reports: [],
          })),
          meta: {
            page: 1,
            pageSize: 10,
            pages: 5,
            total: 50,
          },
        },
      };

      mockedApiClient.get.mockResolvedValue(response);

      const reports = await reportService.getReports(undefined, undefined, 2, 10);

      expect(reports.data.meta.pages).toBe(5);
      expect(reports.data.meta.total).toBe(50);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining("page=1&size=10")
      );
    });
  });

  /* =========================
     WORKFLOW: Error Handling
  ========================= */
  describe("Error Handling in Report Workflow", () => {
    it("should handle submission errors", async () => {
      mockedApiClient.upload.mockResolvedValue({
        status: 500,
        message: "Server error",
      });

      await expect(
        reportService.submitReport("job1", "report", [])
      ).rejects.toThrow();
    });

    it("should handle fetch errors", async () => {
      mockedApiClient.get.mockResolvedValue({
        status: 400,
        message: "Bad request",
      });

      await expect(reportService.getReports()).rejects.toThrow();
    });

    it("should handle status update errors", async () => {
      mockedApiClient.put.mockResolvedValue({
        status: 401,
        message: "Unauthorized",
      });

      await expect(
        reportService.updateReportStatus("job1", "RESOLVED")
      ).rejects.toThrow();
    });
  });

  /* =========================
     WORKFLOW: Deleted Jobs
  ========================= */
  describe("Handling Deleted Jobs in Reports", () => {
    it("should properly flag deleted jobs in reports", async () => {
      const response = {
        status: 200,
        message: "Reports fetched",
        data: {
          result: [
            {
              jobId: "job1",
              reportCount: 1,
              companyName: "Deleted Company",
              status: "RESOLVED",
              isDeleted: true,
              reports: [],
            },
          ],
          meta: {
            page: 0,
            pageSize: 10,
            pages: 1,
            total: 1,
          },
        },
      };

      mockedApiClient.get.mockResolvedValue(response);

      const reports = await reportService.getReports();
      expect(reports.data.result[0].isDeleted).toBe(true);
    });
  });
});
