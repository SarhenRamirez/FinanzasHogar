import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface ThemeContextType { oscuro: boolean; toggleTema: () => void; }
const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [oscuro, setOscuro] = useState(() => localStorage.getItem('tema') === 'oscuro');

  useEffect(() => {
    localStorage.setItem('tema', oscuro ? 'oscuro' : 'claro');
    document.documentElement.setAttribute('data-tema', oscuro ? 'oscuro' : 'claro');
  }, [oscuro]);

  return (
    <ThemeContext.Provider value={{ oscuro, toggleTema: () => setOscuro(p => !p) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return ctx;
}