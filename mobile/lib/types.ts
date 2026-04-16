export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  images: string[];
  sizes: string[];
  brand?: string;
  gender?: string;
  inStock: boolean;
  category: { name: string; slug: string };
  store: { id: string; name: string; address?: string };
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  size?: string;
  qty: number;
}

export interface Order {
  id: string;
  status: string;
  total: number;
  address: string;
  createdAt: string;
  store: { name: string };
  items: {
    id: string;
    qty: number;
    price: number;
    size?: string;
    product: { name: string; images: string[] };
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
}
