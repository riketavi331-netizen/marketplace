'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Sparkles, Store, Package, LogIn, UserCircle2 } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { useLangStore } from '@/store/lang.store';
import { useT } from '@/hooks/useT';
import { Lang } from '@/lib/i18n';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'ru', flag: '🇷🇺', label: 'RU' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'ka', flag: '🇬🇪', label: 'KA' },
];

export default function Header() {
  const count = useCartStore((s) => s.count());
  const { user, logout } = useAuthStore();
  const { lang, setLang } = useLangStore();
  const t = useT();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const navLinks = [
    { href: '/catalog',  labelKey: 'catalog'  as const, icon: Package },
    { href: '/stores',   labelKey: 'stores'   as const, icon: Store },
    { href: '/ai',       labelKey: 'aiStylist' as const, icon: Sparkles, accent: true },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16 gap-3">

          {/* Logo */}
          <Link href="/" className="text-lg md:text-xl font-bold text-primary-600 shrink-0">
            Marketplace
          </Link>

          {/* Desktop nav — hidden on mobile */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-600 flex-1">
            {navLinks.map(({ href, labelKey, icon: Icon, accent }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-1 hover:text-primary-600 transition-colors',
                  accent && 'text-purple-600 hover:text-purple-700',
                  pathname === href && 'text-primary-600 font-semibold',
                )}
              >
                <Icon size={16} /> {t(labelKey)}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Language switcher — always visible */}
            {mounted && (
              <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                {LANGS.map(({ code, flag, label }) => (
                  <button
                    key={code}
                    onClick={() => setLang(code)}
                    className={clsx(
                      'px-1.5 py-1 text-xs font-medium rounded-md transition-colors leading-none',
                      lang === code ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700',
                    )}
                  >
                    <span className="hidden sm:inline">{flag} </span>{label}
                  </button>
                ))}
              </div>
            )}

            {/* Desktop: cart */}
            <Link href="/cart" className="relative hidden md:flex p-2 hover:bg-gray-100 rounded-lg">
              <ShoppingCart size={20} />
              {mounted && count > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium leading-none">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {/* Auth area */}
            {mounted ? (
              user ? (
                /* ── AUTHORIZED ── */
                <div className="flex items-center gap-1">
                  {/* profile chip */}
                  <Link
                    href="/orders"
                    className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-primary-600 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <UserCircle2 size={18} className="text-primary-600" />
                    <span className="max-w-[120px] truncate">{user.name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="hidden md:block text-xs text-gray-400 hover:text-red-500 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('logout')}
                  </button>
                  {/* mobile profile chip (compact) */}
                  <Link
                    href="/orders"
                    className="md:hidden flex items-center gap-1 text-sm font-medium text-primary-600 px-2 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    <UserCircle2 size={20} />
                  </Link>
                </div>
              ) : (
                /* ── UNAUTHORIZED ── */
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/auth"
                    className="text-sm font-medium text-gray-700 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors hidden sm:block"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/auth?mode=register"
                    className="text-sm font-medium bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1"
                  >
                    <LogIn size={15} />
                    <span className="hidden sm:inline">{t('register')}</span>
                    <span className="sm:hidden">{t('login')}</span>
                  </Link>
                </div>
              )
            ) : (
              /* skeleton to prevent layout shift */
              <div className="w-20 h-8 bg-gray-100 rounded-lg animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
