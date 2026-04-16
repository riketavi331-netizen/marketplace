import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { authApi } from '@/lib/api';
import { User } from '@/lib/types';

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginEmail: (email: string, password: string) => Promise<void>;
  loginPhone: (phone: string, password: string) => Promise<void>;
  registerEmail: (name: string, email: string, password: string) => Promise<void>;
  registerPhone: (name: string, phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  loading: true,

  init: async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      set({ token });
      await get().fetchMe();
    }
    set({ loading: false });
  },

  loginEmail: async (email, password) => {
    const res: any = await authApi.loginEmail({ email, password });
    await AsyncStorage.setItem('token', res.access_token);
    set({ token: res.access_token });
    await get().fetchMe();
  },

  loginPhone: async (phone, password) => {
    const res: any = await authApi.loginPhone({ phone, password });
    await AsyncStorage.setItem('token', res.access_token);
    set({ token: res.access_token });
    await get().fetchMe();
  },

  registerEmail: async (name, email, password) => {
    const res: any = await authApi.registerEmail({ name, email, password });
    await AsyncStorage.setItem('token', res.access_token);
    set({ token: res.access_token });
    await get().fetchMe();
  },

  registerPhone: async (name, phone, password) => {
    const res: any = await authApi.registerPhone({ name, phone, password });
    await AsyncStorage.setItem('token', res.access_token);
    set({ token: res.access_token });
    await get().fetchMe();
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ user: null, token: null });
  },

  fetchMe: async () => {
    try {
      const user: any = await api.get('/users/me');
      set({ user });
    } catch {
      await AsyncStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },
}));
