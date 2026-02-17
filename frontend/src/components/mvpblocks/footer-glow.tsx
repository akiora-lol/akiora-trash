'use client';

import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FooterGlow() {
  const { t } = useTranslation();
  return (
    <footer className="relative z-10 mt-8 w-full overflow-hidden pt-16 pb-8">
      <style jsx global>{`
        .glass {
          backdrop-filter: blur(3px) saturate(180%);
          background: radial-gradient(circle, #fff9 0%, #ffdce64d 60%, #f9f2f4 100%);
          border: 1px solid #ff96b41a;
          justify-content: center;
          align-items: center;
          transition: all .3s;
          display: flex;
        }
        .glass:where(.dark, .dark *) {
          display: flex
          backdrop-filter: blur(2px) !important;
          background: radial-gradient(circle, #ffffff1a 0%, #1e00001a 60%, #2a0e0e 100%) !important;
          border: 1px solid #ffffff0d !important;
          border-radius: 16px !important;
          justify-content: center !important;
          align-items: center !important;
        }
      `}</style>
      <div className="pointer-events-none absolute top-0 left-1/2 z-0 h-full w-full -translate-x-1/2 select-none">
        <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-rose-600/20 blur-3xl"></div>
        <div className="absolute right-1/4 -bottom-24 h-80 w-80 rounded-full bg-rose-600/20 blur-3xl"></div>
      </div>
      <div className="glass relative mx-auto flex max-w-6xl flex-col items-center gap-8 rounded-2xl px-6 py-10 md:flex-row md:items-start md:justify-between md:gap-12">
        <div className="flex flex-col items-center md:items-start">
          <Link to="/" className="mb-4 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-700 text-2xl font-extrabold text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="bg-gradient-to-br from-rose-200 to-rose-500 bg-clip-text text-xl font-semibold tracking-tight text-transparent">
              Akiora<span className="text-rose-400">GG</span>
            </span>
          </Link>
          <p className="text-foreground mb-6 max-w-xs text-center text-sm md:text-left">
            {t('footer.description')}
          </p>
          <div className="mt-2 flex gap-3 text-rose-400">
            <a
              href="#"
              aria-label="Discord"
              className="hover:text-rose-300 transition"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
            <a
              href="#"
              aria-label="GitHub"
              className="hover:text-rose-300 transition"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .29a12 12 0 00-3.797 23.401c.6.11.82-.26.82-.577v-2.17c-3.338.726-4.042-1.415-4.042-1.415-.546-1.387-1.332-1.756-1.332-1.756-1.09-.744.084-.729.084-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.835 2.809 1.306 3.495.999.106-.775.418-1.307.76-1.608-2.665-.301-5.466-1.332-5.466-5.933 0-1.31.469-2.381 1.236-3.222-.123-.303-.535-1.523.117-3.176 0 0 1.007-.322 3.301 1.23a11.502 11.502 0 016.002 0c2.292-1.552 3.297-1.23 3.297-1.23.654 1.653.242 2.873.119 3.176.77.841 1.235 1.912 1.235 3.222 0 4.61-2.805 5.629-5.476 5.925.429.369.813 1.096.813 2.211v3.285c0 .32.217.694.825.576A12 12 0 0012 .29"></path>
              </svg>
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="hover:text-rose-300 transition"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.633 7.997c.013.176.013.353.013.53 0 5.387-4.099 11.605-11.604 11.605A11.561 11.561 0 010 18.29c.373.044.734.074 1.12.074a8.189 8.189 0 005.065-1.737 4.102 4.102 0 01-3.834-2.85c.25.04.5.065.765.065.37 0 .734-.049 1.08-.147A4.092 4.092 0 01.8 8.582v-.05a4.119 4.119 0 001.853.522A4.099 4.099 0 01.812 5.847c0-.02 0-.042.002-.062a11.653 11.653 0 008.457 4.287A4.62 4.62 0 0122 5.924a8.215 8.215 0 002.018-.559 4.108 4.108 0 01-1.803 2.268 8.233 8.233 0 002.368-.648 8.897 8.897 0 01-2.062 2.112z" />
              </svg>
            </a>
          </div>
        </div>
        <nav className="flex w-full flex-col gap-9 text-center md:w-auto md:flex-row md:justify-end md:text-left">
          <div>
            <div className="mb-3 text-xs font-semibold tracking-widest text-rose-400 uppercase">
              {t('footer.navigation')}
            </div>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-foreground/70 hover:text-rose-400 transition">
                  {t('common.home')}
                </Link>
              </li>
              <li>
                <Link to="/matches" className="text-foreground/70 hover:text-rose-400 transition">
                  {t('common.matches')}
                </Link>
              </li>
              <li>
                <Link to="/matches/create" className="text-foreground/70 hover:text-rose-400 transition">
                  {t('common.createMatch')}
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-foreground/70 hover:text-rose-400 transition">
                  {t('common.profile')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-xs font-semibold tracking-widest text-rose-400 uppercase">
              {t('footer.about')}
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-foreground/70 hover:text-rose-400 transition">
                  {t('footer.aboutUs')}
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-rose-400 transition">
                  {t('footer.rules')}
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-rose-400 transition">
                  {t('footer.contacts')}
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-rose-400 transition">
                  {t('footer.faq')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-xs font-semibold tracking-widest text-rose-400 uppercase">
              {t('footer.support')}
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-foreground/70 hover:text-rose-400 transition">
                  {t('footer.help')}
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-rose-400 transition">
                  {t('footer.community')}
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-rose-400 transition">
                  {t('footer.reportBug')}
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/70 hover:text-rose-400 transition">
                  {t('footer.privacy')}
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <div className="text-foreground relative z-10 mt-10 text-center text-xs">
        <span>{t('footer.copyright')}</span>
      </div>
    </footer>
  );
}
