import { apiClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/response"
import type {
  AdminDashboardData,
  HrmDashboardData,
  AuditEventPage,
  ActivitySummary,
  UserActivityResponse,
} from "@/types/dashboard"

export const monitoringService = {
  getAdminDashboard(): Promise<ApiResponse<AdminDashboardData>> {
    return apiClient.get<ApiResponse<AdminDashboardData>>(
      "/monitoring/admin/dashboard"
    )
  },

  getHrmDashboard(): Promise<ApiResponse<HrmDashboardData>> {
    return apiClient.get<ApiResponse<HrmDashboardData>>(
      "/monitoring/hrm/dashboard"
    )
  },

  getRecentAuditEvents(): Promise<ApiResponse<AuditEventPage>> {
    return apiClient.get<ApiResponse<AuditEventPage>>(
      "/monitoring/admin/audit?page=0&size=5"
    )
  },

  getOnlineUsers(minutes = 15): Promise<ApiResponse<UserActivityResponse>> {
    return apiClient.get<ApiResponse<UserActivityResponse>>(
      `/monitoring/admin/online-users?minutes=${minutes}`
    )
  },

  getActivitySummary(hours = 24): Promise<ApiResponse<ActivitySummary>> {
    return apiClient.get<ApiResponse<ActivitySummary>>(
      `/monitoring/admin/activity-summary?hours=${hours}`
    )
  },
}
