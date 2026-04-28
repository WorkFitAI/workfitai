export interface ReportData {
  meta: ReportMeta;
  result: Report[];
}

export interface ReportMeta {
  page: number;
  pageSize: number;
  pages: number;
  total: number;
}

export interface Report {
  jobId: string;
  reportCount: number;
  companyName: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "DECLINE";
  isDeleted: boolean;
  reports: ReportDetail[];
}

export interface ReportDetail {
  reportId: string;
  reportContent: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "DECLINE";
  jobId: string;
  createdBy: string;
  imageUrls: string[];
  createdDate: string;
}