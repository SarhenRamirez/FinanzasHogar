import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  foto_url?: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  registro: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  actualizarUsuario: (u: Partial<Usuario>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = Cookies.get('token');
    const u = localStorage.getItem('usuario');
    if (t && u) { setToken(t); setUsuario(JSON.parse(u)); }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post('http://localhost:3001/api/auth/login', { email, password });
    const { token: t, usuario: u } = res.data;
    Cookies.set('token', t, { expires: 7 });
    localStorage.setItem('usuario', JSON.stringify(u));
    setToken(t); setUsuario(u);
  };

  const registro = async (nombre: string, email: string, password: string) => {
    const res = await axios.post('http://localhost:3001/api/auth/registro', { nombre, email, password });
    const { token: t, usuario: u } = res.data;
    Cookies.set('token', t, { expires: 7 });
    localStorage.setItem('usuario', JSON.stringify(u));
    setToken(t); setUsuario(u);
  };

  const logout = () => {
    Cookies.remove('token');
    localStorage.removeItem('usuario');
    setToken(null); setUsuario(null);
  };

  const actualizarUsuario = (u: Partial<Usuario>) => {
    setUsuario(prev => {
      if (!prev) return prev;
      const nuevo = { ...prev, ...u };
      localStorage.setItem('usuario', JSON.stringify(nuevo));
      return nuevo;
    });
  };

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, registro, logout, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}