import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useContext } from 'react';
import type { Usuario } from '../interfaces/usuario'; // <-- RUTA A TU ARCHIVO
import { loadUsuario, saveUsuario } from '../utils/storage'; // <-- RUTA A TU ARCHIVO

interface AuthContextType {
  usuario: Usuario | null;
  login: (usuario: Usuario) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => loadUsuario());

  useEffect(() => {
    saveUsuario(usuario);
  }, [usuario]);

  const login = (usuario: Usuario) => setUsuario(usuario);
  
  const logout = () => {
    setUsuario(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};