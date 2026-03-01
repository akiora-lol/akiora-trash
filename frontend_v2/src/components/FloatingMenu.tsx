import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link, useLocation } from '@tanstack/react-router'
import { cn } from "@/lib/utils"
import {
    Home,
    User,
    HeartPulse,
    MessageCircle,
    Bell,
    Settings,
    LogIn,
    Users,
    Trophy,
    ChevronRight
} from "lucide-react"
import Logo from '@/components/Logo'

const menuItems = [
    { icon: Home, label: "Главная", href: "/" },
    { icon: User, label: "Профиль", href: "/profile/me" },
    { icon: HeartPulse, label: "Формы", href: "/forms" },
    { icon: MessageCircle, label: "Мессенджер", href: "/messenger" },
    { icon: Bell, label: "Уведомления", href: "/notifications" },
    { icon: Users, label: "Клубы", href: "/clubs" },
    { icon: Trophy, label: "Турниры", href: "/tournaments" },
    { icon: Settings, label: "Настройки", href: "/settings" },
]

export function FloatingMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const location = useLocation()

    return (
        <motion.div
            className="fixed left-5 bg-transparent top-5 z-50"
            initial={false}
        >
            {/* Logo Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-transparent relative h-14 w-14 backdrop-blur-xl flex items-center justify-center group overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                {/* Glow effect on hover */}
                <motion.div
                    className="absolute inset-0 transition-all duration-300"
                    initial={false}
                />

                {/* Logo with rotation */}
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    <Logo rotationSpeed={0} size="36" />
                </motion.div>

                {/* Active indicator */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-400"
                    animate={{ scaleX: isOpen ? 1 : 0.3 }}
                    transition={{ duration: 0.2 }}
                />
            </motion.button>

            {/* Expanded Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[-1]"
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="absolute top-14 left-0 w-64 bg-gradient-to-b from-black/98 via-black/95 to-black/98 backdrop-blur-2xl border-r border-b border-cyan-500/30 overflow-hidden shadow-[0_0_60px_-20px_rgba(6,182,212,0.4)]"
                        >
                            {/* Decorative top line */}
                            <div className="h-px bg-gradient-to-r from-cyan-500/50 via-cyan-400/30 to-transparent" />

                            <nav className="py-3">
                                {menuItems.map((item, index) => {
                                    const isActive = location.pathname === item.href
                                    return (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, x: -15 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.04 }}
                                        >
                                            <Link
                                                to={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className="relative group"
                                            >
                                                <div className={cn(
                                                    "flex items-center gap-3 px-5 py-3.5 text-sm transition-all duration-200",
                                                    "hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-transparent",
                                                    isActive && "bg-gradient-to-r from-cyan-500/15 to-transparent"
                                                )}>
                                                    {/* Active/Hover indicator line */}
                                                    <motion.div
                                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-r from-cyan-400 to-cyan-500"
                                                        initial={{ opacity: 0, scaleX: 0 }}
                                                        animate={{
                                                            opacity: isActive ? 1 : 0,
                                                            scaleX: isActive ? 1 : 0
                                                        }}
                                                        transition={{ duration: 0.2 }}
                                                    />

                                                    <div className={cn(
                                                        "relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-300",
                                                        isActive
                                                            ? "bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/40"
                                                            : "bg-cyan-500/5 border border-cyan-500/20 group-hover:border-cyan-500/30"
                                                    )}>
                                                        <item.icon className={cn(
                                                            "h-4 w-4 transition-all duration-300",
                                                            isActive
                                                                ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                                                                : "text-cyan-100/60 group-hover:text-cyan-100/80"
                                                        )} />

                                                        {/* Glow effect for active */}
                                                        {isActive && (
                                                            <motion.div
                                                                initial={{ scale: 0.8, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl blur-md -z-10"
                                                            />
                                                        )}
                                                    </div>

                                                    <span className={cn(
                                                        "font-medium transition-colors duration-200",
                                                        isActive
                                                            ? "text-cyan-50"
                                                            : "text-cyan-100/70 group-hover:text-cyan-100"
                                                    )}>
                                                        {item.label}
                                                    </span>

                                                    <ChevronRight className={cn(
                                                        "ml-auto h-4 w-4 transition-all duration-200",
                                                        isActive
                                                            ? "text-cyan-400 translate-x-0 opacity-100"
                                                            : "text-cyan-100/30 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-50"
                                                    )} />
                                                </div>

                                                {/* Subtle hover glow */}
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                />
                                            </Link>
                                        </motion.div>
                                    )
                                })}

                                {/* Divider */}
                                <div className="my-2 mx-5 h-px bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent" />

                                {/* Login Button */}
                                <motion.div
                                    initial={{ opacity: 0, x: -15 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: menuItems.length * 0.04 + 0.1 }}
                                >
                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="group block"
                                    >
                                        <div className="flex items-center gap-3 px-5 py-3.5 text-sm">
                                            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/30 group-hover:border-cyan-500/50 transition-all duration-300">
                                                <LogIn className="h-4 w-4 text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] transition-all duration-300" />
                                            </div>
                                            <span className="font-medium text-cyan-400 group-hover:text-cyan-300 transition-colors duration-200">
                                                Войти
                                            </span>
                                        </div>
                                    </Link>
                                </motion.div>
                            </nav>

                            {/* Decorative bottom gradient */}
                            <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-cyan-500/50" />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
