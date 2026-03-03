import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createFileRoute } from '@tanstack/react-router'
import { FloatingMenu } from "@/components/FloatingMenu"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    Search,
    Send,
    Phone,
    Video,
    MoreVertical,
    Smile,
    Paperclip,
    Mic,
    Check,
    CheckCheck,
    ArrowLeft,
    Image,
    File,
    MapPin
} from "lucide-react"

// Types
interface Message {
    id: string
    text: string
    timestamp: Date
    sender: 'me' | 'them'
    status: 'sent' | 'delivered' | 'read'
    type: 'text' | 'image' | 'file'
}

interface Chat {
    id: string
    name: string
    avatar: string
    lastMessage: string
    lastMessageTime: Date
    unread: number
    online: boolean
    typing: boolean
    messages: Message[]
}

// Mock data
const mockChats: Chat[] = [
    {
        id: "1",
        name: "ShadowHunter",
        avatar: "",
        lastMessage: "GG WP! Когда следующий матч?",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
        unread: 2,
        online: true,
        typing: false,
        messages: [
            { id: "1", text: "Привет! Как насчёт катки?", timestamp: new Date(Date.now() - 1000 * 60 * 60), sender: "them", status: "read", type: "text" },
            { id: "2", text: "Давай через час", timestamp: new Date(Date.now() - 1000 * 60 * 55), sender: "me", status: "read", type: "text" },
            { id: "3", text: "Договорились", timestamp: new Date(Date.now() - 1000 * 60 * 50), sender: "them", status: "read", type: "text" },
            { id: "4", text: "GG WP! Когда следующий матч?", timestamp: new Date(Date.now() - 1000 * 60 * 5), sender: "them", status: "delivered", type: "text" },
        ]
    },
    {
        id: "2",
        name: "MidOrFeed",
        avatar: "",
        lastMessage: "Зацени мой новый билд",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
        unread: 0,
        online: false,
        typing: false,
        messages: [
            { id: "1", text: "Йо, ты видел патч?", timestamp: new Date(Date.now() - 1000 * 60 * 120), sender: "them", status: "read", type: "text" },
            { id: "2", text: "Ага, нерфнули моего мейна :(", timestamp: new Date(Date.now() - 1000 * 60 * 90), sender: "me", status: "read", type: "text" },
            { id: "3", text: "Зацени мой новый билд", timestamp: new Date(Date.now() - 1000 * 60 * 30), sender: "them", status: "read", type: "text" },
        ]
    },
    {
        id: "3",
        name: "JungleDiff",
        avatar: "",
        lastMessage: "Печать...",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 2),
        unread: 1,
        online: true,
        typing: true,
        messages: [
            { id: "1", text: "Кто на леску?", timestamp: new Date(Date.now() - 1000 * 60 * 10), sender: "them", status: "read", type: "text" },
        ]
    },
    {
        id: "4",
        name: "SupportGap",
        avatar: "",
        lastMessage: "Спасибо за хил!",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
        unread: 0,
        online: false,
        typing: false,
        messages: []
    },
    {
        id: "5",
        name: "Team Captain",
        avatar: "",
        lastMessage: "Сбор в 20:00 по МСК",
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
        unread: 5,
        online: true,
        typing: false,
        messages: []
    },
]

export const Route = createFileRoute('/messenger')({
    component: MessengerPage,
})

function formatTime(date: Date) {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
        return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    } else if (days === 1) {
        return 'Вчера'
    } else if (days < 7) {
        return date.toLocaleDateString('ru-RU', { weekday: 'short' })
    } else {
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
    }
}

function MessengerPage() {
    const [chats, setChats] = useState<Chat[]>(mockChats)
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [newMessage, setNewMessage] = useState("")
    const [showMobileChat, setShowMobileChat] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [showAttachments, setShowAttachments] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const filteredChats = chats.filter(chat =>
        chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [selectedChat?.messages])

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedChat) return

        const message: Message = {
            id: Date.now().toString(),
            text: newMessage,
            timestamp: new Date(),
            sender: 'me',
            status: 'sent',
            type: 'text'
        }

        const updatedChats = chats.map(chat => {
            if (chat.id === selectedChat.id) {
                return {
                    ...chat,
                    messages: [...chat.messages, message],
                    lastMessage: newMessage,
                    lastMessageTime: new Date()
                }
            }
            return chat
        })

        setChats(updatedChats)
        setSelectedChat({
            ...selectedChat,
            messages: [...selectedChat.messages, message]
        })
        setNewMessage("")
        setShowEmojiPicker(false)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleSelectChat = (chat: Chat) => {
        setSelectedChat(chat)
        setShowMobileChat(true)
        const updatedChats = chats.map(c =>
            c.id === chat.id ? { ...c, unread: 0 } : c
        )
        setChats(updatedChats)
    }

    const emojis = ["😀", "😂", "😍", "🥰", "😎", "🤔", "👍", "👎", "❤️", "🔥", "🎮", "GG", "WP", "GL"]

    return (
        <div className="min-h-screen bg-[#030303] flex">
            {/* Left Menu */}


            {/* Main Content */}
            <div className="flex-1 flex ml-26">
                {/* Sidebar - Chat List */}
                <motion.div
                    className={cn(
                        "w-80 border-r border-cyan-500/20 bg-black/40 backdrop-blur-xl flex flex-col",
                        showMobileChat && "hidden md:flex"
                    )}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-cyan-500/20">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-xl font-bold text-cyan-50">Сообщения</h1>
                            <Button variant="ghost" size="icon" className="text-cyan-400 hover:bg-cyan-500/10 h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/50" />
                            <Input
                                placeholder="Поиск..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-9 border-cyan-500/30 bg-black/60 text-cyan-50 placeholder:text-cyan-200/30 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-sm"
                            />
                        </div>
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredChats.map((chat) => (
                            <motion.div
                                key={chat.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => handleSelectChat(chat)}
                                className={cn(
                                    "p-3 border-b border-cyan-500/10 cursor-pointer transition-all hover:bg-cyan-500/5",
                                    selectedChat?.id === chat.id && "bg-cyan-500/10"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
                                            {chat.avatar ? (
                                                <img src={chat.avatar} alt={chat.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <span className="text-cyan-400 font-semibold text-sm">
                                                    {chat.name[0].toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        {chat.online && (
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-cyan-50 font-medium truncate text-sm">{chat.name}</h3>
                                            <span className="text-cyan-200/40 text-xs flex-shrink-0">{formatTime(chat.lastMessageTime)}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-cyan-200/60 text-sm truncate">
                                                {chat.typing ? (
                                                    <span className="text-cyan-400 italic text-xs">Печатает...</span>
                                                ) : (
                                                    <span className="text-xs">{chat.lastMessage}</span>
                                                )}
                                            </p>
                                            {chat.unread > 0 && (
                                                <div className="min-w-[18px] h-4.5 px-1 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-black text-xs font-bold">{chat.unread}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Chat Area */}
                <div className={cn(
                    "flex-1 flex flex-col bg-black/20",
                    !showMobileChat && "hidden md:flex"
                )}>
                    {selectedChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-3 border-b border-cyan-500/20 bg-black/40 backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowMobileChat(false)}
                                        className="md:hidden text-cyan-400 h-8 w-8"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                    <div className="relative flex-shrink-0">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
                                            {selectedChat.avatar ? (
                                                <img src={selectedChat.avatar} alt={selectedChat.name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <span className="text-cyan-400 font-semibold text-sm">
                                                    {selectedChat.name[0].toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        {selectedChat.online && (
                                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-black" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-cyan-50 font-semibold text-sm truncate">{selectedChat.name}</h2>
                                        <p className="text-cyan-200/50 text-xs truncate">
                                            {selectedChat.typing ? (
                                                <span className="text-cyan-400">Печатает...</span>
                                            ) : selectedChat.online ? (
                                                'В сети'
                                            ) : (
                                                'Был(а) недавно'
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                        <Button variant="ghost" size="icon" className="text-cyan-400 hover:bg-cyan-500/10 h-8 w-8 hidden sm:flex">
                                            <Phone className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-cyan-400 hover:bg-cyan-500/10 h-8 w-8 hidden sm:flex">
                                            <Video className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-cyan-400 hover:bg-cyan-500/10 h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                {selectedChat.messages.map((message, index) => {
                                    const isMe = message.sender === 'me'
                                    const showAvatar = index === 0 || selectedChat.messages[index - 1]?.sender !== message.sender

                                    return (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={cn("flex gap-2", isMe ? "flex-row-reverse" : "")}
                                        >
                                            {!isMe && (
                                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                                                    {showAvatar ? (
                                                        <span className="text-cyan-400 text-xs font-semibold">
                                                            {selectedChat.name[0].toUpperCase()}
                                                        </span>
                                                    ) : (
                                                        <div className="w-7" />
                                                    )}
                                                </div>
                                            )}
                                            <div className={cn(
                                                "max-w-[75%] rounded-2xl px-3 py-2",
                                                isMe
                                                    ? "bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-br-sm"
                                                    : "bg-cyan-500/10 border border-cyan-500/20 text-cyan-50 rounded-bl-sm"
                                            )}>
                                                <p className="text-sm">{message.text}</p>
                                                <div className={cn(
                                                    "flex items-center gap-1 mt-0.5 text-xs",
                                                    isMe ? "text-cyan-100 justify-end" : "text-cyan-200/50"
                                                )}>
                                                    <span>{formatTime(message.timestamp)}</span>
                                                    {isMe && (
                                                        <span>
                                                            {message.status === 'read' ? (
                                                                <CheckCheck className="h-3 w-3" />
                                                            ) : message.status === 'delivered' ? (
                                                                <CheckCheck className="h-3 w-3 text-cyan-300" />
                                                            ) : (
                                                                <Check className="h-3 w-3 text-cyan-300" />
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-3 border-t border-cyan-500/20 bg-black/40 backdrop-blur-xl">
                                {/* Emoji Picker */}
                                <AnimatePresence>
                                    {showEmojiPicker && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 20 }}
                                            className="mb-2 p-2 rounded-xl bg-black/80 border border-cyan-500/20 grid grid-cols-7 gap-1"
                                        >
                                            {emojis.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => {
                                                        setNewMessage(prev => prev + emoji)
                                                        inputRef.current?.focus()
                                                    }}
                                                    className="text-lg hover:bg-cyan-500/20 rounded p-0.5 transition-colors"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Attachments */}
                                <AnimatePresence>
                                    {showAttachments && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 20 }}
                                            className="mb-2 flex gap-1"
                                        >
                                            <Button variant="ghost" size="icon" className="text-cyan-400 hover:bg-cyan-500/20 h-8 w-8">
                                                <Image className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-cyan-400 hover:bg-cyan-500/20 h-8 w-8">
                                                <File className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-cyan-400 hover:bg-cyan-500/20 h-8 w-8">
                                                <MapPin className="h-4 w-4" />
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowAttachments(!showAttachments)}
                                        className={cn(
                                            "text-cyan-400 hover:bg-cyan-500/20 h-9 w-9",
                                            showAttachments && "bg-cyan-500/20"
                                        )}
                                    >
                                        <Paperclip className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className={cn(
                                            "text-cyan-400 hover:bg-cyan-500/20 h-9 w-9",
                                            showEmojiPicker && "bg-cyan-500/20"
                                        )}
                                    >
                                        <Smile className="h-4 w-4" />
                                    </Button>
                                    <div className="flex-1">
                                        <Input
                                            ref={inputRef}
                                            placeholder="Написать сообщение..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            className="h-9 border-cyan-500/30 bg-black/60 text-cyan-50 placeholder:text-cyan-200/30 focus:border-cyan-500/50 focus:ring-cyan-500/20 text-sm"
                                        />
                                    </div>
                                    {newMessage.trim() ? (
                                        <Button
                                            onClick={handleSendMessage}
                                            className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:from-cyan-500 hover:to-cyan-400 shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] h-9 w-9"
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button variant="ghost" size="icon" className="text-cyan-400 hover:bg-cyan-500/20 h-9 w-9">
                                            <Mic className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                                    <Send className="h-10 w-10 text-cyan-400/50" />
                                </div>
                                <h2 className="text-cyan-50 text-lg font-semibold mb-2">Выберите чат</h2>
                                <p className="text-cyan-200/50 text-sm">
                                    Выберите собеседника из списка слева
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
