import { apiClient } from "@/lib/api-client";
import { getAccessToken } from "@/lib/auth/token-store";
import { getDeviceId } from "@/lib/auth/device-fingerprint";
import { ApiResponse } from "@/types/response";
import {
  CVMetadata,
  CVListResponse,
  CVUploadResponse,
  CVUpdateRequest,
} from "@/types/cv";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9085";

export const cvService = {
  /**
   * GET /cv/candidate/{username}?page=0&size=10
   * List all CVs for the candidate (paginated, 0-indexed).
   */
  async listMyCVs(
    username: string,
    page = 0,
    size = 10,
  ): Promise<ApiResponse<CVListResponse>> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });
    return apiClient.get<ApiResponse<CVListResponse>>(
      `/cv/candidate/${username}?${params}`,
    );
  },

  /**
   * POST /cv/upload (multipart/form-data)
   * Upload a new CV file (PDF only, max 5MB).
   */
  async uploadCV(file: File): Promise<ApiResponse<CVUploadResponse>> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("templateType", "UPLOAD");
    return apiClient.upload<ApiResponse<CVUploadResponse>>(
      "/cv/candidate/upload",
      formData,
    );
  },

  /**
   * PATCH /cv/candidate/{cvId}
   * Update CV metadata (filename, template type, default status).
   */
  async updateCV(
    cvId: string,
    data: CVUpdateRequest,
  ): Promise<ApiResponse<CVMetadata>> {
    return apiClient.patch<ApiResponse<CVMetadata>>(
      `/cv/candidate/${cvId}`,
      data,
    );
  },

  /**
   * DELETE /cv/candidate/{cvId}
   * Soft-delete a CV (204 No Content).
   */
  async deleteCV(cvId: string): Promise<void> {
    await apiClient.delete<void>(`/cv/candidate/${cvId}`);
  },

  /**
   * Download CV file as PDF blob via authenticated fetch.
   * Routes through backend (/cv/candidate/download/{objectName}) to avoid
   * direct MinIO access from browser (pdfUrl is an internal Docker URL).
   */
  async downloadCV(cv: CVMetadata): Promise<void> {
    const token = getAccessToken();
    const deviceId = getDeviceId();

    const headers: Record<string, string> = { "X-Device-Id": deviceId };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(
      `${API_BASE}/cv/candidate/download/${cv.objectName}`,
      { method: "GET", headers, credentials: "include" },
    );

    if (!response.ok) {
      throw new Error(`CV download failed (${response.status})`);
    }

    // Extract original filename by stripping the leading UUID prefix
    const uuidPrefix = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i;
    const filename = cv.objectName.replace(uuidPrefix, "") || cv.objectName;

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },
};
