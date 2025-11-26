import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CarritoProvider, useCarrito } from '../../src/context/CarritoProvider';

// Componente de prueba para usar el contexto
const TestComponent = () => {
  const { 
    items, 
    agregarItem, 
    removerItem, 
    actualizarCantidad, 
    vaciarCarrito, 
    total, 
    cantidadTotal 
  } = useCarrito();
  
  return (
    <div>
      <div data-testid="cantidad-total">{cantidadTotal}</div>
      <div data-testid="total">{total}</div>
      <div data-testid="items-count">{items.length}</div>
      <button 
        data-testid="agregar-btn" 
        onClick={() => agregarItem({
          id: 1,
          nombre: 'Manzana',
          precio: 1500,
          descripcion: 'Fruta fresca',
          imagen: 'manzana.png',
          stock: 100,
          categoria: 'Frutas'
        })}
      >
        Agregar Manzana
      </button>
      <button 
        data-testid="remover-btn" 
        onClick={() => removerItem(1)}
      >
        Remover
      </button>
      <button 
        data-testid="actualizar-btn" 
        onClick={() => actualizarCantidad(1, 5)}
      >
        Actualizar cantidad
      </button>
      <button 
        data-testid="vaciar-btn" 
        onClick={vaciarCarrito}
      >
        Vaciar carrito
      </button>
      {items.map(item => (
        <div key={item.id} data-testid={`item-${item.id}`}>
          {item.nombre} - Cantidad: {item.cantidad}
        </div>
      ))}
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

describe('Pruebas de CarritoProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('debe inicializar con carrito vacío', () => {
    render(
      <CarritoProvider>
        <TestComponent />
      </CarritoProvider>
    );

    expect(screen.getByTestId('cantidad-total')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
    expect(screen.getByTestId('items-count')).toHaveTextContent('0');
  });

  it('debe agregar items al carrito', async () => {
    render(
      <CarritoProvider>
        <TestComponent />
      </CarritoProvider>
    );

    await act(async () => {
      screen.getByTestId('agregar-btn').click();
    });

    expect(screen.getByTestId('cantidad-total')).toHaveTextContent('1');
    expect(screen.getByTestId('total')).toHaveTextContent('1500');
    expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    expect(screen.getByTestId('item-1')).toHaveTextContent('Manzana - Cantidad: 1');
  });

  it('debe incrementar cantidad si el item ya existe', async () => {
    render(
      <CarritoProvider>
        <TestComponent />
      </CarritoProvider>
    );

    // Agregar dos veces el mismo item
    await act(async () => {
      screen.getByTestId('agregar-btn').click();
    });
    await act(async () => {
      screen.getByTestId('agregar-btn').click();
    });

    expect(screen.getByTestId('cantidad-total')).toHaveTextContent('2');
    expect(screen.getByTestId('total')).toHaveTextContent('3000');
    expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    expect(screen.getByTestId('item-1')).toHaveTextContent('Manzana - Cantidad: 2');
  });

  it('debe remover items del carrito', async () => {
    render(
      <CarritoProvider>
        <TestComponent />
      </CarritoProvider>
    );

    // Primero agregar
    await act(async () => {
      screen.getByTestId('agregar-btn').click();
    });

    // Luego remover
    await act(async () => {
      screen.getByTestId('remover-btn').click();
    });

    expect(screen.getByTestId('cantidad-total')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
    expect(screen.getByTestId('items-count')).toHaveTextContent('0');
  });

  it('debe actualizar la cantidad de un item', async () => {
    render(
      <CarritoProvider>
        <TestComponent />
      </CarritoProvider>
    );

    // Agregar item
    await act(async () => {
      screen.getByTestId('agregar-btn').click();
    });

    // Actualizar cantidad a 5
    await act(async () => {
      screen.getByTestId('actualizar-btn').click();
    });

    expect(screen.getByTestId('cantidad-total')).toHaveTextContent('5');
    expect(screen.getByTestId('total')).toHaveTextContent('7500');
    expect(screen.getByTestId('item-1')).toHaveTextContent('Manzana - Cantidad: 5');
  });

  it('debe remover item si la cantidad se actualiza a 0', async () => {
    // Componente específico para este test para evitar colisión de testids
    const TestComponentForZero = () => {
      const { items, agregarItem, actualizarCantidad, cantidadTotal, total } = useCarrito();
      
      return (
        <div>
          <div data-testid="cantidad-total">{cantidadTotal}</div>
          <div data-testid="total">{total}</div>
          <div data-testid="items-count">{items.length}</div>
          <button 
            data-testid="agregar-cero-test-btn" 
            onClick={() => agregarItem({
              id: 1, nombre: 'Manzana', precio: 1500, descripcion: 'Fruta fresca',
              imagen: 'manzana.png', stock: 100, categoria: 'Frutas'
            })}
          >
            Agregar
          </button>
          <button 
            data-testid="actualizar-cero-btn" 
            onClick={() => actualizarCantidad(1, 0)}
          >
            Actualizar a 0
          </button>
          {items.map(item => (
            <div key={item.id} data-testid={`item-${item.id}`}>
              {item.nombre} - Cantidad: {item.cantidad}
            </div>
          ))}
        </div>
      );
    };

    render(
      <CarritoProvider>
        <TestComponentForZero />
      </CarritoProvider>
    );

    // Agregar item
    await act(async () => {
      screen.getByTestId('agregar-cero-test-btn').click();
    });

    expect(screen.getByTestId('cantidad-total')).toHaveTextContent('1');

    // Actualizar cantidad a 0 (debería remover el item)
    await act(async () => {
      screen.getByTestId('actualizar-cero-btn').click();
    });

    expect(screen.getByTestId('cantidad-total')).toHaveTextContent('0');
    expect(screen.getByTestId('items-count')).toHaveTextContent('0');
  });

  it('debe vaciar el carrito completamente', async () => {
    render(
      <CarritoProvider>
        <TestComponent />
      </CarritoProvider>
    );

    // Agregar varios items
    await act(async () => {
      screen.getByTestId('agregar-btn').click();
      screen.getByTestId('agregar-btn').click();
    });

    // Vaciar carrito
    await act(async () => {
      screen.getByTestId('vaciar-btn').click();
    });

    expect(screen.getByTestId('cantidad-total')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
    expect(screen.getByTestId('items-count')).toHaveTextContent('0');
  });

  it('debe cargar carrito desde localStorage al inicializar', () => {
    const carritoGuardado = [
      {
        id: 1,
        nombre: 'Manzana',
        precio: 1500,
        descripcion: 'Fruta fresca',
        imagen: 'manzana.png',
        stock: 100,
        categoria: 'Frutas',
        cantidad: 3
      }
    ];

    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(carritoGuardado));

    render(
      <CarritoProvider>
        <TestComponent />
      </CarritoProvider>
    );

    expect(screen.getByTestId('cantidad-total')).toHaveTextContent('3');
    expect(screen.getByTestId('total')).toHaveTextContent('4500');
    expect(screen.getByTestId('items-count')).toHaveTextContent('1');
  });

  it('debe manejar datos corruptos en localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('datos-corruptos');
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <CarritoProvider>
        <TestComponent />
      </CarritoProvider>
    );

    expect(screen.getByTestId('cantidad-total')).toHaveTextContent('0');
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('debe persistir cambios en localStorage', async () => {
    render(
      <CarritoProvider>
        <TestComponent />
      </CarritoProvider>
    );

    await act(async () => {
      screen.getByTestId('agregar-btn').click();
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('carrito', expect.any(String));
  });
});