import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { formsAPI, type CreateFormRequest } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const servers = ['EUW', 'EUNE', 'NA', 'KR', 'BR', 'LAN', 'LAS', 'OCE', 'RU', 'TR', 'JP'];
const roles = ['TOP', 'JG', 'MID', 'ADC', 'SUP', 'FILL'];
const ranks = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'];
const rankTiers = [1, 2, 3, 4];
const gameModes = [
  { value: 'NORMAL', label: 'Обычная' },
  { value: 'ARAM', label: 'ARAM' },
  { value: 'SOLOQ', label: 'Ranked Solo/Duo' },
  { value: 'FLEX', label: 'Ranked Flex' },
  { value: 'ARENA', label: 'Arena' },
  { value: 'URF', label: 'URF' }
];
const genders = [
  { value: 'MALE', label: 'Мужской' },
  { value: 'FEMALE', label: 'Женский' }
];

interface Step1Data {
  nickname: string;
  tag: string;
  server: string;
}

interface Step2Data {
  myRoles: string[];
  teammateRoles: string[];
  lookingForRanks: Array<{ rank: string; tier: number }>;
  gameModes: string[];
  servers: string[];
  smurfOnly: boolean;
}

interface Step3Data {
  minAge?: number;
  maxAge?: number;
  gender?: string;
  voice: boolean;
  description: string;
}

export default function CreateMatchNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: League Account
  const [step1Data, setStep1Data] = useState<Step1Data>({
    nickname: '',
    tag: '',
    server: '',
  });
  const [step1Errors, setStep1Errors] = useState<Partial<Record<keyof Step1Data, string>>>({});

  // Step 2: League Preferences
  const [step2Data, setStep2Data] = useState<Step2Data>({
    myRoles: [],
    teammateRoles: [],
    lookingForRanks: [],
    gameModes: [],
    servers: [],
    smurfOnly: false,
  });
  const [step2Errors, setStep2Errors] = useState<Partial<Record<keyof Step2Data, string>>>({});

  // Step 3: Person Preferences
  const [step3Data, setStep3Data] = useState<Step3Data>({
    minAge: undefined,
    maxAge: undefined,
    gender: undefined,
    voice: true,
    description: '',
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const validateStep1 = (): boolean => {
    const errors: Partial<Record<keyof Step1Data, string>> = {};
    
    if (!step1Data.nickname.trim()) {
      errors.nickname = 'Nickname is required';
    }
    if (!step1Data.tag.trim()) {
      errors.tag = 'Tag is required';
    }
    if (!step1Data.server) {
      errors.server = 'Server is required';
    }

    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Partial<Record<keyof Step2Data, string>> = {};
    
    if (step2Data.myRoles.length === 0) {
      errors.myRoles = 'Выберите хотя бы одну вашу роль';
    }
    if (step2Data.teammateRoles.length === 0) {
      errors.teammateRoles = 'Выберите хотя бы одну роль напарника';
    }
    if (step2Data.gameModes.length === 0) {
      errors.gameModes = 'Выберите хотя бы один режим игры';
    }

    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      // Update servers in step2 when moving forward
      setStep2Data(prev => ({
        ...prev,
        servers: [step1Data.server]
      }));
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleArrayValue = <T extends keyof Step2Data>(
    field: T,
    value: string
  ) => {
    setStep2Data((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? (prev[field] as string[]).filter((v) => v !== value)
        : [...(prev[field] as string[]), value],
    }));
    if (step2Errors[field]) {
      setStep2Errors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const toggleRankTier = (rank: string, tier: number) => {
    const existing = step2Data.lookingForRanks.find(r => r.rank === rank && r.tier === tier);
    if (existing) {
      setStep2Data(prev => ({
        ...prev,
        lookingForRanks: prev.lookingForRanks.filter(r => !(r.rank === rank && r.tier === tier))
      }));
    } else {
      setStep2Data(prev => ({
        ...prev,
        lookingForRanks: [...prev.lookingForRanks, { rank, tier }]
      }));
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Необходимо войти в систему');
      navigate('/login');
      return;
    }

    if (!step3Data.description.trim() || step3Data.description.length < 5) {
      toast.error('Описание должно содержать минимум 5 символов');
      return;
    }

    setIsLoading(true);

    try {
      const formData: CreateFormRequest = {
        creator_id: user.userId,
        account: {
          nickname: step1Data.nickname,
          tag: step1Data.tag,
          server: step1Data.server,
        },
        league_preferences: {
          my_roles: step2Data.myRoles,
          teammate_roles: step2Data.teammateRoles,
          looking_for_ranks: step2Data.lookingForRanks,
          mode: step2Data.gameModes,
          server: [step1Data.server],
          smurf_only: step2Data.smurfOnly,
        },
        person_preferences: {
          min_age: step3Data.minAge,
          max_age: step3Data.maxAge,
          gender: step3Data.gender,
          voice: step3Data.voice,
        },
        description: step3Data.description,
      };

      await formsAPI.createForm(formData);
      toast.success('Анкета успешно создана!');
      navigate('/matches');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка создания анкеты');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-rose-950/20 to-black px-4 py-20">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 bg-gradient-to-r from-rose-500 to-rose-700 bg-clip-text text-4xl font-bold text-transparent">
            Создать анкету
          </h1>
          <p className="text-muted-foreground">Найди идеального напарника для игры</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm text-muted-foreground">
            <span>Шаг {step} из {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-800" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-rose-900/50 bg-black/40 backdrop-blur">
              {step === 1 && (
                <>
                  <CardHeader>
                    <CardTitle className="text-rose-50">Игровой аккаунт</CardTitle>
                    <CardDescription>Привяжите ваш League of Legends аккаунт</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nickname" className="text-rose-50">
                        Игровой ник *
                      </Label>
                      <Input
                        id="nickname"
                        value={step1Data.nickname}
                        onChange={(e) => {
                          setStep1Data((prev) => ({ ...prev, nickname: e.target.value }));
                          if (step1Errors.nickname) setStep1Errors((prev) => ({ ...prev, nickname: '' }));
                        }}
                        placeholder="YourNickname"
                        className="border-rose-900/50 bg-black/40 text-rose-50"
                      />
                      {step1Errors.nickname && (
                        <p className="text-sm text-red-400">{step1Errors.nickname}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tag" className="text-rose-50">
                        Тег (#1234) *
                      </Label>
                      <Input
                        id="tag"
                        value={step1Data.tag}
                        onChange={(e) => {
                          setStep1Data((prev) => ({ ...prev, tag: e.target.value }));
                          if (step1Errors.tag) setStep1Errors((prev) => ({ ...prev, tag: '' }));
                        }}
                        placeholder="EUW"
                        className="border-rose-900/50 bg-black/40 text-rose-50"
                      />
                      {step1Errors.tag && (
                        <p className="text-sm text-red-400">{step1Errors.tag}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="server" className="text-rose-50">
                        Сервер *
                      </Label>
                      <Select
                        value={step1Data.server}
                        onValueChange={(value) => {
                          setStep1Data((prev) => ({ ...prev, server: value }));
                          if (step1Errors.server) setStep1Errors((prev) => ({ ...prev, server: '' }));
                        }}
                      >
                        <SelectTrigger className="border-rose-900/50 bg-black/40">
                          <SelectValue placeholder="Выберите сервер" />
                        </SelectTrigger>
                        <SelectContent className="border-slate-700 bg-black/95">
                          {servers.map((server) => (
                            <SelectItem key={server} value={server}>
                              {server}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {step1Errors.server && (
                        <p className="text-sm text-red-400">{step1Errors.server}</p>
                      )}
                    </div>
                  </CardContent>
                </>
              )}

              {step === 2 && (
                <>
                  <CardHeader>
                    <CardTitle className="text-rose-50">Игровые предпочтения</CardTitle>
                    <CardDescription>Расскажите о вашем стиле игры</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 max-h-[500px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-rose-500/40 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {/* My Roles */}
                    <div className="space-y-2">
                      <Label className="text-rose-50">Мои роли *</Label>
                      <div className="flex flex-wrap gap-2">
                        {roles.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => toggleArrayValue('myRoles', role)}
                            className={`rounded-md border px-4 py-2 text-sm font-medium transition-all ${
                              step2Data.myRoles.includes(role)
                                ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                                : 'border-slate-700 bg-black/40 text-muted-foreground hover:border-slate-600'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                      {step2Errors.myRoles && (
                        <p className="text-sm text-red-400">{step2Errors.myRoles}</p>
                      )}
                    </div>

                    {/* Teammate Roles */}
                    <div className="space-y-2">
                      <Label className="text-rose-50">Роли напарника *</Label>
                      <div className="flex flex-wrap gap-2">
                        {roles.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => toggleArrayValue('teammateRoles', role)}
                            className={`rounded-md border px-4 py-2 text-sm font-medium transition-all ${
                              step2Data.teammateRoles.includes(role)
                                ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                                : 'border-slate-700 bg-black/40 text-muted-foreground hover:border-slate-600'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                      {step2Errors.teammateRoles && (
                        <p className="text-sm text-red-400">{step2Errors.teammateRoles}</p>
                      )}
                    </div>

                    {/* Game Modes */}
                    <div className="space-y-2">
                      <Label className="text-rose-50">Режимы игры *</Label>
                      <div className="flex flex-wrap gap-2">
                        {gameModes.map((mode) => (
                          <button
                            key={mode.value}
                            type="button"
                            onClick={() => toggleArrayValue('gameModes', mode.value)}
                            className={`rounded-md border px-4 py-2 text-sm font-medium transition-all ${
                              step2Data.gameModes.includes(mode.value)
                                ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                                : 'border-slate-700 bg-black/40 text-muted-foreground hover:border-slate-600'
                            }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                      {step2Errors.gameModes && (
                        <p className="text-sm text-red-400">{step2Errors.gameModes}</p>
                      )}
                    </div>

                    {/* Looking for Ranks */}
                    {(step2Data.gameModes.includes('SOLOQ') || step2Data.gameModes.includes('FLEX')) && (
                      <div className="space-y-2">
                        <Label className="text-rose-50">Ищу ранги (для Ranked режимов)</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {ranks.map((rank) => (
                            <div key={rank} className="space-y-1">
                              <div className="text-sm font-medium text-rose-300">{rank}</div>
                              <div className="flex gap-1">
                                {rankTiers.map((tier) => (
                                  <button
                                    key={`${rank}-${tier}`}
                                    type="button"
                                    onClick={() => toggleRankTier(rank, tier)}
                                    className={`flex-1 rounded border px-2 py-1 text-xs transition-all ${
                                      step2Data.lookingForRanks.some(r => r.rank === rank && r.tier === tier)
                                        ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                                        : 'border-slate-700 bg-black/40 text-muted-foreground hover:border-slate-600'
                                    }`}
                                  >
                                    {tier}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Smurf Only */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="smurfOnly"
                        checked={step2Data.smurfOnly}
                        onCheckedChange={(checked) =>
                          setStep2Data((prev) => ({ ...prev, smurfOnly: checked as boolean }))
                        }
                      />
                      <Label htmlFor="smurfOnly" className="text-rose-50 cursor-pointer">
                        Только смурфы
                      </Label>
                    </div>
                  </CardContent>
                </>
              )}

              {step === 3 && (
                <>
                  <CardHeader>
                    <CardTitle className="text-rose-50">Личные предпочтения</CardTitle>
                    <CardDescription>Кого вы хотите найти?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minAge" className="text-rose-50">
                          Минимальный возраст
                        </Label>
                        <Input
                          id="minAge"
                          type="number"
                          min="16"
                          max="120"
                          value={step3Data.minAge || ''}
                          onChange={(e) =>
                            setStep3Data((prev) => ({
                              ...prev,
                              minAge: e.target.value ? parseInt(e.target.value) : undefined,
                            }))
                          }
                          placeholder="18"
                          className="border-rose-900/50 bg-black/40 text-rose-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxAge" className="text-rose-50">
                          Максимальный возраст
                        </Label>
                        <Input
                          id="maxAge"
                          type="number"
                          min="16"
                          max="120"
                          value={step3Data.maxAge || ''}
                          onChange={(e) =>
                            setStep3Data((prev) => ({
                              ...prev,
                              maxAge: e.target.value ? parseInt(e.target.value) : undefined,
                            }))
                          }
                          placeholder="35"
                          className="border-rose-900/50 bg-black/40 text-rose-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender" className="text-rose-50">
                        Пол напарника
                      </Label>
                      <Select
                        value={step3Data.gender || ''}
                        onValueChange={(value) =>
                          setStep3Data((prev) => ({ ...prev, gender: value }))
                        }
                      >
                        <SelectTrigger className="border-rose-900/50 bg-black/40">
                          <SelectValue placeholder="Не важно" />
                        </SelectTrigger>
                        <SelectContent className="border-slate-700 bg-black/95">
                          {genders.map((gender) => (
                            <SelectItem key={gender.value} value={gender.value}>
                              {gender.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="voice"
                        checked={step3Data.voice}
                        onCheckedChange={(checked) =>
                          setStep3Data((prev) => ({ ...prev, voice: checked as boolean }))
                        }
                      />
                      <Label htmlFor="voice" className="text-rose-50 cursor-pointer">
                        Голосовой чат
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-rose-50">
                        Описание *
                      </Label>
                      <Textarea
                        id="description"
                        value={step3Data.description}
                        onChange={(e) =>
                          setStep3Data((prev) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Расскажите о себе и кого вы ищете... (минимум 5 символов)"
                        rows={4}
                        className="border-rose-900/50 bg-black/40 text-rose-50 placeholder:text-muted-foreground"
                      />
                    </div>
                  </CardContent>
                </>
              )}

              <CardFooter className="flex gap-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 border-rose-900/50 text-rose-50"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Назад
                  </Button>
                )}
                {step < totalSteps ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600"
                  >
                    Далее
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Создание...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Создать анкету
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Decorative glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-rose-600/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-rose-800/20 blur-3xl" />
        </div>
      </div>
    </div>
  );
}
