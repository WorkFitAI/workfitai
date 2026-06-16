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
  HRUser,
  ApplicationNote,
  JobApplicationCount,
  HRJobListData,
  CandidateListData,
  CandidateDetail,
  CvRankingData,
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
   * GET /application/{applicationId}/cv/download → Blob URL (for inline preview).
   * Caller must call URL.revokeObjectURL() when done to avoid memory leaks.
   */
  async fetchCvBlobUrl(applicationId: string): Promise<string> {
    const token = getAccessToken();
    const deviceId = getDeviceId();

    const headers: Record<string, string> = { "X-Device-Id": deviceId };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(
      `${API_BASE}/application/${applicationId}/cv/download`,
      { method: "GET", headers, credentials: "include" },
    );

    if (!response.ok) {
      throw new Error(`CV fetch failed (${response.status})`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
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

  // ─── HRM (HR Manager) methods ──────────────────────────────────────────────

  /**
   * GET /application/company/:companyNo?page=&size=&status=&assignedTo=&jobTitle=&keyword=
   * List all applications submitted to a company (HRM only).
   */
  async getCompanyApplications(
    companyNo: string,
    page = 0,
    size = 50,
    status?: ApplicationStatus,
    assignedTo?: string,
    jobTitle?: string,
    keyword?: string,
  ): Promise<ApiResponse<ApplicationListData>> {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("size", String(size));
    if (status) params.append("status", status);
    if (assignedTo) params.append("assignedTo", assignedTo);
    if (jobTitle) params.append("jobTitle", jobTitle);
    if (keyword) params.append("keyword", keyword);
    return apiClient.get<ApiResponse<ApplicationListData>>(
      `/application/company/${companyNo}?${params.toString()}`,
    );
  },

  /**
   * GET /application/company/:companyNo/hr-users
   * List all HR users belonging to the company (for assignment dropdown).
   */
  async getCompanyHRUsers(companyNo: string): Promise<ApiResponse<HRUser[]>> {
    return apiClient.get<ApiResponse<HRUser[]>>(
      `/application/company/${companyNo}/hr-users`,
    );
  },

  /**
   * PUT /application/:id/assign
   * Assign an application to a specific HR user by username.
   */
  async assignApplication(
    applicationId: string,
    assignedTo: string,
  ): Promise<ApiResponse<ApplicationDetail>> {
    return apiClient.put<ApiResponse<ApplicationDetail>>(
      `/application/${applicationId}/assign`,
      { assignedTo },
    );
  },

  /**
   * GET /application/assigned/:hrUsername?page=&size=
   * Get applications assigned to a specific HR user.
   */
  async getAssignedApplications(
    hrUsername: string,
    page = 0,
    size = 20,
  ): Promise<ApiResponse<ApplicationListData>> {
    return apiClient.get<ApiResponse<ApplicationListData>>(
      `/application/assigned/${hrUsername}?page=${page}&size=${size}`,
    );
  },

  /**
   * GET /application/job/:jobId?page=&size=
   * Get all applications for a specific job post.
   */
  async getApplicationsByJob(
    jobId: string,
    page = 0,
    size = 20,
  ): Promise<ApiResponse<ApplicationListData>> {
    return apiClient.get<ApiResponse<ApplicationListData>>(
      `/application/job/${jobId}?page=${page}&size=${size}`,
    );
  },

  /**
   * PATCH /application/:id/status?status=
   * Update the status of an application. Backend validates transitions.
   */
  async updateApplicationStatus(
    applicationId: string,
    status: string,
  ): Promise<ApiResponse<ApplicationDetail>> {
    return apiClient.put<ApiResponse<ApplicationDetail>>(
      `/application/${applicationId}/status?status=${status}`,
    );
  },

  /**
   * GET /application/job/:jobId/count
   * Count total applications for a job.
   */
  async countApplicationsByJob(
    jobId: string,
  ): Promise<ApiResponse<JobApplicationCount>> {
    return apiClient.get<ApiResponse<JobApplicationCount>>(
      `/application/job/${jobId}/count`,
    );
  },

  // ─── Notes (HRM & HR) ──────────────────────────────────────────────────────

  /**
   * GET /application/:id/notes
   * Get all HR notes for an application.
   */
  async getApplicationNotes(
    applicationId: string,
  ): Promise<ApiResponse<ApplicationNote[]>> {
    return apiClient.get<ApiResponse<ApplicationNote[]>>(
      `/application/${applicationId}/notes`,
    );
  },

  /**
   * POST /application/:id/notes
   * Add a note to an application. Returns 201 with created note.
   */
  async addApplicationNote(
    applicationId: string,
    content: string,
    candidateVisible: boolean,
  ): Promise<ApiResponse<ApplicationNote>> {
    return apiClient.post<ApiResponse<ApplicationNote>>(
      `/application/${applicationId}/notes`,
      { content, candidateVisible },
    );
  },

  /**
   * PUT /application/:id/notes/:noteId
   * Update a note on an application.
   */
  async updateApplicationNote(
    applicationId: string,
    noteId: string,
    content: string,
    candidateVisible: boolean,
  ): Promise<ApiResponse<ApplicationNote>> {
    return apiClient.put<ApiResponse<ApplicationNote>>(
      `/application/${applicationId}/notes/${noteId}`,
      { content, candidateVisible },
    );
  },

  /**
   * DELETE /application/:id/notes/:noteId
   * Delete a note. Returns 204 No Content.
   */
  async deleteApplicationNote(
    applicationId: string,
    noteId: string,
  ): Promise<void> {
    await apiClient.delete<void>(
      `/application/${applicationId}/notes/${noteId}`,
    );
  },

  // ─── HR endpoints (assigned to this HR) ──────────────────────────────────

  /**
   * GET /application/hr/jobs?page=&size=&jobTitle=
   * List jobs assigned to the current HR user with applicant counts.
   */
  async getHRJobs(
    page = 0,
    size = 20,
    jobTitle?: string,
  ): Promise<ApiResponse<HRJobListData>> {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("size", String(size));
    if (jobTitle) params.append("jobTitle", jobTitle);
    return apiClient.get<ApiResponse<HRJobListData>>(
      `/application/hr/jobs?${params.toString()}`,
    );
  },

  /**
   * GET /application/hr/candidates?page=&size=&status=
   * List candidates assigned to the current HR user.
   */
  async getHRCandidates(
    page = 0,
    size = 20,
    status?: ApplicationStatus,
  ): Promise<ApiResponse<CandidateListData>> {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("size", String(size));
    if (status) params.append("status", status);
    return apiClient.get<ApiResponse<CandidateListData>>(
      `/application/hr/candidates?${params.toString()}`,
    );
  },

  /**
   * GET /application/hr/candidates/:username
   * Get full candidate detail with all applications for the current HR.
   */
  async getHRCandidateDetail(
    username: string,
  ): Promise<ApiResponse<CandidateDetail>> {
    return apiClient.get<ApiResponse<CandidateDetail>>(
      `/application/hr/candidates/${username}`,
    );
  },

  // ─── HRM (company-wide) endpoints ────────────────────────────────────────

  /**
   * GET /application/company/:companyNo/jobs?page=&size=&jobTitle=
   * List all company jobs with applicant counts and status breakdown.
   */
  async getCompanyJobs(
    companyNo: string,
    page = 0,
    size = 20,
    jobTitle?: string,
  ): Promise<ApiResponse<HRJobListData>> {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("size", String(size));
    if (jobTitle) params.append("jobTitle", jobTitle);
    return apiClient.get<ApiResponse<HRJobListData>>(
      `/application/company/${companyNo}/jobs?${params.toString()}`,
    );
  },

  /**
   * GET /application/company/:companyNo/candidates?page=&size=&status=
   * List all candidates who applied to company jobs.
   */
  async getCompanyCandidates(
    companyNo: string,
    page = 0,
    size = 20,
    status?: ApplicationStatus,
  ): Promise<ApiResponse<CandidateListData>> {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("size", String(size));
    if (status) params.append("status", status);
    return apiClient.get<ApiResponse<CandidateListData>>(
      `/application/company/${companyNo}/candidates?${params.toString()}`,
    );
  },

  /**
   * GET /application/company/:companyNo/candidates/:username
   * Get full candidate detail with all applications for the company.
   */
  async getCompanyCandidateDetail(
    companyNo: string,
    username: string,
  ): Promise<ApiResponse<CandidateDetail>> {
    return apiClient.get<ApiResponse<CandidateDetail>>(
      `/application/company/${companyNo}/candidates/${username}`,
    );
  },

  // ─── ADMIN endpoints ───────────────────────────────────────────────────────

  /**
   * GET /application/admin/all?page=&size=&status=&companyId=&username=&jobTitle=&keyword=
   * List all applications platform-wide (ADMIN only).
   * Backend returns Spring Pageable: { content[], totalElements, totalPages, number }
   * mapped here to the standard { items[], meta } shape used by hooks.
   */
  async getAdminApplications(
    page = 0,
    size = 50,
    status?: ApplicationStatus,
    companyId?: string,
    username?: string,
    jobTitle?: string,
    keyword?: string,
  ): Promise<ApiResponse<ApplicationListData>> {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("size", String(size));
    if (status) params.append("status", status);
    if (companyId) params.append("companyId", companyId);
    if (username) params.append("username", username);
    if (jobTitle) params.append("jobTitle", jobTitle);
    if (keyword) params.append("keyword", keyword);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = await apiClient.get<ApiResponse<any>>(
      `/application/admin/all?${params.toString()}`,
    );

    // Map Spring Pageable → ApplicationListData
    const pageable = raw.data ?? {};
    return {
      ...raw,
      data: {
        items: pageable.content ?? [],
        meta: {
          page: pageable.number ?? 0,
          size: pageable.size ?? size,
          totalElements: pageable.totalElements ?? 0,
          totalPages: pageable.totalPages ?? 1,
          first: pageable.first ?? true,
          last: pageable.last ?? true,
          hasNext: !pageable.last,
          hasPrevious: !pageable.first,
        },
      },
    };
  },

  /**
   * DELETE /application/admin/application/{id}?reason=
   * Soft-delete an application (marks as WITHDRAWN). ADMIN only.
   */
  async adminDeleteApplication(
    applicationId: string,
    reason?: string,
  ): Promise<ApiResponse<ApplicationDetail>> {
    const params = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    return apiClient.delete<ApiResponse<ApplicationDetail>>(
      `/application/admin/application/${applicationId}${params}`,
    );
  },

  /**
   * PUT /application/admin/application/{id}/restore
   * Restore a WITHDRAWN application back to APPLIED. ADMIN only.
   */
  async adminRestoreApplication(
    applicationId: string,
  ): Promise<ApiResponse<ApplicationDetail>> {
    return apiClient.put<ApiResponse<ApplicationDetail>>(
      `/application/admin/application/${applicationId}/restore`,
    );
  },

  /**
   * GET /application/job/{jobId}/cv-ranking
   * Triggers AI-powered CV ranking for a job. Response can be very slow (10-15 s).
   * Retries on 503 (service busy) OR per-request timeout (AbortError) up to maxRetries times.
   * onRetry is called each time a retry begins, receiving the attempt number (1-based).
   *
   * @param requestTimeoutMs - Max ms to wait for each individual request before aborting and retrying (default 60 s)
   * @param retryDelayMs     - Ms to wait between retry attempts (default 15 s — matches server processing time)
   */
  async getCVRanking(
    jobId: string,
    maxRetries = 3,
    retryDelayMs = 15000,
    onRetry?: (attempt: number) => void,
    requestTimeoutMs = 60000,
  ): Promise<ApiResponse<CvRankingData>> {
    const token = getAccessToken();
    const deviceId = getDeviceId();
    const headers: Record<string, string> = { "X-Device-Id": deviceId };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    let lastError: Error = new Error("CV ranking failed");
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        onRetry?.(attempt);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);

      try {
        const response = await fetch(
          `${API_BASE}/application/job/${jobId}/cv-ranking`,
          { method: "GET", headers, credentials: "include", signal: controller.signal },
        );

        clearTimeout(timeoutId);

        if (response.status === 503) {
          lastError = new Error(`Service busy — retrying (${attempt + 1}/${maxRetries + 1})`);
          continue;
        }

        if (!response.ok) {
          throw new Error(`CV ranking failed (${response.status})`);
        }

        return response.json() as Promise<ApiResponse<CvRankingData>>;
      } catch (err) {
        clearTimeout(timeoutId);
        // AbortError means our timeout fired — treat as transient, retry
        if (err instanceof Error && err.name === "AbortError") {
          lastError = new Error(`Request timed out — retrying (${attempt + 1}/${maxRetries + 1})`);
          continue;
        }
        throw err;
      }
    }

    throw new Error("CV ranking service unavailable after max retries. Please try again later.");
  },
};
