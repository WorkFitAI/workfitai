import { Report, ReportDetail, ReportData, Snapshot } from "@/types/report";
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

export const createMockSnapshot = (overrides?: Partial<Snapshot>): Snapshot => ({
  snapshotId: "snapshot1",
  title: "Senior Developer",
  description: "A challenging role for experienced developers",
  shortDescription: "Full-time Senior Developer position",
  location: "San Francisco, CA",
  currency: "USD",
  salaryMin: 120000,
  salaryMax: 180000,
  requirements: "5+ years experience with React and Node.js",
  benefits: "Health insurance, 401k, remote work",
  responsibilities: "Lead development of new features",
  educationLevel: "Bachelor's",
  experienceLevel: "Senior",
  requiredExperience: "5 years",
  employmentType: "Full-time",
  skills: "React, Node.js, TypeScript, PostgreSQL",
  companyName: "Tech Corp",
  reportedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockReport = (overrides?: Partial<Report>): Report => ({
  jobId: "job1",
  reportCount: 1,
  companyName: "Tech Corp",
  status: "PENDING",
  isDeleted: false,
  reports: [createMockReportDetail()],
  snapshot: createMockSnapshot(),
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
