'use client';

import { useCartStore } from '@/store/cart.store';
import { useAuthStore } from '@/store/auth.store';
import { ordersApi } from '@/lib/api';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/hooks/useT';

export default function CartPage() {
  const t = useT();
  const { items, updateQty, removeItem, clear, total } = useCartStore();
  const { user } = useAuthStore();
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleOrder = async () => {
    if (!user) { router.push('/auth'); return; }
    if (!address.trim()) { toast.error(t('specifyAddress')); return; }

    setLoading(true);
    try {
      const order: any = await ordersApi.create({
        storeId: 'store-1',
        address,
        items: items.map((i) => ({ productId: i.productId, size: i.size, qty: i.qty })),
      });
      clear();
      toast.success(t('orderPlaced'));
      router.push(`/orders/${order.id}`);
    } catch (e: any) {
      toast.error(e.message || t('orderError'));
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 md:py-24">
        <ShoppingBag size={56} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-gray-700">{t('cartEmpty')}</h2>
        <p className="text-gray-400 mb-6 text-sm">{t('cartEmptyDesc')}</p>
        <Link href="/catalog" className="btn-primary inline-block">{t('gotoCatalog')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
        {t('cartTitle')} <span className="text-gray-400 font-normal text-base">({items.length})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="card p-3 md:p-4 flex gap-3 md:gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">👕</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm leading-tight line-clamp-2">{item.name}</p>
                {item.size && <p className="text-xs text-gray-400 mt-0.5">{t('size')}: {item.size}</p>}
                <p className="font-bold mt-1 text-sm">{(item.price * item.qty).toLocaleString('ru')} ₽</p>
              </div>

              <div className="flex flex-col items-end justify-between flex-shrink-0">
                <button onClick={() => removeItem(item.productId, item.size)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
                <div className="flex items-center gap-1 border rounded-lg overflow-hidden">
                  <button
                    onClick={() => updateQty(item.productId, item.size, item.qty - 1)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.productId, item.size, item.qty + 1)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-4 md:p-6 space-y-4 lg:sticky lg:top-20">
            <h2 className="font-semibold text-base md:text-lg">{t('checkout')}</h2>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('deliveryAddress')}</label>
              <textarea
                className="input resize-none text-sm"
                rows={3}
                placeholder={t('deliveryPlaceholder')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center font-bold text-base md:text-lg border-t pt-3">
              <span>{t('total')}</span>
              <span>{total().toLocaleString('ru')} ₽</span>
            </div>
            <button onClick={handleOrder} disabled={loading} className="btn-primary w-full py-3 text-sm md:text-base">
              {loading ? t('ordering') : t('makeOrder')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
