// Types for chat system

export type MessageStatus = 'sent' | 'delivered' | 'read'

export type Message = {
  id: string
  chatId: string
  senderId: string
  content: string
  status: MessageStatus
  createdAt: string
  isOwn: boolean
}

export type UserStatus = {
  isOnline: boolean
  lastSeen: string | null
}

export type Chat = {
  id: string
  participant: {
    id: string
    name: string
    avatarUrl: string
    status: UserStatus
  }
  lastMessage: Message | null
  unreadCount: number
  isMuted: boolean
  profileReference?: {
    id: string
    username: string
    rank: string
    server: string
  }
  createdAt: string
}

export type Notification = {
  id: string
  type: 'message' | 'match' | 'profile-view' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  link?: string
  avatarUrl?: string
}

// Mock Data
export const mockChats: Chat[] = [
  {
    id: '1',
    participant: {
      id: 'user1',
      name: 'SummonerPro',
      avatarUrl: 'https://ui.shadcn.com/avatars/01.png',
      status: {
        isOnline: true,
        lastSeen: null,
      },
    },
    lastMessage: {
      id: 'msg1',
      chatId: '1',
      senderId: 'user1',
      content: 'Привет! Хочешь сыграть пару игр?',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
      isOwn: false,
    },
    unreadCount: 0,
    isMuted: false,
    profileReference: {
      id: 'profile1',
      username: 'SummonerPro',
      rank: 'Diamond',
      server: 'EUW',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '2',
    participant: {
      id: 'user2',
      name: 'LoLPlayer123',
      avatarUrl: 'https://ui.shadcn.com/avatars/02.png',
      status: {
        isOnline: false,
        lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      },
    },
    lastMessage: {
      id: 'msg2',
      chatId: '2',
      senderId: 'me',
      content: 'Окей, давай завтра вечером',
      status: 'delivered',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
      isOwn: true,
    },
    unreadCount: 2,
    isMuted: false,
    profileReference: {
      id: 'profile2',
      username: 'LoLPlayer123',
      rank: 'Platinum',
      server: 'EUNE',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: '3',
    participant: {
      id: 'user3',
      name: 'ChallengerSeeker',
      avatarUrl: 'https://ui.shadcn.com/avatars/03.png',
      status: {
        isOnline: false,
        lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      },
    },
    lastMessage: {
      id: 'msg3',
      chatId: '3',
      senderId: 'user3',
      content: 'Спасибо за игру!',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
      isOwn: false,
    },
    unreadCount: 0,
    isMuted: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
]

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: 'msg1-1',
      chatId: '1',
      senderId: 'me',
      content: 'Привет! Видел твою анкету',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      isOwn: true,
    },
    {
      id: 'msg1-2',
      chatId: '1',
      senderId: 'user1',
      content: 'Привет! Да, ищу напарника для ранкеда',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      isOwn: false,
    },
    {
      id: 'msg1-3',
      chatId: '1',
      senderId: 'me',
      content: 'Отлично! Я играю ADC',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      isOwn: true,
    },
    {
      id: 'msg1-4',
      chatId: '1',
      senderId: 'user1',
      content: 'Привет! Хочешь сыграть пару игр?',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      isOwn: false,
    },
  ],
  '2': [
    {
      id: 'msg2-1',
      chatId: '2',
      senderId: 'user2',
      content: 'Привет, увидел что ты тоже ищешь людей для нормсов',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      isOwn: false,
    },
    {
      id: 'msg2-2',
      chatId: '2',
      senderId: 'me',
      content: 'Да, всегда рад новым людям! Когда играешь обычно?',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 100).toISOString(),
      isOwn: true,
    },
    {
      id: 'msg2-3',
      chatId: '2',
      senderId: 'user2',
      content: 'Вечером обычно, после 19:00',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      isOwn: false,
    },
    {
      id: 'msg2-4',
      chatId: '2',
      senderId: 'me',
      content: 'Окей, давай завтра вечером',
      status: 'delivered',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      isOwn: true,
    },
  ],
  '3': [
    {
      id: 'msg3-1',
      chatId: '3',
      senderId: 'user3',
      content: 'Спасибо за игру!',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      isOwn: false,
    },
  ],
}

export const mockNotifications: Notification[] = [
  {
    id: 'notif1',
    type: 'message',
    title: 'Новое сообщение',
    message: 'LoLPlayer123: Окей, давай завтра вечером',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    link: '/chats/2',
    avatarUrl: 'https://ui.shadcn.com/avatars/02.png',
  },
  {
    id: 'notif2',
    type: 'match',
    title: 'Новый матч!',
    message: 'У вас совпадение с SummonerPro',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    link: '/matches',
    avatarUrl: 'https://ui.shadcn.com/avatars/01.png',
  },
  {
    id: 'notif3',
    type: 'profile-view',
    title: 'Профиль просмотрен',
    message: 'ChallengerSeeker посмотрел ваш профиль',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    link: '/profile',
    avatarUrl: 'https://ui.shadcn.com/avatars/03.png',
  },
  {
    id: 'notif4',
    type: 'system',
    title: 'Обновление системы',
    message: 'Добавлены новые функции в чат',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
]
