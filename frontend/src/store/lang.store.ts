'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Lang } from '@/lib/i18n';

interface LangStore {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const useLangStore = create<LangStore>()(
  persist(
    (set) => ({
      lang: 'ru',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'lang' },
  ),
);
