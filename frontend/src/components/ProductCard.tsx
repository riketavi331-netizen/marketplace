'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCartStore } from '@/store/cart.store';
import toast from 'react-hot-toast';
import { useT } from '@/hooks/useT';

export default function ProductCard({ product }: { product: Product }) {
  const t = useT();
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images[0],
      qty: 1,
    });
    toast.success(`${product.name} ${t('addedToCart')}`);
  };

  const hasDiscount = product.oldPrice && Number(product.oldPrice) > Number(product.price);
  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.oldPrice!)) * 100)
    : 0;

  return (
    <Link href={`/product/${product.id}`}>
      <div
        className="group overflow-hidden rounded-xl transition-all duration-300"
        style={{ background: 'var(--surface)', border: '1px solid var(--b-sub)' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--b-def)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b-sub)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
      >
        {/* Image */}
        <div className="aspect-square relative overflow-hidden" style={{ background: 'var(--elevated)' }}>
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl opacity-20">
              👕
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {hasDiscount && (
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                style={{ background: 'var(--gold)', color: '#0a0a0a' }}
              >
                −{discountPct}%
              </span>
            )}
          </div>

          {!product.inStock && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(10,10,10,0.7)', backdropFilter: 'blur(2px)' }}
            >
              <span className="text-sm font-medium tracking-wider uppercase" style={{ color: 'var(--tx-2)', letterSpacing: '0.1em' }}>
                {t('outOfStock')}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5">
          <p className="text-[11px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--tx-3)', letterSpacing: '0.12em' }}>
            {product.category.name}{product.brand ? ` · ${product.brand}` : ''}
          </p>
          <h3 className="font-medium text-sm line-clamp-2 mb-2.5 leading-snug" style={{ color: 'var(--tx)' }}>
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-sm" style={{ color: 'var(--tx)' }}>
                {Number(product.price).toLocaleString('ru')} ₽
              </span>
              {hasDiscount && (
                <span className="text-xs line-through ml-2" style={{ color: 'var(--tx-3)' }}>
                  {Number(product.oldPrice).toLocaleString('ru')} ₽
                </span>
              )}
            </div>
            {product.inStock && (
              <button
                onClick={handleAddToCart}
                className="p-2 rounded-lg transition-all duration-200"
                style={{ background: 'var(--gold-sub)', color: 'var(--gold)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = '#0a0a0a'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--gold-sub)'; e.currentTarget.style.color = 'var(--gold)'; }}
              >
                <ShoppingCart size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
