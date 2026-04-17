import axios from 'axios';
import type { Producto, Gasto, Presupuesto } from '../types';
import Cookies from 'js-cookie';

const API = axios.create({ baseURL: 'http://localhost:3001/api' });

API.interceptors.request.use(config => {
  const token = Cookies.get('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const productosApi = {
  getAll: () => API.get<Producto[]>('/productos').then(r => r.data),
  getAgotados: () => API.get<Producto[]>('/productos/agotados').then(r => r.data),
  create: (data: Omit<Producto, 'id'>) => API.post<Producto>('/productos', data).then(r => r.data),
  update: (id: number, data: Omit<Producto, 'id'>) => API.put<Producto>(`/productos/${id}`, data).then(r => r.data),
  delete: (id: number) => API.delete(`/productos/${id}`).then(r => r.data),
};

export const gastosApi = {
  getAll: (mes: number, anio: number) => API.get<Gasto[]>(`/gastos?mes=${mes}&anio=${anio}`).then(r => r.data),
  create: (data: Omit<Gasto, 'id'>) => API.post<Gasto>('/gastos', data).then(r => r.data),
  delete: (id: number) => API.delete(`/gastos/${id}`).then(r => r.data),
};

export const presupuestoApi = {
  get: (mes: number, anio: number) => API.get<Presupuesto>(`/presupuesto?mes=${mes}&anio=${anio}`).then(r => r.data),
  save: (data: Presupuesto) => API.post<Presupuesto>('/presupuesto', data).then(r => r.data),
};

export const historialApi = {
  getAll: (limite?: number) => API.get(`/historial?limite=${limite ?? 100}`).then(r => r.data),
};

export const perfilApi = {
  get: () => API.get('/perfil').then(r => r.data),
  update: (data: { nombre: string; telefono?: string }) => API.put('/perfil', data).then(r => r.data),
  updatePassword: (data: { password_actual: string; password_nuevo: string }) =>
    API.put('/perfil/password', data).then(r => r.data),
  uploadFoto: (file: File) => {
    const form = new FormData();
    form.append('foto', file);
    return API.post('/perfil/foto', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
};