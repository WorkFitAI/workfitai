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
  snapshot: Snapshot;
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

export interface Snapshot {
  snapshotId: string;
  title: string;
  description: string;
  shortDescription: string;
  location: string;
  currency: string | null;
  salaryMin: number;
  salaryMax: number;
  requirements: string;
  benefits: string;
  responsibilities: string;
  educationLevel: string | null;
  experienceLevel: string | null;
  requiredExperience: string | null;
  employmentType: string | null;
  skills: string;
  companyName: string;
  reportedAt: string;
}