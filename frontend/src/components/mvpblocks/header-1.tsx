'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationBell from '@/components/mvpblocks/notification-bell';

interface NavItem {
  nameKey: string;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: { name: string; href: string; description?: string }[];
}

export default function Header1() {
  const { t } = useTranslation();
  
  const navItems: NavItem[] = [
    { nameKey: 'header.nav.home', href: '/' },
    { nameKey: 'header.nav.matches', href: '/matches' },
    // { nameKey: 'header.nav.chats', href: '/chats' },
    // { nameKey: 'header.nav.profile', href: '/profile' },
  ];
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
      scrolled: {
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
  };

  const mobileMenuVariants = {
    closed: { opacity: 0, height: 0 },
    open: { opacity: 1, height: 'auto' },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <motion.header
      className="fixed top-0 right-0 left-0 z-50 transition-all duration-300"
      variants={headerVariants}
      initial="initial"
      animate={isScrolled ? 'scrolled' : 'animate'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        backgroundColor: isScrolled ? 'rgba(0, 0, 0, 0.8)' : 'transparent',
        boxShadow: isScrolled ? '0 8px 32px rgba(0, 0, 0, 0.3)' : 'none',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Link
              
              to="/"
              className="flex items-center space-x-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-rose-700">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-rose-500 to-rose-700 bg-clip-text text-xl font-bold text-transparent">
                Akiora<span className="text-rose-400">GG</span>
              </span>
            </Link>
          </motion.div>

          <nav className="hidden items-center space-x-8 lg:flex">
            {navItems.map((item) => (
              <div
                key={item.nameKey}
                className="relative"
                onMouseEnter={() =>
                  item.hasDropdown && setActiveDropdown(item.nameKey)
                }
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={item.href}
                  className="text-foreground flex items-center space-x-1 font-medium transition-colors duration-200 hover:text-rose-500"
                >
                  <span>{t(item.nameKey)}</span>
                  {item.hasDropdown && (
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  )}
                </Link>

                {item.hasDropdown && (
                  <AnimatePresence>
                    {activeDropdown === item.nameKey && (
                      <motion.div
                        className="border-border bg-background/95 absolute top-full left-0 mt-2 w-64 overflow-hidden rounded-xl border shadow-xl backdrop-blur-lg"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.2 }}
                      >
                        {item.dropdownItems?.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.href}
                            className="hover:bg-muted block px-4 py-3 transition-colors duration-200"
                          >
                            <div className="text-foreground font-medium">
                              {dropdownItem.name}
                            </div>
                            {dropdownItem.description && (
                              <div className="text-muted-foreground text-sm">
                                {dropdownItem.description}
                              </div>
                            )}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden items-center space-x-4 lg:flex">
            {/* <NotificationBell /> */}
            {/* <LanguageSwitcher /> */}
            <Link
              to="/profile"
              className="text-foreground font-medium transition-colors duration-200 hover:text-rose-500"
            >
              {t('common.profile')}
            </Link>
          </div>

          <motion.button
            className="hover:bg-muted rounded-lg p-2 transition-colors duration-200 lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="overflow-hidden lg:hidden"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <div className="border-border bg-background/95 mt-4 space-y-2 rounded-xl border py-4 shadow-xl backdrop-blur-lg">
                {navItems.map((item) => (
                  <Link
                    key={item.nameKey}
                    to={item.href}
                    className="text-foreground hover:bg-muted block px-4 py-3 font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t(item.nameKey)}
                  </Link>
                ))}
                <div className="space-y-2 px-4 py-2">
                  <div className="mb-2">
                    <LanguageSwitcher />
                  </div>
                  <Link
                    to="/profile"
                    className="block w-full rounded-lg bg-gradient-to-r from-rose-500 to-rose-700 py-2.5 text-center font-medium text-white transition-all duration-200 hover:shadow-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('common.profile')}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
