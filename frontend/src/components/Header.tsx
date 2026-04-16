'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Sparkles, Store, Package, UserCircle2, ChevronDown, Globe } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { useLangStore } from '@/store/lang.store';
import { useT } from '@/hooks/useT';
import { Lang } from '@/lib/i18n';
import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ka', flag: '🇬🇪', label: 'ქართული' },
];

function LangDropdown() {
  const { lang, setLang } = useLangStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGS.find((l) => l.code === lang)!;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <Globe size={15} className="text-gray-400" />
        <span className="hidden sm:inline">{current.flag} {current.label}</span>
        <span className="sm:hidden">{current.flag}</span>
        <ChevronDown size={13} className={clsx('transition-transform text-gray-400', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
          {LANGS.map(({ code, flag, label }) => (
            <button
              key={code}
              onClick={() => { setLang(code); setOpen(false); }}
              className={clsx(
                'w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left',
                code === lang
                  ? 'text-primary-600 bg-primary-50 font-medium'
                  : 'text-gray-700 hover:bg-gray-50',
              )}
            >
              {flag} {label}
              {code === lang && <span className="ml-auto text-primary-600">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const count = useCartStore((s) => s.count());
  const { user, logout } = useAuthStore();
  const t = useT();
  const { lang } = useLangStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const navLinks = [
    { href: '/catalog',  labelKey: 'catalog'   as const, icon: Package },
    { href: '/stores',   labelKey: 'stores'    as const, icon: Store },
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

          {/* Desktop nav */}
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

            {/* Cart — desktop only */}
            <Link href="/cart" className="relative hidden md:flex p-2 hover:bg-gray-100 rounded-lg">
              <ShoppingCart size={20} />
              {mounted && count > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium leading-none">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {/* Auth */}
            {mounted ? (
              user ? (
                /* ── AUTHORIZED ── */
                <div className="flex items-center gap-1">
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
                  {/* Mobile: just icon */}
                  <Link href="/orders" className="md:hidden p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    <UserCircle2 size={22} />
                  </Link>
                </div>
              ) : (
                /* ── UNAUTHORIZED ── two separate buttons */
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth"
                    className="text-sm font-medium border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/auth?mode=register"
                    className="text-sm font-medium bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap"
                  >
                    {t('register')}
                  </Link>
                </div>
              )
            ) : (
              <div className="w-40 h-8 bg-gray-100 rounded-lg animate-pulse" />
            )}

            {/* Lang dropdown — always visible */}
            {mounted && <LangDropdown />}
          </div>
        </div>
      </div>
    </header>
  );
}
