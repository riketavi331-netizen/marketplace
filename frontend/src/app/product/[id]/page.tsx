'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cart.store';
import { ShoppingCart, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [imageIdx, setImageIdx] = useState(0);
  const addItem = useCartStore((s) => s.addItem);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', params.id],
    queryFn: () => productsApi.getOne(params.id) as any,
  });

  const handleAdd = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Выберите размер');
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: product.images[0],
      size: selectedSize,
      qty: 1,
    });
    toast.success('Добавлено в корзину');
  };

  if (isLoading) return <div className="animate-pulse space-y-4"><div className="h-96 bg-gray-100 rounded-2xl" /></div>;
  if (!product) return <div>Товар не найден</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {/* Images */}
      <div className="space-y-3">
        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative">
          {product.images[imageIdx] ? (
            <Image src={product.images[imageIdx]} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">👕</div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-2">
            {product.images.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => setImageIdx(i)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${i === imageIdx ? 'border-primary-600' : 'border-transparent'}`}
              >
                <Image src={img} alt="" width={64} height={64} className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-400">{product.category?.name} · {product.brand}</p>
          <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
          <div className="flex items-baseline gap-3 mt-2">
            <span className="text-3xl font-bold">{Number(product.price).toLocaleString('ru')} ₽</span>
            {product.oldPrice && (
              <span className="text-lg text-gray-400 line-through">{Number(product.oldPrice).toLocaleString('ru')} ₽</span>
            )}
          </div>
        </div>

        {product.description && <p className="text-gray-600">{product.description}</p>}

        {product.sizes?.length > 0 && (
          <div>
            <p className="font-medium mb-2">Размер</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-300 hover:border-primary-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={!product.inStock}
          className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
        >
          <ShoppingCart size={20} />
          {product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}
        </button>

        {product.store && (
          <div className="card p-4 space-y-2">
            <p className="font-medium">{product.store.name}</p>
            {product.store.address && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <MapPin size={14} /> {product.store.address}
              </p>
            )}
            {product.store.phone && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Phone size={14} /> {product.store.phone}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
