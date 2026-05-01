import { apiClient } from "@/lib/api-client";
import { ReportData } from "@/types/report";
import { ApiResponse } from "@/types/response";

const buildReportFilter = (keyword?: string, status?: string) => {
  const conditions: string[] = [];

  if (keyword) {
    conditions.push(`reportContent~~'${keyword}'`);
  }

  if (status) {
    conditions.push(`status:'${status}'`);
  }

  return conditions.join(" and ");
};

export const reportService = {
  async submitReport(
    jobId: string,
    content: string,
    images: File[]
  ): Promise<ApiResponse<string>> {
    const payload = {
      reportContent: content,
      jobId: jobId,
    };

    const formData = new FormData();

    formData.append(
      "data",
      new Blob([JSON.stringify(payload)], {
        type: "application/json",
      })
    );

    images.forEach((file) => {
      formData.append("files", file);
    });

    const res = await apiClient.upload<ApiResponse<string>>(
      "/job/candidate/reports",
      formData
    ) as unknown as ApiResponse<string>;

    if (!res.status || res.status >= 400) {
      throw new Error("Failed to submit report");
    }

    return res;
  },

  async getReports(
    keyword?: string,
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<ReportData>> {
    const params = new URLSearchParams();

    const filter = buildReportFilter(keyword, status);

    if (filter) {
      params.append("filter", filter);
    }

    params.append("page", (page - 1).toString());
    params.append("size", limit.toString());
    const res = await apiClient.get<ApiResponse<ReportData>>(
      `/job/admin/reports/grouped?${params.toString()}`
    );

    if (!res.status || res.status == 409) {
      throw new Error(res.message || "Failed to fetch reports");
    }

    if (!res.status || res.status >= 400) {
      throw new Error(res.message || "Failed to fetch reports");
    }

    return res;
  },

  async updateReportStatus(
    jobId: string,
    newStatus: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "DECLINE"
  ): Promise<ApiResponse<string>> {
    const res = await apiClient.put<ApiResponse<string>>(
      `/job/admin/reports/${jobId}/status/${newStatus}`
    );
    if (!res.status || res.status >= 400) {
      throw new Error(res.message || "Failed to update report status");
    }
    return res;
  }
};