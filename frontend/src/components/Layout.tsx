import { useState } from 'react';
import { ShoppingCart, Wallet, Menu, X, LogOut, Sun, Moon, Clock, Home } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  paginaActual: 'inventario' | 'gastos' | 'presupuesto' | 'historial';
  onNavegar: (pagina: 'inventario' | 'gastos' | 'presupuesto' | 'historial') => void;
  usuario: { nombre: string; email: string };
  onLogout: () => void;
  children: React.ReactNode;
}

const NAV = [
  { id: 'inventario',  label: 'Inventario',  icon: Home },
  { id: 'gastos',      label: 'Gastos',       icon: ShoppingCart },
  { id: 'presupuesto', label: 'Presupuesto',  icon: Wallet },
  { id: 'historial',   label: 'Historial',    icon: Clock },
] as const;

export function Layout({ paginaActual, onNavegar, usuario, onLogout, children }: Props) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { oscuro, toggleTema } = useTheme();

  const iniciales = usuario.nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* SIDEBAR DESKTOP */}
      <aside style={{
        width: '220px', background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        padding: '1.5rem 1rem',
        display: 'flex', flexDirection: 'column', gap: '1.5rem',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
        transition: 'background 0.3s ease',
      }}>

        {/* LOGO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem' }}>
          <img
            src="/logo.png"
            alt="FinanzasHogar"
            style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, objectFit: 'contain' }}
          />
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              FinanzasHogar
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Tu control financiero
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => onNavegar(id)} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.75rem 1rem', borderRadius: '10px', border: 'none',
              background: paginaActual === id ? 'rgba(99,102,241,0.12)' : 'transparent',
              color: paginaActual === id ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
              fontFamily: 'inherit', textAlign: 'left', width: '100%',
              transition: 'all 0.15s',
            }}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* BOTON TEMA */}
        <button onClick={toggleTema} style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem 1rem', borderRadius: '10px', border: 'none',
          background: 'transparent', color: 'var(--text-secondary)',
          cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600,
          fontFamily: 'inherit', width: '100%',
        }}>
          {oscuro ? <Sun size={18} /> : <Moon size={18} />}
          <span>{oscuro ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>

        {/* PERFIL */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.75rem', background: 'var(--hover)',
          borderRadius: '12px', border: '1px solid var(--border)',
        }}>
          <div style={{
            width: '36px', height: '36px', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            borderRadius: '10px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '0.82rem', fontWeight: 700,
          }}>
            {iniciales}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '0.85rem', fontWeight: 700,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {usuario.nombre}
            </div>
            <div style={{
              fontSize: '0.72rem', color: 'var(--text-muted)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {usuario.email}
            </div>
          </div>
          <button onClick={onLogout} title="Cerrar sesión" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', display: 'flex',
            alignItems: 'center', padding: '0.25rem',
            borderRadius: '6px', flexShrink: 0,
          }}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* HEADER MOBILE */}
      <header className="mobile-header" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border)',
        padding: '0.85rem 1.25rem',
        justifyContent: 'space-between', alignItems: 'center',
        transition: 'background 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <img
            src="/logo.png"
            alt="FinanzasHogar"
            style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'contain' }}
          />
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            FinanzasHogar
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={toggleTema} style={{
            background: 'var(--hover)', border: 'none',
            borderRadius: '8px', cursor: 'pointer',
            color: 'var(--text-secondary)', display: 'flex',
            alignItems: 'center', padding: '0.4rem',
          }}>
            {oscuro ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div style={{
            width: '32px', height: '32px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            borderRadius: '8px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '0.75rem', fontWeight: 700,
          }}>
            {iniciales}
          </div>
          <button onClick={() => setMenuAbierto(!menuAbierto)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
          }}>
            {menuAbierto ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* MENU MOBILE */}
      {menuAbierto && (
        <div style={{
          position: 'fixed', top: '61px', left: 0, right: 0,
          background: 'var(--bg-sidebar)',
          borderBottom: '1px solid var(--border)',
          zIndex: 150, padding: '0.75rem',
          display: 'flex', flexDirection: 'column', gap: '0.25rem',
        }}>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { onNavegar(id); setMenuAbierto(false); }} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.85rem 1rem', borderRadius: '10px', border: 'none',
              background: paginaActual === id ? 'rgba(99,102,241,0.12)' : 'transparent',
              color: paginaActual === id ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600,
              fontFamily: 'inherit',
            }}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
            <button onClick={toggleTema} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.85rem 1rem', borderRadius: '10px', border: 'none',
              background: 'transparent', color: 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600,
              fontFamily: 'inherit', width: '100%',
            }}>
              {oscuro ? <Sun size={18} /> : <Moon size={18} />}
              <span>{oscuro ? 'Modo claro' : 'Modo oscuro'}</span>
            </button>
            <button onClick={onLogout} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.85rem 1rem', borderRadius: '10px', border: 'none',
              background: 'transparent', color: '#ef4444',
              cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600,
              fontFamily: 'inherit', width: '100%',
            }}>
              <LogOut size={18} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* CONTENIDO */}
      <main style={{
        marginLeft: '220px', flex: 1,
        padding: '2rem', paddingBottom: '2rem',
        transition: 'background 0.3s ease',
      }}>
        {children}
      </main>

      {/* BOTTOM NAV MOBILE */}
      <nav className="bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg-sidebar)',
        borderTop: '1px solid var(--border)',
        zIndex: 100, justifyContent: 'space-around', padding: '0.5rem 0',
        transition: 'background 0.3s ease',
      }}>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => onNavegar(id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '0.2rem', padding: '0.5rem 0.75rem', border: 'none',
            background: 'transparent',
            color: paginaActual === id ? 'var(--accent)' : 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <Icon size={20} />
            <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{label}</span>
          </button>
        ))}
        <button onClick={onLogout} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '0.2rem', padding: '0.5rem 0.75rem', border: 'none',
          background: 'transparent', color: '#ef4444',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <LogOut size={20} />
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Salir</span>
        </button>
      </nav>
    </div>
  );
}