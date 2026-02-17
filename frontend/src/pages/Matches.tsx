import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Users, MapPin, Trophy, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export interface MatchProfile {
  id: string;
  username: string;
  server: string;
  roles: string[];
  rank: string;
  description: string;
  goal: string;
  age?: number;
  playTime?: string;
  createdAt: string;
}

const mockProfiles: MatchProfile[] = [
  {
    id: '1',
    username: 'SummonerPro',
    server: 'EUW',
    roles: ['Mid', 'Top'],
    rank: 'Diamond',
    description: 'Ищу тиммейта для ранкеда. Играю агрессивно, предпочитаю раннюю игру. Готов к комуникации и улучшению.',
    goal: 'Ranked',
    age: 22,
    playTime: 'Вечер (19:00-23:00)',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'LoLPlayer123',
    server: 'EUNE',
    roles: ['Jungle', 'Support'],
    rank: 'Platinum',
    description: 'Ищу друзей для нормсов и флекса. Расслабленная атмосфера, без токсичности.',
    goal: 'Normal',
    age: 25,
    playTime: 'День (12:00-18:00)',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    username: 'ChallengerSeeker',
    server: 'NA',
    roles: ['ADC'],
    rank: 'Master',
    description: 'Серьезный игрок, ищу дуо-партнера для подъема в Challenger. Минимум 5 игр в день.',
    goal: 'Ranked',
    age: 20,
    playTime: 'Любое время',
    createdAt: new Date().toISOString(),
  },
];

const servers = ['EUW', 'EUNE', 'NA', 'KR', 'BR', 'LAN', 'LAS', 'OCE', 'RU', 'TR', 'JP'];
const roles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Challenger'];
const goals = ['Ranked', 'Normal', 'Flex', 'Clash', 'Friends'];

function getRankColor(rank: string): string {
  const rankColors: Record<string, string> = {
    Iron: 'bg-gray-500/20 text-gray-300 border-gray-500/50',
    Bronze: 'bg-amber-700/20 text-amber-300 border-amber-700/50',
    Silver: 'bg-gray-300/20 text-gray-200 border-gray-300/50',
    Gold: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
    Platinum: 'bg-teal-500/20 text-teal-300 border-teal-500/50',
    Diamond: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    Master: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    Grandmaster: 'bg-red-600/20 text-red-300 border-red-600/50',
    Challenger: 'bg-rose-600/20 text-rose-300 border-rose-600/50',
  };
  return rankColors[rank] || 'bg-gray-500/20 text-gray-300 border-gray-500/50';
}

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

export default function Matches() {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<MatchProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterServer, setFilterServer] = useState<string>('all');
  const [filterRank, setFilterRank] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterGoal, setFilterGoal] = useState<string>('all');

  useEffect(() => {
    setIsLoading(true);
    // Симуляция загрузки
    setTimeout(() => {
      const savedProfiles = localStorage.getItem('matchProfiles');
      if (savedProfiles) {
        const parsed = JSON.parse(savedProfiles);
        setProfiles(parsed.length > 0 ? parsed : mockProfiles);
      } else {
        setProfiles(mockProfiles);
        localStorage.setItem('matchProfiles', JSON.stringify(mockProfiles));
      }
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesServer = filterServer === 'all' || profile.server === filterServer;
    const matchesRank = filterRank === 'all' || profile.rank === filterRank;
    const matchesRole = filterRole === 'all' || profile.roles.includes(filterRole);
    const matchesGoal = filterGoal === 'all' || profile.goal === filterGoal;

    return matchesSearch && matchesServer && matchesRank && matchesRole && matchesGoal;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/90 to-black text-foreground pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-rose-500 to-rose-700 bg-clip-text text-4xl font-bold text-transparent">
              {t('matches.title')}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t('matches.subtitle')}
            </p>
          </div>
          <Link to="/matches/create">
            <Button className="bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800">
              <Plus className="mr-2 h-4 w-4" />
              {t('matches.createButton')}
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-slate-800/80 bg-black/40 backdrop-blur">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('matches.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-700 bg-black/40"
                />
              </div>

              {/* Filter buttons */}
              <div className="flex flex-wrap gap-3">
                <Select value={filterServer} onValueChange={setFilterServer}>
                  <SelectTrigger className="w-[140px] border-slate-700 bg-black/40 focus:border-rose-500 focus:ring-rose-500/20">
                    <SelectValue placeholder={t('matches.filters.allServers')} />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-black/95 backdrop-blur-lg">
                    <SelectItem value="all">{t('matches.filters.allServers')}</SelectItem>
                    {servers.map((server) => (
                      <SelectItem key={server} value={server}>
                        {t(`servers.${server}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterRank} onValueChange={setFilterRank}>
                  <SelectTrigger className="w-[140px] border-slate-700 bg-black/40 focus:border-rose-500 focus:ring-rose-500/20">
                    <SelectValue placeholder={t('matches.filters.allRanks')} />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-black/95 backdrop-blur-lg">
                    <SelectItem value="all">{t('matches.filters.allRanks')}</SelectItem>
                    {ranks.map((rank) => (
                      <SelectItem key={rank} value={rank}>
                        {t(`ranks.${rank}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[140px] border-slate-700 bg-black/40 focus:border-rose-500 focus:ring-rose-500/20">
                    <SelectValue placeholder={t('matches.filters.allRoles')} />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-black/95 backdrop-blur-lg">
                    <SelectItem value="all">{t('matches.filters.allRoles')}</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {t(`roles.${role}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterGoal} onValueChange={setFilterGoal}>
                  <SelectTrigger className="w-[140px] border-slate-700 bg-black/40 focus:border-rose-500 focus:ring-rose-500/20">
                    <SelectValue placeholder={t('matches.filters.allGoals')} />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-black/95 backdrop-blur-lg">
                    <SelectItem value="all">{t('matches.filters.allGoals')}</SelectItem>
                    {goals.map((goal) => (
                      <SelectItem key={goal} value={goal}>
                        {t(`goals.${goal}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        <div className="mb-6 text-sm text-muted-foreground">
          {t('matches.found')}: <span className="text-rose-400 font-semibold">{filteredProfiles.length}</span>
        </div>

        {/* Profiles grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-slate-800/80 bg-black/40 backdrop-blur">
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <Card className="border-slate-800/80 bg-black/40 backdrop-blur">
            <CardContent className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">{t('matches.notFound.title')}</p>
              <p className="text-muted-foreground">
                {t('matches.notFound.description')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProfiles.map((profile) => (
              <Card
                key={profile.id}
                className="group border-slate-800/80 bg-black/40 backdrop-blur transition-all duration-300 hover:border-rose-500/50 hover:shadow-lg hover:shadow-rose-500/10"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-foreground mb-2">
                        {profile.username}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.server}</span>
                      </div>
                    </div>
                    <Badge className={getRankColor(profile.rank)} variant="outline">
                      <Trophy className="mr-1 h-3 w-3" />
                      {t(`ranks.${profile.rank}`)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Roles */}
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('matches.card.roles')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.roles.map((role) => (
                        <Badge
                          key={role}
                          className={getRoleColor(role)}
                          variant="outline"
                        >
                          {t(`roles.${role}`)}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t('matches.card.description')}
                    </p>
                    <p className="text-sm text-foreground/80 line-clamp-3">{profile.description}</p>
                  </div>

                  {/* Additional info */}
                  <div className="space-y-2 text-sm">
                    {profile.age && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium">{t('matches.card.age')}:</span>
                        <span>{profile.age}</span>
                      </div>
                    )}
                    {profile.playTime && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-medium">{t('matches.card.playTime')}:</span>
                        <span>{profile.playTime}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground">{t('matches.card.goal')}:</span>
                      <Badge
                        variant="outline"
                        className="border-rose-500/50 bg-rose-500/10 text-rose-400"
                      >
                        {t(`goals.${profile.goal}`)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full bg-gradient-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800"
                    variant="default"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {t('common.contact')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

