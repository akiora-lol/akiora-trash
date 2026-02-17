'use client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { mockNotifications, type Notification } from '@/types/chat'
import { Link } from 'react-router-dom'

export default function NotificationBell() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const getRelativeTime = (dateString: string) => {
    const now = Date.now()
    const then = new Date(dateString).getTime()
    const diff = now - then
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return t('chats.justNow')
    if (minutes < 60) return t('chats.minutesAgo', { count: minutes })
    if (hours < 24) return t('chats.hoursAgo', { count: hours })
    return t('chats.daysAgo', { count: days })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-rose-950/50"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs bg-rose-600"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 border-rose-900/50 bg-black/95 backdrop-blur"
      >
        <DropdownMenuLabel className="flex items-center justify-between text-rose-50">
          {t('header.notifications.title')}
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-auto p-1 text-xs text-rose-400 hover:text-rose-300"
            >
              {t('header.notifications.markAllRead')}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-rose-900/50" />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t('header.notifications.noNotifications')}
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`cursor-pointer p-3 focus:bg-rose-950/30 ${
                  !notification.isRead ? 'bg-rose-950/20' : ''
                }`}
                asChild
              >
                <Link
                  to={notification.link || '#'}
                  onClick={() => markAsRead(notification.id)}
                  className="flex gap-3"
                >
                  {notification.avatarUrl && (
                    <img
                      src={notification.avatarUrl}
                      alt=""
                      className="h-10 w-10 rounded-full"
                    />
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-rose-50">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-rose-500" />
                  )}
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
