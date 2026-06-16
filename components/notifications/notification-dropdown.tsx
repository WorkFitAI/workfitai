"use client"

import { PopoverContent } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { BellOff } from 'lucide-react'
import { useNotificationContext } from '@/contexts/notification-context'
import { NotificationItem } from './notification-item'

export function NotificationDropdown() {
  const { notifications, unreadCount, isLoading, hasMore, markAsRead, markAllAsRead, loadMore } =
    useNotificationContext()

  return (
    <PopoverContent align="end" className="w-[380px] p-0 shadow-lg rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold text-gray-900">Notifications</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
          disabled={unreadCount === 0}
          onClick={() => markAllAsRead()}
        >
          Mark all read
        </Button>
      </div>
      <Separator />

      {/* List — overflow-y-auto + max-h works correctly here; ScrollArea (Radix) needs fixed height */}
      <div className="overflow-y-auto max-h-[400px]">
        {isLoading && notifications.length === 0 && (
          <div className="flex flex-col gap-1 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2 px-2 py-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-gray-400">
            <BellOff className="h-8 w-8 opacity-40" />
            <p className="text-sm font-medium">No notifications yet</p>
          </div>
        )}

        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
        ))}

        {hasMore && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-gray-500 hover:text-gray-700"
                disabled={isLoading}
                onClick={loadMore}
              >
                {isLoading ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          </>
        )}
      </div>
    </PopoverContent>
  )
}
