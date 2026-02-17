'use client'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { authAPI } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Пароли не совпадают')
      return
    }
    
    setIsLoading(true)
    
    try {
      const user = await authAPI.register({
        nickname: formData.nickname,
        email: formData.email,
        password: formData.password,
      })
      login(user)
      toast.success('Регистрация успешна!')
      navigate('/matches')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка регистрации')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-rose-950/20 to-black px-4 pt-20">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 bg-gradient-to-r from-rose-500 to-rose-700 bg-clip-text text-4xl font-bold text-transparent">
            AkioraGG
          </h1>
          <p className="text-muted-foreground">{t('auth.register.subtitle')}</p>
        </div>

        <Card className="border-rose-900/50 bg-black/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-rose-50">{t('auth.register.title')}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {t('auth.register.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-rose-50">
                  {t('auth.register.name')}
                </Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="John Doe"
                  value={formData.nickname}
                  onChange={(e) => handleChange('nickname', e.target.value)}
                  required
                  className="border-rose-900/50 bg-black/40 text-rose-50 placeholder:text-muted-foreground focus-visible:border-rose-500 focus-visible:ring-rose-500/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-rose-50">
                  {t('auth.register.email')}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className="border-rose-900/50 bg-black/40 text-rose-50 placeholder:text-muted-foreground focus-visible:border-rose-500 focus-visible:ring-rose-500/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-rose-50">
                  {t('auth.register.password')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                    className="border-rose-900/50 bg-black/40 pr-10 text-rose-50 placeholder:text-muted-foreground focus-visible:border-rose-500 focus-visible:ring-rose-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-rose-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-rose-50">
                  {t('auth.register.confirmPassword')}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    required
                    className="border-rose-900/50 bg-black/40 pr-10 text-rose-50 placeholder:text-muted-foreground focus-visible:border-rose-500 focus-visible:ring-rose-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-rose-400 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Регистрация...
                  </>
                ) : (
                  t('auth.register.submit')
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex-col space-y-2">
            <div className="text-center text-sm text-muted-foreground">
              {t('auth.register.hasAccount')}{' '}
              <Link to="/login" className="text-rose-400 hover:text-rose-300 font-medium transition-colors">
                {t('auth.register.signIn')}
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Decorative glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-rose-600/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-rose-800/20 blur-3xl" />
        </div>
      </div>
    </div>
  )
}
