export type Categoria = 'granos' | 'aseo' | 'verdura' | 'proteina';
export type CategoriaGasto = 'mercado' | 'aseo' | 'servicios' | 'transporte' | 'salud' | 'otros';

export interface Producto {
  id: number;
  nombre: string;
  categoria: Categoria;
  precio: number;
  cantidad: number;
  cantidad_minima: number;
  unidad: string;
}

export interface Gasto {
  id: number;
  descripcion: string;
  monto: number;
  categoria: CategoriaGasto;
  fecha: string;
}

export interface Presupuesto {
  id?: number;
  mes: number;
  anio: number;
  monto: number;
}

export interface Historial {
  id: number;
  producto_id: number;
  producto_nombre: string;
  campo_modificado: string;
  valor_anterior: string;
  valor_nuevo: string;
  usuario_nombre: string;
  creado_en: string;
}

export interface UsuarioPerfil {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  foto_url?: string;
  creado_en: string;
}