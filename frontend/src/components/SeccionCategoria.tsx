import { useState } from 'react';
import { Wheat, Sparkles, Leaf, Beef, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import type { Producto, Categoria } from '../types';
import { ProductoCard } from './ProductoCard';
import { ProductoForm } from './ProductoForm';

interface Props {
  categoria: Categoria;
  productos: Producto[];
  onCambio: () => void;
}

const META: Record<Categoria, { icon: React.ReactNode; color: string; label: string }> = {
  granos:   { icon: <Wheat size={22} />,     color: '#f59e0b', label: 'Granos y Secos' },
  aseo:     { icon: <Sparkles size={22} />,  color: '#6366f1', label: 'Aseo y Limpieza' },
  verdura:  { icon: <Leaf size={22} />,      color: '#10b981', label: 'Verduras y Frutas' },
  proteina: { icon: <Beef size={22} />,      color: '#ef4444', label: 'Proteínas' },
};

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(n);

export function SeccionCategoria({ categoria, productos, onCambio }: Props) {
  const [agregando, setAgregando] = useState(false);
  const [expandida, setExpandida] = useState(true);
  const { icon, color, label } = META[categoria];
  const total = productos.reduce((a, p) => a + p.precio * p.cantidad, 0);
  const agotados = productos.filter(p => p.cantidad <= p.cantidad_minima).length;

  return (
    <div style={styles.seccion}>
      <div
        style={{ ...styles.header, borderLeftColor: color }}
        onClick={() => setExpandida(!expandida)}
      >
        <div style={styles.titulo}>
          <div style={{ ...styles.iconBox, background: `${color}18`, color }}>
            {icon}
          </div>
          <div>
            <h2 style={styles.nombreCategoria}>{label}</h2>
            <div style={styles.meta}>
              <span>{productos.length} productos</span>
              {agotados > 0 && (
                <span style={styles.badgeAgotado}>{agotados} por acabarse</span>
              )}
            </div>
          </div>
        </div>
        <div style={styles.derecha}>
          <span style={{ ...styles.totalCategoria, color }}>{formatCOP(total)}</span>
          <span style={{ color: '#94a3b8' }}>
            {expandida ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        </div>
      </div>

      {expandida && (
        <div style={styles.body}>
          <div style={styles.grid}>
            {productos.map(p => (
              <ProductoCard key={p.id} producto={p} onCambio={onCambio} />
            ))}
            <button style={styles.btnAgregar} onClick={() => setAgregando(true)}>
              <Plus size={24} color="#94a3b8" />
              <small style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                Agregar a {label}
              </small>
            </button>
          </div>
        </div>
      )}

      {agregando && (
        <ProductoForm
          categoriaInicial={categoria}
          onGuardado={() => { onCambio(); setAgregando(false); }}
          onCancelar={() => setAgregando(false)}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  seccion: {
    background: 'var(--bg-card)', borderRadius: '16px',
    overflow: 'hidden', border: '1px solid var(--border)',
    marginBottom: '1.25rem', transition: 'background 0.3s ease',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1.25rem 1.5rem', borderLeft: '4px solid',
    cursor: 'pointer', userSelect: 'none',
  },
  titulo: { display: 'flex', alignItems: 'center', gap: '1rem' },
  iconBox: {
    width: '44px', height: '44px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  nombreCategoria: { margin: 0, fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 700 },
  meta: { display: 'flex', gap: '0.75rem', marginTop: '0.2rem', fontSize: '0.8rem', color: 'var(--text-muted)' },
  badgeAgotado: {
    background: '#fef2f2', color: '#ef4444',
    padding: '0.1rem 0.5rem', borderRadius: '99px', fontWeight: 600,
  },
  derecha: { display: 'flex', alignItems: 'center', gap: '1rem' },
  totalCategoria: { fontSize: '1.1rem', fontWeight: 800 },
  body: { padding: '1.25rem', borderTop: '1px solid var(--border)' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
  btnAgregar: {
    border: '2px dashed var(--border)', borderRadius: '12px',
    background: 'transparent', cursor: 'pointer',
    padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '0.5rem', minHeight: '130px',
  },
};