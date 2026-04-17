'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { Package, ClipboardList, Plus, Pencil, Trash2, BarChart3, ChevronDown } from 'lucide-react';
import { sellerApi, productsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useT } from '@/hooks/useT';
import ProductFormModal from './ProductFormModal';

const STATUS_OPTIONS = ['PENDING','CONFIRMED','SHIPPED','DELIVERED','CANCELLED'] as const;

function StatusBadge({ status, t }: { status: string; t: (k: any) => string }) {
  const map: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };
  const labels: Record<string, string> = {
    PENDING: t('statusPending'), CONFIRMED: t('statusConfirmed'),
    SHIPPED: t('statusShipped'), DELIVERED: t('statusDelivered'),
    CANCELLED: t('statusCancelled'),
  };
  return (
    <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', map[status] ?? 'bg-gray-100 text-gray-600')}>
      {labels[status] ?? status}
    </span>
  );
}

export default function SellerDashboard() {
  const t = useT();
  const router = useRouter();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const [tab, setTab] = useState<'products' | 'orders'>('products');
  const [editProduct, setEditProduct] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'STORE_OWNER') router.push('/');
  }, [user]);

  const { data: stats } = useQuery({ queryKey: ['seller-stats'], queryFn: () => sellerApi.getStats() as any });
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['seller-products'],
    queryFn: () => sellerApi.getProducts() as any,
    enabled: tab === 'products',
  });
  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: () => sellerApi.getOrders() as any,
    enabled: tab === 'orders',
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sellerApi.deleteProduct(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['seller-products'] }); toast.success('Удалено'); },
    onError: () => toast.error('Ошибка удаления'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => sellerApi.updateOrderStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['seller-orders'] }); toast.success('Статус обновлён'); },
  });

  const handleDelete = (id: string) => {
    if (confirm(t('confirmDelete'))) deleteMutation.mutate(id);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold">{t('sellerDashboard')}</h1>
        {(stats as any)?.store && (
          <span
            className="text-sm font-semibold px-3 py-1 rounded-lg"
            style={{ color: 'var(--gold)', background: 'var(--gold-sub)', border: '1px solid rgba(201,169,110,0.2)' }}
          >
            {(stats as any).store.name}
          </span>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: t('totalProducts'), value: (stats as any).products, icon: Package, color: 'text-blue-600 bg-blue-50' },
            { label: t('totalOrders'),   value: (stats as any).orders,   icon: ClipboardList, color: 'text-purple-600 bg-purple-50' },
            { label: t('totalRevenue'),  value: `${Number((stats as any).revenue).toLocaleString('ru')} ₽`, icon: BarChart3, color: 'text-green-600 bg-green-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 flex items-center gap-3">
              <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', color)}>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 leading-tight">{label}</p>
                <p className="font-bold text-base mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 w-fit">
        {(['products', 'orders'] as const).map((t_) => (
          <button
            key={t_}
            onClick={() => setTab(t_)}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              tab === t_ ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {t_ === 'products' ? <><Package size={15} /> {t('myProducts')}</> : <><ClipboardList size={15} /> {t('myOrders')}</>}
          </button>
        ))}
      </div>

      {/* ── PRODUCTS TAB ── */}
      {tab === 'products' && (
        <div className="space-y-4">
          <button
            onClick={() => { setEditProduct(null); setShowModal(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> {t('addProduct')}
          </button>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !(products as any[]).length ? (
            <div className="text-center py-16 text-gray-400">
              <Package size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">{t('noProducts')}</p>
              <p className="text-sm mt-1">{t('noProductsHint')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(products as any[]).map((p) => (
                <div key={p.id} className="card p-4 flex gap-3">
                  {/* Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">👕</div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.category?.name}</p>
                    <p className="font-bold text-sm mt-1">{Number(p.price).toLocaleString('ru')} ₽</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={clsx('text-xs font-medium', p.inStock ? 'text-green-600' : 'text-red-400')}>
                        {p.inStock ? t('inStock') : t('outOfStockLabel')}
                      </span>
                      <span className="text-xs text-gray-400">{p.stock} {t('pcs')}</span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => { setEditProduct(p); setShowModal(true); }}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ORDERS TAB ── */}
      {tab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !(orders as any[]).length ? (
            <div className="text-center py-16 text-gray-400">
              <ClipboardList size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">{t('noSellerOrders')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(orders as any[]).map((order) => (
                <div key={order.id} className="card p-4 md:p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-medium text-sm">
                        {t('orderLabel')} #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('ru')}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {t('orderFrom')}: {order.user?.name} · {order.user?.phone || order.user?.email}
                      </p>
                    </div>
                    <StatusBadge status={order.status} t={t} />
                  </div>

                  {/* Items */}
                  <div className="space-y-1.5 mb-3">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden shrink-0 relative">
                          {item.product?.images?.[0] ? (
                            <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                          ) : <div className="w-full h-full flex items-center justify-center text-xs">👕</div>}
                        </div>
                        <span className="flex-1 truncate text-gray-700">{item.product?.name}</span>
                        <span className="text-gray-400 shrink-0">×{item.qty}</span>
                        <span className="font-medium shrink-0">{Number(item.price).toLocaleString('ru')} ₽</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="font-bold">{Number(order.total).toLocaleString('ru')} ₽</span>
                    {/* Status selector */}
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => statusMutation.mutate({ id: order.id, status: e.target.value })}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 pr-6 appearance-none bg-white cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Product Form Modal */}
      {showModal && (
        <ProductFormModal
          product={editProduct}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSaved={() => { qc.invalidateQueries({ queryKey: ['seller-products'] }); qc.invalidateQueries({ queryKey: ['seller-stats'] }); }}
        />
      )}
    </div>
  );
}
