"use client"

import { createContext, useContext } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useNotifications } from '@/hooks/use-notifications'
import type { Notification } from '@/types/notification'

interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  isConnected: boolean
  isLoading: boolean
  hasMore: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  loadMore: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()

  const value = useNotifications({
    enabled: isAuthenticated && !!user?.username,
    username: user?.username ?? '',
  })

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotificationContext must be used within NotificationProvider')
  return ctx
}
