'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { CheckCircle, Clock, Truck, Package, XCircle, MapPin } from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  PENDING:   { label: 'Ожидает подтверждения', icon: Clock,        color: 'text-yellow-500' },
  CONFIRMED: { label: 'Подтверждён',           icon: CheckCircle,  color: 'text-blue-500' },
  SHIPPED:   { label: 'В пути',                icon: Truck,        color: 'text-purple-500' },
  DELIVERED: { label: 'Доставлен',             icon: Package,      color: 'text-green-500' },
  CANCELLED: { label: 'Отменён',               icon: XCircle,      color: 'text-red-500' },
};

export default function OrderPage({ params }: { params: { id: string } }) {
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', params.id],
    queryFn: () => ordersApi.getOne(params.id) as any,
  });

  if (isLoading) return <div className="animate-pulse space-y-4"><div className="h-48 bg-gray-100 rounded-xl" /></div>;
  if (!order) return <div>Заказ не найден</div>;

  const status = STATUS_CONFIG[order.status] || { label: order.status, icon: Package, color: 'text-gray-500' };
  const StatusIcon = status.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Заказ #{order.id.slice(-8).toUpperCase()}
        </h1>
        <Link href="/orders" className="text-sm text-gray-400 hover:text-primary-600">
          ← Все заказы
        </Link>
      </div>

      {/* Status */}
      <div className="card p-5 flex items-center gap-4">
        <StatusIcon size={32} className={status.color} />
        <div>
          <p className="font-semibold">{status.label}</p>
          <p className="text-sm text-gray-400">
            {new Date(order.createdAt).toLocaleDateString('ru', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="card divide-y">
        {order.items?.map((item: any) => (
          <div key={item.id} className="flex items-center gap-4 p-4">
            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
              {item.product?.images?.[0] ? (
                <img src={item.product.images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
              ) : '👕'}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{item.product?.name}</p>
              {item.size && <p className="text-xs text-gray-400">Размер: {item.size}</p>}
              <p className="text-xs text-gray-400">× {item.qty}</p>
            </div>
            <p className="font-semibold">{(Number(item.price) * item.qty).toLocaleString('ru')} ₽</p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="card p-5 space-y-3">
        {order.address && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin size={16} className="flex-shrink-0 mt-0.5" />
            <span>{order.address}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t pt-3">
          <span>Итого</span>
          <span>{Number(order.total).toLocaleString('ru')} ₽</span>
        </div>
      </div>
    </div>
  );
}
