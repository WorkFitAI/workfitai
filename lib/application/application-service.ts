import { apiClient } from "@/lib/api-client";
import { getAccessToken } from "@/lib/auth/token-store";
import { getDeviceId } from "@/lib/auth/device-fingerprint";
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

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9085";

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

    return apiClient.get<ApiResponse<ApplicationListData>>(
      `/application/my?${params.toString()}`,
    );
  },

  /**
   * GET /application/{applicationId}
   * Get full application detail (candidate must own it).
   */
  async getApplicationById(
    applicationId: string,
  ): Promise<ApiResponse<ApplicationDetail>> {
    return apiClient.get<ApiResponse<ApplicationDetail>>(
      `/application/${applicationId}`,
    );
  },

  /**
   * GET /application/my/count
   * Get total count of candidate's applications.
   */
  async getApplicationCount(): Promise<ApiResponse<ApplicationCount>> {
    return apiClient.get<ApiResponse<ApplicationCount>>(
      `/application/my/count`,
    );
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
    return apiClient.get<ApiResponse<ApplicationCheck>>(
      `/application/check?jobId=${jobId}`,
    );
  },

  /**
   * GET /application/{applicationId}/history
   * Get full status change history for an application.
   * Backend returns data as a plain array: StatusHistoryItem[]
   */
  async getStatusHistory(
    applicationId: string,
  ): Promise<ApiResponse<StatusHistoryItem[]>> {
    return apiClient.get<ApiResponse<StatusHistoryItem[]>>(
      `/application/${applicationId}/history`,
    );
  },

  /**
   * GET /application/{applicationId}/notes
   * Get candidate-visible notes for an application.
   */
  async getVisibleNotes(
    applicationId: string,
  ): Promise<ApiResponse<{ notes: CandidateNote[] }>> {
    return apiClient.get<ApiResponse<{ notes: CandidateNote[] }>>(
      `/application/${applicationId}/notes`,
    );
  },

  /**
   * GET /application/{applicationId}/cv/download
   * Download the uploaded CV as a PDF file.
   *
   * Uses raw fetch (NOT apiClient) because the response is a binary blob,
   * not JSON. The Bearer token from the in-memory token store is attached
   * so the request is properly authenticated.
   *
   * Triggers a browser file-save dialog with the original filename when
   * provided, falling back to "cv-{applicationId}.pdf".
   */
  async downloadCv(applicationId: string, fileName?: string): Promise<void> {
    const token = getAccessToken();
    const deviceId = getDeviceId();

    const headers: Record<string, string> = { "X-Device-Id": deviceId };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(
      `${API_BASE}/application/${applicationId}/cv/download`,
      { method: "GET", headers, credentials: "include" },
    );

    if (!response.ok) {
      throw new Error(`CV download failed (${response.status})`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName ?? `cv-${applicationId}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
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
