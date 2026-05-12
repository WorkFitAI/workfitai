import { apiClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/response"
import type {
  AdminUsersPage,
  AdminUserSummary,
  AdminUserFullProfile,
  AdminUsersListParams,
  EsSearchRequest,
  EsSearchResult,
} from "@/types/admin-user"

export const adminUserService = {
  // ─── Elasticsearch search (primary) ───────────────────────────────────────

  async searchUsers(
    body: EsSearchRequest = {},
  ): Promise<ApiResponse<EsSearchResult>> {
    return apiClient.post<ApiResponse<EsSearchResult>>(
      "/user/admins/users/search",
      body,
    )
  },

  // ─── Legacy paginated list (kept for compatibility) ───────────────────────

  async listUsers(
    params: AdminUsersListParams = {},
  ): Promise<ApiResponse<AdminUsersPage>> {
    const { keyword = "", page = 0, size = 10, role = "" } = params
    const qs = new URLSearchParams({
      keyword,
      page: String(page),
      size: String(size),
      ...(role ? { role } : {}),
    }).toString()
    return apiClient.get<ApiResponse<AdminUsersPage>>(
      `/user/admins/all-users?${qs}`,
    )
  },

  // ─── Detail ───────────────────────────────────────────────────────────────

  async getUser(userId: string): Promise<ApiResponse<AdminUserSummary>> {
    return apiClient.get<ApiResponse<AdminUserSummary>>(
      `/user/admins/users/${userId}`,
    )
  },

  async getUserFullProfile(
    userId: string,
  ): Promise<ApiResponse<AdminUserFullProfile>> {
    return apiClient.get<ApiResponse<AdminUserFullProfile>>(
      `/user/admins/users/${userId}/full-profile`,
    )
  },

  // ─── Block / Unblock ──────────────────────────────────────────────────────

  async setUserBlocked(
    userId: string,
    blocked: boolean,
  ): Promise<ApiResponse<unknown>> {
    return apiClient.put<ApiResponse<unknown>>(
      `/user/admins/users/${userId}/block?blocked=${blocked}`,
    )
  },

  // ─── Delete ───────────────────────────────────────────────────────────────

  async deleteUser(userId: string): Promise<ApiResponse<unknown>> {
    return apiClient.delete<ApiResponse<unknown>>(
      `/user/admins/users/${userId}`,
    )
  },

  // ─── Approve HR / HR Manager registration ─────────────────────────────────

  async approveManager(username: string): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>(
      `/user/hr/username/${username}/approve-manager`,
    )
  },

  /** POST /user/hr/username/:username/approve — approve an HR staff account */
  async approveHR(username: string): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>(
      `/user/hr/username/${username}/approve`,
    )
  },

  /** POST /user/hr/username/:username/reject-manager — reject an HR Manager (Admin only) */
  async rejectManager(username: string): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>(
      `/user/hr/username/${username}/reject-manager`,
    )
  },

  /** POST /user/hr/username/:username/reject — reject an HR staff account (HR Manager only) */
  async rejectHR(username: string): Promise<ApiResponse<unknown>> {
    return apiClient.post<ApiResponse<unknown>>(
      `/user/hr/username/${username}/reject`,
    )
  },
}
