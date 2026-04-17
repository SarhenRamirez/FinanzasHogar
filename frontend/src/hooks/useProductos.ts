import { useState, useEffect, useCallback } from 'react';
import { productosApi } from '../services/api';
import type { Producto } from '../types';

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [agotados, setAgotados] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const [todos, vacios] = await Promise.all([productosApi.getAll(), productosApi.getAgotados()]);
      setProductos(todos); setAgotados(vacios); setError(null);
    } catch { setError('No se pudo conectar con el servidor'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const totalInventario = productos.reduce((a, p) => a + p.precio * p.cantidad, 0);
  const totalAgotados = agotados.reduce((a, p) => a + p.precio, 0);

  return { productos, agotados, loading, error, cargar, totalInventario, totalAgotados };
}