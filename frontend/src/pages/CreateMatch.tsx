import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import type { MatchProfile } from './Matches';

const servers = ['EUW', 'EUNE', 'NA', 'KR', 'BR', 'LAN', 'LAS', 'OCE', 'RU', 'TR', 'JP'];
const roles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Challenger'];
const goals = ['Ranked', 'Normal', 'Flex', 'Clash', 'Friends'];
const playTimeKeys = [
  { key: 'morning', value: 'morning' },
  { key: 'day', value: 'day' },
  { key: 'evening', value: 'evening' },
  { key: 'night', value: 'night' },
  { key: 'anytime', value: 'anytime' },
];

function getRoleColor(role: string): string {
  const roleColors: Record<string, string> = {
    Top: 'bg-red-500/20 text-red-300 border-red-500/50',
    Jungle: 'bg-green-500/20 text-green-300 border-green-500/50',
    Mid: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    ADC: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    Support: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  };
  return roleColors[role] || 'bg-gray-500/20 text-gray-300 border-gray-500/50';
}

export default function CreateMatch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    server: '',
    roles: [] as string[],
    rank: '',
    description: '',
    goal: '',
    age: '',
    playTime: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
    if (errors.roles) {
      setErrors((prev) => ({ ...prev, roles: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = t('createMatch.form.username.required');
    }
    if (!formData.server) {
      newErrors.server = t('createMatch.form.server.required');
    }
    if (formData.roles.length === 0) {
      newErrors.roles = t('createMatch.form.roles.required');
    }
    if (!formData.rank) {
      newErrors.rank = t('createMatch.form.rank.required');
    }
    if (!formData.description.trim()) {
      newErrors.description = t('createMatch.form.description.required');
    }
    if (!formData.goal) {
      newErrors.goal = t('createMatch.form.goal.required');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newProfile: MatchProfile = {
      id: Date.now().toString(),
      username: formData.username,
      server: formData.server,
      roles: formData.roles,
      rank: formData.rank,
      description: formData.description,
      goal: formData.goal,
      age: formData.age ? parseInt(formData.age) : undefined,
      playTime: formData.playTime || undefined,
      createdAt: new Date().toISOString(),
    };

    const existingProfiles = localStorage.getItem('matchProfiles');
    const profiles = existingProfiles ? JSON.parse(existingProfiles) : [];
    profiles.unshift(newProfile);
    localStorage.setItem('matchProfiles', JSON.stringify(profiles));

    toast.success(t('common.success'), {
      description: t('createMatch.form.createButton') + ' ' + t('common.success').toLowerCase(),
    });

    navigate('/matches');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/90 to-black text-foreground pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/matches')}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('createMatch.backToMatches')}
          </Button>
          <h1 className="bg-gradient-to-r from-rose-500 to-rose-700 bg-clip-text text-4xl font-bold text-transparent">
            {t('createMatch.title')}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t('createMatch.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="border-slate-800/80 bg-black/40 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">{t('createMatch.form.title')}</CardTitle>
              <CardDescription>{t('createMatch.form.subtitle')}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">{t('createMatch.form.username.label')} *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, username: e.target.value }));
                    if (errors.username) {
                      setErrors((prev) => ({ ...prev, username: '' }));
                    }
                  }}
                  placeholder={t('createMatch.form.username.placeholder')}
                  className="border-slate-700 bg-black/40"
                />
                {errors.username && (
                  <p className="text-sm text-red-400">{errors.username}</p>
                )}
              </div>

              {/* Server */}
              <div className="space-y-2">
                <Label htmlFor="server">{t('createMatch.form.server.label')} *</Label>
                <Select
                  value={formData.server}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, server: value }));
                    if (errors.server) {
                      setErrors((prev) => ({ ...prev, server: '' }));
                    }
                  }}
                >
                  <SelectTrigger className="border-slate-700 bg-black/40 focus:border-rose-500 focus:ring-rose-500/20">
                    <SelectValue placeholder={t('createMatch.form.server.placeholder')} />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-black/95 backdrop-blur-lg">
                    {servers.map((server) => (
                      <SelectItem key={server} value={server}>
                        {t(`servers.${server}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.server && (
                  <p className="text-sm text-red-400">{errors.server}</p>
                )}
              </div>

              {/* Roles */}
              <div className="space-y-2">
                <Label>{t('createMatch.form.roles.label')} *</Label>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`rounded-md border px-3 py-2 text-sm font-medium transition-all ${
                        formData.roles.includes(role)
                          ? getRoleColor(role) + ' border-current'
                          : 'border-slate-700 bg-black/40 text-muted-foreground hover:border-slate-600'
                      }`}
                    >
                      {t(`roles.${role}`)}
                    </button>
                  ))}
                </div>
                {errors.roles && (
                  <p className="text-sm text-red-400">{errors.roles}</p>
                )}
              </div>

              {/* Rank */}
              <div className="space-y-2">
                <Label htmlFor="rank">{t('createMatch.form.rank.label')} *</Label>
                <Select
                  value={formData.rank}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, rank: value }));
                    if (errors.rank) {
                      setErrors((prev) => ({ ...prev, rank: '' }));
                    }
                  }}
                >
                  <SelectTrigger className="border-slate-700 bg-black/40 focus:border-rose-500 focus:ring-rose-500/20">
                    <SelectValue placeholder={t('createMatch.form.rank.placeholder')} />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-black/95 backdrop-blur-lg">
                    {ranks.map((rank) => (
                      <SelectItem key={rank} value={rank}>
                        {t(`ranks.${rank}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.rank && (
                  <p className="text-sm text-red-400">{errors.rank}</p>
                )}
              </div>

              {/* Goal */}
              <div className="space-y-2">
                <Label htmlFor="goal">{t('createMatch.form.goal.label')} *</Label>
                <Select
                  value={formData.goal}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, goal: value }));
                    if (errors.goal) {
                      setErrors((prev) => ({ ...prev, goal: '' }));
                    }
                  }}
                >
                  <SelectTrigger className="border-slate-700 bg-black/40 focus:border-rose-500 focus:ring-rose-500/20">
                    <SelectValue placeholder={t('createMatch.form.goal.placeholder')} />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-black/95 backdrop-blur-lg">
                    {goals.map((goal) => (
                      <SelectItem key={goal} value={goal}>
                        {t(`goals.${goal}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.goal && (
                  <p className="text-sm text-red-400">{errors.goal}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('createMatch.form.description.label')} *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, description: e.target.value }));
                    if (errors.description) {
                      setErrors((prev) => ({ ...prev, description: '' }));
                    }
                  }}
                  placeholder={t('createMatch.form.description.placeholder')}
                  rows={4}
                  className="border-slate-700 bg-black/40 placeholder:text-muted-foreground focus:border-rose-500 focus:ring-rose-500/20"
                />
                {errors.description && (
                  <p className="text-sm text-red-400">{errors.description}</p>
                )}
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age">{t('createMatch.form.age.label')}</Label>
                <Input
                  id="age"
                  type="number"
                  min="13"
                  max="100"
                  value={formData.age}
                  onChange={(e) => setFormData((prev) => ({ ...prev, age: e.target.value }))}
                  placeholder={t('createMatch.form.age.placeholder')}
                  className="border-slate-700 bg-black/40"
                />
              </div>

              {/* Play Time */}
              <div className="space-y-2">
                <Label htmlFor="playTime">{t('createMatch.form.playTime.label')}</Label>
                <Select
                  value={formData.playTime}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, playTime: value }))}
                >
                  <SelectTrigger className="border-slate-700 bg-black/40 focus:border-rose-500 focus:ring-rose-500/20">
                    <SelectValue placeholder={t('createMatch.form.playTime.placeholder')} />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-black/95 backdrop-blur-lg">
                    {playTimeKeys.map((item) => (
                      <SelectItem key={item.key} value={t(`playTimes.${item.key}`)}>
                        {t(`playTimes.${item.key}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            <CardFooter className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/matches')}
                className="flex-1 border-slate-700"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800"
              >
                {t('createMatch.form.createButton')}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}

