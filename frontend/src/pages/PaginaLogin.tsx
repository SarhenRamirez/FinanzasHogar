import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {  Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

type Modo = 'login' | 'registro';

export function PaginaLogin() {
  const { login, registro } = useAuth();
  const [modo, setModo] = useState<Modo>('login');
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [verPassword, setVerPassword] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!form.email || !form.password) {
      setError('Completa todos los campos');
      return;
    }
    if (modo === 'registro' && !form.nombre) {
      setError('El nombre es requerido');
      return;
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCargando(true);
    try {
      if (modo === 'login') {
        await login(form.email, form.password);
      } else {
        await registro(form.nombre, form.email, form.password);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  const set = (key: string, value: string) =>
    setForm(p => ({ ...p, [key]: value }));

  return (
    <div style={styles.root}>
      <div style={styles.card}>

        {/* LOGO */}
<div style={styles.logoBox}>
  <img
    src="/logo.png"
    alt="FinanzasHogar"
    style={{ width: '72px', height: '72px', borderRadius: '16px', marginBottom: '0.5rem' }}
  />
  <h1 style={styles.logoTitulo}>FinanzasHogar</h1>
  <p style={styles.logoSub}>Tu control financiero del hogar</p>
</div>

        {/* TOGGLE LOGIN / REGISTRO */}
        <div style={styles.toggle}>
          <button
            style={{ ...styles.toggleBtn, ...(modo === 'login' ? styles.toggleActivo : {}) }}
            onClick={() => { setModo('login'); setError(''); }}
          >
            Iniciar sesión
          </button>
          <button
            style={{ ...styles.toggleBtn, ...(modo === 'registro' ? styles.toggleActivo : {}) }}
            onClick={() => { setModo('registro'); setError(''); }}
          >
            Registrarse
          </button>
        </div>

        {/* FORMULARIO */}
        <div style={styles.form}>
          {modo === 'registro' && (
            <div style={styles.campo}>
              <label style={styles.label}>Nombre completo</label>
              <div style={styles.inputBox}>
                <User size={16} color="#94a3b8" />
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Tu nombre"
                  value={form.nombre}
                  onChange={e => set('nombre', e.target.value)}
                />
              </div>
            </div>
          )}

          <div style={styles.campo}>
            <label style={styles.label}>Correo electrónico</label>
            <div style={styles.inputBox}>
              <Mail size={16} color="#94a3b8" />
              <input
                style={styles.input}
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          <div style={styles.campo}>
            <label style={styles.label}>Contraseña</label>
            <div style={styles.inputBox}>
              <Lock size={16} color="#94a3b8" />
              <input
                style={styles.input}
                type={verPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button style={styles.btnOjo} onClick={() => setVerPassword(!verPassword)}>
                {verPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          <button
            style={{ ...styles.btnSubmit, opacity: cargando ? 0.7 : 1 }}
            onClick={handleSubmit}
            disabled={cargando}
          >
            {cargando
              ? 'Cargando...'
              : modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'
            }
          </button>
        </div>

        <p style={styles.footer}>
          {modo === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button
            style={styles.btnLink}
            onClick={() => { setModo(modo === 'login' ? 'registro' : 'login'); setError(''); }}
          >
            {modo === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)',
    padding: '1rem',
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(99,102,241,0.12)',
    border: '1px solid #e2e8f0',
  },
  logoBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '2rem',
    gap: '0.5rem',
  },
  logoIcono: {
    width: '56px',
    height: '56px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.5rem',
    boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
  },
  logoTitulo: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#1e293b',
    margin: 0,
  },
  logoSub: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    margin: 0,
  },
  toggle: {
    display: 'flex',
    background: '#f1f5f9',
    borderRadius: '12px',
    padding: '0.3rem',
    gap: '0.3rem',
    marginBottom: '1.75rem',
  },
  toggleBtn: {
    flex: 1,
    padding: '0.65rem',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  toggleActivo: {
    background: 'white',
    color: '#6366f1',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  campo: { marginBottom: '1rem' },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#475569',
    marginBottom: '0.4rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  inputBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '0.75rem 1rem',
    background: '#f8fafc',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    color: '#1e293b',
    background: 'transparent',
  },
  btnOjo: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },
  errorBox: {
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  btnSubmit: {
    width: '100%',
    padding: '0.85rem',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 700,
    fontFamily: 'inherit',
    marginTop: '0.5rem',
    boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
  },
  footer: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#94a3b8',
    marginTop: '1.5rem',
    marginBottom: 0,
  },
  btnLink: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    padding: 0,
  },
};