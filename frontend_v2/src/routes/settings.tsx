import { useState } from "react"
import { motion } from "framer-motion"
import { createFileRoute } from '@tanstack/react-router'
import { FloatingMenu } from "@/components/FloatingMenu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Camera,
    User as UserIcon,
    Share2,
    Gamepad2,
    Users,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    Save,
    Link as LinkIcon,
    Shield,
    Crown,
    Bell,
    LogOut
} from "lucide-react"

// Types
type SocialKey = "vk" | "tg" | "ds" | "yt" | "tw" | "sc"
type Gender = "male" | "female" | null
type SocialType = "personal" | "public"
type GamePlatform = "riot" | "steam" | "epic" | "battle" | "xbox" | "psn"

interface Social {
    link: string
    hidden: boolean
    type: SocialType
}

interface GameAccount {
    platform: GamePlatform
    username: string
    region?: string
    verified: boolean
}

interface ClubSetting {
    clubId: string
    clubName: string
    role: "owner" | "admin" | "member"
    notifications: boolean
    visible: boolean
}

interface UserProfile {
    email: string
    avatar: string
    nickname: string
    gender: Gender
    age: number | null
    socials: Record<SocialKey, Social[]>
    gameAccounts: GameAccount[]
    clubSettings: ClubSetting[]
}

const socialPlatforms: { key: SocialKey; label: string; placeholder: string; icon?: string }[] = [
    { key: "vk", label: "VKontakte", placeholder: "https://vk.com/username" },
    { key: "tg", label: "Telegram", placeholder: "https://t.me/username" },
    { key: "ds", label: "Discord", placeholder: "username#1234" },
    { key: "yt", label: "YouTube", placeholder: "https://youtube.com/@channel" },
    { key: "tw", label: "Twitter", placeholder: "https://twitter.com/username" },
    { key: "sc", label: "SoundCloud", placeholder: "https://soundcloud.com/username" },
]

const gamePlatforms: { key: GamePlatform; label: string; placeholder: string }[] = [
    { key: "riot", label: "Riot Games", placeholder: "Riot ID#1234" },
    { key: "steam", label: "Steam", placeholder: "Steam ID или профиль" },
    { key: "epic", label: "Epic Games", placeholder: "Epic username" },
    { key: "battle", label: "Battle.net", placeholder: "BattleTag#1234" },
    { key: "xbox", label: "Xbox Live", placeholder: "Xbox Gamertag" },
    { key: "psn", label: "PlayStation Network", placeholder: "PSN ID" },
]

export const Route = createFileRoute('/settings')({
    component: ProfilePage,
})

function ProfilePage() {
    // Mock initial data
    const [profile, setProfile] = useState<UserProfile>({
        email: "summoner@rift.com",
        avatar: "",
        nickname: "ShadowBlade",
        gender: null,
        age: null,
        socials: {
            vk: [],
            tg: [],
            ds: [{ link: "ShadowBlade#1234", hidden: false, type: "personal" }],
            yt: [],
            tw: [],
            sc: [],
        },
        gameAccounts: [
            { platform: "riot", username: "ShadowBlade#EUW", region: "EUW", verified: true },
        ],
        clubSettings: [],
    })

    const [isDirty, setIsDirty] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string>("")
    const [activeTab, setActiveTab] = useState("general")

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
                setProfile({ ...profile, avatar: reader.result as string })
                setIsDirty(true)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleInputChange = (field: keyof UserProfile, value: any) => {
        setProfile({ ...profile, [field]: value })
        setIsDirty(true)
    }

    // Social handlers
    const handleAddSocial = (platform: SocialKey) => {
        const newSocial: Social = { link: "", hidden: false, type: "personal" }
        setProfile({
            ...profile,
            socials: {
                ...profile.socials,
                [platform]: [...profile.socials[platform], newSocial],
            },
        })
        setIsDirty(true)
    }

    const handleUpdateSocial = (platform: SocialKey, index: number, updates: Partial<Social>) => {
        const updated = profile.socials[platform].map((s, i) =>
            i === index ? { ...s, ...updates } : s
        )
        setProfile({
            ...profile,
            socials: { ...profile.socials, [platform]: updated },
        })
        setIsDirty(true)
    }

    const handleRemoveSocial = (platform: SocialKey, index: number) => {
        const updated = profile.socials[platform].filter((_, i) => i !== index)
        setProfile({
            ...profile,
            socials: { ...profile.socials, [platform]: updated },
        })
        setIsDirty(true)
    }

    // Game account handlers
    const handleAddGameAccount = (platform: GamePlatform) => {
        const newAccount: GameAccount = { platform, username: "", region: "", verified: false }
        setProfile({
            ...profile,
            gameAccounts: [...profile.gameAccounts, newAccount],
        })
        setIsDirty(true)
    }

    const handleUpdateGameAccount = (index: number, updates: Partial<GameAccount>) => {
        const updated = profile.gameAccounts.map((a, i) =>
            i === index ? { ...a, ...updates } : a
        )
        setProfile({ ...profile, gameAccounts: updated })
        setIsDirty(true)
    }

    const handleRemoveGameAccount = (index: number) => {
        const updated = profile.gameAccounts.filter((_, i) => i !== index)
        setProfile({ ...profile, gameAccounts: updated })
        setIsDirty(true)
    }

    const handleSave = async () => {
        console.log("Saving profile:", profile)
        setIsDirty(false)
    }

    return (
        <div className="min-h-screen bg-[#030303]">


            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-cyan-50 mb-2">
                        Профиль
                    </h1>
                    <p className="text-cyan-200/60">
                        Управляйте настройками аккаунта
                    </p>
                </motion.div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full justify-start overflow-x-auto mb-8">
                        <TabsTrigger value="general" className="gap-2">
                            <UserIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">Основное</span>
                        </TabsTrigger>
                        <TabsTrigger value="socials" className="gap-2">
                            <Share2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Соцсети</span>
                        </TabsTrigger>
                        <TabsTrigger value="gaming" className="gap-2">
                            <Gamepad2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Игровые</span>
                        </TabsTrigger>
                        <TabsTrigger value="clubs" className="gap-2">
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">Клубы</span>
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="gap-2">
                            <Shield className="h-4 w-4" />
                            <span className="hidden sm:inline">Настройки</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* General Tab */}
                    <TabsContent value="general" className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="border-cyan-500/30 bg-black/80 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle className="text-cyan-50 flex items-center gap-2">
                                        <UserIcon className="h-5 w-5 text-cyan-400" />
                                        Аватар
                                    </CardTitle>
                                    <CardDescription className="text-cyan-200/60">
                                        Загрузите изображение профиля
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-6">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-2 border-cyan-500/30 overflow-hidden flex items-center justify-center">
                                                {avatarPreview || profile.avatar ? (
                                                    <img
                                                        src={avatarPreview || profile.avatar}
                                                        alt="Avatar"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <UserIcon className="h-12 w-12 text-cyan-400/50" />
                                                )}
                                            </div>
                                            <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <Camera className="h-6 w-6 text-cyan-400" />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleAvatarChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        <div>
                                            <p className="text-cyan-100 text-sm mb-2">
                                                Нажмите на аватар, чтобы загрузить новое изображение
                                            </p>
                                            <p className="text-cyan-200/40 text-xs">
                                                PNG, JPG до 5MB
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="border-cyan-500/30 bg-black/80 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle className="text-cyan-50">Основная информация</CardTitle>
                                    <CardDescription className="text-cyan-200/60">
                                        Измените ваши личные данные
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                            className="border-cyan-500/30 bg-black/40 text-cyan-50 placeholder:text-cyan-200/30 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nickname">Никнейм</Label>
                                        <Input
                                            id="nickname"
                                            value={profile.nickname}
                                            onChange={(e) => handleInputChange("nickname", e.target.value)}
                                            className="border-cyan-500/30 bg-black/40 text-cyan-50 placeholder:text-cyan-200/30 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="gender">Пол</Label>
                                            <Select
                                                value={profile.gender || "none"}
                                                onValueChange={(value) =>
                                                    handleInputChange("gender", value === "none" ? null : value as Gender)
                                                }
                                            >
                                                <SelectTrigger className="border-cyan-500/30 bg-black/40">
                                                    <SelectValue placeholder="Не указано" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Не указано</SelectItem>
                                                    <SelectItem value="male">Мужской</SelectItem>
                                                    <SelectItem value="female">Женский</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="age">Возраст</Label>
                                            <Input
                                                id="age"
                                                type="number"
                                                min={15}
                                                max={100}
                                                value={profile.age || ""}
                                                onChange={(e) =>
                                                    handleInputChange("age", e.target.value ? parseInt(e.target.value) : null)
                                                }
                                                placeholder="18"
                                                className="border-cyan-500/30 bg-black/40 text-cyan-50 placeholder:text-cyan-200/30 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    {/* Socials Tab */}
                    <TabsContent value="socials" className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="border-cyan-500/30 bg-black/80 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle className="text-cyan-50 flex items-center gap-2">
                                        <Share2 className="h-5 w-5 text-cyan-400" />
                                        Социальные сети
                                    </CardTitle>
                                    <CardDescription className="text-cyan-200/60">
                                        Добавьте ссылки на ваши профили
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {socialPlatforms.map((platform) => (
                                        <div key={platform.key} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-cyan-100">{platform.label}</Label>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAddSocial(platform.key)}
                                                    className="border-cyan-500/30 bg-transparent text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 h-8"
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Добавить
                                                </Button>
                                            </div>

                                            {profile.socials[platform.key].length > 0 && (
                                                <div className="space-y-3">
                                                    {profile.socials[platform.key].map((social, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20"
                                                        >
                                                            <LinkIcon className="h-4 w-4 text-cyan-400/50" />
                                                            <Input
                                                                placeholder={platform.placeholder}
                                                                value={social.link}
                                                                onChange={(e) =>
                                                                    handleUpdateSocial(platform.key, index, { link: e.target.value })
                                                                }
                                                                className="flex-1 border-cyan-500/30 bg-black/40 text-cyan-50 placeholder:text-cyan-200/30 focus:border-cyan-500/50 focus:ring-cyan-500/20 h-9"
                                                            />

                                                            <Select
                                                                value={social.type}
                                                                onValueChange={(value: SocialType) =>
                                                                    handleUpdateSocial(platform.key, index, { type: value })
                                                                }
                                                            >
                                                                <SelectTrigger className="w-28 border-cyan-500/30 bg-black/40 h-9">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="personal">Личный</SelectItem>
                                                                    <SelectItem value="public">Публичный</SelectItem>
                                                                </SelectContent>
                                                            </Select>

                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleUpdateSocial(platform.key, index, { hidden: !social.hidden })
                                                                }
                                                                className="text-cyan-400 hover:text-cyan-300 h-9 w-9"
                                                            >
                                                                {social.hidden ? (
                                                                    <EyeOff className="h-4 w-4" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4" />
                                                                )}
                                                            </Button>

                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleRemoveSocial(platform.key, index)}
                                                                className="text-red-400 hover:text-red-300 h-9 w-9"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    {/* Gaming Tab */}
                    <TabsContent value="gaming" className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="border-cyan-500/30 bg-black/80 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle className="text-cyan-50 flex items-center gap-2">
                                        <Gamepad2 className="h-5 w-5 text-cyan-400" />
                                        Игровые аккаунты
                                    </CardTitle>
                                    <CardDescription className="text-cyan-200/60">
                                        Привяжите игровые аккаунты для участия в турнирах
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {gamePlatforms.map((platform) => {
                                        const existingAccount = profile.gameAccounts.find(a => a.platform === platform.key)

                                        return (
                                            <div key={platform.key} className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-cyan-100">{platform.label}</Label>
                                                    {!existingAccount && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleAddGameAccount(platform.key)}
                                                            className="border-cyan-500/30 bg-transparent text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 h-8"
                                                        >
                                                            <Plus className="h-4 w-4 mr-1" />
                                                            Привязать
                                                        </Button>
                                                    )}
                                                </div>

                                                {existingAccount && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="flex items-center gap-3 p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20"
                                                    >
                                                        <div className="flex-1 grid grid-cols-2 gap-3">
                                                            <div className="space-y-2">
                                                                <Label className="text-xs text-cyan-200/60">Username</Label>
                                                                <Input
                                                                    placeholder={platform.placeholder}
                                                                    value={existingAccount.username}
                                                                    onChange={(e) =>
                                                                        handleUpdateGameAccount(
                                                                            profile.gameAccounts.findIndex(a => a.platform === platform.key),
                                                                            { username: e.target.value }
                                                                        )
                                                                    }
                                                                    className="border-cyan-500/30 bg-black/40 text-cyan-50 placeholder:text-cyan-200/30 focus:border-cyan-500/50 focus:ring-cyan-500/20 h-9"
                                                                />
                                                            </div>
                                                            {(platform.key === "riot" || platform.key === "battle") && (
                                                                <div className="space-y-2">
                                                                    <Label className="text-xs text-cyan-200/60">Регион</Label>
                                                                    <Select
                                                                        value={existingAccount.region || "euw"}
                                                                        onValueChange={(value) =>
                                                                            handleUpdateGameAccount(
                                                                                profile.gameAccounts.findIndex(a => a.platform === platform.key),
                                                                                { region: value }
                                                                            )
                                                                        }
                                                                    >
                                                                        <SelectTrigger className="border-cyan-500/30 bg-black/40 h-9">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="euw">EUW</SelectItem>
                                                                            <SelectItem value="eune">EUNE</SelectItem>
                                                                            <SelectItem value="na">NA</SelectItem>
                                                                            <SelectItem value="ru">RU</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {existingAccount.verified && (
                                                            <div className="flex items-center gap-1 text-green-400 text-xs">
                                                                <Shield className="h-4 w-4" />
                                                                <span>Верифицирован</span>
                                                            </div>
                                                        )}

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveGameAccount(
                                                                profile.gameAccounts.findIndex(a => a.platform === platform.key)
                                                            )}
                                                            className="text-red-400 hover:text-red-300 h-9 w-9"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </motion.div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    {/* Clubs Tab */}
                    <TabsContent value="clubs" className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="border-cyan-500/30 bg-black/80 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle className="text-cyan-50 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-cyan-400" />
                                        Клубы и группы
                                    </CardTitle>
                                    <CardDescription className="text-cyan-200/60">
                                        Управляйте членством в клубах
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {profile.clubSettings.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Users className="h-12 w-12 text-cyan-400/30 mx-auto mb-4" />
                                            <p className="text-cyan-200/60 mb-4">
                                                Вы пока не состоите ни в одном клубе
                                            </p>
                                            <Button className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:from-cyan-500 hover:to-cyan-400">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Найти клуб
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {profile.clubSettings.map((club) => (
                                                <motion.div
                                                    key={club.clubId}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex items-center gap-4 p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20"
                                                >
                                                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center">
                                                        {club.role === "owner" ? (
                                                            <Crown className="h-6 w-6 text-cyan-400" />
                                                        ) : club.role === "admin" ? (
                                                            <Shield className="h-6 w-6 text-cyan-400" />
                                                        ) : (
                                                            <Users className="h-6 w-6 text-cyan-400/70" />
                                                        )}
                                                    </div>

                                                    <div className="flex-1">
                                                        <h3 className="text-cyan-50 font-medium">{club.clubName}</h3>
                                                        <p className="text-cyan-200/50 text-sm">
                                                            {club.role === "owner" ? "Владелец" : club.role === "admin" ? "Администратор" : "Участник"}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <Bell className="h-4 w-4 text-cyan-400/50" />
                                                            <Switch
                                                                checked={club.notifications}
                                                                onCheckedChange={(checked) => {
                                                                    const updated = profile.clubSettings.map(c =>
                                                                        c.clubId === club.clubId ? { ...c, notifications: checked } : c
                                                                    )
                                                                    setProfile({ ...profile, clubSettings: updated })
                                                                    setIsDirty(true)
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Eye className="h-4 w-4 text-cyan-400/50" />
                                                            <Switch
                                                                checked={club.visible}
                                                                onCheckedChange={(checked) => {
                                                                    const updated = profile.clubSettings.map(c =>
                                                                        c.clubId === club.clubId ? { ...c, visible: checked } : c
                                                                    )
                                                                    setProfile({ ...profile, clubSettings: updated })
                                                                    setIsDirty(true)
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="border-cyan-500/30 bg-black/80 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle className="text-cyan-50 flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-cyan-400" />
                                        Настройки аккаунта
                                    </CardTitle>
                                    <CardDescription className="text-cyan-200/60">
                                        Управление безопасностью и уведомлениями
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                                        <div>
                                            <h3 className="text-cyan-50 font-medium">Двухфакторная аутентификация</h3>
                                            <p className="text-cyan-200/50 text-sm">Дополнительная защита аккаунта</p>
                                        </div>
                                        <Switch />
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                                        <div>
                                            <h3 className="text-cyan-50 font-medium">Email уведомления</h3>
                                            <p className="text-cyan-200/50 text-sm">Получать новости на почту</p>
                                        </div>
                                        <Switch defaultChecked />
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                                        <div>
                                            <h3 className="text-cyan-50 font-medium">Приватный профиль</h3>
                                            <p className="text-cyan-200/50 text-sm">Скрыть профиль от других пользователей</p>
                                        </div>
                                        <Switch />
                                    </div>

                                    <div className="pt-6 border-t border-cyan-500/20">
                                        <Button
                                            variant="outline"
                                            className="w-full border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Выйти из аккаунта
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </TabsContent>
                </Tabs>

                {/* Save Button - показываем только на вкладках general и socials */}
                {(activeTab === "general" || activeTab === "socials" || activeTab === "gaming") && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-end gap-4 mt-8"
                    >
                        <Button
                            variant="outline"
                            className="border-cyan-500/30 bg-transparent text-cyan-50 hover:bg-cyan-500/10 hover:border-cyan-500/50"
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!isDirty}
                            className="bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-medium hover:from-cyan-500 hover:to-cyan-400 shadow-[0_0_20px_-5px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.7)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Сохранить
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
