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
const PHONE_BODY_REGEX = /^\d{9}$/;
const PASSPORT_REGEX = /^\d{9}$/;

function PhoneInput({ value, onChange, error }: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <>
      <div className={clsx(
        'flex rounded-lg border overflow-hidden',
        error ? 'border-red-400' : 'border-gray-300',
        'focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent',
      )}>
        <span className="flex items-center px-3 bg-gray-50 text-gray-500 text-sm font-medium border-r border-gray-300 select-none">
          🇬🇪 +995
        </span>
        <input
          className="flex-1 px-3 py-2 text-sm focus:outline-none bg-white"
          placeholder="551234567"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 9))}
          inputMode="numeric"
          maxLength={9}
        />
        <span className={clsx('flex items-center pr-3 text-xs', value.length === 9 ? 'text-green-500' : 'text-gray-300')}>
          {value.length}/9
        </span>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </>
  );
}

function Field({ label, hint, error, children }: {
  label: string; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1">{label}</label>
      {children}
      {hint && !error && <p className="text-gray-400 text-xs mt-1">{hint}</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function SellerRegisterPage() {
  const t = useT();
  const router = useRouter();
  const { fetchMe } = useAuthStore();

  const [form, setForm] = useState({
    firstName: '', lastName: '',
    passportId: '',
    email: '',
    phoneBody: '',
    postalAddress: '',
    password: '',
    storeName: '',
    taxId: '',
    storeAddress: '',
    storePhoneBody: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = t('enterFirstName');
    if (!form.lastName.trim()) errs.lastName = t('enterLastName');
    if (!PASSPORT_REGEX.test(form.passportId.trim())) errs.passportId = t('enterPassportId');
    if (!EMAIL_REGEX.test(form.email)) errs.email = t('enterValidEmail');
    if (!PHONE_BODY_REGEX.test(form.phoneBody)) errs.phone = t('enterPhone9');
    if (!form.postalAddress.trim()) errs.postalAddress = t('enterPostalAddress');
    if (form.password.length < 6) errs.password = t('passwordMin6');
    if (!form.storeName.trim()) errs.storeName = t('enterStoreName');
    if (!form.storeAddress.trim()) errs.storeAddress = t('enterStoreAddress');
    if (form.storePhoneBody && !PHONE_BODY_REGEX.test(form.storePhoneBody)) errs.storePhone = t('enterPhone9');
    return errs;
  }

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res: any = await authApi.registerSeller({
        firstName: form.firstName,
        lastName: form.lastName,
        passportId: form.passportId.trim(),
        email: form.email,
        phone: `+995${form.phoneBody}`,
        postalAddress: form.postalAddress,
        password: form.password,
        storeName: form.storeName,
        taxId: form.taxId.trim() || undefined,
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
    <div className="max-w-lg mx-auto pt-6 pb-16">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Store size={28} className="text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('sellerRegisterTitle')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('sellerRegisterSubtitle')}</p>
      </div>

      <form onSubmit={handle} noValidate className="space-y-5">

        {/* ── Секция: данные владельца ── */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
            <User size={16} className="text-primary-600" />
            <h2 className="font-semibold text-sm text-gray-700">{t('ownerInfoTitle')}</h2>
          </div>

          {/* Имя + Фамилия — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('firstNameLabel')} error={errors.firstName}>
              <input
                className={clsx('input', errors.firstName && 'border-red-400')}
                placeholder={t('firstNamePlaceholder')}
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
              />
            </Field>
            <Field label={t('lastNameLabel')} error={errors.lastName}>
              <input
                className={clsx('input', errors.lastName && 'border-red-400')}
                placeholder={t('lastNamePlaceholder')}
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
              />
            </Field>
          </div>

          {/* ID паспорта */}
          <Field label={t('passportIdLabel')} hint={t('passportIdHint')} error={errors.passportId}>
            <input
              className={clsx('input font-mono tracking-widest', errors.passportId && 'border-red-400')}
              placeholder={t('passportIdPlaceholder')}
              value={form.passportId}
              onChange={(e) => set('passportId', e.target.value.replace(/\D/g, '').slice(0, 9))}
              inputMode="numeric"
              maxLength={9}
            />
          </Field>

          {/* Email */}
          <Field label={t('emailLabel')} error={errors.email}>
            <input
              className={clsx('input', errors.email && 'border-red-400')}
              type="email"
              placeholder={t('emailPlaceholder')}
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              autoComplete="email"
            />
          </Field>

          {/* Телефон */}
          <Field label={t('phoneLabel')} error={errors.phone}>
            <PhoneInput
              value={form.phoneBody}
              onChange={(v) => set('phoneBody', v)}
              error={errors.phone}
            />
          </Field>

          {/* Почтовый адрес */}
          <Field label={t('postalAddressLabel')} error={errors.postalAddress}>
            <input
              className={clsx('input', errors.postalAddress && 'border-red-400')}
              placeholder={t('postalAddressPlaceholder')}
              value={form.postalAddress}
              onChange={(e) => set('postalAddress', e.target.value)}
            />
          </Field>

          {/* Пароль */}
          <Field label={t('passwordLabel')} error={errors.password}>
            <input
              className={clsx('input', errors.password && 'border-red-400')}
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              autoComplete="new-password"
            />
          </Field>
        </div>

        {/* ── Секция: данные магазина ── */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
            <Store size={16} className="text-primary-600" />
            <h2 className="font-semibold text-sm text-gray-700">{t('storeInfoTitle')}</h2>
          </div>

          {/* Название магазина */}
          <Field label={t('storeNameLabel')} error={errors.storeName}>
            <input
              className={clsx('input', errors.storeName && 'border-red-400')}
              placeholder={t('storeNamePlaceholder')}
              value={form.storeName}
              onChange={(e) => set('storeName', e.target.value)}
            />
          </Field>

          {/* Номер ИП */}
          <Field label={t('taxIdLabel')} hint={t('taxIdHint')} error={errors.taxId}>
            <input
              className="input"
              placeholder={t('taxIdPlaceholder')}
              value={form.taxId}
              onChange={(e) => set('taxId', e.target.value)}
            />
          </Field>

          {/* Адрес магазина */}
          <Field label={t('storeAddressLabel')} error={errors.storeAddress}>
            <input
              className={clsx('input', errors.storeAddress && 'border-red-400')}
              placeholder={t('storeAddressPlaceholder')}
              value={form.storeAddress}
              onChange={(e) => set('storeAddress', e.target.value)}
            />
          </Field>

          {/* Телефон магазина */}
          <Field label={t('storePhoneLabel')} error={errors.storePhone}>
            <PhoneInput
              value={form.storePhoneBody}
              onChange={(v) => set('storePhoneBody', v)}
              error={errors.storePhone}
            />
          </Field>
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
