import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:3001/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
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
