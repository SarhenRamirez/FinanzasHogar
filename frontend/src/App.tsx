import { useState } from 'react';
import { Layout } from './components/Layout';
import { SeccionCategoria } from './components/SeccionCategoria';
import { PanelAgotados } from './components/PanelAgotados';
import { ProductoForm } from './components/ProductoForm';
import { PaginaGastos } from './pages/PaginaGastos';
import { PaginaPresupuesto } from './pages/PaginaPresupuesto';
import { PaginaHistorial } from './pages/PaginaHistorial';
import { PaginaLogin } from './pages/PaginaLogin';
import { useProductos } from './hooks/useProductos';
import { useAuth } from './contexts/AuthContext';
import { generarPDFInventario } from './utils/pdf';
import { Plus, FileText, Package, AlertTriangle, Search, X } from 'lucide-react';
import type { Categoria } from './types';

const CATEGORIAS: Categoria[] = ['granos', 'verdura', 'proteina', 'aseo'];

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(n);

type Pagina = 'inventario' | 'gastos' | 'presupuesto' | 'historial';

export default function App() {
  const { usuario, logout, loading: authLoading } = useAuth();
  const [pagina, setPagina] = useState<Pagina>('inventario');
  const [modal, setModal] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<Categoria | 'todas'>('todas');

  const {
    productos, agotados, loading, error,
    cargar, totalInventario, totalAgotados,
  } = useProductos();

  const totalAgotadosFixed = isNaN(totalAgotados) ? 0 : totalAgotados;

  const productosFiltrados = productos.filter(p => {
    const coincideNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = filtroCategoria === 'todas' || p.categoria === filtroCategoria;
    return coincideNombre && coincideCategoria;
  });

  if (authLoading) return (
    <div style={styles.centrado}>
      <div style={styles.spinner} />
    </div>
  );

  if (!usuario) return <PaginaLogin />;

  if (loading) return (
    <div style={styles.centrado}>
      <div style={styles.spinner} />
      <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Cargando inventario...</p>
    </div>
  );

  if (error) return (
    <div style={styles.centrado}>
      <AlertTriangle size={48} color="#ef4444" />
      <h2 style={{ color: 'var(--text-primary)' }}>Error de conexión</h2>
      <p style={{ color: 'var(--text-muted)' }}>
        Asegúrate de que el backend esté corriendo en el puerto 3001
      </p>
      <button style={styles.btnPrimario} onClick={cargar}>Reintentar</button>
    </div>
  );

  return (
    <Layout
      paginaActual={pagina}
      onNavegar={setPagina}
      usuario={usuario}
      onLogout={logout}
    >
      {/* ── INVENTARIO ── */}
      {pagina === 'inventario' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>

          {/* TITULO */}
          <div style={styles.topBar}>
            <div>
              <h1 style={styles.titulo}>Inventario</h1>
              <p style={styles.subtitulo}>{productos.length} productos registrados</p>
            </div>
            <div style={styles.topAcciones}>
              <PanelAgotados agotados={agotados} total={totalAgotadosFixed} />
              <button style={styles.btnPrimario} onClick={() => setModal(true)}>
                <Plus size={16} />
                Agregar
              </button>
            </div>
          </div>

          {/* CARDS RESUMEN */}
          <div style={styles.gridResumen}>
            <div style={styles.cardResumen}>
              <div style={{ ...styles.cardResumenIcono, background: '#f1f0fe' }}>
                <Package size={20} color="#6366f1" />
              </div>
              <div>
                <div style={styles.cardResumenLabel}>Valor inventario</div>
                <div style={styles.cardResumenValor}>{formatCOP(totalInventario)}</div>
              </div>
            </div>
            <div style={styles.cardResumen}>
              <div style={{ ...styles.cardResumenIcono, background: '#fef2f2' }}>
                <AlertTriangle size={20} color="#ef4444" />
              </div>
              <div>
                <div style={styles.cardResumenLabel}>Costo reposición</div>
                <div style={{ ...styles.cardResumenValor, color: '#ef4444' }}>
                  {formatCOP(totalAgotadosFixed)}
                </div>
              </div>
            </div>
            <div style={styles.cardResumen}>
              <div style={{ ...styles.cardResumenIcono, background: '#f0fdf4' }}>
                <FileText size={20} color="#10b981" />
              </div>
              <div>
                <div style={styles.cardResumenLabel}>Productos agotados</div>
                <div style={{ ...styles.cardResumenValor, color: '#10b981' }}>
                  {agotados.length}
                </div>
              </div>
            </div>
          </div>

          {/* BOTON PDF */}
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              style={styles.btnSecundario}
              onClick={() => generarPDFInventario(productos, totalInventario)}
            >
              <FileText size={16} />
              Descargar PDF inventario
            </button>
          </div>

          {/* BUSQUEDA Y FILTROS */}
          <div style={styles.barraBusqueda}>
            <div style={styles.inputBusquedaBox}>
              <Search size={16} color="#94a3b8" />
              <input
                style={styles.inputBusqueda}
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <button style={styles.btnLimpiar} onClick={() => setBusqueda('')}>
                  <X size={14} />
                </button>
              )}
            </div>
            <div style={styles.filtrosCat}>
              {(['todas', ...CATEGORIAS] as const).map(cat => (
                <button
                  key={cat}
                  style={{
                    ...styles.filtroCat,
                    ...(filtroCategoria === cat ? styles.filtroCatActivo : {}),
                  }}
                  onClick={() => setFiltroCategoria(cat)}
                >
                  {cat === 'todas' ? 'Todas' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* SECCIONES */}
          {productosFiltrados.length === 0 && busqueda ? (
            <div style={styles.sinResultados}>
              <Search size={36} color="#cbd5e1" />
              <p style={{ color: 'var(--text-muted)' }}>
                No se encontraron productos con "<strong>{busqueda}</strong>"
              </p>
              <button style={styles.btnLimpiarBusqueda} onClick={() => setBusqueda('')}>
                Limpiar búsqueda
              </button>
            </div>
          ) : (
            CATEGORIAS
              .filter(cat => filtroCategoria === 'todas' || filtroCategoria === cat)
              .map(cat => (
                <SeccionCategoria
                  key={cat}
                  categoria={cat}
                  productos={productosFiltrados.filter(p => p.categoria === cat)}
                  onCambio={cargar}
                />
              ))
          )}
        </div>
      )}

      {/* ── GASTOS ── */}
      {pagina === 'gastos' && <PaginaGastos />}

      {/* ── PRESUPUESTO ── */}
      {pagina === 'presupuesto' && <PaginaPresupuesto />}

      {/* ── HISTORIAL ── */}
      {pagina === 'historial' && <PaginaHistorial />}

      {/* MODAL */}
      {modal && (
        <ProductoForm
          onGuardado={() => { cargar(); setModal(false); }}
          onCancelar={() => setModal(false)}
        />
      )}
    </Layout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  centrado: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '1rem', textAlign: 'center', padding: '2rem',
    background: 'var(--bg)',
  },
  spinner: {
    width: '44px', height: '44px',
    border: '4px solid var(--border)', borderTopColor: '#6366f1',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  },
  topBar: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '1.5rem',
    flexWrap: 'wrap', gap: '1rem',
  },
  titulo: { fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 },
  subtitulo: { fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' },
  topAcciones: { display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' },
  gridResumen: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem', marginBottom: '1.5rem',
  },
  cardResumen: {
    background: 'var(--bg-card)', borderRadius: '14px', padding: '1.25rem',
    border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem',
    transition: 'background 0.3s ease',
  },
  cardResumenIcono: {
    width: '44px', height: '44px', borderRadius: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardResumenLabel: { fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', fontWeight: 600 },
  cardResumenValor: { fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' },
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
  barraBusqueda: {
    marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
  },
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
  filtrosCat: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  filtroCat: {
    padding: '0.4rem 0.9rem', borderRadius: '99px',
    border: '1.5px solid var(--border)', background: 'var(--bg-card)',
    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
    color: 'var(--text-secondary)', fontFamily: 'inherit',
  },
  filtroCatActivo: {
    background: '#6366f1', color: 'white', borderColor: '#6366f1',
  },
  sinResultados: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '0.75rem', padding: '3rem', background: 'var(--bg-card)',
    borderRadius: '14px', border: '1px solid var(--border)', textAlign: 'center',
  },
  btnLimpiarBusqueda: {
    background: '#6366f1', color: 'white', border: 'none',
    padding: '0.6rem 1.25rem', borderRadius: '8px',
    cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit',
  },
};