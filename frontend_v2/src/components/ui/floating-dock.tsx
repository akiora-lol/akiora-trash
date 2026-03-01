'use client';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import {
    AnimatePresence,
    motion,
} from 'motion/react';
import { useState } from 'react';

export const FloatingDock = ({
    items,
    desktopClassName,
    mobileClassName,
    isCollapsed = false,
}: {
    items: { title: string; icon: React.ReactNode; href: string }[];
    desktopClassName?: string;
    mobileClassName?: string;
    isCollapsed?: boolean;
}) => {
    return (
        <>
            <FloatingDockDesktop items={items} className={desktopClassName} isCollapsed={isCollapsed} />
            <FloatingDockMobile items={items} className={mobileClassName} />
        </>
    );
};

const FloatingDockMobile = ({
    items,
    className,
}: Readonly<{
    items: { title: string; icon: React.ReactNode; href: string }[];
    className?: string;
}>) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={cn('fixed bottom-4 right-4 z-50 md:hidden', className)}>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full right-0 mb-3 flex flex-col gap-2 bg-black/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-3 shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)]"
                    >
                        {items.map((item, idx) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    x: -10,
                                    transition: {
                                        delay: idx * 0.03,
                                    },
                                }}
                                transition={{ delay: (items.length - 1 - idx) * 0.03 }}
                            >
                                <Link
                                    to={item.href}
                                    onClick={() => setOpen(false)}
                                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/40 hover:scale-110 transition-all duration-200"
                                >
                                    <div className="h-5 w-5">{item.icon}</div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.button
                type="button"
                onClick={() => setOpen(!open)}
                whileTap={{ scale: 0.9 }}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/90 backdrop-blur-xl border border-cyan-500/30 text-cyan-400 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)] hover:border-cyan-500/50 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.5)] transition-all duration-300"
            >
                <AnimatePresence mode="wait" initial={false}>
                    {open ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <X className="h-5 w-5" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="menu"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <Menu className="h-5 w-5" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    );
};

const FloatingDockDesktop = ({
    items,
    className,
    isCollapsed = false,
}: Readonly<{
    items: { title: string; icon: React.ReactNode; href: string }[];
    className?: string;
    isCollapsed?: boolean;
}>) => {
    return (
        <AnimatePresence>
            {!isCollapsed && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                        'fixed left-6 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 rounded-3xl bg-gradient-to-b from-black/90 via-black/80 to-black/90 backdrop-blur-xl py-4 md:flex border border-cyan-500/30 shadow-[0_0_60px_-20px_rgba(6,182,212,0.4)]',
                        className,
                    )}
                >
                    {/* Animated glow line */}
                    <motion.div
                        className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-b from-cyan-400/50 to-transparent blur-sm" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-t from-cyan-600/50 to-transparent blur-sm" />
                    </motion.div>

                    {/* Corner accents */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-cyan-400/50 rounded-tl-lg" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-cyan-400/50 rounded-tr-lg" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-cyan-400/50 rounded-bl-lg" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-cyan-400/50 rounded-br-lg" />

                    {/* Items */}
                    <div className="relative z-10 flex flex-col items-center gap-3">
                        {items.map((item) => (
                            <IconContainer key={item.title} {...item} />
                        ))}
                    </div>

                    {/* Bottom accent - level indicator style */}
                    <motion.div
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1 h-8 rounded-full bg-gradient-to-b from-cyan-500/0 via-cyan-500/30 to-cyan-400/80"
                        animate={{
                            boxShadow: [
                                '0 0 5px rgba(6, 182, 212, 0.3)',
                                '0 0 15px rgba(6, 182, 212, 0.6)',
                                '0 0 5px rgba(6, 182, 212, 0.3)',
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

function IconContainer({
    title,
    icon,
    href,
}: Readonly<{
    title: string;
    icon: React.ReactNode;
    href: string;
}>) {
    const [hovered, setHovered] = useState(false);
    const [clickRipple, setClickRipple] = useState(false);

    const handleClick = () => {
        setClickRipple(true);
        setTimeout(() => setClickRipple(false), 600);
    };

    return (
        <Link to={href} onClick={handleClick}>
            <motion.div
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/20 hover:via-cyan-500/10 hover:border-cyan-400/60 transition-all duration-200 group"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* Ripple effect on click */}
                <AnimatePresence>
                    {clickRipple && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0.8 }}
                            animate={{ scale: 2.5, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0 rounded-xl bg-cyan-400/30"
                        />
                    )}
                </AnimatePresence>

                {/* Active/hover glow ring */}
                <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-cyan-400/0 group-hover:border-cyan-400/40"
                    animate={{
                        boxShadow: hovered
                            ? '0 0 20px rgba(6, 182, 212, 0.4), inset 0 0 20px rgba(6, 182, 212, 0.1)'
                            : 'none',
                    }}
                    transition={{ duration: 0.2 }}
                />

                <AnimatePresence>
                    {hovered && (
                        <motion.div
                            initial={{ opacity: 0, x: 10, y: '-50%' }}
                            animate={{ opacity: 1, x: 0, y: '-50%' }}
                            exit={{ opacity: 0, x: 2, y: '-50%' }}
                            className="absolute left-full top-1/2 ml-4 w-fit rounded-lg border border-cyan-500/30 bg-black/90 backdrop-blur-xl px-3 py-1.5 text-xs font-medium whitespace-pre text-cyan-100 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]"
                        >
                            {title}
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.div
                    className="relative z-10 flex h-5 w-5 items-center justify-center"
                    animate={{
                        filter: hovered ? 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))' : 'none',
                    }}
                    transition={{ duration: 0.15 }}
                >
                    {icon}
                </motion.div>

                {/* Corner sparkle on hover */}
                <AnimatePresence>
                    {hovered && (
                        <>
                            <motion.div
                                initial={{ scale: 0, rotate: 0 }}
                                animate={{ scale: 1, rotate: 180 }}
                                exit={{ scale: 0, rotate: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute -top-1 -right-1 w-2 h-2"
                            >
                                <div className="w-full h-full bg-cyan-400 rotate-45" />
                            </motion.div>
                            <motion.div
                                initial={{ scale: 0, rotate: 0 }}
                                animate={{ scale: 1, rotate: 180 }}
                                exit={{ scale: 0, rotate: 0 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                                className="absolute -bottom-1 -left-1 w-2 h-2"
                            >
                                <div className="w-full h-full bg-cyan-400 rotate-45" />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </motion.div>
        </Link>
    );
}
