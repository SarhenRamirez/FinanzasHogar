import { useState } from 'react';
import { AlertTriangle, FileText, X } from 'lucide-react';
import type { Producto } from '../types';
import { generarPDFAgotados } from '../utils/pdf';

interface Props {
  agotados: Producto[];
  total: number;
}

const formatCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0,
  }).format(n);

export function PanelAgotados({ agotados, total }: Props) {
  const [abierto, setAbierto] = useState(false);

  if (agotados.length === 0) return null;

  return (
    <>
      <button style={styles.btnAgotados} onClick={() => setAbierto(true)}>
        <AlertTriangle size={15} />
        {agotados.length} por acabarse
      </button>

      {abierto && (
        <div style={styles.overlay} onClick={() => setAbierto(false)}>
          <div style={styles.panel} onClick={e => e.stopPropagation()}>

            {/* HEADER */}
            <div style={styles.header}>
              <div style={styles.headerLeft}>
                <div style={styles.headerIcono}>
                  <AlertTriangle size={20} color="#ef4444" />
                </div>
                <div>
                  <h2 style={styles.headerTitulo}>Productos por acabarse</h2>
                  <p style={styles.headerSub}>Debes reponer estos productos pronto</p>
                </div>
              </div>
              <button style={styles.btnCerrar} onClick={() => setAbierto(false)}>
                <X size={18} />
              </button>
            </div>

            {/* LISTA */}
            <div style={styles.lista}>
              {agotados.map(p => (
                <div key={p.id} style={styles.item}>
                  <div style={styles.itemInfo}>
                    <div style={styles.itemNombre}>{p.nombre}</div>
                    <div style={styles.itemMeta}>
                      <span style={styles.itemCategoria}>{p.categoria}</span>
                      <span style={styles.itemStock}>
                        Queda: {p.cantidad} {p.unidad}
                      </span>
                    </div>
                  </div>
                  <div style={styles.itemPrecio}>
                    {formatCOP(p.precio)}
                  </div>
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div style={styles.footer}>
              <div>
                <div style={styles.footerLabel}>Costo de reposición</div>
                <div style={styles.footerValor}>{formatCOP(total)}</div>
              </div>
              <button
                style={styles.btnPDF}
                onClick={() => generarPDFAgotados(agotados, total)}
              >
                <FileText size={15} />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  btnAgotados: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: '#fef2f2', color: '#ef4444',
    border: '1.5px solid #fecaca',
    padding: '0.65rem 1.1rem', borderRadius: '10px',
    cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
    fontFamily: 'inherit',
  },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  },
  panel: {
    background: 'white', borderRadius: '16px',
    width: '100%', maxWidth: '480px', maxHeight: '80vh',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  header: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  headerLeft: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem' },
  headerIcono: {
    width: '40px', height: '40px', background: '#fef2f2',
    borderRadius: '10px', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  headerTitulo: { margin: '0 0 0.2rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b' },
  headerSub: { margin: 0, fontSize: '0.8rem', color: '#94a3b8' },
  btnCerrar: {
    background: '#f8fafc', border: '1px solid #e2e8f0',
    borderRadius: '8px', cursor: 'pointer', color: '#64748b',
    width: '32px', height: '32px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  lista: {
    flex: 1, overflowY: 'auto', padding: '1rem 1.5rem',
    display: 'flex', flexDirection: 'column', gap: '0.5rem',
  },
  item: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.85rem 1rem', background: '#f8fafc',
    border: '1px solid #e2e8f0', borderRadius: '10px',
  },
  itemInfo: { flex: 1 },
  itemNombre: { fontSize: '0.9rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' },
  itemMeta: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  itemCategoria: {
    fontSize: '0.72rem', color: '#6366f1', fontWeight: 600,
    background: '#f1f0fe', padding: '0.1rem 0.5rem', borderRadius: '99px',
    textTransform: 'capitalize',
  },
  itemStock: { fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 },
  itemPrecio: { fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginLeft: '1rem' },
  footer: {
    padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  footerLabel: { fontSize: '0.8rem', color: '#64748b', marginBottom: '0.2rem', fontWeight: 600 },
  footerValor: { fontSize: '1.3rem', fontWeight: 800, color: '#ef4444' },
  btnPDF: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: '#1e293b', color: 'white', border: 'none',
    padding: '0.7rem 1.1rem', borderRadius: '10px',
    cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'inherit',
  },
};