import { useState } from 'react';
import { Plus, Trash2, Receipt, FileText, BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useGastos } from '../hooks/useGastos';
import { gastosApi } from '../services/api';
import { generarPDFGastos } from '../utils/pdf';
import type { CategoriaGasto } from '../types';

const CATEGORIAS: { id: CategoriaGasto; label: string; color: string }[] = [
  { id: 'mercado',    label: 'Mercado',    color: '#6366f1' },
  { id: 'aseo',      label: 'Aseo',        color: '#10b981' },
  { id: 'servicios', label: 'Servicios',   color: '#f59e0b' },
  { id: 'transporte',label: 'Transporte',  color: '#3b82f6' },
  { id: 'salud',     label: 'Salud',       color: '#ef4444' },
  { id: 'otros',     label: 'Otros',       color: '#8b5cf6' },
];

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(n);

const formatCOPCorto = (n: number) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
};

type Vista = 'lista' | 'graficas';

export function PaginaGastos() {
  const { gastos, mes, anio, setMes, setAnio, cargar, totalGastos } = useGastos();
  const [vista, setVista] = useState<Vista>('lista');
  const [form, setForm] = useState({
    descripcion: '', monto: 0,
    categoria: 'mercado' as CategoriaGasto,
    fecha: new Date().toISOString().split('T')[0],
  });
  const [agregando, setAgregando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async () => {
    if (!form.descripcion || form.monto <= 0) return;
    setGuardando(true);
    try {
      await gastosApi.create(form);
      setForm({
        descripcion: '', monto: 0,
        categoria: 'mercado',
        fecha: new Date().toISOString().split('T')[0],
      });
      setAgregando(false);
      cargar();
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Eliminar este gasto?')) return;
    await gastosApi.delete(id);
    cargar();
  };

  const gastosPorCategoria = CATEGORIAS.map(cat => ({
    ...cat,
    total: gastos
      .filter(g => g.categoria === cat.id)
      .reduce((a, g) => a + Number(g.monto), 0),
  })).filter(c => c.total > 0);

  const gastosPorDia = gastos.reduce((acc, g) => {
    const dia = new Date(g.fecha).getDate();
    const key = `${dia}`;
    const existing = acc.find(a => a.dia === key);
    if (existing) {
      existing.total += Number(g.monto);
    } else {
      acc.push({ dia: key, total: Number(g.monto) });
    }
    return acc;
  }, [] as { dia: string; total: number }[])
    .sort((a, b) => Number(a.dia) - Number(b.dia));

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>

      {/* TITULO */}
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.titulo}>Gastos</h1>
          <p style={styles.subtitulo}>Registro de gastos del hogar</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            style={styles.btnSecundario}
            onClick={() => generarPDFGastos(gastos, totalGastos, MESES[mes - 1], anio)}
          >
            <FileText size={16} />
            Descargar PDF
          </button>
          <button style={styles.btnPrimario} onClick={() => setAgregando(true)}>
            <Plus size={16} />
            Agregar gasto
          </button>
        </div>
      </div>

      {/* FILTROS + TOGGLE */}
      <div style={styles.filtrosBar}>
        <div style={styles.filtros}>
          <select style={styles.select} value={mes}
            onChange={e => setMes(Number(e.target.value))}>
            {MESES.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select style={styles.select} value={anio}
            onChange={e => setAnio(Number(e.target.value))}>
            {[2024, 2025, 2026].map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div style={styles.toggleVista}>
          <button
            style={{ ...styles.toggleBtn, ...(vista === 'lista' ? styles.toggleActivo : {}) }}
            onClick={() => setVista('lista')}
          >
            <Receipt size={15} />
            Lista
          </button>
          <button
            style={{ ...styles.toggleBtn, ...(vista === 'graficas' ? styles.toggleActivo : {}) }}
            onClick={() => setVista('graficas')}
          >
            <BarChart2 size={15} />
            Gráficas
          </button>
        </div>
      </div>

      {/* CARD TOTAL */}
      <div style={styles.cardTotal}>
        <div style={styles.cardTotalIcono}>
          <Receipt size={22} color="#6366f1" />
        </div>
        <div>
          <div style={styles.cardTotalLabel}>Total gastado en {MESES[mes - 1]}</div>
          <div style={styles.cardTotalValor}>{formatCOP(totalGastos)}</div>
        </div>
      </div>

      {/* ── VISTA LISTA ── */}
      {vista === 'lista' && (
        <>
          {gastosPorCategoria.length > 0 && (
            <div style={styles.seccion}>
              <h2 style={styles.seccionTitulo}>Por categoría</h2>
              <div style={styles.gridCategorias}>
                {gastosPorCategoria.map(cat => (
                  <div key={cat.id} style={styles.catCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={styles.catLabel}>{cat.label}</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: cat.color }}>
                        {((cat.total / totalGastos) * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div style={styles.catValor}>{formatCOP(cat.total)}</div>
                    <div style={styles.catBarra}>
                      <div style={{
                        ...styles.catBarraFill,
                        width: `${(cat.total / totalGastos) * 100}%`,
                        background: cat.color,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={styles.seccion}>
            <h2 style={styles.seccionTitulo}>Detalle de gastos</h2>
            {gastos.length === 0 ? (
              <div style={styles.vacio}>
                <Receipt size={40} color="#cbd5e1" />
                <p>No hay gastos registrados en {MESES[mes - 1]}</p>
              </div>
            ) : (
              <div style={styles.lista}>
                {gastos.map(g => {
                  const catColor = CATEGORIAS.find(c => c.id === g.categoria)?.color ?? '#6366f1';
                  return (
                    <div key={g.id} style={styles.gastoItem}>
                      <div style={{ ...styles.gastoColorBar, background: catColor }} />
                      <div style={styles.gastoInfo}>
                        <div style={styles.gastoDesc}>{g.descripcion}</div>
                        <div style={styles.gastoMeta}>
                          <span style={{
                            ...styles.gastoCat,
                            color: catColor,
                            background: `${catColor}18`,
                          }}>
                            {g.categoria}
                          </span>
                          <span style={styles.gastoFecha}>
                            {new Date(g.fecha).toLocaleDateString('es-CO')}
                          </span>
                        </div>
                      </div>
                      <div style={styles.gastoMonto}>{formatCOP(Number(g.monto))}</div>
                      <button style={styles.btnEliminar} onClick={() => handleEliminar(g.id)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── VISTA GRAFICAS ── */}
      {vista === 'graficas' && (
        <>
          {gastos.length === 0 ? (
            <div style={styles.vacio}>
              <BarChart2 size={40} color="#cbd5e1" />
              <p>No hay datos para mostrar en {MESES[mes - 1]}</p>
            </div>
          ) : (
            <>
              <div style={styles.cardGrafica}>
                <h2 style={styles.seccionTitulo}>Distribución por categoría</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={gastosPorCategoria}
                      dataKey="total"
                      nameKey="label"
                      cx="50%" cy="50%"
                      outerRadius={100} innerRadius={55}
                      paddingAngle={3}
                    >
                      {gastosPorCategoria.map((cat, i) => (
                        <Cell key={i} fill={cat.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCOP(Number(value))} />
                    <Legend
                      formatter={(value) => (
                        <span style={{ fontSize: '0.82rem', color: '#475569' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {gastosPorDia.length > 0 && (
                <div style={styles.cardGrafica}>
                  <h2 style={styles.seccionTitulo}>Gastos por día</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={gastosPorDia} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={formatCOPCorto} />
                      <Tooltip formatter={(value) => [formatCOP(Number(value)), 'Total']} />
                      <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div style={styles.cardGrafica}>
                <h2 style={styles.seccionTitulo}>Total por categoría</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={gastosPorCategoria} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={formatCOPCorto} />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: '#475569' }} tickLine={false} axisLine={false} width={80} />
                    <Tooltip formatter={(value) => [formatCOP(Number(value)), 'Total']} />
                    <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                      {gastosPorCategoria.map((cat, i) => (
                        <Cell key={i} fill={cat.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      )}

      {/* MODAL AGREGAR */}
      {agregando && (
        <div style={styles.overlay} onClick={() => setAgregando(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitulo}>Nuevo gasto</h2>

            <div style={styles.campo}>
              <label style={styles.label}>Descripción</label>
              <input
                style={styles.input} type="text"
                placeholder="Ej: Compra supermercado"
                value={form.descripcion}
                onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
              />
            </div>

            <div style={styles.campo}>
              <label style={styles.label}>Monto (COP)</label>
              <input
                style={styles.input} type="number" min="0"
                value={form.monto}
                onChange={e => setForm(p => ({ ...p, monto: Number(e.target.value) }))}
              />
            </div>

            <div style={styles.campo}>
              <label style={styles.label}>Categoría</label>
              <select
                style={styles.input}
                value={form.categoria}
                onChange={e => setForm(p => ({ ...p, categoria: e.target.value as CategoriaGasto }))}
              >
                {CATEGORIAS.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div style={styles.campo}>
              <label style={styles.label}>Fecha</label>
              <input
                style={styles.input} type="date"
                value={form.fecha}
                onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))}
              />
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.btnCancelar} onClick={() => setAgregando(false)}>
                Cancelar
              </button>
              <button style={styles.btnPrimario} onClick={handleGuardar} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  topBar: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem',
  },
  titulo: { fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 },
  subtitulo: { fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' },
  btnPrimario: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: '#6366f1', color: 'white', border: 'none',
    padding: '0.7rem 1.25rem', borderRadius: '10px',
    cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit',
  },
  btnSecundario: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: 'var(--bg-card)', color: 'var(--text-secondary)',
    border: '1.5px solid var(--border)',
    padding: '0.7rem 1.25rem', borderRadius: '10px',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', fontFamily: 'inherit',
  },
  filtrosBar: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem',
  },
  filtros: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },
  select: {
    padding: '0.6rem 1rem', border: '1.5px solid var(--border)',
    borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit',
    background: 'var(--bg-card)', color: 'var(--text-primary)',
    cursor: 'pointer', outline: 'none',
  },
  toggleVista: {
    display: 'flex', background: 'var(--toggle-bg)',
    borderRadius: '10px', padding: '0.25rem', gap: '0.25rem',
  },
  toggleBtn: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
    background: 'transparent', color: 'var(--text-secondary)',
    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit',
  },
  toggleActivo: {
    background: 'var(--bg-card)', color: '#6366f1',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  cardTotal: {
    background: 'var(--bg-card)', borderRadius: '14px', padding: '1.25rem 1.5rem',
    border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
    gap: '1rem', marginBottom: '1.5rem', transition: 'background 0.3s ease',
  },
  cardTotalIcono: {
    width: '48px', height: '48px', background: '#f1f0fe',
    borderRadius: '12px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  cardTotalLabel: { fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' },
  cardTotalValor: { fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' },
  seccion: { marginBottom: '1.5rem' },
  seccionTitulo: { fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' },
  gridCategorias: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem',
  },
  catCard: {
    background: 'var(--bg-card)', borderRadius: '12px', padding: '1rem',
    border: '1px solid var(--border)', transition: 'background 0.3s ease',
  },
  catLabel: { fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 },
  catValor: { fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' },
  catBarra: { height: '4px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' },
  catBarraFill: { height: '100%', borderRadius: '99px' },
  cardGrafica: {
    background: 'var(--bg-card)', borderRadius: '14px', padding: '1.25rem 1.5rem',
    border: '1px solid var(--border)', marginBottom: '1.25rem',
    transition: 'background 0.3s ease',
  },
  lista: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  gastoItem: {
    background: 'var(--bg-card)', borderRadius: '12px', padding: '1rem 1.25rem',
    border: '1px solid var(--border)', display: 'flex', alignItems: 'center',
    gap: '1rem', overflow: 'hidden', transition: 'background 0.3s ease',
  },
  gastoColorBar: { width: '4px', height: '40px', borderRadius: '99px', flexShrink: 0 },
  gastoInfo: { flex: 1 },
  gastoDesc: { fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' },
  gastoMeta: { display: 'flex', gap: '0.75rem', marginTop: '0.2rem' },
  gastoCat: {
    fontSize: '0.75rem', fontWeight: 600,
    padding: '0.15rem 0.5rem', borderRadius: '99px',
  },
  gastoFecha: { fontSize: '0.75rem', color: 'var(--text-muted)' },
  gastoMonto: { fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' },
  btnEliminar: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '0.25rem',
  },
  vacio: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '0.75rem', padding: '3rem', color: 'var(--text-muted)',
    background: 'var(--bg-card)', borderRadius: '14px',
    border: '1px solid var(--border)',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(4px)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem',
  },
  modal: {
    background: 'var(--bg-card)', borderRadius: '16px', padding: '1.75rem',
    width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
    transition: 'background 0.3s ease',
  },
  modalTitulo: { fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' },
  campo: { marginBottom: '1rem' },
  label: {
    display: 'block', fontSize: '0.8rem', fontWeight: 700,
    color: 'var(--text-secondary)', marginBottom: '0.35rem',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  },
  input: {
    width: '100%', padding: '0.7rem 0.9rem',
    border: '1.5px solid var(--border)', borderRadius: '8px',
    fontSize: '0.95rem', fontFamily: 'inherit', outline: 'none',
    color: 'var(--text-primary)', background: 'var(--bg-input)',
  },
  modalFooter: {
    display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem',
  },
  btnCancelar: {
    padding: '0.7rem 1.25rem', border: '1.5px solid var(--border)',
    borderRadius: '10px', background: 'var(--bg-card)', cursor: 'pointer',
    fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'inherit',
  },
};