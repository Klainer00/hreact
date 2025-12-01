import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
// Las rutas ahora suben dos niveles (../..) para entrar a src/
import { fetchUsuarios, fetchAdmins, fetchProductos } from '../../src/utils/api';
import type { Usuario } from '../../src/interfaces/usuario';
import type { Producto } from '../../src/interfaces/producto';

// Mock de datos - Datos directos como array, no como objeto envuelto
const mockDataUsuarios: Usuario[] = [
  { id: 1, nombre: 'Juan', apellido: 'Pérez', rol: 'USUARIO', email: 'juan@test.cl', password: '123456', rut: '12345678-9', fecha_nacimiento: '1990-01-01', direccion: 'Calle 1', comuna: 'Santiago', region: 'Metropolitana', estado: 'activo' },
  { id: 2, nombre: 'Ana', apellido: 'García', rol: 'USUARIO', email: 'ana@test.cl', password: '123456', rut: '87654321-0', fecha_nacimiento: '1992-05-15', direccion: 'Calle 2', comuna: 'Santiago', region: 'Metropolitana', estado: 'activo' }
];

const mockDataAdmins: Usuario[] = [
  { id: 1, nombre: 'Admin', apellido: 'User', rol: 'ADMIN', email: 'admin@test.cl', password: 'admin123', rut: '11111111-1', fecha_nacimiento: '1985-01-01', direccion: 'Calle Admin', comuna: 'Santiago', region: 'Metropolitana', estado: 'activo' },
  { id: 2, nombre: 'Vendedor', apellido: 'User', rol: 'VENDEDOR', email: 'vendedor@test.cl', password: 'vendedor123', rut: '22222222-2', fecha_nacimiento: '1988-06-20', direccion: 'Calle Vend', comuna: 'Santiago', region: 'Metropolitana', estado: 'activo' }
];

const mockDataProductos: Producto[] = [
  { id: 1, codigo: 'MAN001', nombre: 'Manzana', precio: 1500, descripcion: 'Fruta fresca', imagen: 'manzana.png', stock: 100, stock_critico: 20, categoria: 'Frutas' },
  { id: 2, codigo: 'LEC001', nombre: 'Lechuga', precio: 800, descripcion: 'Verdura orgánica', imagen: 'lechuga.png', stock: 50, stock_critico: 10, categoria: 'Verduras' }
];

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
      // Arrange
      vi.spyOn(window, 'fetch').mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDataUsuarios),
      } as Response);

      // Act
      const usuarios = await fetchUsuarios();

      // Assert
      expect(window.fetch).toHaveBeenCalledWith('/api/usuarios', expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }));
      expect(usuarios.length).toBe(2);
      expect(usuarios[0].nombre).toBe('Juan');
      expect(usuarios[0].rol).toBe('USUARIO');
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
      expect(window.fetch).toHaveBeenCalledWith('/api/usuarios?rol=Admin', expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }));
      expect(admins.length).toBe(2);
      expect(admins[0].rol).toBe('ADMIN');
      expect(admins[1].rol).toBe('VENDEDOR');
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
      // fetchProductos carga desde localStorage o initProductos
      const productosMock = JSON.stringify(mockDataProductos);
      localStorage.setItem('productos', productosMock);

      // Act
      const productos = await fetchProductos();

      // Assert
      expect(productos.length).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(productos)).toBe(true);
    });

    it('debe manejar errores y retornar array o productos iniciales', async () => {
      // Arrange
      localStorage.removeItem('productos');

      // Act
      const productos = await fetchProductos();

      // Assert
      expect(Array.isArray(productos)).toBe(true);
    });
  });
});