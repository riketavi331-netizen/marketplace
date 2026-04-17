'use client';

import Link from 'next/link';
import { Sparkles, Store, Tag } from 'lucide-react';
import { useT } from '@/hooks/useT';

export default function Home() {
  const t = useT();

  const features = [
    { icon: Tag,      titleKey: 'catalog'   as const, descKey: 'catalogDesc'   as const, href: '/catalog' },
    { icon: Store,    titleKey: 'stores'    as const, descKey: 'storesDesc'    as const, href: '/stores' },
    { icon: Sparkles, titleKey: 'aiStylist' as const, descKey: 'aiStylistDesc' as const, href: '/ai', accent: true },
  ];

  return (
    <div className="space-y-10 md:space-y-14">

      {/* Hero */}
      <section
        className="relative text-center py-16 md:py-24 rounded-2xl overflow-hidden px-6"
        style={{
          background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1408 50%, #0f0f0f 100%)',
          border: '1px solid var(--b-sub)',
        }}
      >
        {/* Decorative gold lines */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0.5 }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', opacity: 0.5 }}
        />

        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(201,169,110,0.06) 0%, transparent 70%)' }}
        />

        <div className="relative z-10">
          <p
            className="text-xs tracking-widest uppercase mb-4 font-medium"
            style={{ color: 'var(--gold)', letterSpacing: '0.25em' }}
          >
            Premium Collection
          </p>
          <h1
            className="font-display text-4xl md:text-6xl font-light mb-4 leading-tight"
            style={{ color: 'var(--tx)' }}
          >
            {t('heroTitle')}
          </h1>
          <p className="text-base md:text-lg mb-8 max-w-md mx-auto" style={{ color: 'var(--tx-2)' }}>
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/catalog" className="btn-primary text-sm px-8 py-3 rounded-xl">
              {t('gotoCatalog')}
            </Link>
            <Link
              href="/ai"
              className="text-sm px-8 py-3 rounded-xl flex items-center justify-center gap-2 font-medium transition-all"
              style={{ border: '1px solid var(--b-str)', color: '#c4a0d4' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c4a0d4'; e.currentTarget.style.background = 'rgba(196,160,212,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b-str)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Sparkles size={16} /> {t('aiStylist')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
        {features.map(({ icon: Icon, titleKey, descKey, href, accent }) => (
          <Link
            key={titleKey}
            href={href}
            className="group relative card p-6 md:p-7 flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0 overflow-hidden transition-all duration-300"
            onMouseEnter={e => { e.currentTarget.style.borderColor = accent ? 'rgba(196,160,212,0.4)' : 'var(--gold-sub)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b-sub)'; }}
          >
            {/* subtle glow on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"
              style={{ background: accent ? 'radial-gradient(circle at 30% 50%, rgba(196,160,212,0.05) 0%, transparent 70%)' : 'radial-gradient(circle at 30% 50%, rgba(201,169,110,0.05) 0%, transparent 70%)' }}
            />
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 sm:mb-4 transition-all duration-300"
              style={{
                background: accent ? 'rgba(196,160,212,0.1)' : 'var(--gold-sub)',
                border: `1px solid ${accent ? 'rgba(196,160,212,0.2)' : 'rgba(201,169,110,0.2)'}`,
              }}
            >
              <Icon size={20} style={{ color: accent ? '#c4a0d4' : 'var(--gold)' }} />
            </div>
            <div className="relative">
              <h2 className="text-base md:text-lg font-semibold mb-1.5" style={{ color: 'var(--tx)' }}>
                {t(titleKey)}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--tx-2)' }}>
                {t(descKey)}
              </p>
            </div>
          </Link>
        ))}
      </section>

    </div>
  );
}
