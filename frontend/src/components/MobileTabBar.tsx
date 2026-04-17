'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, Heart, Search, ShoppingCart,
  X, Package, Store, Sparkles, ClipboardList, LogOut, UserCircle2, LayoutDashboard,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { useLangStore } from '@/store/lang.store';
import { useT } from '@/hooks/useT';
import { Lang } from '@/lib/i18n';

const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'ru', flag: '🇷🇺', label: 'RU' },
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'ka', flag: '🇬🇪', label: 'KA' },
];

export default function MobileTabBar() {
  const t = useT();
  const pathname = usePathname();
  const count = useCartStore((s) => s.count());
  const { user, logout } = useAuthStore();
  const { lang, setLang } = useLangStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setDrawerOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const navLinks = [
    { href: '/catalog', labelKey: 'catalog'   as const, icon: Package },
    { href: '/stores',  labelKey: 'stores'    as const, icon: Store },
    { href: '/ai',      labelKey: 'aiStylist' as const, icon: Sparkles, accent: true },
  ];

  const tabs = [
    { icon: Menu,         labelKey: 'menu'      as const, action: () => setDrawerOpen(true) },
    { icon: Heart,        labelKey: 'favorites' as const, href: '/favorites' },
    { icon: Search,       labelKey: 'search'    as const, href: '/catalog' },
    { icon: ShoppingCart, labelKey: 'cart'      as const, href: '/cart', badge: mounted && count > 0 ? count : null },
  ];

  return (
    <>
      {/* Bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-bottom"
        style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--b-sub)' }}
      >
        <div className="flex items-stretch h-[60px]">
          {tabs.map(({ icon: Icon, labelKey, href, action, badge }) => {
            const isActive = href ? pathname === href || pathname.startsWith(href + '/') : false;
            const content = (
              <div className="flex flex-col items-center justify-center gap-0.5 relative w-full h-full">
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  {badge && (
                    <span
                      className="absolute -top-1.5 -right-1.5 text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-semibold leading-none"
                      style={{ background: 'var(--gold)', color: '#0a0a0a' }}
                    >
                      {(badge as number) > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium leading-none">{t(labelKey)}</span>
              </div>
            );

            const style = isActive
              ? { color: 'var(--gold)' }
              : { color: 'var(--tx-2)' };

            if (action) {
              return (
                <button key={labelKey} onClick={action} className="flex-1 flex items-center justify-center transition-colors" style={style}>
                  {content}
                </button>
              );
            }
            return (
              <Link key={labelKey} href={href!} className="flex-1 flex items-center justify-center transition-colors" style={style}>
                {content}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />

          {/* Drawer panel */}
          <div
            className="relative w-72 max-w-[85vw] h-full flex flex-col"
            style={{ background: 'var(--surface)', borderRight: '1px solid var(--b-sub)', boxShadow: '8px 0 40px rgba(0,0,0,0.8)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--b-sub)' }}>
              <span
                className="font-display text-xl font-semibold tracking-widest uppercase"
                style={{ color: 'var(--gold)', letterSpacing: '0.15em' }}
              >
                4Hub
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--tx-3)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--tx)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--tx-3)'}
              >
                <X size={20} />
              </button>
            </div>

            {/* User */}
            {mounted && user && (
              <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--b-sub)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--gold-sub)', border: '1px solid var(--gold-sub)' }}
                  >
                    <UserCircle2 size={20} style={{ color: 'var(--gold)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--tx)' }}>{user.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--tx-3)' }}>{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
              {navLinks.map(({ href, labelKey, icon: Icon, accent }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      color: isActive ? 'var(--gold)' : accent ? '#c4a0d4' : 'var(--tx-2)',
                      background: isActive ? 'var(--gold-sub)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--elevated)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Icon size={19} /> {t(labelKey)}
                  </Link>
                );
              })}

              {mounted && user && (
                <>
                  <div className="gold-divider my-3" />
                  {user.role === 'STORE_OWNER' ? (
                    <Link
                      href="/seller/dashboard"
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all"
                      style={{
                        color: pathname.startsWith('/seller') ? 'var(--gold)' : 'var(--tx-2)',
                        background: pathname.startsWith('/seller') ? 'var(--gold-sub)' : 'transparent',
                      }}
                      onMouseEnter={e => { if (!pathname.startsWith('/seller')) e.currentTarget.style.background = 'var(--elevated)'; }}
                      onMouseLeave={e => { if (!pathname.startsWith('/seller')) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <LayoutDashboard size={19} /> {t('sellerDashboard')}
                    </Link>
                  ) : (
                    <Link
                      href="/orders"
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all"
                      style={{
                        color: pathname === '/orders' ? 'var(--gold)' : 'var(--tx-2)',
                        background: pathname === '/orders' ? 'var(--gold-sub)' : 'transparent',
                      }}
                      onMouseEnter={e => { if (pathname !== '/orders') e.currentTarget.style.background = 'var(--elevated)'; }}
                      onMouseLeave={e => { if (pathname !== '/orders') e.currentTarget.style.background = 'transparent'; }}
                    >
                      <ClipboardList size={19} /> {t('orders')}
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setDrawerOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{ color: '#d07878' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,80,80,0.08)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <LogOut size={19} /> {t('logout')}
                  </button>
                </>
              )}
            </div>

            {/* Lang switcher */}
            <div className="px-5 py-4" style={{ borderTop: '1px solid var(--b-sub)' }}>
              <p className="text-xs mb-2 tracking-widest uppercase" style={{ color: 'var(--tx-3)' }}>{t('language')}</p>
              <div className="flex gap-1.5">
                {LANGS.map(({ code, flag, label }) => (
                  <button
                    key={code}
                    onClick={() => setLang(code)}
                    className="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
                    style={{
                      background: lang === code ? 'var(--gold)' : 'var(--elevated)',
                      color: lang === code ? '#0a0a0a' : 'var(--tx-2)',
                      border: `1px solid ${lang === code ? 'var(--gold)' : 'var(--b-def)'}`,
                    }}
                  >
                    {flag} {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
