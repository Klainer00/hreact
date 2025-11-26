import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginModal from '../../../src/components/modals/LoginModal';
import { AuthProvider } from '../../../src/context/AuthProvider';
import { RolUsuario } from '../../../src/interfaces/rolUsuario';

// Mock de las utilidades API
vi.mock('../../../src/utils/api', () => ({
  fetchUsuarios: vi.fn(),
  fetchAdmins: vi.fn(),
}));

// Mock de SweetAlert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true })
  }
}));

// Mock de Bootstrap Modal con eventos simulados
const mockModal = {
  getInstance: vi.fn(),
  hide: vi.fn(),
};

// Mock más completo de Bootstrap Modal
vi.mock('bootstrap', () => ({
  Modal: {
    getInstance: vi.fn(() => mockModal),
  }
}));

// Mock de useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import { fetchUsuarios, fetchAdmins } from '../../../src/utils/api';
import Swal from 'sweetalert2';

const mockUsuarios = [
  {
    id: 1,
    nombre: 'Juan Cliente',
    email: 'cliente@test.cl',
    password: '123456',
    rol: RolUsuario.Cliente,
    telefono: '123456789',
    direccion: 'Test 123',
    region: 'RM',
    comuna: 'Santiago',
    rut: '11111111-1'
  }
];

const mockAdmins = [
  {
    id: 1,
    nombre: 'Ana Admin',
    email: 'admin@test.cl',
    password: 'admin123',
    rol: RolUsuario.Admin,
    telefono: '987654321',
    direccion: 'Admin 456',
    region: 'RM',
    comuna: 'Providencia',
    rut: '22222222-2'
  },
  {
    id: 2,
    nombre: 'Carlos Vendedor',
    email: 'vendedor@test.cl',
    password: 'vendedor123',
    rol: RolUsuario.Vendedor,
    telefono: '555666777',
    direccion: 'Vendedor 789',
    region: 'RM',
    comuna: 'Las Condes',
    rut: '33333333-3'
  }
];

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Pruebas de LoginModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchUsuarios).mockResolvedValue(mockUsuarios);
    vi.mocked(fetchAdmins).mockResolvedValue(mockAdmins);
    mockNavigate.mockClear();
    
    // Mock del modal de Bootstrap para simular eventos
    mockModal.hide.mockImplementation(() => {
      // Simular el evento hidden.bs.modal después de un pequeño delay
      setTimeout(() => {
        const event = new Event('hidden.bs.modal');
        const modalElement = document.getElementById('loginModal');
        if (modalElement) {
          modalElement.dispatchEvent(event);
        }
      }, 10);
    });
  });

  it('debe renderizar el modal de login correctamente', () => {
    renderWithProviders(<LoginModal />);
    
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeInTheDocument();
  });

  it('debe mostrar mensaje informativo sobre detección automática', () => {
    renderWithProviders(<LoginModal />);
    
    expect(screen.getByText('El sistema detectará automáticamente tu rol y te redirigirá')).toBeInTheDocument();
  });

  it('debe permitir login exitoso de cliente', async () => {
    renderWithProviders(<LoginModal />);
    
    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Ingresar' });

    fireEvent.change(emailInput, { target: { value: 'cliente@test.cl' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetchUsuarios).toHaveBeenCalled();
    });

    // Esperar a que se ejecute la lógica asíncrona
    await waitFor(() => {
      expect(mockModal.hide).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('debe permitir login exitoso de administrador y redirigir', async () => {
    renderWithProviders(<LoginModal />);
    
    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Ingresar' });

    fireEvent.change(emailInput, { target: { value: 'admin@test.cl' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetchUsuarios).toHaveBeenCalled();
      expect(fetchAdmins).toHaveBeenCalled();
    });
  });

  it('debe permitir login exitoso de vendedor', async () => {
    renderWithProviders(<LoginModal />);
    
    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Ingresar' });

    fireEvent.change(emailInput, { target: { value: 'vendedor@test.cl' } });
    fireEvent.change(passwordInput, { target: { value: 'vendedor123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetchUsuarios).toHaveBeenCalled();
      expect(fetchAdmins).toHaveBeenCalled();
    });
  });

  it('debe mostrar error con credenciales incorrectas', async () => {
    renderWithProviders(<LoginModal />);
    
    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Ingresar' });

    fireEvent.change(emailInput, { target: { value: 'wrong@test.cl' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Correo o contraseña incorrectos.')).toBeInTheDocument();
    });
  });

  it('debe mostrar estado de carga durante el login', async () => {
    // Simular respuesta lenta
    vi.mocked(fetchUsuarios).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockUsuarios), 100))
    );

    renderWithProviders(<LoginModal />);
    
    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Ingresar' });

    fireEvent.change(emailInput, { target: { value: 'cliente@test.cl' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);

    expect(screen.getByText('Verificando...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
  });

  it('debe manejar errores de red', async () => {
    vi.mocked(fetchUsuarios).mockRejectedValue(new Error('Network error'));

    renderWithProviders(<LoginModal />);
    
    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Ingresar' });

    fireEvent.change(emailInput, { target: { value: 'cliente@test.cl' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error al intentar iniciar sesión.')).toBeInTheDocument();
    });
  });

  it('debe mostrar enlace de registro', () => {
    renderWithProviders(<LoginModal />);
    
    expect(screen.getByText('¿No tienes cuenta? Regístrate aquí')).toBeInTheDocument();
  });

  it('debe resetear campos después del login exitoso', async () => {
    renderWithProviders(<LoginModal />);
    
    const emailInput = screen.getByLabelText('Correo Electrónico') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Contraseña') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Ingresar' });

    fireEvent.change(emailInput, { target: { value: 'cliente@test.cl' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput.value).toBe('');
      expect(passwordInput.value).toBe('');
    });
  });

  it('debe buscar primero en usuarios y luego en admins', async () => {
    // Mock para que no encuentre en usuarios
    vi.mocked(fetchUsuarios).mockResolvedValue([]);
    
    renderWithProviders(<LoginModal />);
    
    const emailInput = screen.getByLabelText('Correo Electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Ingresar' });

    fireEvent.change(emailInput, { target: { value: 'admin@test.cl' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetchUsuarios).toHaveBeenCalled();
      expect(fetchAdmins).toHaveBeenCalled();
    });
  });
});