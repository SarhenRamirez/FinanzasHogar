import { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Edit3, Check } from 'lucide-react';
import { useGastos } from '../hooks/useGastos';
import { presupuestoApi } from '../services/api';

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(n);

export function PaginaPresupuesto() {
  const {
    presupuesto, mes, anio, setMes, setAnio,
    cargar, totalGastos, disponible, porcentajeUsado,
  } = useGastos();

  const [editando, setEditando] = useState(false);
  const [nuevoMonto, setNuevoMonto] = useState(0);
  const [guardando, setGuardando] = useState(false);

  const handleEditar = () => {
    setNuevoMonto(Number(presupuesto.monto));
    setEditando(true);
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await presupuestoApi.save({ mes, anio, monto: nuevoMonto });
      setEditando(false);
      cargar();
    } finally {
      setGuardando(false);
    }
  };

  const colorDisponible = disponible < 0 ? '#ef4444' : disponible < Number(presupuesto.monto) * 0.2 ? '#f59e0b' : '#10b981';
  const colorBarra = porcentajeUsado > 90 ? '#ef4444' : porcentajeUsado > 70 ? '#f59e0b' : '#6366f1';

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>

      {/* TITULO */}
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.titulo}>Presupuesto</h1>
          <p style={styles.subtitulo}>Planifica tus gastos mensuales</p>
        </div>
      </div>

      {/* FILTRO MES */}
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

      {/* CARD PRESUPUESTO */}
      <div style={styles.cardPresupuesto}>
        <div style={styles.cardHeader}>
          <div style={styles.cardIcono}>
            <Wallet size={22} color="#6366f1" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={styles.cardLabel}>
              Presupuesto de {MESES[mes - 1]} {anio}
            </div>
            {editando ? (
              <div style={styles.editRow}>
                <input
                  style={styles.inputPresupuesto}
                  type="number"
                  min="0"
                  value={nuevoMonto}
                  onChange={e => setNuevoMonto(Number(e.target.value))}
                  autoFocus
                />
                <button style={styles.btnGuardar} onClick={handleGuardar} disabled={guardando}>
                  <Check size={16} />
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            ) : (
              <div style={styles.montoRow}>
                <span style={styles.montoValor}>{formatCOP(Number(presupuesto.monto))}</span>
                <button style={styles.btnEditar} onClick={handleEditar}>
                  <Edit3 size={15} />
                  Editar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BARRA DE PROGRESO */}
        <div style={styles.barraBox}>
          <div style={styles.barraLabel}>
            <span>Usado: {porcentajeUsado.toFixed(0)}%</span>
            <span>{formatCOP(totalGastos)} de {formatCOP(Number(presupuesto.monto))}</span>
          </div>
          <div style={styles.barra}>
            <div style={{
              ...styles.barraFill,
              width: `${porcentajeUsado}%`,
              background: colorBarra,
            }} />
          </div>
        </div>
      </div>

      {/* CARDS RESUMEN */}
      <div style={styles.gridCards}>
        <div style={styles.card}>
          <div style={{ ...styles.cardIconoSmall, background: '#f1f0fe' }}>
            <TrendingDown size={18} color="#6366f1" />
          </div>
          <div style={styles.cardSmallLabel}>Total gastado</div>
          <div style={styles.cardSmallValor}>{formatCOP(totalGastos)}</div>
        </div>

        <div style={styles.card}>
          <div style={{
            ...styles.cardIconoSmall,
            background: disponible < 0 ? '#fef2f2' : '#f0fdf4',
          }}>
            <TrendingUp size={18} color={colorDisponible} />
          </div>
          <div style={styles.cardSmallLabel}>
            {disponible < 0 ? 'Excedido' : 'Disponible'}
          </div>
          <div style={{ ...styles.cardSmallValor, color: colorDisponible }}>
            {formatCOP(Math.abs(disponible))}
          </div>
        </div>
      </div>

      {/* ALERTA SI SE EXCEDE */}
      {disponible < 0 && (
        <div style={styles.alerta}>
          <TrendingDown size={18} color="#ef4444" />
          <span>
            Has excedido tu presupuesto por <strong>{formatCOP(Math.abs(disponible))}</strong>.
            Considera revisar tus gastos.
          </span>
        </div>
      )}

      {/* CONSEJO SI QUEDA POCO */}
      {disponible >= 0 && disponible < Number(presupuesto.monto) * 0.2 && presupuesto.monto > 0 && (
        <div style={styles.alertaWarning}>
          <TrendingUp size={18} color="#f59e0b" />
          <span>
            Solo te queda el <strong>{((disponible / Number(presupuesto.monto)) * 100).toFixed(0)}%</strong> del presupuesto.
            Administra bien lo que queda.
          </span>
        </div>
      )}

      {/* TIPS */}
      {presupuesto.monto === 0 && (
        <div style={styles.cardVacio}>
          <Wallet size={40} color="#cbd5e1" />
          <p style={{ color: '#94a3b8', textAlign: 'center' }}>
            Aún no has definido un presupuesto para {MESES[mes - 1]}.
            <br />Haz clic en <strong>Editar</strong> para establecer uno.
          </p>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  topBar: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '1.5rem',
  },
  titulo: { fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 },
  subtitulo: { fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' },
  filtros: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  select: {
    padding: '0.6rem 1rem', border: '1.5px solid var(--border)',
    borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'inherit',
    background: 'var(--bg-card)', color: 'var(--text-primary)',
    cursor: 'pointer', outline: 'none',
  },
  cardPresupuesto: {
    background: 'var(--bg-card)', borderRadius: '16px', padding: '1.5rem',
    border: '1px solid var(--border)', marginBottom: '1.25rem',
    transition: 'background 0.3s ease',
  },
  cardHeader: { display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' },
  cardIcono: {
    width: '48px', height: '48px', background: '#f1f0fe',
    borderRadius: '12px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  cardLabel: { fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' },
  editRow: { display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' },
  inputPresupuesto: {
    padding: '0.6rem 0.9rem', border: '2px solid #6366f1',
    borderRadius: '8px', fontSize: '1.1rem', fontWeight: 700,
    fontFamily: 'inherit', outline: 'none',
    color: 'var(--text-primary)', background: 'var(--bg-input)', width: '200px',
  },
  btnGuardar: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    background: '#6366f1', color: 'white', border: 'none',
    padding: '0.6rem 1rem', borderRadius: '8px',
    cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', fontSize: '0.9rem',
  },
  montoRow: { display: 'flex', alignItems: 'center', gap: '1rem' },
  montoValor: { fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' },
  btnEditar: {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    background: 'var(--hover)', border: '1.5px solid var(--border)',
    padding: '0.4rem 0.85rem', borderRadius: '8px',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
    color: 'var(--text-secondary)', fontFamily: 'inherit',
  },
  barraBox: { marginTop: '0.5rem' },
  barraLabel: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem',
  },
  barra: {
    height: '10px', background: 'var(--border)',
    borderRadius: '99px', overflow: 'hidden',
  },
  barraFill: {
    height: '100%', borderRadius: '99px', transition: 'width 0.5s ease',
  },
  gridCards: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '1rem', marginBottom: '1.25rem',
  },
  card: {
    background: 'var(--bg-card)', borderRadius: '14px', padding: '1.25rem',
    border: '1px solid var(--border)', transition: 'background 0.3s ease',
  },
  cardIconoSmall: {
    width: '40px', height: '40px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  cardSmallLabel: { fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 600 },
  cardSmallValor: { fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' },
  alerta: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    background: '#fef2f2', border: '1px solid #fecaca',
    borderRadius: '12px', padding: '1rem 1.25rem',
    color: '#dc2626', fontSize: '0.9rem', marginBottom: '1rem',
  },
  alertaWarning: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    background: '#fffbeb', border: '1px solid #fde68a',
    borderRadius: '12px', padding: '1rem 1.25rem',
    color: '#92400e', fontSize: '0.9rem', marginBottom: '1rem',
  },
  cardVacio: {
    background: 'var(--bg-card)', borderRadius: '14px', padding: '3rem',
    border: '1px solid var(--border)', display: 'flex',
    flexDirection: 'column', alignItems: 'center', gap: '1rem',
    transition: 'background 0.3s ease',
  },
};