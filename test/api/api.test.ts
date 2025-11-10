import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
// Las rutas ahora suben dos niveles (../..) para entrar a src/
import { fetchUsuarios } from '../../src/utils/api';
import { RolUsuario } from '../../src/interfaces/rolUsuario';

// Mock de datos
const mockDataUsuarios = {
  usuarios: [
    { id: 1, nombre: 'Juan', rol: RolUsuario.Cliente, email: 'juan@test.cl' },
    { id: 2, nombre: 'Ana', rol: RolUsuario.Vendedor, email: 'ana@test.cl' }
  ]
};

describe('Pruebas de las utilidades de API (api.ts)', () => {

  beforeEach(() => {
    // Interceptamos fetch
    vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDataUsuarios),
      } as Response)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Limpiamos mocks
  });

  it('fetchUsuarios debe retornar una lista de usuarios mockeada', async () => {
    // Act
    const usuarios = await fetchUsuarios();

    // Assert
    expect(global.fetch).toHaveBeenCalledWith('/data/usuarios.json');
    expect(usuarios.length).toBe(2);
    expect(usuarios[0].nombre).toBe('Juan');
  });
});