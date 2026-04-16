import { create } from 'zustand';
import { CartItem } from '@/lib/types';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQty: (productId: string, size: string | undefined, qty: number) => void;
  removeItem: (productId: string, size: string | undefined) => void;
  clear: () => void;
  total: () => number;
  count: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    set((state) => {
      const idx = state.items.findIndex((i) => i.productId === item.productId && i.size === item.size);
      if (idx >= 0) {
        const items = [...state.items];
        items[idx] = { ...items[idx], qty: items[idx].qty + item.qty };
        return { items };
      }
      return { items: [...state.items, item] };
    });
  },

  updateQty: (productId, size, qty) => {
    set((state) => ({
      items: qty <= 0
        ? state.items.filter((i) => !(i.productId === productId && i.size === size))
        : state.items.map((i) => i.productId === productId && i.size === size ? { ...i, qty } : i),
    }));
  },

  removeItem: (productId, size) => {
    set((state) => ({ items: state.items.filter((i) => !(i.productId === productId && i.size === size)) }));
  },

  clear: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
  count: () => get().items.reduce((sum, i) => sum + i.qty, 0),
}));
