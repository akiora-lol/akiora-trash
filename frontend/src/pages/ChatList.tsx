import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MessageSquare, Search, Bell, BellOff } from 'lucide-react'
import { mockChats, type Chat } from '@/types/chat'
import { cn } from '@/lib/utils'

export default function ChatList() {
  const { t } = useTranslation()
  const [chats, setChats] = useState<Chat[]>(mockChats)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredChats = chats.filter((chat) =>
    chat.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  const toggleMute = (chatId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, isMuted: !chat.isMuted } : chat
      )
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/90 to-black text-foreground pt-24 pb-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="bg-gradient-to-r from-rose-500 to-rose-700 bg-clip-text text-4xl font-bold text-transparent">
            {t('chats.title')}
          </h1>
          <p className="mt-2 text-muted-foreground">{t('chats.subtitle')}</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-rose-900/50 bg-black/40 focus-visible:border-rose-500 focus-visible:ring-rose-500/50"
            />
          </div>
        </div>

        {/* Chat List */}
        {filteredChats.length === 0 ? (
          <Card className="border-rose-900/50 bg-black/40 backdrop-blur">
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                {t('chats.noChats')}
              </p>
              <p className="text-muted-foreground">{t('chats.noChatsSub')}</p>
              <Button
                asChild
                className="mt-6 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600"
              >
                <Link to="/matches">{t('matches.title')}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredChats.map((chat) => (
              <Link key={chat.id} to={`/chats/${chat.id}`}>
                <Card
                  className={cn(
                    'group border-rose-900/50 bg-black/40 backdrop-blur transition-all duration-300 hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-500/10',
                    chat.unreadCount > 0 && 'border-rose-500/70'
                  )}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    {/* Avatar with online status */}
                    <div className="relative">
                      <img
                        src={chat.participant.avatarUrl}
                        alt={chat.participant.name}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                      <div
                        className={cn(
                          'absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-black',
                          chat.participant.status.isOnline
                            ? 'bg-green-500'
                            : 'bg-gray-500'
                        )}
                      />
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-semibold text-rose-50 truncate">
                          {chat.participant.name}
                        </h3>
                        {chat.lastMessage && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {getRelativeTime(chat.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2 mb-2">
                        {chat.participant.status.isOnline ? (
                          <Badge className="bg-green-600/20 text-green-400 border-green-600/50">
                            {t('chats.online')}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {t('chats.lastSeen')}{' '}
                            {chat.participant.status.lastSeen &&
                              getRelativeTime(chat.participant.status.lastSeen)}
                          </span>
                        )}
                      </div>

                      {/* Last Message */}
                      {chat.lastMessage && (
                        <div className="flex items-center gap-2">
                          <p
                            className={cn(
                              'text-sm truncate flex-1',
                              chat.unreadCount > 0
                                ? 'text-rose-50 font-medium'
                                : 'text-muted-foreground'
                            )}
                          >
                            {chat.lastMessage.isOwn && (
                              <span className="mr-1">
                                {chat.lastMessage.status === 'read' && '✓✓'}
                                {chat.lastMessage.status === 'delivered' && '✓✓'}
                                {chat.lastMessage.status === 'sent' && '✓'}
                              </span>
                            )}
                            {chat.lastMessage.content}
                          </p>
                        </div>
                      )}

                      {/* Profile Reference */}
                      {chat.profileReference && (
                        <div className="mt-2">
                          <Badge
                            variant="outline"
                            className="border-rose-500/50 bg-rose-500/10 text-rose-400 text-xs"
                          >
                            {chat.profileReference.rank} •{' '}
                            {chat.profileReference.server}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Right Side */}
                    <div className="flex flex-col items-end gap-2">
                      {chat.unreadCount > 0 && (
                        <Badge className="bg-rose-600 text-white">
                          {chat.unreadCount}
                        </Badge>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => toggleMute(chat.id, e)}
                        className="h-8 w-8 hover:bg-rose-950/50"
                      >
                        {chat.isMuted ? (
                          <BellOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Bell className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
