import { describe, it, beforeEach, expect, vi } from "vitest";
import { reportService } from "@/lib/report/report-service";
import { apiClient } from "@/lib/api-client";

vi.mock("@/lib/api-client");

const mockedApiClient = vi.mocked(apiClient);

describe("reportService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* =========================
     SUBMIT REPORT
  ========================= */
  describe("submitReport", () => {
    it("should submit report with content and images", async () => {
      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const mockResponse = {
        status: 200,
        message: "Report submitted successfully",
        data: "report123",
      };

      mockedApiClient.upload.mockResolvedValue(mockResponse);

      const result = await reportService.submitReport("job1", "This is a report", [mockFile]);

      expect(result).toEqual(mockResponse);
      expect(mockedApiClient.upload).toHaveBeenCalledWith(
        "/job/candidate/reports",
        expect.any(FormData)
      );
    });

    it("should throw error when status is 400 or higher", async () => {
      const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const mockResponse = {
        status: 400,
        message: "Bad request",
      };

      mockedApiClient.upload.mockResolvedValue(mockResponse);

      await expect(
        reportService.submitReport("job1", "This is a report", [mockFile])
      ).rejects.toThrow("Failed to submit report");
    });

    it("should handle multiple images", async () => {
      const mockFile1 = new File(["test1"], "test1.jpg", { type: "image/jpeg" });
      const mockFile2 = new File(["test2"], "test2.jpg", { type: "image/jpeg" });
      const mockResponse = {
        status: 200,
        message: "Report submitted",
        data: "report123",
      };

      mockedApiClient.upload.mockResolvedValue(mockResponse);

      await reportService.submitReport("job1", "Multi image report", [mockFile1, mockFile2]);

      expect(mockedApiClient.upload).toHaveBeenCalled();
    });
  });

  /* =========================
     GET REPORTS
  ========================= */
  describe("getReports", () => {
    it("should fetch all reports with default pagination", async () => {
      const mockResponse = {
        status: 200,
        message: "Reports fetched",
        data: {
          result: [
            {
              jobId: "job1",
              reportCount: 2,
              companyName: "Tech Corp",
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

      mockedApiClient.get.mockResolvedValue(mockResponse);

      const result = await reportService.getReports();

      expect(result).toEqual(mockResponse);
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        "/job/admin/reports/grouped?page=0&size=10"
      );
    });

    it("should fetch reports with keyword filter", async () => {
      const mockResponse = {
        status: 200,
        message: "Reports fetched",
        data: {
          result: [],
          meta: { page: 0, pageSize: 10, pages: 0, total: 0 },
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      await reportService.getReports("spam", undefined, 1, 10);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining("filter=reportContent%7E%7E%27spam%27")
      );
    });

    it("should fetch reports with status filter", async () => {
      const mockResponse = {
        status: 200,
        message: "Reports fetched",
        data: {
          result: [],
          meta: { page: 0, pageSize: 10, pages: 0, total: 0 },
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      await reportService.getReports(undefined, "RESOLVED", 1, 10);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining("filter=status%3A%27RESOLVED%27")
      );
    });

    it("should fetch reports with both filters", async () => {
      const mockResponse = {
        status: 200,
        message: "Reports fetched",
        data: {
          result: [],
          meta: { page: 0, pageSize: 10, pages: 0, total: 0 },
        },
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      await reportService.getReports("spam", "PENDING", 2, 20);

      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining("filter=reportContent%7E%7E%27spam%27+and+status%3A%27PENDING%27")
      );
      expect(mockedApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining("page=1&size=20")
      );
    });

    it("should throw error on failed fetch", async () => {
      const mockResponse = {
        status: 500,
        message: "Server error",
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      await expect(reportService.getReports()).rejects.toThrow("Server error");
    });

    it("should throw error on 409 status", async () => {
      const mockResponse = {
        status: 409,
        message: "Conflict",
      };

      mockedApiClient.get.mockResolvedValue(mockResponse);

      await expect(reportService.getReports()).rejects.toThrow("Conflict");
    });
  });

  /* =========================
     UPDATE REPORT STATUS
  ========================= */
  describe("updateReportStatus", () => {
    it("should update report status to RESOLVED", async () => {
      const mockResponse = {
        status: 200,
        message: "Status updated",
        data: "success",
      };

      mockedApiClient.put.mockResolvedValue(mockResponse);

      const result = await reportService.updateReportStatus("job1", "RESOLVED");

      expect(result).toEqual(mockResponse);
      expect(mockedApiClient.put).toHaveBeenCalledWith(
        "/job/admin/reports/job1/status/RESOLVED"
      );
    });

    it("should update report status to IN_PROGRESS", async () => {
      const mockResponse = {
        status: 200,
        message: "Status updated",
        data: "success",
      };

      mockedApiClient.put.mockResolvedValue(mockResponse);

      await reportService.updateReportStatus("job1", "IN_PROGRESS");

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        "/job/admin/reports/job1/status/IN_PROGRESS"
      );
    });

    it("should update report status to PENDING", async () => {
      const mockResponse = {
        status: 200,
        message: "Status updated",
        data: "success",
      };

      mockedApiClient.put.mockResolvedValue(mockResponse);

      await reportService.updateReportStatus("job1", "PENDING");

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        "/job/admin/reports/job1/status/PENDING"
      );
    });

    it("should update report status to DECLINE", async () => {
      const mockResponse = {
        status: 200,
        message: "Status updated",
        data: "success",
      };

      mockedApiClient.put.mockResolvedValue(mockResponse);

      await reportService.updateReportStatus("job1", "DECLINE");

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        "/job/admin/reports/job1/status/DECLINE"
      );
    });

    it("should throw error on failed status update", async () => {
      const mockResponse = {
        status: 400,
        message: "Invalid status",
      };

      mockedApiClient.put.mockResolvedValue(mockResponse);

      await expect(
        reportService.updateReportStatus("job1", "RESOLVED")
      ).rejects.toThrow("Invalid status");
    });

    it("should throw generic error when no message provided", async () => {
      const mockResponse = {
        status: 400,
      };

      mockedApiClient.put.mockResolvedValue(mockResponse);

      await expect(
        reportService.updateReportStatus("job1", "RESOLVED")
      ).rejects.toThrow("Failed to update report status");
    });
  });
});
