import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import LinkAccountModal from '@/components/mvpblocks/link-account-modal'
import EditProfileDialog from '@/components/mvpblocks/edit-profile-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Role = "Top" | "Jungle" | "Mid" | "ADC" | "Support"

type RankedTier =
  | "Iron"
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Master"
  | "Grandmaster"
  | "Challenger"

type LinkedAccount = {
  id: string
  region: string
  summonerName: string
  roles: Role[] // массив ролей
  tag: string // тег как строка
  tier: RankedTier
  lp: number
  wins: number
  losses: number
  isPrimary?: boolean
}

type UserProfile = {
  name: string
  email: string
  age: number | null
  gender: 'male' | 'female' | 'other' | null
  avatarUrl: string
  bio: string
  favoriteChampion: string
}

type SiteStats = {
  guidesRead: number
  scrimsJoined: number
  matchesTracked: number
  reviewsWritten: number
  lastLogin: string
}

type RecentAction = {
  id: string
  type: "match-tracked" | "scrim-joined" | "guide-saved" | "account-linked"
  description: string
  createdAt: string
}

const initialUser: UserProfile = {
  name: "Akiora",
  email: "akiora@example.com",
  age: 24,
  gender: "male",
  avatarUrl: "https://ui.shadcn.com/avatars/04.png",
  bio: "ADC main. Tempo over everything. Climbing to Challenger one reset at a time.",
  favoriteChampion: "Kai'Sa",
}

const initialLinkedAccounts: LinkedAccount[] = [
  {
    id: "1",
    region: "EUW",
    summonerName: "Akiora",
    roles: ["ADC", "Mid"],
    tag: "EUW1",
    tier: "Master",
    lp: 115,
    wins: 210,
    losses: 180,
    isPrimary: true,
  },
  {
    id: "2",
    region: "EUNE",
    summonerName: "Akiora smurf",
    roles: ["Mid", "Top"],
    tag: "EUNE7",
    tier: "Diamond",
    lp: 60,
    wins: 95,
    losses: 70,
  },
]

const siteStats: SiteStats = {
  guidesRead: 34,
  scrimsJoined: 12,
  matchesTracked: 148,
  reviewsWritten: 7,
  lastLogin: "2 часа назад",
}

const recentActions: RecentAction[] = [
  {
    id: "1",
    type: "match-tracked",
    description: "Затрекал матч: Master EUW — Kai'Sa vs Jinx (KDA 9/2/7)",
    createdAt: "15 минут назад",
  },
  {
    id: "2",
    type: "scrim-joined",
    description: "Присоединился к скриму: Flex queue tryouts",
    createdAt: "3 часа назад",
  },
  {
    id: "3",
    type: "guide-saved",
    description: "Сохранил гайд: Kai'Sa mid — AP on-hit hybrid",
    createdAt: "вчера",
  },
  {
    id: "4",
    type: "account-linked",
    description: "Привязал аккаунт: Akiora smurf (EUNE)",
    createdAt: "2 дня назад",
  },
]

function winrate(account: LinkedAccount) {
  const total = account.wins + account.losses
  if (!total) return "0%"
  return `${Math.round((account.wins / total) * 100)}%`
}

function tierColor(tier: RankedTier) {
  switch (tier) {
    case "Iron":
    case "Bronze":
      return "bg-zinc-700 text-zinc-100"
    case "Silver":
      return "bg-slate-500 text-slate-100"
    case "Gold":
      return "bg-yellow-500 text-black"
    case "Platinum":
      return "bg-rose-400 text-black"
    case "Diamond":
      return "bg-rose-500 text-black"
    case "Master":
      return "bg-rose-600 text-white"
    case "Grandmaster":
      return "bg-red-600 text-white"
    case "Challenger":
      return "bg-red-700 text-white"
  }
}

export default function ProfilePage() {
  const { t } = useTranslation()
  const [user, setUser] = useState<UserProfile>(initialUser)
  const [accounts, setAccounts] = useState<LinkedAccount[]>(initialLinkedAccounts)
  const [telegram, setTelegram] = useState<string | null>(null)
  const [discord, setDiscord] = useState<string | null>(null)
  const [telegramOpen, setTelegramOpen] = useState(false)
  const [discordOpen, setDiscordOpen] = useState(false)

  function handleLinkLeague(data: { region: string; summonerName: string; tag: string; roles: Role[] }) {
    const newAcc: LinkedAccount = {
      id: String(Date.now()),
      region: data.region,
      summonerName: data.summonerName,
      roles: data.roles,
      tag: data.tag,
      tier: "Iron",
      lp: 0,
      wins: 0,
      losses: 0,
    }
    setAccounts((s) => [newAcc, ...s])
  }

  function handleEditProfile(data: { name: string; email: string; age: number | null; gender: 'male' | 'female' | 'other' | null }) {
    setUser((prev) => ({ ...prev, ...data }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/90 to-black text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-24 pb-10 lg:flex-row">
        {/* Left column – main profile + linked accounts */}
        <div className="flex-1 space-y-6">
          <Card className="border border-slate-800/80 bg-black/40 backdrop-blur">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-slate-700">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 rounded-full ring-2 ring-rose-500/60 ring-offset-2 ring-offset-black" />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl font-semibold">{user.name}</CardTitle>
                  <Badge
                    variant="outline"
                    className="border-rose-500/60 bg-rose-500/10 text-xs font-medium uppercase tracking-wide text-rose-400"
                  >
                    Live
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{t('profile.title')}</p>
                <p className="mt-1 text-sm text-muted-foreground">{user.bio}</p>
              </div>
              <div className="hidden flex-col items-end gap-2 sm:flex">
                <p className="text-xs text-muted-foreground">Любимый чемпион</p>
                <p className="text-sm font-medium text-rose-400">{user.favoriteChampion}</p>
                <EditProfileDialog
                  initialData={{
                    name: user.name,
                    email: user.email,
                    age: user.age,
                    gender: user.gender,
                  }}
                  onSubmit={handleEditProfile}
                />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pt-2">
              <Separator className="bg-slate-800/80" />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-rose-900/50 bg-black/40 p-3">
                  <p className="text-xs text-muted-foreground">Всего матчей (ранкед)</p>
                  <p className="mt-1 text-lg font-semibold text-slate-50">
                    {accounts[0].wins + accounts[0].losses}
                  </p>
                  <p className="mt-1 text-xs text-rose-400">
                    Winrate: {winrate(accounts[0])}
                  </p>
                </div>
                <div className="rounded-lg border border-rose-900/50 bg-black/40 p-3">
                  <p className="text-xs text-muted-foreground">Текущий ранг</p>
                  <p className="mt-1 text-lg font-semibold">
                    {accounts[0].tier} {accounts[0].lp} LP
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Основной аккаунт • {accounts[0].region}
                  </p>
                </div>
                <div className="rounded-lg border border-rose-900/50 bg-black/40 p-3">
                  <p className="text-xs text-muted-foreground">Активность на сайте</p>
                  <p className="mt-1 text-lg font-semibold">
                    {siteStats.matchesTracked} матчей
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Последний визит: {siteStats.lastLogin}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-800/80 bg-black/40 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base font-semibold">
                  {t('profile.linkedAccounts')}
                </CardTitle>
                <div>
                  <LinkAccountModal onSubmit={handleLinkLeague} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className={cn(
                    "flex flex-col gap-3 rounded-lg border bg-slate-900/80 p-3 transition-colors sm:flex-row sm:items-center",
                    acc.isPrimary ? "border-rose-500/70" : "border-slate-800/80",
                  )}
                >
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/80 text-xs font-semibold text-slate-100">
                      {acc.region}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{acc.summonerName}</p>
                        {acc.isPrimary && (
                          <Badge className="bg-rose-500/90 text-black">
                            Основной
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Tag: #{acc.tag} • {acc.region}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge
                          variant="outline"
                          className={cn(
                            "border-none px-2 py-0.5 text-[10px] font-semibold",
                            tierColor(acc.tier),
                          )}
                        >
                          {acc.tier}
                        </Badge>
                        <span>{acc.lp} LP</span>
                        <Separator orientation="vertical" className="h-3 bg-slate-700" />
                        <span>
                          {acc.wins}W / {acc.losses}L
                        </span>
                        <Separator orientation="vertical" className="h-3 bg-slate-700" />
                        <span>WR {winrate(acc)}</span>
                        <Separator orientation="vertical" className="h-3 bg-slate-700" />
                        <div className="flex gap-1">
                          {acc.roles.map((role) => (
                            <Badge key={role} variant="secondary" className="text-[10px]">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 border-rose-900/50 bg-black/40 hover:bg-rose-950/50 hover:border-rose-800/50"
                    >
                      ⚙
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-rose-900/50 bg-black/40 text-xs hover:bg-rose-950/50 hover:border-rose-800/50 sm:flex-none"
                    >
                      Просмотр статистики
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column – site stats, recent activity, settings */}
        <div className="w-full space-y-6 lg:w-[320px]">
          <Card className="border border-slate-800/80 bg-black/30 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t('profile.link.linkAccount')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Telegram</p>
                  <p className="text-xs text-muted-foreground">{telegram ?? t('profile.link.notLinked')}</p>
                </div>
                <div>
                  <Dialog open={telegramOpen} onOpenChange={setTelegramOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">{telegram ? t('profile.link.linked') : t('profile.link.openLinkModal')}</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Link Telegram</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">Provide your Telegram handle (without @)</DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Label>Telegram</Label>
                        <Input placeholder="e.g. myhandle" onChange={(e) => setTelegram(e.target.value)} value={telegram ?? ''} />
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setTelegramOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={() => setTelegramOpen(false)}>{t('common.save')}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Discord</p>
                  <p className="text-xs text-muted-foreground">{discord ?? t('profile.link.notLinked')}</p>
                </div>
                <div>
                  <Dialog open={discordOpen} onOpenChange={setDiscordOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">{discord ? t('profile.link.linked') : t('profile.link.openLinkModal')}</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Link Discord</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">Provide your Discord tag (e.g. name#1234)</DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Label>Discord</Label>
                        <Input placeholder="e.g. name#1234" onChange={(e) => setDiscord(e.target.value)} value={discord ?? ''} />
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setDiscordOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={() => setDiscordOpen(false)}>{t('common.save')}</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-slate-800/80 bg-black/30 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Статистика на сайте
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-rose-900/50 bg-black/40 p-3">
                <p className="text-xs text-muted-foreground">Матчей затрекано</p>
                <p className="mt-1 text-lg font-semibold text-slate-50">
                  {siteStats.matchesTracked}
                </p>
              </div>
              <div className="rounded-lg border border-rose-900/50 bg-black/40 p-3">
                <p className="text-xs text-muted-foreground">Скримов</p>
                <p className="mt-1 text-lg font-semibold text-slate-50">
                  {siteStats.scrimsJoined}
                </p>
              </div>
              <div className="rounded-lg border border-rose-900/50 bg-black/40 p-3">
                <p className="text-xs text-muted-foreground">Гайды прочитаны</p>
                <p className="mt-1 text-lg font-semibold text-slate-50">
                  {siteStats.guidesRead}
                </p>
              </div>
              <div className="rounded-lg border border-rose-900/50 bg-black/40 p-3">
                <p className="text-xs text-muted-foreground">Оценок и отзывов</p>
                <p className="mt-1 text-lg font-semibold text-slate-50">
                  {siteStats.reviewsWritten}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-800/80 bg-black/30 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Последние действия
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {recentActions.map((action) => (
                <div
                  key={action.id}
                  className="rounded-lg border border-rose-900/50 bg-black/30 p-3"
                >
                  <p className="text-xs text-muted-foreground">{action.createdAt}</p>
                  <p className="mt-1 text-sm">{action.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-slate-800/80 bg-black/30 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Настройки аккаунта
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">Публичный профиль</p>
                  <p className="text-xs text-muted-foreground">
                    Ваш ранг и матчи будут отображаться в поиске.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 border-rose-900/50 bg-black/40 text-xs hover:bg-rose-950/50 hover:border-rose-800/50"
                >
                  Вкл
                </Button>
              </div>

              <Separator className="bg-slate-800/80" />

              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">Трекать матчи автоматически</p>
                  <p className="text-xs text-muted-foreground">
                    Мы будем подтягивать результаты из Riot API.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 border-rose-900/50 bg-black/40 text-xs hover:bg-rose-950/50 hover:border-rose-800/50"
                >
                  Вкл
                </Button>
              </div>

              <Separator className="bg-slate-800/80" />

              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">Экспорт статистики</p>
                  <p className="text-xs text-muted-foreground">
                    Скачайте свои матчи в формате CSV для аналитики.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 border-rose-900/50 bg-black/40 text-xs hover:bg-rose-950/50 hover:border-rose-800/50"
                >
                  Скачать
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

}
