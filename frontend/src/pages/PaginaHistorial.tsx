import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { Clock, Package, Search, X, RefreshCw } from 'lucide-react';
import { historialApi } from '../services/api';
import type { Historial } from '../types';

const ICONOS_CAMPO: Record<string, string> = {
  creación: '✨',
  eliminación: '🗑',
  nombre: '📝',
  precio: '💰',
  cantidad: '📦',
  cantidad_minima: '⚠️',
  categoria: '🏷',
  unidad: '📏',
};

const COLORES_CAMPO: Record<string, string> = {
  creación: '#10b981',
  eliminación: '#ef4444',
  nombre: '#6366f1',
  precio: '#f59e0b',
  cantidad: '#3b82f6',
  cantidad_minima: '#f59e0b',
  categoria: '#8b5cf6',
  unidad: '#64748b',
};

export function PaginaHistorial() {
  const [historial, setHistorial] = useState<Historial[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCampo, setFiltroCampo] = useState('todos');

  const cargar = async () => {
    setLoading(true);
    try {
      const data = await historialApi.getAll(200);
      setHistorial(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const campos = ['todos', ...Array.from(new Set(historial.map(h => h.campo_modificado)))];

  const filtrado = historial.filter(h => {
    const coincideBusqueda =
      h.producto_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      h.usuario_nombre?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCampo = filtroCampo === 'todos' || h.campo_modificado === filtroCampo;
    return coincideBusqueda && coincideCampo;
  });

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha);
    return d.toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>

      {/* TITULO */}
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.titulo}>Historial</h1>
          <p style={styles.subtitulo}>Registro de todos los cambios del inventario</p>
        </div>
        <button style={styles.btnRefresh} onClick={cargar}>
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {/* STATS */}
      <div style={styles.gridStats}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcono, background: '#f1f0fe' }}>
            <Clock size={20} color="#6366f1" />
          </div>
          <div>
            <div style={styles.statLabel}>Total cambios</div>
            <div style={styles.statValor}>{historial.length}</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcono, background: '#f0fdf4' }}>
            <Package size={20} color="#10b981" />
          </div>
          <div>
            <div style={styles.statLabel}>Productos modificados</div>
            <div style={styles.statValor}>
              {new Set(historial.map(h => h.producto_id)).size}
            </div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcono, background: '#fef9f0' }}>
            <Clock size={20} color="#f59e0b" />
          </div>
          <div>
            <div style={styles.statLabel}>Cambios hoy</div>
            <div style={styles.statValor}>
              {historial.filter(h => {
                const hoy = new Date().toDateString();
                return new Date(h.creado_en).toDateString() === hoy;
              }).length}
            </div>
          </div>
        </div>
      </div>

      {/* BUSQUEDA Y FILTROS */}
      <div style={styles.filtrosBox}>
        <div style={styles.inputBusquedaBox}>
          <Search size={16} color="#94a3b8" />
          <input
            style={styles.inputBusqueda}
            type="text"
            placeholder="Buscar por producto o usuario..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button style={styles.btnLimpiar} onClick={() => setBusqueda('')}>
              <X size={14} />
            </button>
          )}
        </div>
        <div style={styles.filtrosCampo}>
          {campos.map(campo => (
            <button
              key={campo}
              style={{
                ...styles.filtroCampo,
                ...(filtroCampo === campo ? {
                  background: COLORES_CAMPO[campo] ?? '#6366f1',
                  color: 'white',
                  borderColor: COLORES_CAMPO[campo] ?? '#6366f1',
                } : {}),
              }}
              onClick={() => setFiltroCampo(campo)}
            >
              {campo === 'todos' ? 'Todos' : campo}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA */}
      {loading ? (
        <div style={styles.vacio}>
          <div style={styles.spinner} />
          <p style={{ color: 'var(--text-muted)' }}>Cargando historial...</p>
        </div>
      ) : filtrado.length === 0 ? (
        <div style={styles.vacio}>
          <Clock size={40} color="#cbd5e1" />
          <p style={{ color: 'var(--text-muted)' }}>
            {busqueda ? 'No se encontraron resultados' : 'No hay cambios registrados aún'}
          </p>
        </div>
      ) : (
        <div style={styles.lista}>
          {filtrado.map((h, i) => {
            const color = COLORES_CAMPO[h.campo_modificado] ?? '#6366f1';
            const icono = ICONOS_CAMPO[h.campo_modificado] ?? '📋';
            return (
              <div key={h.id} style={{
                ...styles.item,
                animationDelay: `${i * 0.03}s`,
              }}>
                {/* LINEA TIEMPO */}
                <div style={styles.lineaTiempo}>
                  <div style={{ ...styles.lineaPunto, background: color }}>
                    <span style={{ fontSize: '0.7rem' }}>{icono}</span>
                  </div>
                  {i < filtrado.length - 1 && <div style={styles.lineaVertical} />}
                </div>

                {/* CONTENIDO */}
                <div style={styles.itemContenido}>
                  <div style={styles.itemHeader}>
                    <div style={styles.itemProducto}>{h.producto_nombre}</div>
                    <div style={styles.itemFecha}>{formatFecha(h.creado_en)}</div>
                  </div>

                  <div style={styles.itemDetalle}>
                    <span style={{
                      ...styles.itemCampo,
                      background: `${color}18`,
                      color,
                    }}>
                      {h.campo_modificado}
                    </span>

                    {h.campo_modificado !== 'creación' && h.campo_modificado !== 'eliminación' && (
                      <div style={styles.itemCambio}>
                        <span style={styles.valorAnterior}>{h.valor_anterior}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>→</span>
                        <span style={styles.valorNuevo}>{h.valor_nuevo}</span>
                      </div>
                    )}

                    {(h.campo_modificado === 'creación' || h.campo_modificado === 'eliminación') && (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {h.valor_nuevo}
                      </span>
                    )}
                  </div>

                  {h.usuario_nombre && (
                    <div style={styles.itemUsuario}>
                      <div style={styles.usuarioAvatar}>
                        {h.usuario_nombre.charAt(0).toUpperCase()}
                      </div>
                      <span>{h.usuario_nombre}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  topBar: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem',
  },
  titulo: { fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 },
  subtitulo: { fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' },
  btnRefresh: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: 'var(--bg-card)', color: 'var(--text-secondary)',
    border: '1.5px solid var(--border)', padding: '0.7rem 1.25rem',
    borderRadius: '10px', cursor: 'pointer', fontWeight: 600,
    fontSize: '0.9rem', fontFamily: 'inherit',
  },
  gridStats: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '1rem', marginBottom: '1.5rem',
  },
  statCard: {
    background: 'var(--bg-card)', borderRadius: '14px', padding: '1.25rem',
    border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem',
  },
  statIcono: {
    width: '44px', height: '44px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  statLabel: { fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.2rem' },
  statValor: { fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' },
  filtrosBox: { marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  inputBusquedaBox: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    background: 'var(--bg-card)', border: '1.5px solid var(--border)',
    borderRadius: '10px', padding: '0.65rem 1rem',
  },
  inputBusqueda: {
    flex: 1, border: 'none', outline: 'none',
    fontSize: '0.95rem', fontFamily: 'inherit',
    color: 'var(--text-primary)', background: 'transparent',
  },
  btnLimpiar: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
  },
  filtrosCampo: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  filtroCampo: {
    padding: '0.35rem 0.85rem', borderRadius: '99px',
    border: '1.5px solid var(--border)', background: 'var(--bg-card)',
    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
    color: 'var(--text-secondary)', fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  lista: { display: 'flex', flexDirection: 'column', gap: '0' },
  item: {
    display: 'flex', gap: '1rem',
    animation: 'fadeIn 0.3s ease both',
  },
  lineaTiempo: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    flexShrink: 0,
  },
  lineaPunto: {
    width: '36px', height: '36px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, zIndex: 1,
  },
  lineaVertical: {
    width: '2px', flex: 1, background: 'var(--border)',
    margin: '4px 0', minHeight: '20px',
  },
  itemContenido: {
    flex: 1, background: 'var(--bg-card)',
    borderRadius: '12px', padding: '1rem 1.25rem',
    border: '1px solid var(--border)', marginBottom: '0.75rem',
  },
  itemHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem',
  },
  itemProducto: { fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' },
  itemFecha: { fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' },
  itemDetalle: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' },
  itemCampo: {
    fontSize: '0.75rem', fontWeight: 700,
    padding: '0.2rem 0.6rem', borderRadius: '99px',
    textTransform: 'capitalize',
  },
  itemCambio: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  valorAnterior: {
    fontSize: '0.85rem', color: '#ef4444',
    background: '#fef2f2', padding: '0.15rem 0.5rem',
    borderRadius: '6px', textDecoration: 'line-through',
  },
  valorNuevo: {
    fontSize: '0.85rem', color: '#10b981',
    background: '#f0fdf4', padding: '0.15rem 0.5rem',
    borderRadius: '6px', fontWeight: 600,
  },
  itemUsuario: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    fontSize: '0.78rem', color: 'var(--text-muted)',
  },
  usuarioAvatar: {
    width: '20px', height: '20px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontSize: '0.65rem', fontWeight: 700,
  },
  vacio: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '0.75rem', padding: '3rem', color: 'var(--text-muted)',
    background: 'var(--bg-card)', borderRadius: '14px',
    border: '1px solid var(--border)',
  },
  spinner: {
    width: '36px', height: '36px',
    border: '3px solid var(--border)', borderTopColor: '#6366f1',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
};