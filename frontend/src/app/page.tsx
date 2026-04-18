'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Store, Tag, ArrowRight } from 'lucide-react';
import { useT } from '@/hooks/useT';

const BANNER_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80',
    alt: 'Luxury bag',
    position: 'object-center',
  },
  {
    src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80',
    alt: 'Premium sneakers',
    position: 'object-center',
  },
  {
    src: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=900&q=80',
    alt: 'Designer shoes',
    position: 'object-top',
  },
  {
    src: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&q=80',
    alt: 'Luxury handbag',
    position: 'object-center',
  },
];

export default function Home() {
  const t = useT();

  const features = [
    { icon: Tag,      titleKey: 'catalog'   as const, descKey: 'catalogDesc'   as const, href: '/catalog' },
    { icon: Store,    titleKey: 'stores'    as const, descKey: 'storesDesc'    as const, href: '/stores' },
    { icon: Sparkles, titleKey: 'aiStylist' as const, descKey: 'aiStylistDesc' as const, href: '/ai', accent: true },
  ];

  return (
    <div className="space-y-6 md:space-y-10">

      {/* ── Main Banner ── */}
      <section
        className="relative rounded-2xl overflow-hidden"
        style={{ minHeight: 480, border: '1px solid var(--b-sub)' }}
      >
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1600&q=85"
          alt="Luxury collection"
          fill
          className="object-cover object-center"
          priority
        />

        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(105deg, rgba(5,5,5,0.88) 0%, rgba(10,10,10,0.65) 55%, rgba(10,10,10,0.3) 100%)' }}
        />

        {/* Gold top line */}
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, var(--gold), transparent)', opacity: 0.6 }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-14 py-16 md:py-20 max-w-xl">
          <p className="text-xs tracking-[0.3em] uppercase mb-4 font-medium" style={{ color: 'var(--gold)' }}>
            New Collection 2026
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-light leading-tight mb-5" style={{ color: 'var(--tx)' }}>
            {t('heroTitle')}
          </h1>
          <p className="text-sm md:text-base mb-8 leading-relaxed" style={{ color: 'var(--tx-2)' }}>
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="btn-primary flex items-center gap-2 text-sm px-6 py-3 rounded-xl"
            >
              {t('gotoCatalog')} <ArrowRight size={15} />
            </Link>
            <Link
              href="/ai"
              className="flex items-center gap-2 text-sm px-6 py-3 rounded-xl font-medium transition-all"
              style={{ border: '1px solid rgba(196,160,212,0.4)', color: '#c4a0d4', backdropFilter: 'blur(8px)', background: 'rgba(196,160,212,0.06)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,160,212,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(196,160,212,0.06)'; }}
            >
              <Sparkles size={15} /> {t('aiStylist')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Image Grid Banner ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {BANNER_IMAGES.map((img, i) => (
          <Link
            key={i}
            href="/catalog"
            className="group relative rounded-xl overflow-hidden"
            style={{ aspectRatio: '3/4', border: '1px solid var(--b-sub)' }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className={`object-cover ${img.position} transition-transform duration-500 group-hover:scale-105`}
            />
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <span className="text-xs font-medium tracking-wider" style={{ color: 'var(--gold)' }}>
                {['BAGS', 'SNEAKERS', 'HEELS', 'HANDBAGS'][i]}
              </span>
            </div>
          </Link>
        ))}
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
