import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { FcGoogle } from "react-icons/fc"
import { SiYandexcloud } from "react-icons/si"
import { FaDiscord } from "react-icons/fa"
import { Mail, Shield, ArrowRight, Loader2, CheckCircle2 } from "lucide-react"

interface LoginFormProps {
    className?: string
    onLogin?: (email: string, code: string) => void
}

export function LoginForm({ className, onLogin }: LoginFormProps) {
    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const [codeSent, setCodeSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSendCode = async () => {
        if (!email) return
        setError("")
        setLoading(true)
        // TODO: API call to send code
        await new Promise(resolve => setTimeout(resolve, 1000))
        setCodeSent(true)
        setLoading(false)
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !code) return
        setError("")
        setLoading(true)
        // TODO: API call to login with email and code
        await new Promise(resolve => setTimeout(resolve, 1000))
        onLogin?.(email, code)
        setLoading(false)
    }

    const handleOAuth = (provider: string) => {
        // TODO: OAuth flow
        console.log(`OAuth with ${provider}`)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={cn("w-full max-w-md", className)}
        >
            {/* Glow effect behind card */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 rounded-3xl blur-2xl -z-10" />

            <Card className="relative border-cyan-500/30 bg-black/90 backdrop-blur-xl shadow-[0_0_60px_-15px_rgba(6,182,212,0.3)] overflow-hidden">
                {/* Animated border gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-50" />

                <CardHeader className="text-center relative z-10">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        className="mx-auto mb-2 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center"
                    >
                        <Shield className="h-8 w-8 text-cyan-400" />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold text-cyan-50">
                        Вход в Akiora
                    </CardTitle>
                    <CardDescription className="text-cyan-200/60 text-sm">
                        Твой центр экосистемы League of Legends
                    </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 space-y-6">
                    {/* OAuth кнопки */}
                    <div>
                        <p className="text-center text-cyan-200/50 text-sm mb-4">
                            Войти через соцсети
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            <OAuthButton
                                icon={<FcGoogle className="h-5 w-5" />}
                                label="Google"
                                onClick={() => handleOAuth("google")}
                            />
                            <OAuthButton
                                icon={<SiYandexcloud className="h-5 w-5 text-red-500" />}
                                label="Yandex"
                                onClick={() => handleOAuth("yandex")}
                            />
                            <OAuthButton
                                icon={<FaDiscord className="h-5 w-5 text-indigo-500" />}
                                label="Discord"
                                onClick={() => handleOAuth("discord")}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-cyan-500/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-black/90 px-3 text-cyan-200/40 font-medium">
                                Или через email
                            </span>
                        </div>
                    </div>

                    {/* Email + Code форма */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-cyan-200/70 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-cyan-400" />
                                Email
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        type="email"
                                        placeholder="summoner@rift.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value)
                                            setError("")
                                        }}
                                        className="border-cyan-500/30 bg-black/50 text-cyan-50 placeholder:text-cyan-200/30 focus:border-cyan-500/50 focus:ring-cyan-500/20 h-11"
                                        disabled={codeSent || loading}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="default"
                                    onClick={handleSendCode}
                                    disabled={!email || codeSent || loading}
                                    className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 whitespace-nowrap h-11 min-w-[80px]"
                                >
                                    {loading && !codeSent ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : codeSent ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                                    ) : (
                                        "Код"
                                    )}
                                </Button>
                            </div>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-sm text-red-400"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </div>

                        <AnimatePresence>
                            {codeSent && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2"
                                >
                                    <label className="text-sm font-medium text-cyan-200/70 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-cyan-400" />
                                        Код подтверждения
                                    </label>
                                    <Input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        placeholder="• • • • • •"
                                        value={code}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                                            setCode(value)
                                            setError("")
                                        }}
                                        className="border-cyan-500/30 bg-black/50 text-cyan-50 placeholder:text-cyan-200/30 focus:border-cyan-500/50 focus:ring-cyan-500/20 h-11 text-center text-lg tracking-[0.5em] font-mono"
                                        maxLength={6}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Button
                            type="submit"
                            disabled={(!email || (codeSent && !code)) || loading}
                            className="w-full h-12 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-semibold hover:from-cyan-500 hover:to-cyan-400 shadow-[0_0_30px_-8px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_-8px_rgba(6,182,212,0.7)] transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    {codeSent ? "Войти" : "Продолжить"}
                                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    )
}

function OAuthButton({
    icon,
    label,
    onClick
}: {
    icon: React.ReactNode
    label: string
    onClick: () => void
}) {
    return (
        <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-cyan-100 hover:bg-cyan-500/15 hover:border-cyan-500/40 transition-all duration-300 group"
        >
            <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.2 }}
            >
                {icon}
            </motion.div>
            <span className="text-xs font-medium text-cyan-200/70 group-hover:text-cyan-100 transition-colors">
                {label}
            </span>
        </motion.button>
    )
}

export default LoginForm
