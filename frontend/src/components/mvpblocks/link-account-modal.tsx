'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

type Role = 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support'

type LinkAccountData = {
  region: string
  summonerName: string
  tag: string
  roles: Role[]
  opggUrl?: string
}

type Props = {
  onSubmit?: (data: LinkAccountData) => void
  trigger?: React.ReactNode
}

export default function LinkAccountModal({ onSubmit, trigger }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'manual' | 'opgg'>('manual')
  
  // Manual form
  const [region, setRegion] = useState('EUW')
  const [summonerName, setSummonerName] = useState('')
  const [tag, setTag] = useState('')
  const [roles, setRoles] = useState<Role[]>([])
  
  // OP.GG form
  const [opggUrl, setOpggUrl] = useState('')

  const allRoles: Role[] = ['Top', 'Jungle', 'Mid', 'ADC', 'Support']

  const toggleRole = (role: Role) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const handleSubmit = () => {
    if (activeTab === 'manual') {
      if (!summonerName || !tag || roles.length === 0) return
      onSubmit?.({ region, summonerName, tag, roles })
    } else {
      if (!opggUrl) return
      // Парсинг OP.GG URL (упрощенно)
      const extracted = parseOpggUrl(opggUrl)
      if (extracted) {
        onSubmit?.({ ...extracted, roles: ['ADC'], opggUrl }) // default role
      }
    }
    setOpen(false)
    resetForm()
  }

  const parseOpggUrl = (url: string): { region: string; summonerName: string; tag: string } | null => {
    // Простой парсер для демо: https://www.op.gg/summoners/euw/PlayerName-TAG
    try {
      const match = url.match(/summoners\/([^/]+)\/([^-]+)-(.+)/)
      if (match) {
        return {
          region: match[1].toUpperCase(),
          summonerName: match[2],
          tag: match[3],
        }
      }
    } catch (e) {
      console.error('Failed to parse OP.GG URL', e)
    }
    return null
  }

  const resetForm = () => {
    setSummonerName('')
    setTag('')
    setRoles([])
    setOpggUrl('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="sm"
            variant="outline"
            className="border-dashed border-rose-500/60 bg-slate-900/80 hover:bg-slate-800 hover:border-rose-400"
          >
            {t('profile.link.linkNewAccount')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-rose-900/50 bg-black/95 backdrop-blur sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-rose-50">{t('profile.link.modalTitle')}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('profile.link.league')}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-rose-900/50">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'manual'
                ? 'border-b-2 border-rose-500 text-rose-50'
                : 'text-muted-foreground hover:text-rose-400'
            }`}
          >
            {t('profile.link.manualTab')}
          </button>
          <button
            onClick={() => setActiveTab('opgg')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'opgg'
                ? 'border-b-2 border-rose-500 text-rose-50'
                : 'text-muted-foreground hover:text-rose-400'
            }`}
          >
            {t('profile.link.opggTab')}
          </button>
        </div>

        <div className="space-y-4 py-4">
          {activeTab === 'manual' ? (
            <>
              <div className="space-y-2">
                <Label className="text-rose-50">{t('profile.link.modalRegion')}</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="border-rose-900/50 bg-black/40 text-rose-50 focus:ring-rose-500/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-rose-900/50 bg-black/95">
                    <SelectItem value="EUW">EUW</SelectItem>
                    <SelectItem value="EUNE">EUNE</SelectItem>
                    <SelectItem value="NA">NA</SelectItem>
                    <SelectItem value="KR">KR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-rose-50">Summoner</Label>
                <Input
                  placeholder={t('profile.link.modalSummonerPlaceholder') as string}
                  value={summonerName}
                  onChange={(e) => setSummonerName(e.target.value)}
                  className="border-rose-900/50 bg-black/40 text-rose-50 focus-visible:border-rose-500 focus-visible:ring-rose-500/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-rose-50">{t('profile.link.modalTag')}</Label>
                <Input
                  placeholder={t('profile.link.modalTagPlaceholder') as string}
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="border-rose-900/50 bg-black/40 text-rose-50 focus-visible:border-rose-500 focus-visible:ring-rose-500/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-rose-50">{t('profile.link.modalRole')}</Label>
                <div className="flex flex-wrap gap-2">
                  {allRoles.map((role) => (
                    <Badge
                      key={role}
                      onClick={() => toggleRole(role)}
                      className={`cursor-pointer transition-colors ${
                        roles.includes(role)
                          ? 'bg-rose-600 hover:bg-rose-500 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {role}
                      {roles.includes(role) && <X size={12} className="ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-rose-50">OP.GG URL</Label>
                <Input
                  placeholder={t('profile.link.modalOpggPlaceholder') as string}
                  value={opggUrl}
                  onChange={(e) => setOpggUrl(e.target.value)}
                  className="border-rose-900/50 bg-black/40 text-rose-50 focus-visible:border-rose-500 focus-visible:ring-rose-500/50"
                />
                <p className="text-xs text-muted-foreground">
                  Example: https://www.op.gg/summoners/euw/PlayerName-TAG
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="hover:bg-rose-950/50 hover:text-rose-50"
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600"
          >
            {t('profile.link.modalSubmit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
