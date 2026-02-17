import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Heart, X, Loader2, Users as UsersIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formsAPI, type HotP2PForm } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import RankDisplay from '@/components/RankDisplay';
import ChampionStatsCard from '@/components/ChampionStatsCard';

export default function MatchesFeedNew() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [forms, setForms] = useState<HotP2PForm[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadForms();
  }, [isAuthenticated, navigate]);

  const loadForms = async () => {
    setIsLoading(true);
    try {
      const allForms = await formsAPI.getAllForms(user?.userId);
      console.log(allForms);
      setForms(allForms);
    } catch (error) {
      toast.error('Ошибка загрузки анкет');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentForm = forms[currentIndex];

  const handleLike = async () => {
    if (!user || !currentForm || isActioning) return;

    setIsActioning(true);
    try {
      await formsAPI.likeForm(currentForm.id, user.userId);
      toast.success('❤️ Лайк отправлен!');
      
      // Check if it's a match
      if (currentForm.liked_by.includes(user.userId)) {
        toast.success('🎉 Это взаимно! Начните чат!');
      }
      
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      toast.error('Ошибка при отправке лайка');
      console.error(error);
    } finally {
      setIsActioning(false);
    }
  };

  const handleDislike = async () => {
    if (!user || !currentForm || isActioning) return;

    setIsActioning(true);
    try {
        console.log(currentForm.id);
        console.log(user.userId);
      await formsAPI.dislikeForm(currentForm.id, user.userId);
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      toast.error('Ошибка при отклонении');
      console.error(error);
    } finally {
      setIsActioning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-rose-950/20 to-black">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (forms.length === 0 || currentIndex >= forms.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-rose-950/20 to-black px-4">
        <Card className="border-rose-900/50 bg-black/40 backdrop-blur">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 rounded-full bg-rose-500/20 p-4">
              <UsersIcon className="h-8 w-8 text-rose-400" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-rose-50">Анкет больше нет</h2>
            <p className="mb-6 text-muted-foreground">
              Вы просмотрели все доступные анкеты. Попробуйте позже!
            </p>
            <Button
              onClick={() => navigate('/matches/create')}
              className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Создать анкету
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-rose-950/20 to-black px-4 py-20">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 bg-gradient-to-r from-rose-500 to-rose-700 bg-clip-text text-4xl font-bold text-transparent">
            Поиск напарника
          </h1>
          <p className="text-muted-foreground">
            Осталось анкет: {forms.length - currentIndex}
          </p>
        </div>

        {/* Swipe Card */}
        <div className="relative h-[600px]">
          <AnimatePresence mode="wait">
            {currentForm && (
              <motion.div
                key={currentForm.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <Card className="h-full border-rose-900/50 bg-black/40 backdrop-blur flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl text-rose-50">
                          {currentForm.user_data?.nickname || currentForm.account.nickname}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {currentForm.account.nickname}#{currentForm.account.tag}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-rose-500/50 bg-rose-500/10 text-rose-300">
                        {currentForm.account.server}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 overflow-y-auto flex-1 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-rose-500/40 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-rose-500/20 hover:[&::-webkit-scrollbar-thumb]:bg-rose-500/60">{/* Account Info */}
                    {currentForm.account_info && (currentForm.account_info.solo_queue || currentForm.account_info.flex_queue) && (
                      <RankDisplay 
                        solo_queue={currentForm.account_info.solo_queue}
                        flex_queue={currentForm.account_info.flex_queue}
                      />
                    )}

                    {/* Roles */}
                    <div>
                      <h3 className="mb-2 font-semibold text-rose-50">Мои роли</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentForm.league_preferences?.my_roles?.map((role) => (
                          <Badge
                            key={role}
                            className="border-rose-500/50 bg-rose-500/20 text-rose-300"
                          >
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Looking for Ranks */}
                    {currentForm.league_preferences?.looking_for_ranks && currentForm.league_preferences.looking_for_ranks.length > 0 && (
                      <div>
                        <h3 className="mb-2 font-semibold text-rose-50">Ищу ранги</h3>
                        <div className="flex flex-wrap gap-2">
                          {currentForm.league_preferences.looking_for_ranks.map((rank, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="border-slate-700 bg-slate-800/50"
                            >
                              {rank.rank} {rank.tier}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Game Modes */}
                    {currentForm.league_preferences?.mode && currentForm.league_preferences.mode.length > 0 && (
                      <div>
                        <h3 className="mb-2 font-semibold text-rose-50">Режимы игры</h3>
                        <div className="flex flex-wrap gap-2">
                          {currentForm.league_preferences.mode.map((mode) => (
                            <Badge
                              key={mode}
                              variant="outline"
                              className="border-rose-900/50 bg-black/40"
                            >
                              {mode}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {currentForm?.description && (
                      <div>
                        <h3 className="mb-2 font-semibold text-rose-50">Описание</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {currentForm.description}
                        </p>
                      </div>
                    )}

                    {/* User Info */}
                    {currentForm?.user_data && (currentForm.user_data.age || currentForm.user_data.gender) && (
                      <div className="rounded-lg border border-rose-900/30 bg-gradient-to-br from-black/40 to-rose-950/10 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <UsersIcon className="h-5 w-5 text-rose-400" />
                          <h3 className="font-semibold text-rose-50">О пользователе</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {currentForm.user_data.age && (
                            <div className="rounded-lg bg-black/40 p-3">
                              <p className="text-muted-foreground mb-1">Возраст</p>
                              <p className="text-lg font-semibold text-rose-50">{currentForm.user_data.age}</p>
                            </div>
                          )}
                          {currentForm.user_data.gender && (
                            <div className="rounded-lg bg-black/40 p-3">
                              <p className="text-muted-foreground mb-1">Пол</p>
                              <p className="text-lg font-semibold text-rose-50">
                                {currentForm.user_data.gender === 'MALE'
                                  ? 'Мужской'
                                  : currentForm.user_data.gender === 'FEMALE'
                                  ? 'Женский'
                                  : 'Другое'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Champion Stats */}
                    {currentForm.account_info?.champion_stats && (
                      <ChampionStatsCard championStats={currentForm.account_info.champion_stats} />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-8">
          <Button
            onClick={handleDislike}
            disabled={isActioning}
            size="lg"
            variant="outline"
            className="h-16 w-16 rounded-full border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
          >
            <X className="h-8 w-8" />
          </Button>
          <Button
            onClick={handleLike}
            disabled={isActioning}
            size="lg"
            className="h-20 w-20 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50"
          >
            <Heart className="h-10 w-10" />
          </Button>
        </div>

        {/* Create Form Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => navigate('/matches/create')}
            variant="outline"
            className="border-rose-900/50 text-rose-50 hover:bg-rose-950/50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Создать свою анкету
          </Button>
        </div>

        {/* Decorative glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-rose-600/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-rose-800/20 blur-3xl" />
        </div>
      </div>
    </div>
  );
}
