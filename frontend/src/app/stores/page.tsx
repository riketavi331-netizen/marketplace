'use client';

import { useQuery } from '@tanstack/react-query';
import { storesApi } from '@/lib/api';
import Link from 'next/link';
import { MapPin, Phone, Package } from 'lucide-react';
import { useT } from '@/hooks/useT';

export default function StoresPage() {
  const t = useT();
  const { data: stores, isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: () => storesApi.getAll() as any,
  });

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({length:6}).map((_,i)=><div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"/>)}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('stores')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(stores as any)?.map((store: any) => (
          <Link key={store.id} href={`/stores/${store.id}`}>
            <div className="card p-5 hover:shadow-md transition-shadow h-full">
              <h2 className="font-semibold text-lg mb-3">{store.name}</h2>
              <div className="space-y-2 text-sm text-gray-500">
                {store.address && (
                  <p className="flex items-center gap-2"><MapPin size={14} /> {store.address}</p>
                )}
                {store.phone && (
                  <p className="flex items-center gap-2"><Phone size={14} /> {store.phone}</p>
                )}
                {store._count && (
                  <p className="flex items-center gap-2"><Package size={14} /> {store._count.products} {t('productsCount')}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
