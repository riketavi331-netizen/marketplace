'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { Store, User, ChevronRight } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useT } from '@/hooks/useT';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+995\d{9}$/;
const PHONE_BODY_REGEX = /^\d{9}$/;

export default function SellerRegisterPage() {
  const t = useT();
  const router = useRouter();
  const { fetchMe } = useAuthStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneBody: '',
    password: '',
    storeName: '',
    storeAddress: '',
    storePhoneBody: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const setField = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t('enterName');
    if (!EMAIL_REGEX.test(form.email)) errs.email = t('enterValidEmail');
    if (!PHONE_BODY_REGEX.test(form.phoneBody)) errs.phone = t('enterPhone9');
    if (form.password.length < 6) errs.password = t('passwordMin6');
    if (!form.storeName.trim()) errs.storeName = t('enterStoreName');
    if (!form.storeAddress.trim()) errs.storeAddress = t('enterStoreAddress');
    if (form.storePhoneBody && !PHONE_BODY_REGEX.test(form.storePhoneBody)) {
      errs.storePhone = t('enterPhone9');
    }
    return errs;
  }

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res: any = await authApi.registerSeller({
        name: form.name,
        email: form.email,
        phone: `+995${form.phoneBody}`,
        password: form.password,
        storeName: form.storeName,
        storeAddress: form.storeAddress,
        storePhone: form.storePhoneBody ? `+995${form.storePhoneBody}` : undefined,
      });
      localStorage.setItem('token', res.access_token);
      await fetchMe();
      toast.success(t('sellerRegistered'));
      router.push('/');
    } catch (err: any) {
      const msg = err?.message || (Array.isArray(err?.message) ? err.message[0] : 'Error');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto pt-6 pb-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Store size={28} className="text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('sellerRegisterTitle')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('sellerRegisterSubtitle')}</p>
      </div>

      <form onSubmit={handle} noValidate className="space-y-6">

        {/* ── Секция: данные владельца ── */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <User size={17} className="text-primary-600" />
            <h2 className="font-semibold text-sm text-gray-700">{t('ownerInfoTitle')}</h2>
          </div>

          {/* Имя */}
          <div>
            <label className="text-sm font-medium block mb-1">{t('nameLabel')}</label>
            <input
              className={clsx('input', errors.name && 'border-red-400')}
              placeholder={t('namePlaceholder')}
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium block mb-1">{t('emailLabel')}</label>
            <input
              className={clsx('input', errors.email && 'border-red-400')}
              type="email"
              placeholder={t('emailPlaceholder')}
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              autoComplete="email"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Телефон владельца */}
          <div>
            <label className="text-sm font-medium block mb-1">{t('phoneLabel')}</label>
            <div className={clsx(
              'flex rounded-lg border overflow-hidden',
              errors.phone ? 'border-red-400' : 'border-gray-300',
              'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent',
            )}>
              <span className="flex items-center px-3 bg-gray-50 text-gray-500 text-sm font-medium border-r border-gray-300 select-none">
                🇬🇪 +995
              </span>
              <input
                className="flex-1 px-3 py-2 text-sm focus:outline-none bg-white"
                placeholder={t('phonePlaceholder')}
                value={form.phoneBody}
                onChange={(e) => setField('phoneBody', e.target.value.replace(/\D/g, '').slice(0, 9))}
                inputMode="numeric"
                maxLength={9}
              />
              <span className={clsx('flex items-center pr-3 text-xs', form.phoneBody.length === 9 ? 'text-green-500' : 'text-gray-300')}>
                {form.phoneBody.length}/9
              </span>
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Пароль */}
          <div>
            <label className="text-sm font-medium block mb-1">{t('passwordLabel')}</label>
            <input
              className={clsx('input', errors.password && 'border-red-400')}
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              autoComplete="new-password"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
        </div>

        {/* ── Секция: данные магазина ── */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Store size={17} className="text-primary-600" />
            <h2 className="font-semibold text-sm text-gray-700">{t('storeInfoTitle')}</h2>
          </div>

          {/* Название магазина */}
          <div>
            <label className="text-sm font-medium block mb-1">{t('storeNameLabel')}</label>
            <input
              className={clsx('input', errors.storeName && 'border-red-400')}
              placeholder={t('storeNamePlaceholder')}
              value={form.storeName}
              onChange={(e) => setField('storeName', e.target.value)}
            />
            {errors.storeName && <p className="text-red-500 text-xs mt-1">{errors.storeName}</p>}
          </div>

          {/* Адрес магазина */}
          <div>
            <label className="text-sm font-medium block mb-1">{t('storeAddressLabel')}</label>
            <input
              className={clsx('input', errors.storeAddress && 'border-red-400')}
              placeholder={t('storeAddressPlaceholder')}
              value={form.storeAddress}
              onChange={(e) => setField('storeAddress', e.target.value)}
            />
            {errors.storeAddress && <p className="text-red-500 text-xs mt-1">{errors.storeAddress}</p>}
          </div>

          {/* Телефон магазина (необязательно) */}
          <div>
            <label className="text-sm font-medium block mb-1">{t('storePhoneLabel')}</label>
            <div className={clsx(
              'flex rounded-lg border overflow-hidden',
              errors.storePhone ? 'border-red-400' : 'border-gray-300',
              'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent',
            )}>
              <span className="flex items-center px-3 bg-gray-50 text-gray-500 text-sm font-medium border-r border-gray-300 select-none">
                🇬🇪 +995
              </span>
              <input
                className="flex-1 px-3 py-2 text-sm focus:outline-none bg-white"
                placeholder={t('phonePlaceholder')}
                value={form.storePhoneBody}
                onChange={(e) => setField('storePhoneBody', e.target.value.replace(/\D/g, '').slice(0, 9))}
                inputMode="numeric"
                maxLength={9}
              />
              <span className={clsx('flex items-center pr-3 text-xs', form.storePhoneBody.length === 9 ? 'text-green-500' : 'text-gray-300')}>
                {form.storePhoneBody.length}/9
              </span>
            </div>
            {errors.storePhone && <p className="text-red-500 text-xs mt-1">{errors.storePhone}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
        >
          {loading ? t('sellerRegistering') : (
            <><Store size={18} /> {t('sellerRegisterBtn')} <ChevronRight size={16} /></>
          )}
        </button>
      </form>
    </div>
  );
}
