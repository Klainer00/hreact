import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/context/AuthProvider';
import { RolUsuario } from '../../src/interfaces/rolUsuario';

// Componente de prueba para usar el contexto
const TestComponent = () => {
  const { usuario, login, logout, isAuthenticated } = useAuth();
  
  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="usuario-nombre">{usuario?.nombre || 'No usuario'}</div>
      <div data-testid="usuario-rol">{usuario?.rol || 'No rol'}</div>
      <button 
        data-testid="login-btn" 
        onClick={() => login({ 
          id: 1, 
          nombre: 'Juan Test', 
          email: 'juan@test.cl',
          password: '123456',
          rol: RolUsuario.Cliente,
          telefono: '123456789',
          direccion: 'Test 123',
          region: 'RM',
          comuna: 'Santiago',
          rut: '11111111-1'
        })}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

// Mock de localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Pruebas de AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('debe inicializar con estado sin autenticar', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('usuario-nombre')).toHaveTextContent('No usuario');
    expect(screen.getByTestId('usuario-rol')).toHaveTextContent('No rol');
  });

  it('debe permitir hacer login', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('usuario-nombre')).toHaveTextContent('Juan Test');
    expect(screen.getByTestId('usuario-rol')).toHaveTextContent('Cliente');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('usuarioLogueado', expect.any(String));
  });

  it('debe permitir hacer logout', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Primero hacer login
    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    // Luego hacer logout
    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('usuario-nombre')).toHaveTextContent('No usuario');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('usuarioLogueado');
  });

  it('debe cargar usuario desde localStorage al inicializar', () => {
    const usuarioGuardado = {
      id: 2,
      nombre: 'Ana Test',
      email: 'ana@test.cl',
      password: '123456',
      rol: RolUsuario.Admin,
      telefono: '987654321',
      direccion: 'Admin 456',
      region: 'RM',
      comuna: 'Providencia',
      rut: '22222222-2'
    };

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(usuarioGuardado));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('usuario-nombre')).toHaveTextContent('Ana Test');
    expect(screen.getByTestId('usuario-rol')).toHaveTextContent('Administrador');
  });

  it('debe manejar datos corruptos en localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('datos-corruptos');
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});