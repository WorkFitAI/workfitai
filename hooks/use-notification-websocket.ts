"use client"

import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import { getAccessToken } from '@/lib/auth/token-store'
import type { Notification } from '@/types/notification'

interface UseNotificationWebSocketOptions {
  username: string
  enabled: boolean
  onNotification: (n: Notification) => void
  onUnreadCount: (count: number) => void
  onConnected: () => void
}

// Derive WebSocket base from HTTP API base — WebSocket can't go through the Next.js HTTP proxy
const HTTP_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9085'
const WS_URL = `${HTTP_BASE.replace(/^http/, 'ws')}/notification/ws/notifications`

export function useNotificationWebSocket({
  username,
  enabled,
  onNotification,
  onUnreadCount,
  onConnected,
}: UseNotificationWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)

  // Stable refs — prevent stale closures inside STOMP callbacks
  const usernameRef = useRef(username)
  const onNotificationRef = useRef(onNotification)
  const onUnreadCountRef = useRef(onUnreadCount)
  const onConnectedRef = useRef(onConnected)
  useEffect(() => { usernameRef.current = username }, [username])
  useEffect(() => { onNotificationRef.current = onNotification }, [onNotification])
  useEffect(() => { onUnreadCountRef.current = onUnreadCount }, [onUnreadCount])
  useEffect(() => { onConnectedRef.current = onConnected }, [onConnected])

  useEffect(() => {
    if (!enabled || !username) return

    const client = new Client({
      webSocketFactory: () => new WebSocket(WS_URL),
      reconnectDelay: 5000,
      // beforeConnect fires before every connect/reconnect — reads fresh token each time
      beforeConnect: () => {
        client.connectHeaders = {
          'X-Username': usernameRef.current,
          'Authorization': `Bearer ${getAccessToken() ?? ''}`,
        }
      },
      onConnect: () => {
        setIsConnected(true)
        onConnectedRef.current()

        // Spring STOMP maps /user/queue/* to the authenticated Principal (X-Username)
        client.subscribe('/user/queue/notifications', (msg) => {
          try {
            onNotificationRef.current(JSON.parse(msg.body) as Notification)
          } catch {
            // malformed push — ignore
          }
        })

        client.subscribe('/user/queue/unread-count', (msg) => {
          try {
            const { count } = JSON.parse(msg.body) as { count: number }
            onUnreadCountRef.current(count)
          } catch {
            // malformed push — ignore
          }
        })
      },
      onDisconnect: () => setIsConnected(false),
      onStompError: () => setIsConnected(false),
    })

    client.activate()
    return () => { client.deactivate() }
  }, [enabled, username])

  return { isConnected }
}
