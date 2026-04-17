import { useState, useEffect, useCallback } from 'react';
import { gastosApi, presupuestoApi } from '../services/api';
import type { Gasto, Presupuesto } from '../types';

export function useGastos() {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [presupuesto, setPresupuesto] = useState<Presupuesto>({ mes, anio, monto: 0 });
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const [g, p] = await Promise.all([gastosApi.getAll(mes, anio), presupuestoApi.get(mes, anio)]);
      setGastos(g); setPresupuesto(p || { mes, anio, monto: 0 });
    } finally { setLoading(false); }
  }, [mes, anio]);

  useEffect(() => { cargar(); }, [cargar]);

  const totalGastos = gastos.reduce((a, g) => a + Number(g.monto), 0);
  const disponible = Number(presupuesto.monto) - totalGastos;
  const porcentajeUsado = presupuesto.monto > 0
    ? Math.min((totalGastos / Number(presupuesto.monto)) * 100, 100) : 0;

  return { gastos, presupuesto, loading, mes, anio, setMes, setAnio, cargar, totalGastos, disponible, porcentajeUsado };
}