import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/response'
import type { Notification, NotificationPage, UnreadCountData } from '@/types/notification'

export const notificationService = {
  async getNotifications(page = 0, size = 10): Promise<ApiResponse<NotificationPage>> {
    return apiClient.get(`/notification?page=${page}&size=${size}`)
  },

  async getUnreadCount(): Promise<ApiResponse<UnreadCountData>> {
    return apiClient.get('/notification/unread-count')
  },

  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    return apiClient.put(`/notification/${id}/read`)
  },

  async markAllAsRead(): Promise<ApiResponse<null>> {
    return apiClient.put('/notification/read-all')
  },
}
