import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import type { ItemCarrito } from '../interfaces/itemCarrito';
import type { Producto } from '../interfaces/producto';
import { loadCarrito, saveCarrito } from '../utils/storage';

interface CarritoContextType {
  items: ItemCarrito[];
  carrito: ItemCarrito[];
  agregarItem: (producto: Producto) => void;
  agregarAlCarrito: (producto: Producto) => void;
  removerItem: (id: number) => void;
  eliminarDelCarrito: (id: string) => void;
  actualizarCantidad: (id: number, cantidad: number) => void;
  incrementarCantidad: (id: string) => void;
  disminuirCantidad: (id: string) => void;
  vaciarCarrito: () => void;
  limpiarCarrito: () => void;
  total: number;
  cantidadTotal: number;
  totalItems: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export const CarritoProvider = ({ children }: { children: ReactNode }) => {
  const [carrito, setCarrito] = useState<ItemCarrito[]>(() => loadCarrito());

  useEffect(() => {
    saveCarrito(carrito);
  }, [carrito]);

  // --- Lógica de cálculo (useMemo para eficiencia) ---
  const total = useMemo(() => {
    return carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  }, [carrito]);

  const cantidadTotal = useMemo(() => {
    return carrito.reduce((acc, item) => acc + item.cantidad, 0);
  }, [carrito]);

  const totalItems = cantidadTotal; // Alias

  // --- Funciones de mutación ---
  const agregarAlCarrito = (producto: Producto) => {
    setCarrito(prev => {
      const existente = prev.find(item => item.id === producto.codigo);
      if (existente) {
        return prev.map(item =>
          item.id === producto.codigo ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      } else {
        const rutaImagen = producto.imagen.startsWith('../') ? producto.imagen.substring(3) : producto.imagen;
        return [...prev, {
          id: producto.codigo,
          nombre: producto.nombre,
          precio: producto.precio,
          img: rutaImagen,
          cantidad: 1
        }];
      }
    });
  };

  const agregarItem = (producto: Producto) => {
    setCarrito(prev => {
      const existente = prev.find(item => Number(item.id) === producto.id);
      if (existente) {
        return prev.map(item =>
          Number(item.id) === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      } else {
        return [...prev, {
          id: producto.id.toString(),
          nombre: producto.nombre,
          precio: producto.precio,
          img: producto.imagen,
          cantidad: 1
        }];
      }
    });
  };

  const incrementarCantidad = (id: string) => {
    setCarrito(prev =>
      prev.map(item =>
        item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
      )
    );
  };

  const disminuirCantidad = (id: string) => {
    setCarrito(prev => {
      const itemExistente = prev.find(item => item.id === id);
      if (itemExistente && itemExistente.cantidad > 1) {
        return prev.map(item =>
          item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
        );
      } else {
        return prev.filter(item => item.id !== id);
      }
    });
  };

  const eliminarDelCarrito = (id: string) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  const removerItem = (id: number) => {
    setCarrito(prev => prev.filter(item => Number(item.id) !== id));
  };

  const actualizarCantidad = (id: number, cantidad: number) => {
    if (cantidad <= 0) {
      removerItem(id);
    } else {
      setCarrito(prev =>
        prev.map(item =>
          Number(item.id) === id ? { ...item, cantidad } : item
        )
      );
    }
  };

  const limpiarCarrito = () => {
    setCarrito([]);
  };

  const vaciarCarrito = limpiarCarrito; // Alias

  return (
    <CarritoContext.Provider 
      value={{ 
        items: carrito,
        carrito, 
        agregarItem,
        agregarAlCarrito, 
        removerItem,
        eliminarDelCarrito, 
        actualizarCantidad,
        incrementarCantidad,
        disminuirCantidad,
        vaciarCarrito,
        limpiarCarrito, 
        total,
        cantidadTotal,
        totalItems
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return context;
};