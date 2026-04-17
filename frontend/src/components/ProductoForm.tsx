import { useState } from 'react';
import type { Producto, Categoria } from '../types';
import { productosApi } from '../services/api';

interface Props {
  producto?: Producto;
  categoriaInicial?: Categoria;
  onGuardado: () => void;
  onCancelar: () => void;
}

const CATEGORIAS: Categoria[] = ['granos', 'verdura', 'proteina', 'aseo'];
const UNIDADES = ['unidad', 'kg', 'g', 'litro', 'ml', 'paquete', 'bolsa', 'caja', 'docena'];

export function ProductoForm({ producto, categoriaInicial, onGuardado, onCancelar }: Props) {
  const [form, setForm] = useState({
    nombre: producto?.nombre ?? '',
    categoria: producto?.categoria ?? categoriaInicial ?? 'granos',
    precio: producto?.precio ?? 0,
    cantidad: producto?.cantidad ?? 0,
    cantidad_minima: producto?.cantidad_minima ?? 1,
    unidad: producto?.unidad ?? 'unidad',
  });
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const validar = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (form.precio < 0) e.precio = 'El precio no puede ser negativo';
    if (form.cantidad < 0) e.cantidad = 'La cantidad no puede ser negativa';
    return e;
  };

  const handleSubmit = async () => {
    const e = validar();
    if (Object.keys(e).length > 0) { setErrores(e); return; }
    setGuardando(true);
    try {
      if (producto) {
        await productosApi.update(producto.id, form as Omit<Producto, 'id'>);
      } else {
        await productosApi.create(form as Omit<Producto, 'id'>);
      }
      onGuardado();
    } catch {
      setErrores({ general: 'Error al guardar el producto' });
    } finally {
      setGuardando(false);
    }
  };

  const set = (key: string, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div style={styles.overlay} onClick={onCancelar}>
      <div style={styles.box} onClick={e => e.stopPropagation()}>

        <div style={styles.header}>
          <h2 style={styles.headerTitle}>
            {producto ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
          </h2>
          <button style={styles.btnCerrar} onClick={onCancelar}>✕</button>
        </div>

        {errores.general && (
          <div style={styles.errorBanner}>{errores.general}</div>
        )}

        <div style={styles.grid}>
          <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
            <label style={styles.label}>Nombre del producto *</label>
            <input
              style={styles.input}
              type="text"
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Arroz diana, Jabón rey..."
            />
            {errores.nombre && <span style={styles.error}>{errores.nombre}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Categoría *</label>
            <select style={styles.input} value={form.categoria}
              onChange={e => set('categoria', e.target.value)}>
              {CATEGORIAS.map(c => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Unidad</label>
            <select style={styles.input} value={form.unidad}
              onChange={e => set('unidad', e.target.value)}>
              {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Precio (COP) *</label>
            <input
              style={styles.input}
              type="number"
              min="0"
              value={form.precio}
              onChange={e => set('precio', parseFloat(e.target.value))}
            />
            {errores.precio && <span style={styles.error}>{errores.precio}</span>}
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Cantidad actual</label>
            <input
              style={styles.input}
              type="number"
              min="0"
              value={form.cantidad}
              onChange={e => set('cantidad', parseInt(e.target.value))}
            />
          </div>

          <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
            <label style={styles.label}>Cantidad mínima (alerta agotado)</label>
            <input
              style={styles.input}
              type="number"
              min="0"
              value={form.cantidad_minima}
              onChange={e => set('cantidad_minima', parseInt(e.target.value))}
            />
            <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
              Cuando la cantidad llegue a este número se marcará como agotado
            </small>
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.btnCancelar} onClick={onCancelar}>Cancelar</button>
          <button style={styles.btnGuardar} onClick={handleSubmit} disabled={guardando}>
            {guardando ? 'Guardando...' : producto ? 'Actualizar' : 'Agregar Producto'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  },
  box: {
    background: '#fff', borderRadius: '16px',
    width: '100%', maxWidth: '540px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
  },
  header: {
    background: '#16a34a', color: 'white',
    padding: '1.25rem 1.5rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { margin: 0, fontSize: '1.2rem', color: 'white' },
  btnCerrar: {
    background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
    width: '32px', height: '32px', borderRadius: '50%',
    cursor: 'pointer', fontSize: '1rem',
  },
  errorBanner: {
    background: '#fef2f2', color: '#dc2626',
    padding: '0.75rem 1.5rem', fontSize: '0.9rem',
  },
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '1rem', padding: '1.5rem',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: {
    fontSize: '0.8rem', fontWeight: 600, color: '#374151',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  input: {
    padding: '0.65rem 0.9rem', border: '2px solid #e5e7eb',
    borderRadius: '8px', fontSize: '0.95rem', outline: 'none',
    fontFamily: 'inherit',
  },
  error: { fontSize: '0.75rem', color: '#dc2626' },
  footer: {
    display: 'flex', gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderTop: '1px solid #f3f4f6', justifyContent: 'flex-end',
  },
  btnCancelar: {
    padding: '0.65rem 1.25rem', border: '2px solid #e5e7eb',
    borderRadius: '8px', background: 'white', cursor: 'pointer',
    fontWeight: 600, color: '#6b7280',
  },
  btnGuardar: {
    padding: '0.65rem 1.5rem', background: '#16a34a',
    color: 'white', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem',
  },
};