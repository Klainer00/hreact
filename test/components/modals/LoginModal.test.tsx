import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginModal from '../../../src/components/modals/LoginModal';
import * as Api from '../../../src/utils/api';
import { RolUsuario } from '../../../src/interfaces/rolUsuario';

// --- Mocks ---

// Mock del hook useAuth
const mockLogin = vi.fn();
vi.mock('../../../src/context/AuthProvider', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../../src/context/AuthProvider')>();
  return {
    ...mod,
    useAuth: () => ({
      usuario: null,
      login: mockLogin, 
      logout: vi.fn(),
    }),
  };
});

// Mock de los usuarios que devolverá la API
const mockUsuarios = [
  {
    id: 1,
    rut: "12345678-9",
    nombre: "Juan",
    apellido: "Pérez",
    fecha_nacimiento: "1990-05-15",
    email: "juan.perez@example.com",
    direccion: "Calle Falsa 123",
    region: "Metropolitana",
    comuna: "Santiago",
    rol: RolUsuario.Cliente,
    estado: "Activo",
    password: "password123" //
  }
];

const mockFetchUsuarios = vi.spyOn(Api, 'fetchUsuarios');


// --- Pruebas ---

describe('Pruebas del componente LoginModal', () => {

  beforeEach(() => {
    vi.clearAllMocks(); // Limpia mocks
    cleanup(); // Limpia el DOM

    mockFetchUsuarios.mockResolvedValue(mockUsuarios); 
  });

  it('debe renderizar los campos de email y contraseña', () => {
    render(<LoginModal />);
    expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ingresar/i })).toBeInTheDocument();
  });

  it('debe iniciar sesión exitosamente con credenciales correctas', async () => {
    const user = userEvent.setup();
    render(<LoginModal />);

    // Llenamos el formulario
    await user.type(screen.getByLabelText('Correo Electrónico'), 'juan.perez@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'password123');
    await user.click(screen.getByRole('button', { name: /Ingresar/i }));
    expect(mockFetchUsuarios).toHaveBeenCalled();
    expect(mockLogin).toHaveBeenCalledWith(mockUsuarios[0]);
  });

  it('debe mostrar un error con credenciales incorrectas', async () => {
    const user = userEvent.setup();
    render(<LoginModal />);

    // Llenamos el formulario con contraseña incorrecta
    await user.type(screen.getByLabelText('Correo Electrónico'), 'juan.perez@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'passwordMALO');
    
    await user.click(screen.getByRole('button', { name: /Ingresar/i }));

    // Verificamos que la API fue llamada
    expect(mockFetchUsuarios).toHaveBeenCalled();

    // Verificamos que se muestra el mensaje de error
    const errorMsg = await screen.findByText('Correo o contraseña incorrectos.');
    expect(errorMsg).toBeInTheDocument();
    
    // Verificamos que la función 'login' NUNCA fue llamada
    expect(mockLogin).not.toHaveBeenCalled();
  });

});