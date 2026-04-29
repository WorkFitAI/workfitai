import { Report, ReportDetail, ReportData } from "@/types/report";
import { ApiResponse } from "@/types/response";

export const createMockReportDetail = (overrides?: Partial<ReportDetail>): ReportDetail => ({
  reportId: "report1",
  reportContent: "This is inappropriate content",
  status: "PENDING",
  jobId: "job1",
  createdBy: "user123",
  imageUrls: ["https://example.com/image1.jpg"],
  createdDate: new Date().toISOString(),
  ...overrides,
});

export const createMockReport = (overrides?: Partial<Report>): Report => ({
  jobId: "job1",
  reportCount: 1,
  companyName: "Tech Corp",
  status: "PENDING",
  isDeleted: false,
  reports: [createMockReportDetail()],
  ...overrides,
});

export const createMockReportData = (overrides?: Partial<ReportData>): ReportData => ({
  result: [createMockReport()],
  meta: {
    page: 0,
    pageSize: 10,
    pages: 1,
    total: 1,
  },
  ...overrides,
});

export const createMockReportResponse = (
  overrides?: Partial<ApiResponse<ReportData>>
): ApiResponse<ReportData> => ({
  status: 200,
  message: "Reports fetched successfully",
  data: createMockReportData(),
  ...overrides,
});
