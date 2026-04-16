export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  oldPrice?: number;
  images: string[];
  sizes: string[];
  brand?: string;
  gender?: 'MEN' | 'WOMEN' | 'UNISEX' | 'KIDS';
  inStock: boolean;
  category: { name: string; slug: string };
  store: { id: string; name: string; address?: string };
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  geoLat?: number;
  geoLng?: number;
  logo?: string;
  _count?: { products: number };
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
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
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
  role: 'CUSTOMER' | 'ADMIN' | 'STORE_OWNER';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}
