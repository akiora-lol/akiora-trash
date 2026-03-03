import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { createFileRoute } from '@tanstack/react-router'
import { FloatingMenu } from "@/components/FloatingMenu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
    Heart,
    X,
    Grid3x3,
    List,
    Filter,
    Plus,
    Search,
    Trophy,
    MapPin,
    Users,
    Clock,
    ChevronDown,
    Star,
    Flame,
    Sparkles,
    Swords,
    Target
} from "lucide-react"

// Types
type Rank = "iron" | "bronze" | "silver" | "gold" | "platinum" | "emerald" | "diamond" | "master" | "grandmaster" | "challenger"
type Server = "ru" | "euw" | "eune" | "tr" | "na"
type Role = "top" | "jg" | "mid" | "adc" | "sup"

interface LeagueRank {
    rank: Rank
    division: number
    lp?: number
}

interface RankRange {
    server: Server
    min_rank: LeagueRank
    max_rank: LeagueRank
}

interface HotForm {
    id: string
    owner_id: string
    owner_type: "group" | "user"
    liked_by: string[]
    disliked_by: string[]
    created_at: Date
    rank_range: RankRange[]
    my_roles: Role[]
    looking_for_roles: Role[]
    description: string
    owner_name?: string
    owner_avatar?: string
}

// Mock data
const mockHotForms: HotForm[] = [
    {
        id: "1",
        owner_id: "u1",
        owner_type: "user",
        owner_name: "ShadowBlade",
        owner_avatar: "",
        liked_by: [],
        disliked_by: [],
        created_at: new Date(Date.now() - 1000 * 60 * 30),
        rank_range: [
            { server: "euw", min_rank: { rank: "gold", division: 2 }, max_rank: { rank: "platinum", division: 1 } }
        ],
        my_roles: ["mid", "jg"],
        looking_for_roles: ["adc", "sup"],
        description: "Ищу саппорта и АДЦ для поднятия в соло/дуо. Играю на Зое, Силько, Виего. Мид или лесница по необходимости."
    },
    {
        id: "2",
        owner_id: "g1",
        owner_type: "group",
        owner_name: "Night Wolves",
        owner_avatar: "",
        liked_by: [],
        disliked_by: [],
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2),
        rank_range: [
            { server: "euw", min_rank: { rank: "platinum", division: 3 }, max_rank: { rank: "diamond", division: 2 } }
        ],
        my_roles: ["top", "jg", "mid"],
        looking_for_roles: ["adc", "sup"],
        description: "Киберспортивная организация ищет таланты для академического состава. Требования: Платина+, адекватность, желание развиваться."
    },
    {
        id: "3",
        owner_id: "u2",
        owner_type: "user",
        owner_name: "JungleKing",
        owner_avatar: "",
        liked_by: [],
        disliked_by: [],
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5),
        rank_range: [
            { server: "eune", min_rank: { rank: "silver", division: 1 }, max_rank: { rank: "gold", division: 4 } }
        ],
        my_roles: ["jg"],
        looking_for_roles: ["mid", "top"],
        description: "Лесник 200+ пингов на Ли Сине, Кса'Сабе. Ищу мидера для ботланки."
    },
    {
        id: "4",
        owner_id: "u3",
        owner_type: "user",
        owner_name: "SupportGod",
        owner_avatar: "",
        liked_by: [],
        disliked_by: [],
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24),
        rank_range: [
            { server: "ru", min_rank: { rank: "diamond", division: 4 }, max_rank: { rank: "master", division: 1 } }
        ],
        my_roles: ["sup"],
        looking_for_roles: ["adc"],
        description: "Мастер саппорт. Играю на Треш, Нами, Лакс. Ищу АДЦ для поднятия на дуо."
    },
    {
        id: "5",
        owner_id: "g2",
        owner_type: "group",
        owner_name: "Phoenix Rising",
        owner_avatar: "",
        liked_by: [],
        disliked_by: [],
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48),
        rank_range: [
            { server: "euw", min_rank: { rank: "gold", division: 1 }, max_rank: { rank: "diamond", division: 1 } }
        ],
        my_roles: ["top", "jg", "mid", "adc", "sup"],
        looking_for_roles: ["top", "jg"],
        description: "Любительская команда ищет топ и лес для участия в турнирах. Скрамы 3-4 раза в неделю."
    },
]

const rankOrder: Rank[] = ["iron", "bronze", "silver", "gold", "platinum", "emerald", "diamond", "master", "grandmaster", "challenger"]
const servers: Server[] = ["ru", "euw", "eune", "tr", "na"]
const roles: Role[] = ["top", "jg", "mid", "adc", "sup"]

const rankIcons: Record<Rank, string> = {
    iron: "🥉",
    bronze: "🥉",
    silver: "🥈",
    gold: "🥇",
    platinum: "💎",
    emerald: "💚",
    diamond: "💎",
    master: "⭐",
    grandmaster: "⭐⭐",
    challenger: "👑"
}

const roleIcons: Record<Role, string> = {
    top: "⚔️",
    jg: "🌲",
    mid: "🔮",
    adc: "🏹",
    sup: "🛡️"
}

export const Route = createFileRoute('/forms')({
    component: FormsPage,
})

function FormsPage() {
    const [activeTab, setActiveTab] = useState("hot")
    const [viewMode, setViewMode] = useState<"swipe" | "table">("swipe")
    const [forms, setForms] = useState<HotForm[]>(mockHotForms)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [filters, setFilters] = useState<{
        server: Server | "all"
        minRank: Rank | "all"
        maxRank: Rank | "all"
        roles: Role[]
    }>({
        server: "all",
        minRank: "all",
        maxRank: "all",
        roles: []
    })

    const filteredForms = forms.filter(form => {
        if (searchQuery && !form.owner_name?.toLowerCase().includes(searchQuery.toLowerCase())) return false
        if (filters.server !== "all" && !form.rank_range.some(r => r.server === filters.server)) return false
        if (filters.roles.length > 0 && !filters.roles.some(r => form.looking_for_roles.includes(r))) return false
        return true
    })

    const handleSwipe = (direction: "left" | "right") => {
        const currentForm = filteredForms[currentIndex]
        if (!currentForm) return

        if (direction === "right") {
            // Like
            setForms(forms.map(f => f.id === currentForm.id ? { ...f, liked_by: [...f.liked_by, "me"] } : f))
        } else {
            // Dislike
            setForms(forms.map(f => f.id === currentForm.id ? { ...f, disliked_by: [...f.disliked_by, "me"] } : f))
        }

        setTimeout(() => {
            setCurrentIndex(prev => prev + 1)
        }, 200)
    }

    const resetSwipe = () => {
        setCurrentIndex(0)
    }

    return (
        <div className="min-h-screen bg-[#030303]">


            <div className="container mx-auto px-4 py-8 max-w-6xl ml-14">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-cyan-50 mb-2 flex items-center gap-3">
                                <Flame className="h-10 w-10 text-orange-500" />
                                Формы
                            </h1>
                            <p className="text-cyan-200/60">
                                Найди тиммейтов или команду своей мечты
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setViewMode(viewMode === "swipe" ? "table" : "swipe")}
                                className="border-cyan-500/30 bg-transparent text-cyan-400 hover:bg-cyan-500/10"
                            >
                                {viewMode === "swipe" ? <List className="h-5 w-5" /> : <Grid3x3 className="h-5 w-5" />}
                            </Button>
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:from-cyan-500 hover:to-cyan-400 shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)]"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Создать
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
                    <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 bg-black/60 border border-cyan-500/20">
                        <TabsTrigger value="hot" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-red-500/20">
                            <Flame className="h-4 w-4" />
                            Горячие
                        </TabsTrigger>
                        <TabsTrigger value="cold" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20">
                            <Sparkles className="h-4 w-4" />
                            Холодные
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="hot" className="mt-6">
                        {viewMode === "swipe" ? (
                            <SwipeView
                                forms={filteredForms}
                                currentIndex={currentIndex}
                                onSwipe={handleSwipe}
                                onReset={resetSwipe}
                            />
                        ) : (
                            <TableView
                                forms={filteredForms}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                showFilters={showFilters}
                                setShowFilters={setShowFilters}
                                filters={filters}
                                setFilters={setFilters}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="cold" className="mt-6">
                        <div className="text-center py-20">
                            <Sparkles className="h-16 w-16 text-cyan-400/30 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-cyan-50 mb-2">Холодные формы</h2>
                            <p className="text-cyan-200/60 mb-4">
                                Формы, которые ждут своего часа
                            </p>
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Создать форму
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateFormModal onClose={() => setShowCreateModal(false)} />
                )}
            </AnimatePresence>
        </div>
    )
}

// Swipe View Component
function SwipeView({
    forms,
    currentIndex,
    onSwipe,
    onReset
}: {
    forms: HotForm[]
    currentIndex: number
    onSwipe: (direction: "left" | "right") => void
    onReset: () => void
}) {
    const x = useMotionValue(0)
    const rotate = useTransform(x, [-200, 200], [-15, 15])
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0])

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.x > 100) {
            onSwipe("right")
        } else if (info.offset.x < -100) {
            onSwipe("left")
        }
    }

    if (forms.length === 0 || currentIndex >= forms.length) {
        return (
            <div className="text-center py-20">
                <div className="w-32 h-32 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-16 w-16 text-cyan-400/50" />
                </div>
                <h2 className="text-2xl font-bold text-cyan-50 mb-2">Формы закончились</h2>
                <p className="text-cyan-200/60 mb-6">
                    Заходи позже или создай свою форму
                </p>
                <Button
                    onClick={onReset}
                    className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white"
                >
                    Начать сначала
                </Button>
            </div>
        )
    }

    const currentForm = forms[currentIndex]
    const nextForm = forms[currentIndex + 1]

    return (
        <div className="relative max-w-md mx-auto">
            {/* Next card preview */}
            {nextForm && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 0.95 }}
                    className="absolute inset-0 z-0"
                >
                    <FormCard form={nextForm} />
                </motion.div>
            )}

            {/* Current card */}
            <motion.div
                style={{ x, rotate, opacity }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                className="relative z-10 cursor-grab active:cursor-grabbing"
            >
                <FormCard form={currentForm} />

                {/* Swipe indicators */}
                <motion.div
                    style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
                    className="absolute top-8 left-8 border-4 border-green-500 text-green-500 px-4 py-2 rounded-lg text-2xl font-bold rotate-[-15deg] z-20 pointer-events-none"
                >
                    LIKE
                </motion.div>
                <motion.div
                    style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
                    className="absolute top-8 right-8 border-4 border-red-500 text-red-500 px-4 py-2 rounded-lg text-2xl font-bold rotate-[15deg] z-20 pointer-events-none"
                >
                    NOPE
                </motion.div>
            </motion.div>

            {/* Action buttons */}
            <div className="flex justify-center gap-6 mt-8">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onSwipe("left")}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/20 border-2 border-red-500/50 flex items-center justify-center text-red-500 hover:from-red-500/30 hover:to-red-600/30 transition-all shadow-[0_0_30px_-10px_rgba(239,68,68,0.4)]"
                >
                    <X className="h-8 w-8" />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onSwipe("right")}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 border-2 border-green-500/50 flex items-center justify-center text-green-500 hover:from-green-500/30 hover:to-green-600/30 transition-all shadow-[0_0_30px_-10px_rgba(34,197,94,0.4)]"
                >
                    <Heart className="h-8 w-8" />
                </motion.button>
            </div>
        </div>
    )
}

// Form Card Component
function FormCard({ form }: { form: HotForm }) {
    return (
        <Card className="border-cyan-500/30 bg-gradient-to-b from-black/90 via-black/80 to-black/90 backdrop-blur-xl overflow-hidden shadow-[0_0_60px_-20px_rgba(6,182,212,0.4)]">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-2 border-cyan-500/30 flex items-center justify-center">
                            {form.owner_avatar ? (
                                <img src={form.owner_avatar} alt={form.owner_name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span className="text-cyan-400 font-bold text-xl">
                                    {form.owner_name?.[0]?.toUpperCase() || "?"}
                                </span>
                            )}
                        </div>
                        <div>
                            <CardTitle className="text-cyan-50 text-lg">{form.owner_name}</CardTitle>
                            <CardDescription className="text-cyan-200/60 flex items-center gap-2">
                                {form.owner_type === "group" ? (
                                    <><Users className="h-3 w-3" /> Команда</>
                                ) : (
                                    <><User className="h-3 w-3" /> Игрок</>
                                )}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-cyan-400/70 text-sm">
                        <Clock className="h-4 w-4" />
                        {formatTimeAgo(form.created_at)}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Rank Range */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-cyan-200/70 text-sm">
                        <Trophy className="h-4 w-4 text-cyan-400" />
                        Ранг
                    </div>
                    {form.rank_range.map((range, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                            <MapPin className="h-4 w-4 text-cyan-400/70" />
                            <span className="text-cyan-100 uppercase text-sm">{range.server}</span>
                            <span className="text-cyan-200/50">•</span>
                            <span className="text-cyan-100">
                                {rankIcons[range.min_rank.rank]} {range.min_rank.rank} {range.min_rank.division}
                            </span>
                            <span className="text-cyan-200/50">-</span>
                            <span className="text-cyan-100">
                                {rankIcons[range.max_rank.rank]} {range.max_rank.rank} {range.max_rank.division}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Roles */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-cyan-200/70 text-sm">
                        <Target className="h-4 w-4 text-cyan-400" />
                        Ищет
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {form.looking_for_roles.map(role => (
                            <span
                                key={role}
                                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 text-cyan-100 text-sm flex items-center gap-1.5"
                            >
                                <span>{roleIcons[role]}</span>
                                <span className="uppercase">{role}</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-cyan-200/70 text-sm">
                        <Swords className="h-4 w-4 text-cyan-400" />
                        Описание
                    </div>
                    <p className="text-cyan-100/80 text-sm leading-relaxed">
                        {form.description}
                    </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 pt-2 border-t border-cyan-500/20">
                    <div className="flex items-center gap-1.5 text-green-400 text-sm">
                        <Heart className="h-4 w-4" />
                        <span>{form.liked_by.length}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-red-400 text-sm">
                        <X className="h-4 w-4" />
                        <span>{form.disliked_by.length}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Table View Component
function TableView({
    forms,
    searchQuery,
    setSearchQuery,
    showFilters,
    setShowFilters,
    filters,
    setFilters
}: {
    forms: HotForm[]
    searchQuery: string
    setSearchQuery: (v: string) => void
    showFilters: boolean
    setShowFilters: (v: boolean) => void
    filters: any
    setFilters: (v: any) => void
}) {
    return (
        <Card className="border-cyan-500/30 bg-black/80 backdrop-blur-xl">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-cyan-50">Все формы</CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-400/50" />
                            <Input
                                placeholder="Поиск..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-64 border-cyan-500/30 bg-black/60 text-cyan-50 placeholder:text-cyan-200/30 focus:border-cyan-500/50 focus:ring-cyan-500/20 h-9"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className={cn(
                                "border-cyan-500/30 bg-transparent text-cyan-400 hover:bg-cyan-500/10",
                                showFilters && "bg-cyan-500/10"
                            )}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Фильтры
                        </Button>
                    </div>
                </div>

                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex flex-wrap gap-4 pt-4 border-t border-cyan-500/20"
                    >
                        <div className="space-y-2">
                            <Label className="text-cyan-200/70">Сервер</Label>
                            <Select
                                value={filters.server}
                                onValueChange={(v) => setFilters({ ...filters, server: v })}
                            >
                                <SelectTrigger className="w-32 border-cyan-500/30 bg-black/60">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Все</SelectItem>
                                    {servers.map(s => (
                                        <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-cyan-200/70">Роль</Label>
                            <div className="flex gap-1">
                                {roles.map(role => (
                                    <button
                                        key={role}
                                        onClick={() => {
                                            const newRoles = filters.roles.includes(role)
                                                ? filters.roles.filter(r => r !== role)
                                                : [...filters.roles, role]
                                            setFilters({ ...filters, roles: newRoles })
                                        }}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg border text-sm transition-all",
                                            filters.roles.includes(role)
                                                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-100"
                                                : "bg-black/60 border-cyan-500/30 text-cyan-200/60 hover:border-cyan-500/50"
                                        )}
                                    >
                                        {roleIcons[role]} {role.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </CardHeader>

            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-cyan-500/20">
                                <th className="text-left py-3 px-4 text-cyan-200/60 font-medium text-sm">Игрок/Команда</th>
                                <th className="text-left py-3 px-4 text-cyan-200/60 font-medium text-sm">Сервер</th>
                                <th className="text-left py-3 px-4 text-cyan-200/60 font-medium text-sm">Ранг</th>
                                <th className="text-left py-3 px-4 text-cyan-200/60 font-medium text-sm">Ищет</th>
                                <th className="text-left py-3 px-4 text-cyan-200/60 font-medium text-sm">Описание</th>
                                <th className="text-right py-3 px-4 text-cyan-200/60 font-medium text-sm">Лайки</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forms.map((form) => (
                                <tr key={form.id} className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
                                                <span className="text-cyan-400 font-semibold">
                                                    {form.owner_name?.[0]?.toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="text-cyan-50 font-medium">{form.owner_name}</div>
                                                <div className="text-cyan-200/50 text-xs">
                                                    {form.owner_type === "group" ? "Команда" : "Игрок"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-cyan-100 uppercase text-sm">
                                            {form.rank_range[0]?.server}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="text-cyan-100 text-sm">
                                            {rankIcons[form.rank_range[0]?.min_rank.rank]} {form.rank_range[0]?.min_rank.rank}
                                            <span className="text-cyan-200/50"> - </span>
                                            {rankIcons[form.rank_range[0]?.max_rank.rank]} {form.rank_range[0]?.max_rank.rank}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-1">
                                            {form.looking_for_roles.map(role => (
                                                <span key={role} className="text-lg" title={role}>
                                                    {roleIcons[role]}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <p className="text-cyan-100/70 text-sm truncate max-w-xs">
                                            {form.description}
                                        </p>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <span className="text-green-400 flex items-center justify-end gap-1">
                                            <Heart className="h-4 w-4" />
                                            {form.liked_by.length}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}

// Create Form Modal
function CreateFormModal({ onClose }: { onClose: () => void }) {
    const [formData, setFormData] = useState({
        owner_type: "user" as "user" | "group",
        server: "euw" as Server,
        minRank: "gold" as Rank,
        maxRank: "diamond" as Rank,
        division: 4,
        my_roles: [] as Role[],
        looking_for_roles: [] as Role[],
        description: ""
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Creating form:", formData)
        onClose()
    }

    const toggleRole = (role: Role, field: "my_roles" | "looking_for_roles") => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(role)
                ? prev[field].filter(r => r !== role)
                : [...prev[field], role]
        }))
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl"
            >
                <Card className="border-cyan-500/30 bg-gradient-to-b from-black/95 via-black/90 to-black/95 backdrop-blur-xl shadow-[0_0_100px_-30px_rgba(6,182,212,0.4)]">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-cyan-50 text-2xl flex items-center gap-2">
                                    <Flame className="h-6 w-6 text-orange-500" />
                                    Создать форму
                                </CardTitle>
                                <CardDescription className="text-cyan-200/60">
                                    Найди идеальных тиммейтов
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-cyan-400 hover:bg-cyan-500/10"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            {/* Owner Type */}
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    onClick={() => setFormData({ ...formData, owner_type: "user" })}
                                    className={cn(
                                        "p-4 rounded-xl border-2 cursor-pointer transition-all",
                                        formData.owner_type === "user"
                                            ? "border-cyan-500/50 bg-cyan-500/10"
                                            : "border-cyan-500/20 bg-black/40 hover:border-cyan-500/30"
                                    )}
                                >
                                    <User className="h-6 w-6 text-cyan-400 mb-2" />
                                    <div className="text-cyan-50 font-medium">Игрок</div>
                                    <div className="text-cyan-200/50 text-sm">Индивидуальный поиск</div>
                                </div>
                                <div
                                    onClick={() => setFormData({ ...formData, owner_type: "group" })}
                                    className={cn(
                                        "p-4 rounded-xl border-2 cursor-pointer transition-all",
                                        formData.owner_type === "group"
                                            ? "border-cyan-500/50 bg-cyan-500/10"
                                            : "border-cyan-500/20 bg-black/40 hover:border-cyan-500/30"
                                    )}
                                >
                                    <Users className="h-6 w-6 text-cyan-400 mb-2" />
                                    <div className="text-cyan-50 font-medium">Команда</div>
                                    <div className="text-cyan-200/50 text-sm">Поиск игроков</div>
                                </div>
                            </div>

                            {/* Server & Rank */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-cyan-200/70">Сервер</Label>
                                    <Select
                                        value={formData.server}
                                        onValueChange={(v: Server) => setFormData({ ...formData, server: v })}
                                    >
                                        <SelectTrigger className="border-cyan-500/30 bg-black/60">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {servers.map(s => (
                                                <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-cyan-200/70">Мин. ранг</Label>
                                    <Select
                                        value={formData.minRank}
                                        onValueChange={(v: Rank) => setFormData({ ...formData, minRank: v })}
                                    >
                                        <SelectTrigger className="border-cyan-500/30 bg-black/60">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rankOrder.map(r => (
                                                <SelectItem key={r} value={r}>
                                                    {rankIcons[r]} {r.charAt(0).toUpperCase() + r.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-cyan-200/70">Макс. ранг</Label>
                                    <Select
                                        value={formData.maxRank}
                                        onValueChange={(v: Rank) => setFormData({ ...formData, maxRank: v })}
                                    >
                                        <SelectTrigger className="border-cyan-500/30 bg-black/60">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rankOrder.map(r => (
                                                <SelectItem key={r} value={r}>
                                                    {rankIcons[r]} {r.charAt(0).toUpperCase() + r.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Roles */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-cyan-200/70">Твои роли</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {roles.map(role => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => toggleRole(role, "my_roles")}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg border transition-all",
                                                    formData.my_roles.includes(role)
                                                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-100"
                                                        : "bg-black/60 border-cyan-500/30 text-cyan-200/60 hover:border-cyan-500/50"
                                                )}
                                            >
                                                {roleIcons[role]} {role.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-cyan-200/70">Ищешь роли</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {roles.map(role => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => toggleRole(role, "looking_for_roles")}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg border transition-all",
                                                    formData.looking_for_roles.includes(role)
                                                        ? "bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 border-cyan-500/50 text-cyan-100"
                                                        : "bg-black/60 border-cyan-500/30 text-cyan-200/60 hover:border-cyan-500/50"
                                                )}
                                            >
                                                {roleIcons[role]} {role.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label className="text-cyan-200/70">Описание</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Расскажи о себе, своих целях и требованиях..."
                                    className="min-h-[120px] border-cyan-500/30 bg-black/60 text-cyan-50 placeholder:text-cyan-200/30 focus:border-cyan-500/50 focus:ring-cyan-500/20 resize-none"
                                />
                            </div>
                        </CardContent>

                        <div className="flex justify-end gap-4 p-6 pt-0">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="border-cyan-500/30 bg-transparent text-cyan-50 hover:bg-cyan-500/10"
                            >
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:from-cyan-500 hover:to-cyan-400 shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)]"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Создать форму
                            </Button>
                        </div>
                    </form>
                </Card>
            </motion.div>
        </motion.div>
    )
}

// Helper functions
function formatTimeAgo(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes} мин назад`
    if (hours < 24) return `${hours} ч назад`
    return `${days} дн назад`
}

function User({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    )
}
