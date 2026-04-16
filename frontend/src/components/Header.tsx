'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, Sparkles, Store, Package, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { useState } from 'react';
import clsx from 'clsx';

const navLinks = [
  { href: '/catalog', label: 'Каталог', icon: Package },
  { href: '/stores', label: 'Магазины', icon: Store },
  { href: '/ai', label: 'AI-стилист', icon: Sparkles, accent: true },
];

export default function Header() {
  const count = useCartStore((s) => s.count());
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">

          {/* Logo */}
          <Link href="/" className="text-lg md:text-xl font-bold text-primary-600" onClick={() => setOpen(false)}>
            Marketplace
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            {navLinks.map(({ href, label, icon: Icon, accent }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-1 hover:text-primary-600 transition-colors',
                  accent && 'text-purple-600 hover:text-purple-700',
                  pathname === href && 'text-primary-600 font-semibold',
                )}
              >
                <Icon size={16} /> {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1 md:gap-3">
            <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg">
              <ShoppingCart size={22} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link href="/orders" className="text-sm text-gray-600 hover:text-primary-600">Заказы</Link>
                  <button onClick={logout} className="text-sm text-gray-400 hover:text-red-500">Выйти</button>
                </>
              ) : (
                <Link href="/auth" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary-600">
                  <User size={18} /> Войти
                </Link>
              )}
            </div>

            {/* Burger */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
          {navLinks.map(({ href, label, icon: Icon, accent }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                accent ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-700 hover:bg-gray-50',
                pathname === href && 'bg-primary-50 text-primary-600',
              )}
            >
              <Icon size={20} /> {label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-3 mt-2">
            {user ? (
              <div className="flex items-center justify-between px-3">
                <span className="text-sm text-gray-600">{user.name}</span>
                <div className="flex gap-3">
                  <Link href="/orders" onClick={() => setOpen(false)} className="text-sm text-primary-600 font-medium">Заказы</Link>
                  <button onClick={() => { logout(); setOpen(false); }} className="text-sm text-red-400">Выйти</button>
                </div>
              </div>
            ) : (
              <Link
                href="/auth"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <User size={20} /> Войти / Зарегистрироваться
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
