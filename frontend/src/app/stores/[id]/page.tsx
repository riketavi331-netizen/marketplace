'use client';

import { useQuery } from '@tanstack/react-query';
import { storesApi } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function StorePage({ params }: { params: { id: string } }) {
  const { data: store, isLoading } = useQuery({
    queryKey: ['store', params.id],
    queryFn: () => storesApi.getOne(params.id) as any,
  });

  if (isLoading) return <div className="animate-pulse space-y-4"><div className="h-32 bg-gray-100 rounded-xl" /></div>;
  if (!store) return <div>Магазин не найден</div>;

  return (
    <div className="space-y-8">
      {/* Store info */}
      <div className="card p-6">
        <h1 className="text-2xl font-bold mb-4">{store.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          {store.address && (
            <span className="flex items-center gap-1"><MapPin size={14} /> {store.address}</span>
          )}
          {store.phone && (
            <span className="flex items-center gap-1"><Phone size={14} /> {store.phone}</span>
          )}
          {store.email && (
            <span className="flex items-center gap-1"><Mail size={14} /> {store.email}</span>
          )}
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Товары{store.products?.length ? ` (${store.products.length})` : ''}
        </h2>
        {store.products?.length === 0 ? (
          <p className="text-gray-400">В этом магазине пока нет товаров</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {store.products?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
