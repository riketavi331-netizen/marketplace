'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import {
  Users, Store, Package, ShoppingBag, BarChart3,
  Snowflake, Flame, Copy, ChevronDown, ChevronUp,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

type Tab = 'customers' | 'stores';

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', color)}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--tx-3)' }}>{label}</p>
        <p className="text-2xl font-bold mt-0.5" style={{ color: 'var(--tx)' }}>{value ?? '—'}</p>
      </div>
    </div>
  );
}

function CopyId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const short = id.slice(0, 8) + '…';
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="flex items-center gap-1 font-mono text-xs px-2 py-1 rounded-lg transition-all"
      style={{ background: 'var(--elevated)', color: copied ? 'var(--gold)' : 'var(--tx-3)' }}
      title={id}
    >
      {short} <Copy size={11} />
    </button>
  );
}

function FreezeBtn({ frozen, onClick, loading }: { frozen: boolean; onClick: () => void; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={clsx(
        'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all',
        frozen
          ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
          : 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
      )}
    >
      {frozen ? <><Flame size={13} /> Разморозить</> : <><Snowflake size={13} /> Заморозить</>}
    </button>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('customers');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.replace('/');
  }, [user]);

  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminApi.getStats() as any });
  const { data: customers = [], isLoading: loadingC } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => adminApi.getCustomers() as any,
    enabled: tab === 'customers',
  });
  const { data: storeOwners = [] } = useQuery({
    queryKey: ['admin-store-owners'],
    queryFn: () => adminApi.getStoreOwners() as any,
    enabled: tab === 'stores',
  });
  const { data: stores = [], isLoading: loadingS } = useQuery({
    queryKey: ['admin-stores'],
    queryFn: () => adminApi.getStores() as any,
    enabled: tab === 'stores',
  });

  const freezeUserMut = useMutation({
    mutationFn: ({ id, frozen }: { id: string; frozen: boolean }) => adminApi.freezeUser(id, frozen),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-customers'] });
      qc.invalidateQueries({ queryKey: ['admin-store-owners'] });
      toast.success('Статус обновлён');
    },
    onError: () => toast.error('Ошибка'),
  });

  const freezeStoreMut = useMutation({
    mutationFn: ({ id, frozen }: { id: string; frozen: boolean }) => adminApi.freezeStore(id, frozen),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-stores'] }); toast.success('Статус магазина обновлён'); },
    onError: () => toast.error('Ошибка'),
  });

  if (!user) return null;
  if (user.role !== 'ADMIN') return null;

  const s = stats as any;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BarChart3 size={22} style={{ color: 'var(--gold)' }} />
        <h1 className="text-2xl font-bold" style={{ color: 'var(--tx)' }}>Администрирование</h1>
        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--gold-sub)', color: 'var(--gold)', border: '1px solid rgba(201,169,110,0.2)' }}>
          ADMIN
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Клиентов" value={s?.customers} icon={Users} color="bg-blue-500/10 text-blue-400" />
        <StatCard label="Продавцов" value={s?.storeOwners} icon={ShoppingBag} color="bg-purple-500/10 text-purple-400" />
        <StatCard label="Магазинов" value={s?.stores} icon={Store} color="text-green-400" style={{}} />
        <StatCard label="Товаров" value={s?.products} icon={Package} color="bg-amber-500/10 text-amber-400" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--elevated)' }}>
        {(['customers', 'stores'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t ? 'var(--gold)' : 'transparent',
              color: tab === t ? '#0a0a0a' : 'var(--tx-2)',
            }}
          >
            {t === 'customers' ? <><Users size={15} /> Клиенты</> : <><Store size={15} /> Магазины</>}
          </button>
        ))}
      </div>

      {/* ── CUSTOMERS TAB ── */}
      {tab === 'customers' && (
        <div className="space-y-2">
          {loadingC ? (
            Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--elevated)' }} />)
          ) : !(customers as any[]).length ? (
            <p style={{ color: 'var(--tx-3)' }}>Нет клиентов</p>
          ) : (
            (customers as any[]).map((u: any) => (
              <div
                key={u.id}
                className="rounded-xl overflow-hidden"
                style={{ background: 'var(--surface)', border: `1px solid ${u.frozen ? 'rgba(100,150,255,0.2)' : 'var(--b-sub)'}` }}
              >
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                >
                  <div className="flex-1 grid grid-cols-3 md:grid-cols-4 gap-3 items-center min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: u.frozen ? 'rgba(100,150,255,0.15)' : 'var(--gold-sub)', color: u.frozen ? '#6496ff' : 'var(--gold)' }}>
                        {u.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="text-sm font-medium truncate" style={{ color: 'var(--tx)' }}>{u.name}</span>
                    </div>
                    <span className="text-xs truncate hidden md:block" style={{ color: 'var(--tx-2)' }}>{u.email}</span>
                    <span className="text-xs" style={{ color: 'var(--tx-3)' }}>{u.phone ?? '—'}</span>
                    <div className="flex items-center gap-2 justify-end">
                      {u.frozen && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(100,150,255,0.1)', color: '#6496ff' }}>заморожен</span>}
                      {expandedId === u.id ? <ChevronUp size={14} style={{ color: 'var(--tx-3)' }} /> : <ChevronDown size={14} style={{ color: 'var(--tx-3)' }} />}
                    </div>
                  </div>
                </div>

                {expandedId === u.id && (
                  <div className="px-4 pb-4 pt-1 space-y-3" style={{ borderTop: '1px solid var(--b-sub)' }}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'var(--tx-3)' }}>ID</p>
                        <CopyId id={u.id} />
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'var(--tx-3)' }}>Email</p>
                        <p style={{ color: 'var(--tx)' }}>{u.email}</p>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'var(--tx-3)' }}>Телефон</p>
                        <p style={{ color: 'var(--tx)' }}>{u.phone ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'var(--tx-3)' }}>Паспорт</p>
                        <p className="font-mono" style={{ color: 'var(--tx)' }}>{u.passportId ?? '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'var(--tx-3)' }}>Заказов</p>
                        <p style={{ color: 'var(--tx)' }}>{u._count?.orders ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'var(--tx-3)' }}>Зарегистрирован</p>
                        <p style={{ color: 'var(--tx)' }}>{new Date(u.createdAt).toLocaleDateString('ru')}</p>
                      </div>
                    </div>
                    <FreezeBtn
                      frozen={u.frozen}
                      loading={freezeUserMut.isPending}
                      onClick={() => freezeUserMut.mutate({ id: u.id, frozen: !u.frozen })}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── STORES TAB ── */}
      {tab === 'stores' && (
        <div className="space-y-4">
          {/* Store owners */}
          <h3 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--tx-3)' }}>
            Продавцы ({(storeOwners as any[]).length})
          </h3>
          <div className="space-y-2">
            {(storeOwners as any[]).map((u: any) => (
              <div
                key={u.id}
                className="rounded-xl overflow-hidden"
                style={{ background: 'var(--surface)', border: `1px solid ${u.frozen ? 'rgba(100,150,255,0.2)' : 'var(--b-sub)'}` }}
              >
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}>
                  <div className="flex-1 grid grid-cols-3 md:grid-cols-4 gap-3 items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: 'rgba(196,160,212,0.15)', color: '#c4a0d4' }}>
                        {u.name?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <span className="text-sm font-medium truncate" style={{ color: 'var(--tx)' }}>{u.name}</span>
                    </div>
                    <span className="text-xs hidden md:block truncate" style={{ color: 'var(--tx-2)' }}>{u.email}</span>
                    <span className="text-xs" style={{ color: 'var(--tx-3)' }}>{u.phone ?? '—'}</span>
                    <div className="flex items-center gap-2 justify-end">
                      {u.frozen && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(100,150,255,0.1)', color: '#6496ff' }}>заморожен</span>}
                      {expandedId === u.id ? <ChevronUp size={14} style={{ color: 'var(--tx-3)' }} /> : <ChevronDown size={14} style={{ color: 'var(--tx-3)' }} />}
                    </div>
                  </div>
                </div>
                {expandedId === u.id && (
                  <div className="px-4 pb-4 pt-1 space-y-3" style={{ borderTop: '1px solid var(--b-sub)' }}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div><p className="text-xs mb-1" style={{ color: 'var(--tx-3)' }}>ID</p><CopyId id={u.id} /></div>
                      <div><p className="text-xs mb-1" style={{ color: 'var(--tx-3)' }}>Email</p><p style={{ color: 'var(--tx)' }}>{u.email}</p></div>
                      <div><p className="text-xs mb-1" style={{ color: 'var(--tx-3)' }}>Телефон</p><p style={{ color: 'var(--tx)' }}>{u.phone ?? '—'}</p></div>
                      <div><p className="text-xs mb-1" style={{ color: 'var(--tx-3)' }}>Паспорт</p><p className="font-mono" style={{ color: 'var(--tx)' }}>{u.passportId ?? '—'}</p></div>
                      <div><p className="text-xs mb-1" style={{ color: 'var(--tx-3)' }}>Дата</p><p style={{ color: 'var(--tx)' }}>{new Date(u.createdAt).toLocaleDateString('ru')}</p></div>
                    </div>
                    <FreezeBtn frozen={u.frozen} loading={freezeUserMut.isPending}
                      onClick={() => freezeUserMut.mutate({ id: u.id, frozen: !u.frozen })} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Stores */}
          <h3 className="text-sm font-semibold uppercase tracking-widest mt-6" style={{ color: 'var(--tx-3)' }}>
            Магазины ({(stores as any[]).length})
          </h3>
          <div className="space-y-2">
            {loadingS ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--elevated)' }} />)
            ) : (stores as any[]).map((store: any) => (
              <div key={store.id} className="rounded-xl overflow-hidden"
                style={{ background: 'var(--surface)', border: `1px solid ${store.frozen ? 'rgba(100,150,255,0.2)' : 'var(--b-sub)'}` }}>
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === store.id ? null : store.id)}>
                  <div className="flex-1 grid grid-cols-3 md:grid-cols-4 gap-3 items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: 'var(--gold-sub)', color: 'var(--gold)' }}>
                        {store.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium truncate" style={{ color: 'var(--tx)' }}>{store.name}</span>
                    </div>
                    <span className="text-xs hidden md:block truncate" style={{ color: 'var(--tx-2)' }}>{store.email ?? '—'}</span>
                    <span className="text-xs" style={{ color: 'var(--tx-3)' }}>{store.phone ?? '—'}</span>
                    <div className="flex items-center gap-2 justify-end">
                      {store.frozen && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(100,150,255,0.1)', color: '#6496ff' }}>заморожен</span>}
                      {expandedId === store.id ? <ChevronUp size={14} style={{ color: 'var(--tx-3)' }} /> : <ChevronDown size={14} style={{ color: 'var(--tx-3)' }} />}
                    </div>
                  </div>
                </div>
                {expandedId === store.id && (
                  <div className="px-4 pb-4 pt-1 space-y-3" style={{ borderTop: '1px solid var(--b-sub)' }}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div><p className="text-xs mb-1" style={{ color: 'var(--tx-3)' }}>ID</p><CopyId id={store.id} /></div>
                      <div><p className="text-xs mb-1" style={{ color: 'var(--tx-3)' }}>Адрес</p><p style={{ color: 'var(--tx)' }}>{store.address}</p></div>
                      <div><p className="text-xs mb-1" style={{ color: 'var(--tx-3)' }}>Товаров</p><p style={{ color: 'var(--tx)' }}>{store._count?.products ?? 0}</p></div>
                      <div><p className="text-xs mb-1" style={{ color: 'var(--tx-3)' }}>Заказов</p><p style={{ color: 'var(--tx)' }}>{store._count?.orders ?? 0}</p></div>
                      <div><p className="text-xs mb-1" style={{ color: 'var(--tx-3)' }}>Создан</p><p style={{ color: 'var(--tx)' }}>{new Date(store.createdAt).toLocaleDateString('ru')}</p></div>
                    </div>
                    <FreezeBtn frozen={store.frozen} loading={freezeStoreMut.isPending}
                      onClick={() => freezeStoreMut.mutate({ id: store.id, frozen: !store.frozen })} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
