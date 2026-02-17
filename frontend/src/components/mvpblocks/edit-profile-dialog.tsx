'use client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit } from 'lucide-react'

type EditProfileData = {
  name: string
  email: string
  age: number | null
  gender: 'male' | 'female' | 'other' | null
}

type Props = {
  initialData: EditProfileData
  onSubmit?: (data: EditProfileData) => void
  trigger?: React.ReactNode
}

export default function EditProfileDialog({ initialData, onSubmit, trigger }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<EditProfileData>(initialData)

  const handleSubmit = () => {
    onSubmit?.(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            size="sm"
            variant="outline"
            className="border-rose-900/50 bg-black/40 hover:bg-rose-950/50 hover:border-rose-800/50"
          >
            <Edit size={16} className="mr-2" />
            {t('profile.editProfile')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-rose-900/50 bg-black/95 backdrop-blur sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-rose-50">{t('profile.edit.modalTitle')}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('profile.editProfile')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label className="text-rose-50">{t('profile.edit.name')}</Label>
            <Input
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border-rose-900/50 bg-black/40 text-rose-50 focus-visible:border-rose-500 focus-visible:ring-rose-500/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-rose-50">{t('profile.edit.email')}</Label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border-rose-900/50 bg-black/40 text-rose-50 focus-visible:border-rose-500 focus-visible:ring-rose-500/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-rose-50">{t('profile.edit.age')}</Label>
            <Input
              type="number"
              placeholder="25"
              value={formData.age || ''}
              onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : null })}
              className="border-rose-900/50 bg-black/40 text-rose-50 focus-visible:border-rose-500 focus-visible:ring-rose-500/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-rose-50">{t('profile.edit.gender')}</Label>
            <Select
              value={formData.gender || ''}
              onValueChange={(v) => setFormData({ ...formData, gender: v as any })}
            >
              <SelectTrigger className="border-rose-900/50 bg-black/40 text-rose-50 focus:ring-rose-500/50">
                <SelectValue placeholder={t('profile.edit.gender')} />
              </SelectTrigger>
              <SelectContent className="border-rose-900/50 bg-black/95 backdrop-blur">
                <SelectItem value="male">{t('profile.edit.male')}</SelectItem>
                <SelectItem value="female">{t('profile.edit.female')}</SelectItem>
                <SelectItem value="other">{t('profile.edit.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            {t('profile.edit.modalSubmit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
