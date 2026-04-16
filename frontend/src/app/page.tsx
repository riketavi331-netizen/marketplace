import Link from 'next/link';
import { Sparkles, Store, Tag } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-8 md:space-y-12">
      {/* Hero */}
      <section className="text-center py-12 md:py-16 bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
          Одежда и обувь<br className="md:hidden" /> в одном месте
        </h1>
        <p className="text-base md:text-lg text-gray-500 mb-6 md:mb-8">
          Локальный маркетплейс с AI-стилистом
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/catalog" className="btn-primary text-base px-6 py-3">
            Перейти в каталог
          </Link>
          <Link href="/ai" className="btn-secondary text-base px-6 py-3 flex items-center justify-center gap-2">
            <Sparkles size={18} /> AI-стилист
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {[
          { icon: Tag, title: 'Каталог', desc: 'Одежда, обувь и аксессуары от локальных магазинов', href: '/catalog' },
          { icon: Store, title: 'Магазины', desc: 'Найди ближайший магазин и посмотри их ассортимент', href: '/stores' },
          { icon: Sparkles, title: 'AI-стилист', desc: 'Подбор образов с помощью искусственного интеллекта', href: '/ai' },
        ].map(({ icon: Icon, title, desc, href }) => (
          <Link key={title} href={href} className="card p-5 md:p-6 hover:shadow-md transition-shadow flex sm:flex-col items-center sm:items-start gap-4 sm:gap-0">
            <Icon size={28} className="text-primary-600 sm:mb-3 flex-shrink-0" />
            <div>
              <h2 className="text-base md:text-lg font-semibold mb-1">{title}</h2>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
