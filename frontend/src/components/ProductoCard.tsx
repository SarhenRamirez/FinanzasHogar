import { useState } from 'react';
import type { Producto } from '../types';
import { productosApi } from '../services/api';
import { ProductoForm } from './ProductoForm';

interface Props {
  producto: Producto;
  onCambio: () => void;
}

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(n);

export function ProductoCard({ producto: p, onCambio }: Props) {
  const [editando, setEditando] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const agotado = p.cantidad <= p.cantidad_minima;
  const porcentaje = Math.min((p.cantidad / (p.cantidad_minima * 3)) * 100, 100);

  const handleEliminar = async () => {
    if (!confirm(`¿Eliminar "${p.nombre}"?`)) return;
    setEliminando(true);
    try {
      await productosApi.delete(p.id);
      onCambio();
    } finally {
      setEliminando(false);
    }
  };

  return (
    <>
      <div style={{
        ...styles.card,
        borderColor: agotado ? '#fca5a5' : '#e5e7eb',
        background: agotado ? '#fff9f9' : 'white',
      }}>
        {agotado && (
          <div style={styles.badge}>⚠️ Por acabarse</div>
        )}

        <div style={styles.body}>
          <h3 style={styles.nombre}>{p.nombre}</h3>
          <div style={styles.precio}>
            {formatCOP(p.precio)} <span style={styles.unidad}>/ {p.unidad}</span>
          </div>

          <div style={styles.stockBox}>
            <div style={styles.stockInfo}>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Stock</span>
              <span style={styles.cantidad}>{p.cantidad} {p.unidad}</span>
            </div>
            <div style={styles.barra}>
              <div style={{
                ...styles.barraFill,
                width: `${porcentaje}%`,
                background: agotado ? '#ef4444' : '#16a34a',
              }} />
            </div>
            <div style={styles.minimo}>Mínimo: {p.cantidad_minima}</div>
          </div>

          <div style={styles.subtotal}>
            Subtotal: <strong>{formatCOP(p.precio * p.cantidad)}</strong>
          </div>
        </div>

        <div style={styles.actions}>
          <button style={styles.btnEdit} onClick={() => setEditando(true)}>
            ✏️ Editar
          </button>
          <button style={styles.btnDel} onClick={handleEliminar} disabled={eliminando}>
            {eliminando ? '...' : '🗑️'}
          </button>
        </div>
      </div>

      {editando && (
        <ProductoForm
          producto={p}
          onGuardado={() => { onCambio(); setEditando(false); }}
          onCancelar={() => setEditando(false)}
        />
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    borderRadius: '12px', border: '2px solid',
    overflow: 'hidden', transition: 'transform 0.2s, background 0.3s ease',
  },
  badge: {
    background: '#dc2626', color: 'white',
    fontSize: '0.72rem', fontWeight: 700,
    padding: '0.3rem 0.75rem', textAlign: 'center',
    letterSpacing: '0.05em',
  },
  body: { padding: '1rem', background: 'var(--bg-card)' },
  nombre: { fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem' },
  precio: { fontSize: '1.1rem', fontWeight: 700, color: '#16a34a', marginBottom: '0.75rem' },
  unidad: { fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' },
  stockBox: { marginBottom: '0.75rem' },
  stockInfo: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem',
  },
  cantidad: { fontWeight: 700, color: 'var(--text-primary)' },
  barra: {
    height: '6px', background: 'var(--border)',
    borderRadius: '99px', overflow: 'hidden',
  },
  barraFill: { height: '100%', borderRadius: '99px', transition: 'width 0.4s ease' },
  minimo: { fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', textAlign: 'right' },
  subtotal: {
    fontSize: '0.85rem', color: 'var(--text-secondary)',
    paddingTop: '0.5rem', borderTop: '1px solid var(--border)',
  },
  actions: {
    display: 'flex', gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderTop: '1px solid var(--border)',
    background: 'var(--hover)',
  },
  btnEdit: {
    flex: 1, padding: '0.5rem',
    background: 'var(--bg-card)', border: '2px solid var(--border)',
    borderRadius: '8px', cursor: 'pointer',
    fontSize: '0.85rem', fontWeight: 600,
    color: 'var(--text-secondary)', fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
  },
  btnDel: {
    padding: '0.5rem 0.75rem',
    background: 'var(--bg-card)', border: '2px solid var(--border)',
    borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
};