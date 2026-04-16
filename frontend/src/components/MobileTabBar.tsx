'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, Heart, Search, ShoppingCart,
  X, Package, Store, Sparkles, ClipboardList, LogOut, UserCircle2, LogIn,
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

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const navLinks = [
    { href: '/catalog', labelKey: 'catalog'  as const, icon: Package },
    { href: '/stores',  labelKey: 'stores'   as const, icon: Store },
    { href: '/ai',      labelKey: 'aiStylist' as const, icon: Sparkles, accent: true },
  ];

  const tabs = [
    {
      icon: Menu,
      labelKey: 'menu' as const,
      action: () => setDrawerOpen(true),
      active: false,
    },
    {
      icon: Heart,
      labelKey: 'favorites' as const,
      href: '/favorites',
    },
    {
      icon: Search,
      labelKey: 'search' as const,
      href: '/catalog',
    },
    {
      icon: ShoppingCart,
      labelKey: 'cart' as const,
      href: '/cart',
      badge: mounted && count > 0 ? count : null,
    },
  ];

  return (
    <>
      {/* Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-stretch h-16">
          {tabs.map(({ icon: Icon, labelKey, href, action, badge, active: forcedActive }) => {
            const isActive = href ? pathname === href || pathname.startsWith(href + '/') : forcedActive;
            const content = (
              <div className="flex flex-col items-center justify-center gap-0.5 relative w-full h-full">
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  {badge && (
                    <span className="absolute -top-1.5 -right-1.5 bg-primary-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium leading-none">
                      {(badge as number) > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span className={clsx('text-[10px] font-medium leading-none', isActive ? 'font-semibold' : '')}>
                  {t(labelKey)}
                </span>
              </div>
            );

            const cls = clsx(
              'flex-1 flex items-center justify-center transition-colors',
              isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600',
            );

            if (action) {
              return (
                <button key={labelKey} onClick={action} className={cls}>
                  {content}
                </button>
              );
            }
            return (
              <Link key={labelKey} href={href!} className={cls}>
                {content}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          onClick={() => setDrawerOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Drawer panel */}
          <div
            className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <span className="font-bold text-lg text-primary-600">Marketplace</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* User section — show name/email only when authorized */}
            {mounted && user && (
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    <UserCircle2 size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {navLinks.map(({ href, labelKey, icon: Icon, accent }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setDrawerOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                    accent ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-700 hover:bg-gray-50',
                    pathname === href && (accent ? 'bg-purple-50' : 'bg-primary-50 text-primary-600'),
                  )}
                >
                  <Icon size={20} /> {t(labelKey)}
                </Link>
              ))}

              {mounted && user && (
                <>
                  <div className="border-t border-gray-100 my-2" />
                  <Link
                    href="/orders"
                    onClick={() => setDrawerOpen(false)}
                    className={clsx(
                      'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors',
                      pathname === '/orders' && 'bg-primary-50 text-primary-600',
                    )}
                  >
                    <ClipboardList size={20} /> {t('orders')}
                  </Link>
                  <button
                    onClick={() => { logout(); setDrawerOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={20} /> {t('logout')}
                  </button>
                </>
              )}
            </div>

            {/* Language switcher at bottom */}
            <div className="px-4 py-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-2">{t('language')}</p>
              <div className="flex gap-1.5">
                {LANGS.map(({ code, flag, label }) => (
                  <button
                    key={code}
                    onClick={() => setLang(code)}
                    className={clsx(
                      'flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
                      lang === code
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                    )}
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
