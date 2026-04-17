'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Sparkles, Store, Package, UserCircle2, ChevronDown, Globe, LayoutDashboard } from 'lucide-react';
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
        className="flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg transition-all"
        style={{ color: 'var(--tx-2)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--tx-2)')}
      >
        <Globe size={14} style={{ color: 'var(--tx-3)' }} />
        <span className="hidden sm:inline">{current.flag} {current.label}</span>
        <span className="sm:hidden">{current.flag}</span>
        <ChevronDown size={12} className={clsx('transition-transform', open && 'rotate-180')} style={{ color: 'var(--tx-3)' }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-40 rounded-xl py-1 z-50"
          style={{ background: 'var(--elevated)', border: '1px solid var(--b-def)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
        >
          {LANGS.map(({ code, flag, label }) => (
            <button
              key={code}
              onClick={() => { setLang(code); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left"
              style={{
                color: code === lang ? 'var(--gold)' : 'var(--tx-2)',
                background: code === lang ? 'var(--gold-sub)' : 'transparent',
              }}
              onMouseEnter={e => { if (code !== lang) e.currentTarget.style.background = 'var(--raised)'; }}
              onMouseLeave={e => { if (code !== lang) e.currentTarget.style.background = 'transparent'; }}
            >
              {flag} {label}
              {code === lang && <span className="ml-auto" style={{ color: 'var(--gold)' }}>✓</span>}
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
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'rgba(10,10,10,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--b-sub)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16 gap-3">

          {/* Logo */}
          <Link
            href="/"
            className="font-display text-xl md:text-2xl font-semibold shrink-0 tracking-widest uppercase"
            style={{ color: 'var(--gold)', letterSpacing: '0.15em' }}
          >
            LUXE
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium flex-1">
            {navLinks.map(({ href, labelKey, icon: Icon, accent }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 transition-all tracking-wide"
                  style={{
                    color: isActive ? 'var(--gold)' : accent ? '#c4a0d4' : 'var(--tx-2)',
                    letterSpacing: '0.05em',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = accent ? '#d4b0e4' : 'var(--tx)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = isActive ? 'var(--gold)' : accent ? '#c4a0d4' : 'var(--tx-2)'; }}
                >
                  <Icon size={15} />
                  {t(labelKey)}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1">

            {/* Cart — desktop */}
            <Link
              href="/cart"
              className="relative hidden md:flex p-2 rounded-lg transition-all"
              style={{ color: 'var(--tx-2)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.background = 'var(--gold-sub)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--tx-2)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <ShoppingCart size={19} />
              {mounted && count > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold leading-none"
                  style={{ background: 'var(--gold)', color: '#0a0a0a', fontSize: '10px' }}
                >
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {/* Auth */}
            {mounted ? (
              user ? (
                <div className="flex items-center gap-0.5">
                  {user.role === 'STORE_OWNER' && (
                    <Link
                      href="/seller/dashboard"
                      className="hidden md:flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        color: pathname.startsWith('/seller') ? 'var(--gold)' : 'var(--tx-2)',
                        background: pathname.startsWith('/seller') ? 'var(--gold-sub)' : 'transparent',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.background = 'var(--gold-sub)'; }}
                      onMouseLeave={e => {
                        e.currentTarget.style.color = pathname.startsWith('/seller') ? 'var(--gold)' : 'var(--tx-2)';
                        e.currentTarget.style.background = pathname.startsWith('/seller') ? 'var(--gold-sub)' : 'transparent';
                      }}
                    >
                      <LayoutDashboard size={15} style={{ color: 'var(--gold)' }} />
                      {t('sellerDashboard')}
                    </Link>
                  )}
                  <Link
                    href={user.role === 'STORE_OWNER' ? '/seller/dashboard' : '/orders'}
                    className="hidden md:flex items-center gap-1.5 text-sm font-medium px-2.5 py-1.5 rounded-lg transition-all"
                    style={{ color: 'var(--tx-2)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--tx)'; e.currentTarget.style.background = 'var(--elevated)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--tx-2)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <UserCircle2 size={17} style={{ color: 'var(--gold)' }} />
                    <span className="max-w-[120px] truncate">{user.name}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="hidden md:block text-xs px-2.5 py-1.5 rounded-lg transition-all"
                    style={{ color: 'var(--tx-3)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#c86868'; e.currentTarget.style.background = 'rgba(220,80,80,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--tx-3)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    {t('logout')}
                  </button>
                  <Link
                    href={user.role === 'STORE_OWNER' ? '/seller/dashboard' : '/orders'}
                    className="md:hidden p-2 rounded-lg transition-all"
                    style={{ color: 'var(--gold)' }}
                  >
                    <UserCircle2 size={22} />
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth"
                    className="text-sm font-medium px-3 py-1.5 rounded-lg transition-all tracking-wide"
                    style={{ border: '1px solid var(--b-str)', color: 'var(--tx-2)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b-str)'; e.currentTarget.style.color = 'var(--tx-2)'; }}
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/auth?mode=register"
                    className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-all tracking-wide"
                    style={{ background: 'var(--gold)', color: '#0a0a0a' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold-lt)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(201,169,110,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {t('register')}
                  </Link>
                </div>
              )
            ) : (
              <div className="w-40 h-8 rounded-lg animate-pulse" style={{ background: 'var(--elevated)' }} />
            )}

            {mounted && <LangDropdown />}
          </div>
        </div>
      </div>
    </header>
  );
}
