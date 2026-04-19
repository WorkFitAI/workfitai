import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/types/response";
import {
  ApplicationListData,
  ApplicationDetail,
  ApplicationCount,
  ApplicationCheck,
  StatusHistoryItem,
  CandidateNote,
  ApplicationStatus,
  SubmitApplicationData,
} from "@/types/application";

export const applicationService = {
  /**
   * GET /application/my?page=&size=&status=
   * List all applications for the current candidate (paginated).
   */
  async getMyApplications(
    page = 0,
    size = 20,
    status?: ApplicationStatus,
    sortBy = "createdAt",
    sortDirection: "ASC" | "DESC" = "DESC",
  ): Promise<ApiResponse<ApplicationListData>> {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("size", String(size));
    params.append("sortBy", sortBy);
    params.append("sortDirection", sortDirection);
    if (status) params.append("status", status);

    const res = await apiClient.get<ApiResponse<ApplicationListData>>(
      `/application/my?${params.toString()}`,
    );
    return res;
  },

  /**
   * GET /application/{applicationId}
   * Get full application detail (candidate must own it).
   */
  async getApplicationById(
    applicationId: string,
  ): Promise<ApiResponse<ApplicationDetail>> {
    const res = await apiClient.get<ApiResponse<ApplicationDetail>>(
      `/application/${applicationId}`,
    );
    return res;
  },

  /**
   * GET /application/my/count
   * Get total count of candidate's applications.
   */
  async getApplicationCount(): Promise<ApiResponse<ApplicationCount>> {
    const res = await apiClient.get<ApiResponse<ApplicationCount>>(
      `/application/my/count`,
    );
    return res;
  },

  /**
   * DELETE /application/{applicationId}
   * Withdraw an application (soft delete — marks as WITHDRAWN).
   * Returns 204 No Content on success.
   */
  async withdrawApplication(applicationId: string): Promise<void> {
    await apiClient.delete<void>(`/application/${applicationId}`);
  },

  /**
   * GET /application/check?jobId=
   * Check if the candidate has already applied to a specific job.
   */
  async checkApplied(jobId: string): Promise<ApiResponse<ApplicationCheck>> {
    const res = await apiClient.get<ApiResponse<ApplicationCheck>>(
      `/application/check?jobId=${jobId}`,
    );
    return res;
  },

  /**
   * GET /application/{applicationId}/status-history
   * Get full status change history for an application.
   */
  async getStatusHistory(
    applicationId: string,
  ): Promise<ApiResponse<{ statusHistory: StatusHistoryItem[] }>> {
    const res = await apiClient.get<
      ApiResponse<{ statusHistory: StatusHistoryItem[] }>
    >(`/application/${applicationId}/status-history`);
    return res;
  },

  /**
   * GET /application/{applicationId}/notes
   * Get candidate-visible notes for an application.
   */
  async getVisibleNotes(
    applicationId: string,
  ): Promise<ApiResponse<{ notes: CandidateNote[] }>> {
    const res = await apiClient.get<ApiResponse<{ notes: CandidateNote[] }>>(
      `/application/${applicationId}/notes`,
    );
    return res;
  },

  /**
   * POST /application  (multipart/form-data)
   * Submit a new job application with CV upload.
   * Required: jobId (UUID), email (string), cvPdfFile (PDF ≤ 5 MB)
   * Optional: coverLetter (string, ≤ 5000 chars)
   *
   * Uses apiClient.upload() which deliberately omits Content-Type so the
   * browser sets the correct multipart/form-data boundary automatically.
   * Field names match the backend @Valid DTO: cvPdfFile, email.
   */
  async submitApplication(
    jobId: string,
    email: string,
    cvPdfFile: File,
    coverLetter?: string,
  ): Promise<ApiResponse<SubmitApplicationData>> {
    const formData = new FormData();
    formData.append("jobId", jobId);
    formData.append("email", email);
    formData.append("cvPdfFile", cvPdfFile);
    if (coverLetter) formData.append("coverLetter", coverLetter);

    return apiClient.upload<ApiResponse<SubmitApplicationData>>(
      `/application`,
      formData,
    );
  },
};
