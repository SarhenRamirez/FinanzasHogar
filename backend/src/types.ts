export type Categoria = 'granos' | 'aseo' | 'verdura' | 'proteina';

export interface Producto {
  id: number;
  nombre: string;
  categoria: Categoria;
  precio: number;
  cantidad: number;
  cantidad_minima: number;
  unidad: string;
  creado_en?: string;
  actualizado_en?: string;
}

export interface CreateProductoDTO {
  nombre: string;
  categoria: Categoria;
  precio: number;
  cantidad: number;
  cantidad_minima: number;
  unidad: string;
}