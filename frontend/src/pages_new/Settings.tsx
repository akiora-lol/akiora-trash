"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, useReducedMotion } from "framer-motion";
import { UploadCloud, Plus, X, Github, Linkedin, Twitter } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { type SocialKey, type Social, type LeagueAccount, type LeagueServer, type NewLeagueAccount } from "@/types/user";

import { FaVk, FaTelegramPlane, FaDiscord, FaYoutube, FaTwitch, FaSoundcloud } from "react-icons/fa";
import { FaV } from "react-icons/fa6";
import { Checkbox } from "@/components/ui/checkbox";

export function GlassProfileSettingsCard() {
    const { user } = useAuth();
    const shouldReduceMotion = useReducedMotion();

    // Состояния для полей пользователя
    const [nickname, setNickname] = useState(user?.nickname || "");
    const [email, setEmail] = useState(user?.email || "");
    const [gender, setGender] = useState<"male" | "female" | "none" | null>(user?.gender || null);
    const [age, setAge] = useState<number | string>(user?.age || "");
    const [bio, setBio] = useState("Designing expressive interfaces that feel alive.");

    // Состояния для настроек
    const [notifications, setNotifications] = useState(true);
    const [newsletter, setNewsletter] = useState(false);

    // Состояние для социальных сетей
    const [socials, setSocials] = useState<Record<SocialKey, Social[]>>(
        user?.socials || {
            vk: [],
            tg: [],
            ds: [],
            tw: [],
            yt: [],
            sc: [],
        }
    );

    const [newSocial, setNewSocial] = useState<{
        platform: SocialKey | null;
        link: string;
        hidden: boolean;
    }>({
        platform: null,
        link: "",
        hidden: false
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Здесь будет логика сохранения
        console.log({
            nickname,
            email,
            gender,
            age: age ? Number(age) : null,
            bio,
            socials,
            notifications,
            newsletter
        });
    };

    const addSocial = () => {
        if (newSocial.platform && newSocial.link) {
            setSocials(prev => ({
                ...prev,
                [newSocial.platform!]: [
                    ...(prev[newSocial.platform!] || []),
                    { link: newSocial.link, hidden: newSocial.hidden || false }
                ]
            }));
            setNewSocial({ platform: null, link: "", hidden: false });
        }
    };

    const removeSocial = (platform: SocialKey, index: number) => {
        setSocials(prev => ({
            ...prev,
            [platform]: prev[platform].filter((_, i) => i !== index)
        }));
    };

    const getSocialIcon = (platform: SocialKey) => {
        switch (platform) {
            case "vk": return <FaVk className="h-4 w-4" />;
            case "ds": return <FaDiscord className="h-4 w-4" />;
            case "yt": return <FaYoutube className="h-4 w-4" />;
            case "tw": return <FaTwitch className="h-4 w-4" />;
            case "tg": return <FaTelegramPlane className="h-4 w-4" />;
            case "sc": return <FaSoundcloud className="h-4 w-4" />;

            default: return null;
        }
    };

    // Состояние для списка аккаунтов
    const [leagueAccounts, setLeagueAccounts] = useState<LeagueAccount[]>([]);

    // Состояние для нового аккаунта
    const [newLeagueAccount, setNewLeagueAccount] = useState<NewLeagueAccount>({
        server: '' as LeagueServer,
        gameName: '',
        tagLine: '',
        hidden: false
    });

    // Валидация аккаунта
    const isLeagueAccountValid = (account: NewLeagueAccount): boolean => {
        return (
            account.server &&
            account.gameName.trim().length >= 3 &&
            account.gameName.trim().length <= 16 &&
            account.tagLine.trim().length >= 2 &&
            account.tagLine.trim().length <= 5 &&
            /^[a-zA-Z0-9]+$/.test(account.tagLine) // Только буквы и цифры
        );
    };

    // Добавление аккаунта
    const addLeagueAccount = () => {
        if (!isLeagueAccountValid(newLeagueAccount)) return;

        setLeagueAccounts([...leagueAccounts, { ...newLeagueAccount }]);
        setNewLeagueAccount({
            server: '' as LeagueServer,
            gameName: '',
            tagLine: '',
            hidden: false
        });
    };

    // Удаление аккаунта
    const removeLeagueAccount = (index: number) => {
        setLeagueAccounts(leagueAccounts.filter((_, i) => i !== index));
    };

    // Получение названия сервера
    const getServerName = (server: LeagueServer): string => {
        const serverNames: Record<LeagueServer, string> = {
            EUW: 'EU West',
            EUNE: 'EU Nordic & East',
            NA: 'North America',
            KR: 'Korea',
            BR: 'Brazil',
            JP: 'Japan',
            RU: 'Russia',
            OCE: 'Oceania',

            TR: 'Turkey'
        };
        return serverNames[server] || server;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.45,
                ease: shouldReduceMotion ? "linear" : [0.16, 1, 0.3, 1],
            }}
            className="group mx-auto w-full max-w-3xl rounded-3xl overflow-hidden border border-border/60 bg-card/85 p-8 backdrop-blur-xl sm:p-12 relative"
            aria-labelledby="glass-profile-settings-title"
        >
            <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-br from-foreground/[0.04] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 -z-10"
            />

            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                        Profile
                    </div>
                    <h1
                        id="glass-profile-settings-title"
                        className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl"
                    >
                        Profile settings
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Update your avatar, personal details, and notification preferences.
                    </p>
                </div>

                {user?.roles && user.roles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {user.roles.map((role) => (
                            <Badge key={role} variant="secondary" className="rounded-full">
                                {role}
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            <form className="grid gap-8 sm:grid-cols-5" onSubmit={handleSubmit}>
                {/* Аватар секция */}
                <div className="sm:col-span-2">
                    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-background/40 p-6 backdrop-blur">
                        <Avatar className="h-24 w-24 border border-border/60">
                            <span className="flex h-full w-full items-center justify-center rounded-full bg-primary/20 text-lg font-semibold text-primary">
                                {nickname?.slice(0, 2).toLocaleUpperCase() || "U"}
                            </span>
                        </Avatar>
                        <div className="text-center">
                            <p className="text-sm font-medium text-foreground">{nickname}</p>
                            {age && <p className="text-xs text-muted-foreground">{age} years</p>}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full border-border/60 bg-white/5 px-4 py-2 text-sm text-foreground"
                        >
                            <UploadCloud className="mr-2 h-4 w-4" />
                            Update avatar
                        </Button>
                    </div>
                </div>

                {/* Основная информация */}
                <div className="space-y-6 sm:col-span-3">
                    {/* Имя пользователя */}
                    <div className="space-y-2">
                        <Label htmlFor="profile-nickname">Nickname *</Label>
                        <Input
                            id="profile-nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="h-11 rounded-2xl border-border/60 bg-background/60 px-4"
                            autoComplete="nickname"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="profile-email">Email address *</Label>
                        <Input
                            id="profile-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-11 rounded-2xl border-border/60 bg-background/60 px-4"
                            autoComplete="email"
                            required
                        />
                    </div>

                    {/* Пол и возраст */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="profile-gender">Gender</Label>
                            <Select value={gender || undefined} onValueChange={(value: "male" | "female" | "none") => setGender(value)}>
                                <SelectTrigger className="h-11 rounded-2xl border-border/60 bg-background/60 px-4">
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="none">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile-age">Age</Label>
                            <Input
                                id="profile-age"
                                type="number"
                                min={15}
                                value={age}
                                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                                className="h-11 rounded-2xl border-border/60 bg-background/60 px-4"
                                placeholder="25"
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <Label htmlFor="profile-bio">Bio</Label>
                        <Textarea
                            id="profile-bio"
                            value={bio}
                            onChange={(event) => setBio(event.target.value)}
                            rows={4}
                            className="rounded-2xl border-border/60 bg-background/60 px-4 py-3 text-sm"
                            placeholder="Tell us about your role, interests, or current focus."
                        />
                        <p className="text-right text-xs text-muted-foreground">
                            {bio.length}/160 characters
                        </p>
                    </div>

                    {/* Социальные сети */}
                    <div className="rounded-2xl border border-border/60 bg-background/40 p-5 backdrop-blur">
                        <h2 className="text-sm font-medium text-foreground mb-4">
                            Social Links
                        </h2>

                        {/* Список добавленных соцсетей */}
                        <div className="space-y-3 mb-4">
                            {Object.entries(socials).map(([platform, links]) =>
                                links.map((link, index) => (
                                    <div key={`${platform}-${index}`} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background/60">
                                        <div className="flex items-center gap-2">
                                            {getSocialIcon(platform as SocialKey)}
                                            <span className="text-sm text-muted-foreground">{platform}</span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeSocial(platform as SocialKey, index)}
                                            className="h-6 w-6 p-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Добавление новой соцсети */}
                        <div className="space-y-3">
                            <Select
                                value={newSocial.platform!}
                                onValueChange={(value: SocialKey) => setNewSocial({ ...newSocial, platform: value })}
                            >
                                <SelectTrigger className="rounded-xl border-border/60 bg-background/60">
                                    <SelectValue placeholder="Select platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[
                                        { id: "vk", label: "VK" },
                                        { id: "tg", label: "Telegram" },
                                        { id: "ds", label: "Discord" },
                                        { id: "yt", label: "YouTube" },
                                        { id: "tw", label: "Twitch" },
                                        { id: "sc", label: "SoundCloud" }
                                    ].map((item) => (
                                        <SelectItem key={item.id} value={item.id}>
                                            <div className="flex items-center gap-2">
                                                {getSocialIcon(item.id as SocialKey)}
                                                <span>{item.label}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>



                            <Input
                                placeholder="URL"
                                value={newSocial.link}
                                onChange={(e) => setNewSocial({ ...newSocial, link: e.target.value })}
                                className="rounded-xl border-border/60 bg-background/60"
                            />
                            <div className="flex flex-row items-center gap-4 p-1">
                                <Checkbox
                                    id="hide-social"
                                    // Важно: привязываем текущее значение из стейта
                                    checked={newSocial.hidden}
                                    onCheckedChange={(checked: boolean) => {
                                        // Обновляем через деструктуризацию для триггера ререндера
                                        setNewSocial({ ...newSocial, hidden: checked });
                                    }}
                                />
                                <Label htmlFor="hide-social" className="cursor-pointer">
                                    Hide from others
                                </Label>
                            </div>


                            <Button
                                type="button"
                                onClick={addSocial}
                                disabled={!newSocial.platform || !newSocial.link}
                                className="w-full rounded-xl"
                                variant="outline"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add social link
                            </Button>
                        </div>
                    </div>
                    {/* League accs */}
                    <div className="rounded-2xl border border-border/60 bg-background/40 p-5 backdrop-blur">
                        <h2 className="text-sm font-medium text-foreground mb-4">
                            League accs
                        </h2>

                        {/* Список добавленных аккаунтов LoL */}
                        <div className="space-y-3 mb-4">
                            {leagueAccounts.map((account, index) => (
                                <div key={index} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background/60">
                                    <div className="flex items-center gap-3">
                                        {/* Иконка League of Legends */}
                                        <div className="w-6 h-6 flex items-center justify-center">
                                            <span className="text-lg">🏆</span>
                                        </div>

                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-foreground">
                                                    {account.gameName}
                                                </span>
                                                <span className="text-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                                                    #{account.tagLine}
                                                </span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                Server: {getServerName(account.server)}
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeLeagueAccount(index)}
                                        className="h-6 w-6 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Добавление нового аккаунта LoL */}
                        <div className="space-y-3">
                            {/* Выбор сервера */}
                            <Select
                                value={newLeagueAccount.server}
                                onValueChange={(value: LeagueServer) =>
                                    setNewLeagueAccount({ ...newLeagueAccount, server: value })
                                }
                            >
                                <SelectTrigger className="rounded-xl border-border/60 bg-background/60">
                                    <SelectValue placeholder="Select server" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EUW">
                                        <div className="flex items-center gap-2">
                                            <span>🇪🇺</span>
                                            <span>EU West</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="EUNE">
                                        <div className="flex items-center gap-2">
                                            <span>🇪🇺</span>
                                            <span>EU Nordic & East</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="NA">
                                        <div className="flex items-center gap-2">
                                            <span>🇺🇸</span>
                                            <span>North America</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="KR">
                                        <div className="flex items-center gap-2">
                                            <span>🇰🇷</span>
                                            <span>Korea</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="BR">
                                        <div className="flex items-center gap-2">
                                            <span>🇧🇷</span>
                                            <span>Brazil</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="JP">
                                        <div className="flex items-center gap-2">
                                            <span>🇯🇵</span>
                                            <span>Japan</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="RU">
                                        <div className="flex items-center gap-2">
                                            <span>🇷🇺</span>
                                            <span>Russia</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="OCE">
                                        <div className="flex items-center gap-2">
                                            <span>🇦🇺</span>
                                            <span>Oceania</span>
                                        </div>
                                    </SelectItem>

                                    <SelectItem value="TR">
                                        <div className="flex items-center gap-2">
                                            <span>🇹🇷</span>
                                            <span>Turkey</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Имя аккаунта (Game Name) */}
                            <Input
                                placeholder="Game Name (e.g., Faker)"
                                value={newLeagueAccount.gameName}
                                onChange={(e) => setNewLeagueAccount({
                                    ...newLeagueAccount,
                                    gameName: e.target.value
                                })}
                                className="rounded-xl border-border/60 bg-background/60"
                            />

                            {/* Тэг (TagLine) */}
                            <div className="relative">
                                <Input
                                    placeholder="TagLine (e.g., KR1)"
                                    value={newLeagueAccount.tagLine}
                                    onChange={(e) => setNewLeagueAccount({
                                        ...newLeagueAccount,
                                        tagLine: e.target.value.replace(/[^a-zA-Z0-9]/g, '') // Только буквы и цифры
                                    })}
                                    className="rounded-xl border-border/60 bg-background/60 pl-8"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    #
                                </span>
                            </div>



                            {/* Кнопка добавления */}
                            <Button
                                type="button"
                                onClick={addLeagueAccount}
                                disabled={!isLeagueAccountValid(newLeagueAccount)}
                                className="w-full rounded-xl"
                                variant="outline"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add League of Legends account
                            </Button>


                        </div>
                    </div>

                    {/* Настройки уведомлений */}
                    <div className="rounded-2xl border border-border/60 bg-background/40 p-5 backdrop-blur">
                        <h2 className="text-sm font-medium text-foreground">
                            Notifications
                        </h2>
                        <p className="mb-4 text-xs text-muted-foreground">
                            Choose the updates you want to receive about your workspace.
                        </p>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                                Enable notifications
                                <Switch
                                    checked={notifications}
                                    onCheckedChange={setNotifications}
                                />
                            </label>
                            <label className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                                Subscribe to newsletter
                                <Switch checked={newsletter} onCheckedChange={setNewsletter} />
                            </label>
                        </div>
                    </div>

                    {/* Кнопки действий */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full border-border/60 bg-white/5 px-6 py-3 text-sm text-muted-foreground hover:text-primary"
                            onClick={() => {
                                // Сброс всех изменений
                                setNickname(user?.nickname || "");
                                setEmail(user?.email || "");
                                setGender(user?.gender || null);
                                setAge(user?.age || "");
                                setSocials(user?.socials || {
                                    vk: [],
                                    tg: [],
                                    ds: [],
                                    tw: [],
                                    yt: [],
                                    sc: [],
                                });
                            }}
                        >
                            Reset changes
                        </Button>
                        <Button
                            type="submit"
                            className="rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-[0_20px_60px_-30px_rgba(79,70,229,0.75)] transition-transform duration-300 hover:-translate-y-1"
                        >
                            Save settings
                        </Button>
                    </div>
                </div>
            </form>
        </motion.div>
    );
}
