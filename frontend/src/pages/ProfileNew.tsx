import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit, LogOut, User, Mail, Calendar, Users, Loader2, MessageCircle, Bell, BellOff } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { userAPI, formsAPI, notificationAPI, type HotP2PForm, type User as UserType } from '@/lib/api';
import TelegramBotButton from '@/components/TelegramBotButton';

export default function ProfilePageNew() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState<UserType | null>(authUser);
  const [myForms, setMyForms] = useState<HotP2PForm[]>([]);
  const [likedForms, setLikedForms] = useState<HotP2PForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [telegramSubscribed, setTelegramSubscribed] = useState(false);
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [isTogglingNotification, setIsTogglingNotification] = useState(false);

  const [editData, setEditData] = useState({
    nickname: '',
    email: '',
    age: undefined as number | undefined,
    gender: '',
    telegram: '',
  });

  useEffect(() => {
    if (!authUser) {
      navigate('/login');
      return;
    }
    loaduser_data();
  }, [authUser, navigate]);

  const loaduser_data = async () => {
    if (!authUser) return;

    setIsLoading(true);
    try {
      const [user_data, userForms, likedFormsData] = await Promise.all([
        userAPI.getUser(authUser.userId),
        formsAPI.getFormsByCreator(authUser.userId),
        formsAPI.getLikedForms(authUser.userId),
      ]);

      setUser(user_data);
      setMyForms(userForms);
      setLikedForms(likedFormsData);
      
      const telegramSocial = user_data?.socials?.['Telegram'];
      setEditData({
        nickname: user_data.nickname,
        email: user_data.email,
        age: user_data.age,
        gender: user_data.gender || '',
        telegram: telegramSocial?.url || '',
      });
    } catch (error) {
      toast.error('Ошибка загрузки данных профиля');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!authUser) return;

    setIsSaving(true);
    try {
      const updates: Promise<User>[] = [];

      // Update nickname if changed
      if (editData.nickname !== user?.nickname) {
        updates.push(userAPI.updateNickname(authUser.userId, editData.nickname));
      }

      // Update email if changed
      if (editData.email !== user?.email) {
        updates.push(userAPI.updateEmail(authUser.userId, editData.email));
      }

      // Update age if changed
      if (editData.age !== user?.age) {
        updates.push(userAPI.updateAge(authUser.userId, editData.age!));
      }

      // Update gender if changed
      if (editData.gender !== user?.gender) {
        updates.push(userAPI.updateGender(authUser.userId, editData.gender));
      }

      // Update socials (telegram) if changed
     
      if (editData.telegram !== undefined ) {
        const socialsMap = editData.telegram
          ? { Telegram: { platform: 'telegram', url: editData.telegram } }
          : {};
        updates.push(userAPI.updateSocials(authUser.userId, socialsMap));
      }

      // Wait for all updates to complete
      if (updates.length > 0) {
        const results = await Promise.all(updates);
        // Use the last result as the updated user
        const updatedUser = results[results.length - 1];
        setUser(updatedUser);
        toast.success('Профиль успешно обновлен');
      } else {
        toast.info('Нет изменений для сохранения');
      }

      setIsEditOpen(false);
    } catch (error) {
      toast.error('Ошибка обновления профиля');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Вы вышли из системы');
    navigate('/login');
  };

  const handleToggleTelegram = async () => {
    if (!authUser) return;
    setIsTogglingNotification(true);
    try {
      if (telegramSubscribed) {
        await notificationAPI.unsubscribeTelegram(authUser.userId);
        setTelegramSubscribed(false);
        toast.success('Отписка от Telegram уведомлений');
      } else {
        // При подписке запрашиваем Telegram Chat ID
        const telegramChatId = prompt('Введите ваш Telegram Chat ID:');
        if (telegramChatId) {
          await notificationAPI.subscribeTelegram(authUser.userId, telegramChatId);
          setTelegramSubscribed(true);
          toast.success('Подписка на Telegram уведомления');
        }
      }
    } catch (error) {
      toast.error('Ошибка управления подпиской');
      console.error(error);
    } finally {
      setIsTogglingNotification(false);
    }
  };

  const handleToggleEmail = async () => {
    if (!authUser) return;
    setIsTogglingNotification(true);
    try {
      if (emailSubscribed) {
        await notificationAPI.unsubscribeEmail(authUser.userId);
        setEmailSubscribed(false);
        toast.success('Отписка от Email уведомлений');
      } else {
        await notificationAPI.subscribeEmail(authUser.userId);
        setEmailSubscribed(true);
        toast.success('Подписка на Email уведомления');
      }
    } catch (error) {
      toast.error('Ошибка управления подпиской');
      console.error(error);
    } finally {
      setIsTogglingNotification(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-rose-950/20 to-black">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-rose-950/20 to-black px-4 py-20">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 bg-gradient-to-r from-rose-500 to-rose-700 bg-clip-text text-4xl font-bold text-transparent">
                Профиль
              </h1>
              <p className="text-muted-foreground">Управляйте вашим аккаунтом и анкетами</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-rose-900/50 text-rose-50 hover:bg-rose-950/50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Sidebar - User Info */}
          <div className="space-y-6">
            <Card className="border-rose-900/50 bg-black/40 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-rose-50">
                  <span>Информация</span>
                  <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-400 hover:text-rose-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="border-rose-900/50 bg-black/95 backdrop-blur">
                      <DialogHeader>
                        <DialogTitle className="text-rose-50">Редактировать профиль</DialogTitle>
                        <DialogDescription>
                          Обновите ваши личные данные
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="nickname" className="text-rose-50">
                            Никнейм
                          </Label>
                          <Input
                            id="nickname"
                            value={editData.nickname}
                            onChange={(e) =>
                              setEditData((prev) => ({ ...prev, nickname: e.target.value }))
                            }
                            className="border-rose-900/50 bg-black/40 text-rose-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-rose-50">
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={editData.email}
                            onChange={(e) =>
                              setEditData((prev) => ({ ...prev, email: e.target.value }))
                            }
                            className="border-rose-900/50 bg-black/40 text-rose-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="age" className="text-rose-50">
                            Возраст
                          </Label>
                          <Input
                            id="age"
                            type="number"
                            value={editData.age || ''}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                age: e.target.value ? parseInt(e.target.value) : undefined,
                              }))
                            }
                            className="border-rose-900/50 bg-black/40 text-rose-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gender" className="text-rose-50">
                            Пол
                          </Label>
                          <Select
                            value={editData.gender}
                            onValueChange={(value) =>
                              setEditData((prev) => ({ ...prev, gender: value }))
                            }
                          >
                            <SelectTrigger className="border-rose-900/50 bg-black/40">
                              <SelectValue placeholder="Выберите пол" />
                            </SelectTrigger>
                            <SelectContent className="border-slate-700 bg-black/95">
                              <SelectItem value="Male">Мужской</SelectItem>
                              <SelectItem value="Female">Женский</SelectItem>
                              <SelectItem value="Other">Другое</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telegram" className="text-rose-50">
                            Telegram
                          </Label>
                          <Input
                            id="telegram"
                            value={editData.telegram}
                            onChange={(e) =>
                              setEditData((prev) => ({ ...prev, telegram: e.target.value }))
                            }
                            placeholder="@username или ссылка"
                            className="border-rose-900/50 bg-black/40 text-rose-50"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditOpen(false)}
                          className="border-rose-900/50"
                        >
                          Отмена
                        </Button>
                        <Button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Сохранение...
                            </>
                          ) : (
                            'Сохранить'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20">
                    <User className="h-6 w-6 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Никнейм</p>
                    <p className="font-medium text-rose-50">{user.nickname}</p>
                  </div>
                </div>

                <Separator className="bg-rose-900/30" />

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20">
                    <Mail className="h-6 w-6 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-rose-50">{user.email}</p>
                  </div>
                </div>

                {user.age && (
                  <>
                    <Separator className="bg-rose-900/30" />
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20">
                        <Calendar className="h-6 w-6 text-rose-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Возраст</p>
                        <p className="font-medium text-rose-50">{user.age} лет</p>
                      </div>
                    </div>
                  </>
                )}

                {user.gender && (
                  <>
                    <Separator className="bg-rose-900/30" />
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20">
                        <Users className="h-6 w-6 text-rose-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Пол</p>
                        <p className="font-medium text-rose-50">
                          {user.gender === 'Male'
                            ? 'Мужской'
                            : user.gender === 'Female'
                            ? 'Женский'
                            : 'Другое'}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {user.socials && user.socials?.['Telegram'] && (
                  <>
                    <Separator className="bg-rose-900/30" />
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20">
                        <MessageCircle className="h-6 w-6 text-rose-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Telegram</p>
                        <p className="font-medium text-rose-50">
                          {user.socials?.['Telegram']?.url}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Telegram Bot */}
            <Card className="border-rose-900/50 bg-black/40 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-rose-50">Уведомления</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    Telegram уведомления
                  </p>
                  <div className="flex gap-2">
                    <TelegramBotButton
                      variant="outline"
                      className="flex-1 border-rose-900/50 text-rose-50 hover:bg-rose-950/50"
                    />
                    {/* <Button
                      onClick={handleToggleTelegram}
                      disabled={isTogglingNotification}
                      variant={telegramSubscribed ? "destructive" : "default"}
                      className={telegramSubscribed ? "" : "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600"}
                    >
                      {isTogglingNotification ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : telegramSubscribed ? (
                        <>
                          <BellOff className="mr-2 h-4 w-4" />
                          Отписаться
                        </>
                      ) : (
                        <>
                          <Bell className="mr-2 h-4 w-4" />
                          Подписаться
                        </>
                      )}
                    </Button> */}
                  </div>
                </div>
                
                <Separator className="bg-rose-900/30" />
                
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    Email уведомления
                  </p>
                  <Button
                    onClick={handleToggleEmail}
                    disabled={isTogglingNotification}
                    variant={emailSubscribed ? "destructive" : "default"}
                    className={`w-full ${emailSubscribed ? "" : "bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600"}`}
                  >
                    {isTogglingNotification ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : emailSubscribed ? (
                      <>
                        <BellOff className="mr-2 h-4 w-4" />
                        Отписаться от Email
                      </>
                    ) : (
                      <>
                        <Bell className="mr-2 h-4 w-4" />
                        Подписаться на Email
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Forms */}
          <div className="space-y-6 md:col-span-2">
            {/* My Forms */}
            <Card className="border-rose-900/50 bg-black/40 backdrop-blur">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-rose-50">Мои анкеты</CardTitle>
                  <Button
                    onClick={() => navigate('/matches/create')}
                    size="sm"
                    className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600"
                  >
                    Создать анкету
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {myForms.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    У вас пока нет анкет. Создайте первую!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {myForms.map((form) => (
                      <div
                        key={form.id}
                        className="rounded-lg border border-rose-900/30 bg-black/20 p-4 transition-colors hover:border-rose-900/50"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-rose-50">
                              {form.account.nickname}#{form.account.tag}
                            </h3>
                            <p className="text-sm text-muted-foreground">{form.account.server}</p>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-rose-500/50 bg-rose-500/10 text-rose-300"
                          >
                            {form.liked_by.length} лайков
                          </Badge>
                        </div>
                        {form.description && (
                          <p className="mb-3 text-sm text-muted-foreground">{form.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {form.league_preferences.teammate_roles.map((role) => (
                            <Badge
                              key={role}
                              variant="secondary"
                              className="border-slate-700 bg-slate-800/50"
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                        {form.account_info?.solo_queue && (
                          <div className="mt-3 flex items-center gap-4 text-sm">
                            <span className="text-rose-400">
                              {form.account_info.solo_queue.current_rank} {form.account_info.solo_queue.current_lp} LP
                            </span>
                            <span className="text-muted-foreground">
                              WR: {form.account_info.solo_queue.win_rate}%
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Liked Forms */}
            <Card className="border-rose-900/50 bg-black/40 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-rose-50">Понравившиеся анкеты</CardTitle>
              </CardHeader>
              <CardContent>
                {likedForms.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    Вы еще не лайкнули ни одной анкеты
                  </p>
                ) : (
                  <div className="space-y-4">
                    {likedForms.map((form) => (
                      <div
                        key={form.id}
                        className="rounded-lg border border-rose-900/30 bg-black/20 p-4 transition-colors hover:border-rose-900/50"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-rose-50">
                              {form.user_data?.nickname || form.account.nickname}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {form.account.nickname}#{form.account.tag} • {form.account.server}
                            </p>
                          </div>
                        </div>
                        {form.description && (
                          <p className="mb-3 text-sm text-muted-foreground">{form.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {form.league_preferences.teammate_roles.map((role) => (
                            <Badge
                              key={role}
                              variant="secondary"
                              className="border-slate-700 bg-slate-800/50"
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
