"use client"

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Popover, PopoverTrigger } from '@/components/ui/popover'
import { useNotificationContext } from '@/contexts/notification-context'
import { NotificationDropdown } from './notification-dropdown'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { unreadCount } = useNotificationContext()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <NotificationDropdown />
    </Popover>
  )
}
