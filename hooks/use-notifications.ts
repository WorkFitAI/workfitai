"use client"

import { useCallback, useReducer } from 'react'
import { notificationService } from '@/lib/notification/notification-service'
import { useNotificationWebSocket } from '@/hooks/use-notification-websocket'
import type { Notification } from '@/types/notification'

interface State {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  page: number
  hasMore: boolean
}

type Action =
  | { type: 'SET_INITIAL'; notifications: Notification[]; unreadCount: number; hasMore: boolean }
  | { type: 'PREPEND'; notification: Notification }
  | { type: 'SET_UNREAD'; count: number }
  | { type: 'MARK_READ'; id: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'APPEND_PAGE'; notifications: Notification[]; page: number; hasMore: boolean }
  | { type: 'SET_LOADING'; value: boolean }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_INITIAL':
      return { ...state, notifications: action.notifications, unreadCount: action.unreadCount, hasMore: action.hasMore, page: 0, isLoading: false }
    case 'PREPEND':
      return { ...state, notifications: [action.notification, ...state.notifications], unreadCount: state.unreadCount + 1 }
    case 'SET_UNREAD':
      return { ...state, unreadCount: action.count }
    case 'MARK_READ': {
      const wasUnread = state.notifications.find(n => n.id === action.id && !n.read)
      return {
        ...state,
        notifications: state.notifications.map(n => n.id === action.id ? { ...n, read: true } : n),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      }
    }
    case 'MARK_ALL_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })), unreadCount: 0 }
    case 'APPEND_PAGE':
      return { ...state, notifications: [...state.notifications, ...action.notifications], page: action.page, hasMore: action.hasMore, isLoading: false }
    case 'SET_LOADING':
      return { ...state, isLoading: action.value }
    default:
      return state
  }
}

const INITIAL_STATE: State = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  page: 0,
  hasMore: false,
}

interface UseNotificationsOptions {
  enabled: boolean
  username: string
}

export function useNotifications({ enabled, username }: UseNotificationsOptions) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  const handleConnected = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', value: true })
    try {
      const [notifRes, countRes] = await Promise.all([
        notificationService.getNotifications(0, 10),
        notificationService.getUnreadCount(),
      ])
      dispatch({
        type: 'SET_INITIAL',
        notifications: notifRes.data.content,
        unreadCount: countRes.data.count,
        hasMore: !notifRes.data.last,
      })
    } catch {
      dispatch({ type: 'SET_LOADING', value: false })
    }
  }, [])

  const handleNotification = useCallback((n: Notification) => {
    dispatch({ type: 'PREPEND', notification: n })
  }, [])

  const handleUnreadCount = useCallback((count: number) => {
    dispatch({ type: 'SET_UNREAD', count })
  }, [])

  const { isConnected } = useNotificationWebSocket({
    enabled,
    username,
    onConnected: handleConnected,
    onNotification: handleNotification,
    onUnreadCount: handleUnreadCount,
  })

  const markAsRead = useCallback(async (id: string) => {
    dispatch({ type: 'MARK_READ', id })
    await notificationService.markAsRead(id).catch(() => {})
  }, [])

  const markAllAsRead = useCallback(async () => {
    dispatch({ type: 'MARK_ALL_READ' })
    await notificationService.markAllAsRead().catch(() => {})
  }, [])

  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.isLoading) return
    const nextPage = state.page + 1
    dispatch({ type: 'SET_LOADING', value: true })
    try {
      const res = await notificationService.getNotifications(nextPage, 10)
      dispatch({
        type: 'APPEND_PAGE',
        notifications: res.data.content,
        page: nextPage,
        hasMore: !res.data.last,
      })
    } catch {
      dispatch({ type: 'SET_LOADING', value: false })
    }
  }, [state.hasMore, state.isLoading, state.page])

  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isConnected,
    isLoading: state.isLoading,
    hasMore: state.hasMore,
    markAsRead,
    markAllAsRead,
    loadMore,
  }
}
