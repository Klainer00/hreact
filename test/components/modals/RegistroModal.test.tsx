// test/components/modals/RegistroModal.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Swal from 'sweetalert2';

import RegistroModal from '../../../src/components/modals/RegistroModal';

// --- Mocks ---
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

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

// Mock de LocalStorage
let store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => {
    store[key] = value.toString();
  },
  clear: () => {
    store = {};
  }
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});


// --- Pruebas ---

describe('Pruebas del componente RegistroModal', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    store = {}; 
    cleanup(); 
  });

  it('debe renderizar los campos del formulario', () => {

    render(<RegistroModal />);

    expect(screen.getByLabelText('RUT')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('debe registrar un usuario exitosamente si el formulario es válido', async () => {
    const user = userEvent.setup();
    localStorage.setItem('usuarios', '[]');

    render(<RegistroModal />);

    const botonRegistro = screen.getByRole('button', { name: /Registrarse/i });

    await user.type(screen.getByLabelText('RUT'), '14479742-K'); // RUT Válido
    await user.type(screen.getByLabelText('Nombre'), 'Brian');
    await user.type(screen.getByLabelText('Apellido'), 'Prueba');
    await user.type(screen.getByLabelText('Email'), 'test@gmail.com');
    await user.type(screen.getByLabelText('Contraseña'), '12345');
    await user.type(screen.getByLabelText('Confirmar Contraseña'), '12345');
    
    const fechaInput = screen.getByLabelText('Fecha de Nacimiento');
    fireEvent.change(fechaInput, { target: { value: '2000-01-01' } });

    await user.type(screen.getByLabelText('Dirección'), 'Calle Falsa 123');
    await user.selectOptions(screen.getByLabelText('Región'), 'Biobío');
    await user.selectOptions(await screen.findByLabelText('Comuna'), 'Concepción');

    expect(botonRegistro).toBeEnabled();
    await user.click(botonRegistro);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    const usuariosEnStorage = JSON.parse(store['usuarios']);
    expect(usuariosEnStorage).toHaveLength(1);
    expect(usuariosEnStorage[0].email).toBe('test@gmail.com');
  });

  it('debe mostrar un error si el email ya está registrado', async () => {
    const user = userEvent.setup();
    const usuarioExistente = [{ email: 'test@gmail.com' }];
    localStorage.setItem('usuarios', JSON.stringify(usuarioExistente));

    render(<RegistroModal />);

    await user.type(screen.getByLabelText('RUT'), '14479742-K');
    await user.type(screen.getByLabelText('Nombre'), 'Brian');
    await user.type(screen.getByLabelText('Apellido'), 'Prueba');
    await user.type(screen.getByLabelText('Email'), 'test@gmail.com'); // Duplicado
    await user.type(screen.getByLabelText('Contraseña'), '12345');
    await user.type(screen.getByLabelText('Confirmar Contraseña'), '12345');
    
    const fechaInput = screen.getByLabelText('Fecha de Nacimiento');
    fireEvent.change(fechaInput, { target: { value: '2000-01-01' } });

    await user.type(screen.getByLabelText('Dirección'), 'Calle Falsa 123');
    await user.selectOptions(screen.getByLabelText('Región'), 'Biobío');
    await user.selectOptions(await screen.findByLabelText('Comuna'), 'Concepción');

    await user.click(screen.getByRole('button', { name: /Registrarse/i }));

    await waitFor(() => {
      expect(Swal.fire).toHaveBeenCalledWith(
        "Error", 
        "El Email ingresado ya se encuentra registrado.", 
        "error"
      );
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

});