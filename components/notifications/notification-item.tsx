"use client"

import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/notification'

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
}

function typeLabel(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const router = useRouter()

  function handleClick() {
    if (!notification.read) onRead(notification.id)
    if (notification.actionUrl) router.push(notification.actionUrl)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={cn(
        'flex flex-col gap-1 px-4 py-3 cursor-pointer transition-colors border-l-2',
        notification.read
          ? 'border-l-transparent bg-white hover:bg-gray-50'
          : 'border-l-blue-500 bg-blue-50 hover:bg-blue-100'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 bg-blue-100 rounded px-1.5 py-0.5 leading-none">
          {typeLabel(notification.type)}
        </span>
        <span className="text-[11px] text-gray-400 shrink-0">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </span>
      </div>
      <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
        {notification.title}
      </p>
      {notification.message && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-snug">
          {notification.message}
        </p>
      )}
    </div>
  )
}
