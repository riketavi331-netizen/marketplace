import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data || err),
);

export default api;

export const authApi = {
  registerEmail: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register/email', data),
  registerPhone: (data: { name: string; phone: string; password: string }) =>
    api.post('/auth/register/phone', data),
  loginEmail: (data: { email: string; password: string }) =>
    api.post('/auth/login/email', data),
  loginPhone: (data: { phone: string; password: string }) =>
    api.post('/auth/login/phone', data),
  registerSeller: (data: {
    firstName: string; lastName: string; passportId: string;
    email: string; phone: string; postalAddress: string; password: string;
    storeName: string; taxId?: string; storeAddress: string; storePhone?: string;
  }) => api.post('/auth/register/seller', data),
};

export const productsApi = {
  getAll: (params?: any) => api.get('/products', { params }),
  getOne: (id: string) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
};

export const storesApi = {
  getAll: () => api.get('/stores'),
  getOne: (id: string) => api.get(`/stores/${id}`),
};

export const cartApi = {
  get: () => api.get('/cart'),
  add: (item: any) => api.post('/cart', item),
  update: (data: any) => api.patch('/cart', data),
  clear: () => api.delete('/cart'),
};

export const ordersApi = {
  create: (data: any) => api.post('/orders', data),
  getOne: (id: string) => api.get(`/orders/${id}`),
  getMine: () => api.get('/users/me/orders'),
};

export const aiApi = {
  chat: (data: any) => api.post('/ai-assistant/chat', data),
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  getOrders: (page = 1) => api.get('/admin/orders', { params: { page } }),
};
