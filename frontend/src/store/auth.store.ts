'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/lib/types';
import api, { authApi } from '@/lib/api';

interface AuthStore {
  user: User | null;
  token: string | null;
  loginEmail: (email: string, password: string) => Promise<void>;
  loginPhone: (phone: string, password: string) => Promise<void>;
  registerEmail: (name: string, email: string, password: string) => Promise<void>;
  registerPhone: (name: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      loginEmail: async (email, password) => {
        const res: any = await authApi.loginEmail({ email, password });
        localStorage.setItem('token', res.access_token);
        set({ token: res.access_token });
        await get().fetchMe();
      },

      loginPhone: async (phone, password) => {
        const res: any = await authApi.loginPhone({ phone, password });
        localStorage.setItem('token', res.access_token);
        set({ token: res.access_token });
        await get().fetchMe();
      },

      registerEmail: async (name, email, password) => {
        const res: any = await authApi.registerEmail({ name, email, password });
        localStorage.setItem('token', res.access_token);
        set({ token: res.access_token });
        await get().fetchMe();
      },

      registerPhone: async (name, phone, password) => {
        const res: any = await authApi.registerPhone({ name, phone, password });
        localStorage.setItem('token', res.access_token);
        set({ token: res.access_token });
        await get().fetchMe();
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        try {
          const user: any = await api.get('/users/me');
          set({ user });
        } catch {
          set({ user: null, token: null });
        }
      },
    }),
    { name: 'auth', partialize: (s) => ({ token: s.token }) },
  ),
);
