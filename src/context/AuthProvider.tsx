import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useContext } from 'react';
import type { Usuario } from '../interfaces/usuario'; 
import { loadUsuario, saveUsuario, removeUsuario } from '../utils/storage';

interface AuthContextType {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (usuario: Usuario) => void;
  logout: () => void;
  updateUsuario: (usuario: Usuario) => void;
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
    removeUsuario();
    // Redirigir al inicio
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const updateUsuario = (usuarioActualizado: Usuario) => {
    setUsuario(usuarioActualizado);
  };

  const isAuthenticated = usuario !== null;

  return (
    <AuthContext.Provider value={{ usuario, isAuthenticated, login, logout, updateUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};