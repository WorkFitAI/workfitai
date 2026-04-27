import { apiClient } from "@/lib/api-client";
import { ApiResponse } from "@/types/response";
import {
  CandidateProfile,
  UpdateCandidateProfileRequest,
  NotificationSettings,
  PrivacySettings,
  AvatarData,
  DeactivateRequest,
  DeleteAccountRequest,
  UserSessionInfo,
} from "@/types/user";

export const userService = {
  // ─── Profile ─────────────────────────────────────────────────────────────

  async getMyProfile(): Promise<ApiResponse<CandidateProfile>> {
    return apiClient.get<ApiResponse<CandidateProfile>>("/user/profile/me");
  },

  async updateCandidateProfile(
    data: UpdateCandidateProfileRequest,
  ): Promise<ApiResponse<CandidateProfile>> {
    return apiClient.put<ApiResponse<CandidateProfile>>(
      "/user/profile/candidate",
      data,
    );
  },

  // ─── Avatar ───────────────────────────────────────────────────────────────

  async getAvatar(): Promise<ApiResponse<AvatarData>> {
    return apiClient.get<ApiResponse<AvatarData>>("/user/profile/avatar");
  },

  async uploadAvatar(file: File): Promise<ApiResponse<AvatarData>> {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.upload<ApiResponse<AvatarData>>(
      "/user/profile/avatar",
      formData,
    );
  },

  async deleteAvatar(): Promise<void> {
    await apiClient.delete<void>("/user/profile/avatar");
  },

  // ─── Sessions ────────────────────────────────────────────────────────────

  async getActiveSessions(): Promise<ApiResponse<UserSessionInfo[]>> {
    return apiClient.get<ApiResponse<UserSessionInfo[]>>("/auth/sessions");
  },

  async revokeSession(sessionId: string): Promise<ApiResponse<unknown>> {
    return apiClient.delete<ApiResponse<unknown>>(`/auth/sessions/${sessionId}`);
  },

  async revokeAllOtherSessions(): Promise<ApiResponse<unknown>> {
    return apiClient.delete<ApiResponse<unknown>>("/auth/sessions/others");
  },

  // ─── Notification settings ────────────────────────────────────────────────

  async getNotificationSettings(): Promise<ApiResponse<NotificationSettings>> {
    return apiClient.get<ApiResponse<NotificationSettings>>(
      "/user/profile/notification-settings",
    );
  },

  async updateNotificationSettings(
    data: Omit<NotificationSettings, "updatedAt">,
  ): Promise<ApiResponse<NotificationSettings>> {
    return apiClient.put<ApiResponse<NotificationSettings>>(
      "/user/profile/notification-settings",
      data,
    );
  },

  // ─── Privacy settings ────────────────────────────────────────────────────

  async getPrivacySettings(): Promise<ApiResponse<PrivacySettings>> {
    return apiClient.get<ApiResponse<PrivacySettings>>(
      "/user/profile/privacy-settings",
    );
  },

  async updatePrivacySettings(
    data: Omit<PrivacySettings, "updatedAt">,
  ): Promise<ApiResponse<PrivacySettings>> {
    return apiClient.put<ApiResponse<PrivacySettings>>(
      "/user/profile/privacy-settings",
      data,
    );
  },

  // ─── Danger zone ──────────────────────────────────────────────────────────

  async deactivateAccount(
    data: DeactivateRequest,
  ): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>(
      "/user/profile/deactivate",
      data,
    );
  },

  async requestAccountDeletion(
    data: DeleteAccountRequest,
  ): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>(
      "/user/profile/delete-request",
      data,
    );
  },

  async cancelAccountDeletion(): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>(
      "/user/profile/cancel-deletion",
    );
  },
};
