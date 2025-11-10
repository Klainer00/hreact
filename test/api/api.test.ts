// test/utils/api.test.ts

import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { fetchUsuarios } from '../../src/utils/api';
import { RolUsuario } from '../../src/interfaces/rolUsuario';

const mockDataUsuarios = {
  usuarios: [
    { id: 1, nombre: 'Juan', rol: RolUsuario.Cliente, email: 'juan@test.cl' },
    { id: 2, nombre: 'Ana', rol: RolUsuario.Vendedor, email: 'ana@test.cl' }
  ]
};

describe('API', () => {
  it('performs basic test', () => {
    expect(true).toBe(true);
  });
});

describe('Pruebas de las utilidades de API (api.ts)', () => {

  beforeEach(() => {
    vi.spyOn(window, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDataUsuarios),
      } as Response)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks(); 
  });

  it('fetchUsuarios debe retornar una lista de usuarios mockeada', async () => {
    const usuarios = await fetchUsuarios();

    expect(window.fetch).toHaveBeenCalledWith('/data/usuarios.json');
    expect(usuarios.length).toBe(2);
    expect(usuarios[0].nombre).toBe('Juan');
  });
});