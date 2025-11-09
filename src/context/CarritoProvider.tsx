import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import type { ItemCarrito } from '../interfaces/itemCarrito';
import type { Producto } from '../interfaces/producto';
import { loadCarrito, saveCarrito } from '../utils/storage';

interface CarritoContextType {
  carrito: ItemCarrito[];
  agregarAlCarrito: (producto: Producto) => void;
  eliminarDelCarrito: (id: string) => void;
  incrementarCantidad: (id: string) => void;
  disminuirCantidad: (id: string) => void;
  limpiarCarrito: () => void;
  total: number;
  totalItems: number; // <-- 1. AÑADIMOS ESTO
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

  // 2. AÑADIMOS EL CÁLCULO DEL TOTAL DE ÍTEMS
  const totalItems = useMemo(() => {
    return carrito.reduce((acc, item) => acc + item.cantidad, 0);
  }, [carrito]);

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

  const limpiarCarrito = () => {
    setCarrito([]);
  };

  return (
    <CarritoContext.Provider 
      value={{ 
        carrito, 
        agregarAlCarrito, 
        eliminarDelCarrito, 
        incrementarCantidad,
        disminuirCantidad,
        limpiarCarrito, 
        total,
        totalItems // <-- 3. EXPORTAMOS EL VALOR
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