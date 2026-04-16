'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useT } from '@/hooks/useT';

type Mode = 'login' | 'register';
type Method = 'email' | 'phone';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_BODY_REGEX = /^\d{9}$/;

export default function AuthPage() {
  const t = useT();
  const [mode, setMode] = useState<Mode>('login');
  const [method, setMethod] = useState<Method>('email');
  const [form, setForm] = useState({ name: '', email: '', phoneBody: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const { loginEmail, loginPhone, registerEmail, registerPhone } = useAuthStore();
  const router = useRouter();

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (mode === 'register' && !form.name.trim()) errs.name = t('enterName');
    if (method === 'email') {
      if (!EMAIL_REGEX.test(form.email)) errs.email = t('enterValidEmail');
    } else {
      if (!PHONE_BODY_REGEX.test(form.phoneBody)) errs.phone = t('enterPhone9');
    }
    if (form.password.length < 6) errs.password = t('passwordMin6');
    return errs;
  }

  const setField = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const phone = `+995${form.phoneBody}`;
      if (mode === 'register') {
        if (method === 'email') await registerEmail(form.name, form.email, form.password);
        else await registerPhone(form.name, phone, form.password);
        toast.success(t('accountCreated'));
      } else {
        if (method === 'email') await loginEmail(form.email, form.password);
        else await loginPhone(phone, form.password);
        toast.success(t('welcome'));
      }
      router.push('/');
    } catch (err: any) {
      const msg = err?.message || (Array.isArray(err?.message) ? err.message[0] : 'Error');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-8 md:pt-12">
      <div className="card p-6 md:p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          {mode === 'login' ? t('loginTitle') : t('registerTitle')}
        </h1>

        {/* Email / Phone tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {(['email', 'phone'] as Method[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMethod(m); setErrors({}); }}
              className={clsx(
                'flex-1 py-2 text-sm font-medium rounded-lg transition-colors',
                method === m ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {m === 'email' ? `✉️ ${t('emailLabel')}` : `📱 ${t('phoneLabel')}`}
            </button>
          ))}
        </div>

        <form onSubmit={handle} noValidate className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-sm font-medium block mb-1">{t('nameLabel')}</label>
              <input
                className={clsx('input', errors.name && 'border-red-400 focus:ring-red-400')}
                placeholder={t('namePlaceholder')}
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
          )}

          {method === 'email' && (
            <div>
              <label className="text-sm font-medium block mb-1">{t('emailLabel')}</label>
              <input
                className={clsx('input', errors.email && 'border-red-400 focus:ring-red-400')}
                type="email"
                placeholder={t('emailPlaceholder')}
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          )}

          {method === 'phone' && (
            <div>
              <label className="text-sm font-medium block mb-1">{t('phoneLabel')}</label>
              <div className={clsx(
                'flex rounded-lg border overflow-hidden transition-colors',
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
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                    setField('phoneBody', val);
                  }}
                  inputMode="numeric"
                  maxLength={9}
                />
                <span className={clsx(
                  'flex items-center pr-3 text-xs',
                  form.phoneBody.length === 9 ? 'text-green-500' : 'text-gray-300',
                )}>
                  {form.phoneBody.length}/9
                </span>
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          )}

          <div>
            <label className="text-sm font-medium block mb-1">{t('passwordLabel')}</label>
            <input
              className={clsx('input', errors.password && 'border-red-400 focus:ring-red-400')}
              type="password"
              placeholder={t('passwordPlaceholder')}
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base mt-2"
          >
            {loading ? t('loadingText') : mode === 'login' ? t('login') : t('register')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {mode === 'login' ? t('noAccount') : t('hasAccount')}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); }}
            className="text-primary-600 font-medium hover:underline"
          >
            {mode === 'login' ? t('register') : t('login')}
          </button>
        </p>
      </div>
    </div>
  );
}
