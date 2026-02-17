import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  Send,
  Bell,
  BellOff,
  MoreVertical,
  UserCircle,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockChats, mockMessages, type Chat, type Message } from '@/types/chat'
import { cn } from '@/lib/utils'

export default function Chat() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [chat, setChat] = useState<Chat | undefined>(
    mockChats.find((c) => c.id === id)
  )
  const [messages, setMessages] = useState<Message[]>(
    mockMessages[id || ''] || []
  )
  const [newMessage, setNewMessage] = useState('')

  useEffect(() => {
    // Scroll to bottom on mount and when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (!chat) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background/90 to-black text-foreground flex items-center justify-center">
        <Card className="border-rose-900/50 bg-black/40 backdrop-blur">
          <CardContent className="py-12 px-8 text-center">
            <p className="text-lg text-foreground mb-4">
              {t('chats.chatNotFound')}
            </p>
            <Button
              onClick={() => navigate('/chats')}
              className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600"
            >
              {t('common.back')}
            </Button>
          </CardContent>
        </Card>
      </div>
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

  const toggleMute = () => {
    setChat((prev) => (prev ? { ...prev, isMuted: !prev.isMuted } : prev))
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: `msg-${Date.now()}`,
      chatId: chat.id,
      senderId: 'current-user',
      content: newMessage,
      createdAt: new Date().toISOString(),
      status: 'sent',
      isOwn: true,
    }

    setMessages((prev) => [...prev, message])
    setChat((prev) =>
      prev
        ? {
            ...prev,
            lastMessage: message,
          }
        : prev
    )
    setNewMessage('')

    // Simulate status updates
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        )
      )
    }, 1000)

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, status: 'read' } : msg
        )
      )
    }, 2000)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/90 to-black text-foreground flex flex-col">
      {/* Chat Header */}
      <div className="border-b border-rose-900/50 bg-black/60 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => navigate('/chats')}
                className="hover:bg-rose-950/50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <Link
                to={
                  chat.profileReference
                    ? `/profile/${chat.profileReference.id}`
                    : '#'
                }
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="relative">
                  <img
                    src={chat.participant.avatarUrl}
                    alt={chat.participant.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div
                    className={cn(
                      'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black',
                      chat.participant.status.isOnline
                        ? 'bg-green-500'
                        : 'bg-gray-500'
                    )}
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-rose-50">
                    {chat.participant.name}
                  </h2>
                  {chat.participant.status.isOnline ? (
                    <p className="text-xs text-green-400">{t('chats.online')}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {t('chats.lastSeen')}{' '}
                      {chat.participant.status.lastSeen &&
                        getRelativeTime(chat.participant.status.lastSeen)}
                    </p>
                  )}
                </div>
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={toggleMute}
                className="hover:bg-rose-950/50"
              >
                {chat.isMuted ? (
                  <BellOff className="h-5 w-5" />
                ) : (
                  <Bell className="h-5 w-5" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:bg-rose-950/50"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="border-rose-900/50 bg-black/95 backdrop-blur"
                >
                  {chat.profileReference && (
                    <DropdownMenuItem asChild>
                      <Link
                        to={`/profile/${chat.profileReference.id}`}
                        className="cursor-pointer"
                      >
                        <UserCircle className="mr-2 h-4 w-4" />
                        {t('chats.viewProfile')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={toggleMute}>
                    {chat.isMuted ? (
                      <>
                        <Bell className="mr-2 h-4 w-4" />
                        {t('chats.unmute')}
                      </>
                    ) : (
                      <>
                        <BellOff className="mr-2 h-4 w-4" />
                        {t('chats.mute')}
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Profile Reference Card */}
          {chat.profileReference && (
            <Link
              to={`/profile/${chat.profileReference.id}`}
              className="mt-4 block"
            >
              <Card className="border-rose-900/50 bg-rose-950/20 backdrop-blur hover:border-rose-500/50 transition-colors">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-rose-50">
                      {t('chats.matchedProfile')}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="border-rose-500/50 bg-rose-500/10 text-rose-400 text-xs"
                      >
                        {chat.profileReference.rank}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {chat.profileReference.server}
                      </span>
                    </div>
                  </div>
                  <UserCircle className="h-5 w-5 text-rose-500" />
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto px-4 py-6 mx-auto max-w-4xl"
        >
          <div className="space-y-4">
            {messages.map((message, index) => {
              const showDate =
                index === 0 ||
                new Date(messages[index - 1].createdAt).toDateString() !==
                  new Date(message.createdAt).toDateString()

              return (
                <div key={message.id}>
                  {/* Date Separator */}
                  {showDate && (
                    <div className="flex items-center justify-center my-4">
                      <Badge
                        variant="outline"
                        className="border-rose-900/50 bg-black/60 text-muted-foreground"
                      >
                        {new Date(message.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </Badge>
                    </div>
                  )}

                  {/* Message */}
                  <div
                    className={cn(
                      'flex',
                      message.isOwn ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[70%] rounded-2xl px-4 py-2',
                        message.isOwn
                          ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white rounded-br-sm'
                          : 'bg-black/60 backdrop-blur text-foreground rounded-bl-sm border border-rose-900/50'
                      )}
                    >
                      <p className="text-sm break-words">{message.content}</p>
                      <div
                        className={cn(
                          'flex items-center gap-1 mt-1',
                          message.isOwn
                            ? 'justify-end text-rose-100'
                            : 'justify-end text-muted-foreground'
                        )}
                      >
                        <span className="text-xs">
                          {formatTime(message.createdAt)}
                        </span>
                        {message.isOwn && (
                          <span className="text-xs">
                            {message.status === 'read' && '✓✓'}
                            {message.status === 'delivered' && (
                              <span className="opacity-70">✓✓</span>
                            )}
                            {message.status === 'sent' && (
                              <span className="opacity-70">✓</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t border-rose-900/50 bg-black/60 backdrop-blur sticky bottom-0">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-end gap-2">
            <Textarea
              placeholder={t('chats.typeMessage')}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="min-h-[44px] max-h-32 resize-none border-rose-900/50 bg-black/40 focus-visible:border-rose-500 focus-visible:ring-rose-500/50"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="h-11 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
