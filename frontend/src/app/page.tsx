'use client';

import Link from 'next/link';
import { Sparkles, Store, Tag } from 'lucide-react';
import { useT } from '@/hooks/useT';

export default function Home() {
  const t = useT();

  const features = [
    { icon: Tag, titleKey: 'catalog' as const, descKey: 'catalogDesc' as const, href: '/catalog' },
    { icon: Store, titleKey: 'stores' as const, descKey: 'storesDesc' as const, href: '/stores' },
    { icon: Sparkles, titleKey: 'aiStylist' as const, descKey: 'aiStylistDesc' as const, href: '/ai' },
  ];

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero */}
      <section className="text-center py-12 md:py-16 bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
          {t('heroTitle')}
        </h1>
        <p className="text-base md:text-lg text-gray-500 mb-6 md:mb-8">
          {t('heroSubtitle')}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/catalog" className="btn-primary text-base px-6 py-3">
            {t('gotoCatalog')}
          </Link>
          <Link href="/ai" className="btn-secondary text-base px-6 py-3 flex items-center justify-center gap-2">
            <Sparkles size={18} /> {t('aiStylist')}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {features.map(({ icon: Icon, titleKey, descKey, href }) => (
          <Link key={titleKey} href={href} className="card p-5 md:p-6 hover:shadow-md transition-shadow flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
            <Icon size={28} className="text-primary-600 sm:mb-3 flex-shrink-0" />
            <div>
              <h2 className="text-base md:text-lg font-semibold mb-1">{t(titleKey)}</h2>
              <p className="text-gray-500 text-sm">{t(descKey)}</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
