import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
// Las rutas ahora suben dos niveles (../..) para entrar a src/
import { fetchUsuarios, fetchAdmins, fetchProductos } from '../../src/utils/api';
import { RolUsuario } from '../../src/interfaces/rolUsuario';

// Mock de datos
const mockDataUsuarios = {
  usuarios: [
    { id: 1, nombre: 'Juan', rol: RolUsuario.Cliente, email: 'juan@test.cl', password: '123456' },
    { id: 2, nombre: 'Ana', rol: RolUsuario.Cliente, email: 'ana@test.cl', password: '123456' }
  ]
};

const mockDataAdmins = {
  admins: [
    { id: 1, nombre: 'Admin', rol: RolUsuario.Admin, email: 'admin@test.cl', password: 'admin123' },
    { id: 2, nombre: 'Vendedor', rol: RolUsuario.Vendedor, email: 'vendedor@test.cl', password: 'vendedor123' }
  ]
};

const mockDataProductos = {
  productos: [
    { id: 1, nombre: 'Manzana', precio: 1500, descripcion: 'Fruta fresca', imagen: 'manzana.png', stock: 100, categoria: 'Frutas' },
    { id: 2, nombre: 'Lechuga', precio: 800, descripcion: 'Verdura orgánica', imagen: 'lechuga.png', stock: 50, categoria: 'Verduras' }
  ]
};

describe('Pruebas de las utilidades de API (api.ts)', () => {

  beforeEach(() => {
    // Mock de fetch por defecto
    vi.spyOn(window, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDataUsuarios),
      } as Response)
    );
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Limpiamos mocks
  });

  describe('fetchUsuarios', () => {
    it('debe retornar una lista de usuarios mockeada', async () => {
      // Act
      const usuarios = await fetchUsuarios();

      // Assert
      expect(window.fetch).toHaveBeenCalledWith('/data/usuarios.json');
      expect(usuarios.length).toBe(2);
      expect(usuarios[0].nombre).toBe('Juan');
      expect(usuarios[0].rol).toBe(RolUsuario.Cliente);
    });

    it('debe manejar errores de red y retornar array vacío', async () => {
      // Arrange
      vi.spyOn(window, 'fetch').mockRejectedValue(new Error('Network error'));

      // Act
      const usuarios = await fetchUsuarios();

      // Assert
      expect(usuarios).toEqual([]);
    });

    it('debe manejar respuestas no exitosas', async () => {
      // Arrange
      vi.spyOn(window, 'fetch').mockResolvedValue({
        ok: false,
        status: 404
      } as Response);

      // Act
      const usuarios = await fetchUsuarios();

      // Assert
      expect(usuarios).toEqual([]);
    });
  });

  describe('fetchAdmins', () => {
    it('debe retornar una lista de administradores', async () => {
      // Arrange
      vi.spyOn(window, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDataAdmins),
      } as Response);

      // Act
      const admins = await fetchAdmins();

      // Assert
      expect(window.fetch).toHaveBeenCalledWith('/data/admins.json');
      expect(admins.length).toBe(2);
      expect(admins[0].rol).toBe(RolUsuario.Admin);
      expect(admins[1].rol).toBe(RolUsuario.Vendedor);
    });

    it('debe manejar errores y retornar array vacío', async () => {
      // Arrange
      vi.spyOn(window, 'fetch').mockRejectedValue(new Error('Error'));

      // Act
      const admins = await fetchAdmins();

      // Assert
      expect(admins).toEqual([]);
    });
  });

  describe('fetchProductos', () => {
    it('debe retornar una lista de productos', async () => {
      // Arrange
      vi.spyOn(window, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDataProductos),
      } as Response);

      // Act
      const productos = await fetchProductos();

      // Assert
      expect(window.fetch).toHaveBeenCalledWith('/data/productos.json');
      expect(productos.length).toBe(2);
      expect(productos[0].nombre).toBe('Manzana');
      expect(productos[1].categoria).toBe('Verduras');
    });

    it('debe manejar errores y retornar array vacío', async () => {
      // Arrange
      vi.spyOn(window, 'fetch').mockRejectedValue(new Error('Error'));

      // Act
      const productos = await fetchProductos();

      // Assert
      expect(productos).toEqual([]);
    });
  });
});