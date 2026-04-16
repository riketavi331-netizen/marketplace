'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCartStore } from '@/store/cart.store';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: Product }) {
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
    toast.success(`${product.name} добавлен в корзину`);
  };

  return (
    <Link href={`/product/${product.id}`}>
      <div className="card hover:shadow-md transition-shadow overflow-hidden group">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
              👕
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-medium">Нет в наличии</span>
            </div>
          )}
        </div>

        <div className="p-3">
          <p className="text-xs text-gray-400 mb-1">{product.category.name} · {product.brand}</p>
          <h3 className="font-medium text-sm line-clamp-2 mb-2">{product.name}</h3>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-900">{Number(product.price).toLocaleString('ru')} ₽</span>
              {product.oldPrice && (
                <span className="text-xs text-gray-400 line-through ml-2">
                  {Number(product.oldPrice).toLocaleString('ru')} ₽
                </span>
              )}
            </div>
            {product.inStock && (
              <button
                onClick={handleAddToCart}
                className="p-2 bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white rounded-lg transition-colors"
              >
                <ShoppingCart size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
