'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useT } from '@/hooks/useT';

export default function OrdersPage() {
  const t = useT();
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => { if (!user) router.push('/auth'); }, [user]);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.getMine() as any,
    enabled: !!user,
  });

  const statusMap = () => ({
    PENDING:   { label: t('statusPending'),   color: 'bg-yellow-100 text-yellow-700' },
    CONFIRMED: { label: t('statusConfirmed'), color: 'bg-blue-100 text-blue-700' },
    SHIPPED:   { label: t('statusShipped'),   color: 'bg-purple-100 text-purple-700' },
    DELIVERED: { label: t('statusDelivered'), color: 'bg-green-100 text-green-700' },
    CANCELLED: { label: t('statusCancelled'), color: 'bg-red-100 text-red-700' },
  } as Record<string, { label: string; color: string }>);

  if (isLoading) return <div className="animate-pulse space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="h-24 bg-gray-100 rounded-xl"/>)}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('myOrders')}</h1>

      {!(orders as any)?.length ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">📦</p>
          <p className="text-gray-500 mb-4">{t('noOrders')}</p>
          <Link href="/catalog" className="btn-primary">{t('toCatalog')}</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(orders as any).map((order: any) => {
            const s = statusMap()[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600' };
            return (
              <div key={order.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium">{t('orderLabel')} #{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleDateString('ru')}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  {order.items?.slice(0, 2).map((item: any) => (
                    <p key={item.id}>{item.product?.name} × {item.qty}</p>
                  ))}
                  {order.items?.length > 2 && <p className="text-gray-400">+{order.items.length - 2} {t('more')}</p>}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <span className="font-bold">{Number(order.total).toLocaleString('ru')} ₽</span>
                  <span className="text-sm text-gray-400">{order.store?.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
