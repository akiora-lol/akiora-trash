import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
    Users, 
    Trophy, 
    Gamepad2, 
    Sparkles, 
    Swords, 
    Target,
    ChevronRight,
    Zap
} from "lucide-react"
import { Link } from '@tanstack/react-router'

interface LandingProps {
    className?: string
}

const features = [
    {
        icon: <Users className="h-6 w-6" />,
        title: "Клубные ивенты",
        description: "Участвуй в регулярных мероприятиях от сообщества, участвуй в скриммах и выигрывай призы"
    },
    {
        icon: <Swords className="h-6 w-6" />,
        title: "Поиск напарников",
        description: "Находи тиммейтов под твой ранг, роль и расписание для комфортной игры"
    },
    {
        icon: <Trophy className="h-6 w-6" />,
        title: "Турниры",
        description: "Создавай и участвуй в турнирах любого масштаба — от локальных скримшей до чемпионатов"
    },
    {
        icon: <Gamepad2 className="h-6 w-6" />,
        title: "Статистика и аналитика",
        description: "Отслеживай свой прогресс, анализируй матчи и улучшай скилл с детальными метриками"
    },
    {
        icon: <Sparkles className="h-6 w-6" />,
        title: "Кастомные игры",
        description: "Организовывай свои режимы игр, ARAM-вечеринки и развлекательные форматы"
    },
    {
        icon: <Target className="h-6 w-6" />,
        title: "Коучинг",
        description: "Находи тренеров и менторов для улучшения механики и макро-понимания игры"
    }
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.5 }
    }
}

export function Landing({ className }: LandingProps) {
    return (
        <div className={cn("min-h-screen bg-[#030303] text-white", className)}>
            {/* Hero секция */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Фоновые эффекты */}
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />
                
                <div className="relative z-10 container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm mb-6">
                            <Zap className="h-4 w-4" />
                            Экосистема для League of Legends
                        </div>
                        
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-100 to-cyan-200 bg-clip-text text-transparent">
                            Твой новый уровень<br />
                            <span className="text-cyan-400">в Summoner's Rift</span>
                        </h1>
                        
                        <p className="text-xl text-cyan-100/60 max-w-2xl mx-auto mb-10">
                            Платформа для игроков, где ты найдёшь напарников, 
                            будешь участвовать в турнирах и станешь частью комьюнити
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-12 px-8 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:from-cyan-500 hover:to-cyan-400 shadow-[0_0_30px_-10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.7)] transition-all duration-300"
                            >
                                Начать играть
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Link>
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-12 px-8 border-cyan-500/30 bg-transparent text-cyan-50 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all duration-300"
                            >
                                Узнать больше
                            </Button>
                        </div>
                    </motion.div>
                    
                    {/* Статистика */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
                    >
                        {[
                            { value: "10K+", label: "Игроков" },
                            { value: "500+", label: "Турниров" },
                            { value: "50+", label: "Клубов" },
                            { value: "24/7", label: "Активность" }
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-cyan-100/50 text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features секция */}
            <section className="py-24 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
                
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            <span className="text-cyan-400">Возможности</span> платформы
                        </h2>
                        <p className="text-xl text-cyan-100/60 max-w-2xl mx-auto">
                            Всё необходимое для комфортной игры и развития в одном месте
                        </p>
                    </motion.div>
                    
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {features.map((feature, index) => (
                            <motion.div key={index} variants={itemVariants}>
                                <Card className="h-full border-cyan-500/20 bg-black/40 backdrop-blur-sm hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all duration-300 group">
                                    <CardHeader>
                                        <div className="h-12 w-12 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all duration-300 mb-2">
                                            {feature.icon}
                                        </div>
                                        <CardTitle className="text-xl text-cyan-50">
                                            {feature.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-cyan-100/60 text-base">
                                            {feature.description}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA секция */}
            <section className="py-24 relative">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-cyan-500/20 rounded-3xl blur-xl" />
                        <Card className="relative border-cyan-500/30 bg-gradient-to-r from-black/80 to-cyan-950/30 backdrop-blur-xl overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]" />
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px]" />
                            
                            <CardContent className="py-16 px-8 text-center relative z-10">
                                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-cyan-50">
                                    Готов покорить<br />
                                    <span className="text-cyan-400">Ущелье Призывателей?</span>
                                </h2>
                                <p className="text-xl text-cyan-100/60 max-w-2xl mx-auto mb-8">
                                    Присоединяйся к тысячам игроков уже сегодня и открой для себя 
                                    новые возможности для игры и общения
                                </p>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-14 px-10 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-semibold text-lg hover:from-cyan-500 hover:to-cyan-400 shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)] hover:shadow-[0_0_60px_-10px_rgba(6,182,212,0.7)] transition-all duration-300"
                                >
                                    Присоединиться бесплатно
                                </Link>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-cyan-500/10">
                <div className="container mx-auto px-4 text-center text-cyan-100/40 text-sm">
                    <p>© 2026 Akiora. Все права защищены.</p>
                    <p className="mt-2">
                        League of Legends является товарным знаком Riot Games, Inc.
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default Landing
