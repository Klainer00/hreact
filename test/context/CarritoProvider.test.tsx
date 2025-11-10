import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CarritoProvider, useCarrito } from '../../src/context/CarritoProvider';
import type { Producto } from '../../src/interfaces/producto';

// --- Mocks ---

vi.mock('../../src/utils/storage', () => ({
  loadCarrito: vi.fn(() => []), 
  saveCarrito: vi.fn(), 
}));

// Producto de prueba
const productoManzana: Producto = {
  codigo: 'FR001',
  nombre: 'Manzanas Fuji',
  precio: 1200,
  descripcion: '', stock: 10, stock_critico: 2, categoria: 'Frutas', imagen: '/img/manzana.png'
};

const productoNaranja: Producto = {
  codigo: 'FR002',
  nombre: 'Naranja',
  precio: 1000,
  descripcion: '', stock: 10, stock_critico: 2, categoria: 'Frutas', imagen: '/img/naranja.png'
};


// --- Pruebas ---

describe('Pruebas de lógica de CarritoProvider', () => {

  beforeEach(() => {
    vi.clearAllMocks(); // Limpia mocks
  });

  const renderCarritoHook = () => {
    return renderHook(() => useCarrito(), {
      wrapper: CarritoProvider 
    });
  }

  it('debe agregar un producto nuevo al carrito', () => {
    const { result } = renderCarritoHook();

    act(() => {
      result.current.agregarAlCarrito(productoManzana);
    });

    expect(result.current.carrito).toHaveLength(1);
    expect(result.current.carrito[0].id).toBe('FR001');
    expect(result.current.totalItems).toBe(1);
    expect(result.current.total).toBe(1200);
  });

  it('debe incrementar la cantidad si el producto ya existe', () => {
    const { result } = renderCarritoHook();

    // Agregamos la manzana dos veces
    act(() => {
      result.current.agregarAlCarrito(productoManzana);
    });
    act(() => {
      result.current.agregarAlCarrito(productoManzana);
    });

    // El carrito solo debe tener 1 item, pero con cantidad 2
    expect(result.current.carrito).toHaveLength(1);
    expect(result.current.carrito[0].cantidad).toBe(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.total).toBe(2400); // 1200 * 2
  });

  it('debe disminuir la cantidad de un producto', () => {
    const { result } = renderCarritoHook();

    act(() => {
      result.current.agregarAlCarrito(productoManzana);
    });
    act(() => {
      result.current.agregarAlCarrito(productoManzana); // Cantidad = 2
    });

    // Disminuimos
    act(() => {
      result.current.disminuirCantidad('FR001');
    });

    expect(result.current.carrito[0].cantidad).toBe(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.total).toBe(1200);
  });

  it('debe eliminar un producto si la cantidad llega a 0', () => {
    const { result } = renderCarritoHook();

    act(() => {
      result.current.agregarAlCarrito(productoManzana); // Cantidad = 1
    });

    // Disminuimos
    act(() => {
      result.current.disminuirCantidad('FR001');
    });

    // El carrito debe quedar vacío
    expect(result.current.carrito).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  it('debe eliminar un producto usando eliminarDelCarrito', () => {
    const { result } = renderCarritoHook();

    act(() => {
      result.current.agregarAlCarrito(productoManzana);
    });

    act(() => {
      result.current.eliminarDelCarrito('FR001');
    });

    expect(result.current.carrito).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
  });

  it('debe limpiar el carrito completo', () => {
    const { result } = renderCarritoHook();

    // Agregamos dos productos diferentes
    act(() => {
      result.current.agregarAlCarrito(productoManzana);
    });
    act(() => {
      result.current.agregarAlCarrito(productoNaranja);
    });

    expect(result.current.totalItems).toBe(2);

    // Limpiamos
    act(() => {
      result.current.limpiarCarrito();
    });

    expect(result.current.carrito).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.total).toBe(0);
  });
});