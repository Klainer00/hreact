import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useContext } from 'react';
import type { ItemCarrito } from '../interfaces/itemCarrito';
import type { Producto } from '../interfaces/producto';
import { loadCarrito, saveCarrito } from '../utils/storage'; // <-- Tus rutas

interface CarritoContextType {
  carrito: ItemCarrito[];
  agregarAlCarrito: (producto: Producto) => void;
  eliminarDelCarrito: (id: string) => void;
  incrementarCantidad: (id: string) => void;
  disminuirCantidad: (id: string) => void;
  limpiarCarrito: () => void;
  total: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export const CarritoProvider = ({ children }: { children: ReactNode }) => {
  const [carrito, setCarrito] = useState<ItemCarrito[]>(() => loadCarrito());

  useEffect(() => {
    saveCarrito(carrito);
  }, [carrito]);

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito(prev => {
      const existente = prev.find(item => item.id === producto.codigo);
      if (existente) {
        // Si existe, solo incrementa la cantidad
        return prev.map(item =>
          item.id === producto.codigo ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      } else {
        // Si no existe, lo agrega al carrito
        const rutaImagen = producto.imagen.startsWith('../') ? producto.imagen.substring(3) : producto.imagen;
        return [...prev, {
          id: producto.codigo,
          nombre: producto.nombre,
          precio: producto.precio,
          img: rutaImagen,
          cantidad: 1 // Inicia en 1
        }];
      }
    });
  };

  // NUEVA FUNCIÓN: Aumenta en 1
  const incrementarCantidad = (id: string) => {
    setCarrito(prev =>
      prev.map(item =>
        item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
      )
    );
  };

  // NUEVA FUNCIÓN: Disminuye en 1 (o elimina si llega a 0)
  const disminuirCantidad = (id: string) => {
    setCarrito(prev => {
      const itemExistente = prev.find(item => item.id === id);
      
      if (itemExistente && itemExistente.cantidad > 1) {
        // Si hay más de 1, resta
        return prev.map(item =>
          item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
        );
      } else {
        // Si hay 1 (o 0), lo elimina del carrito
        return prev.filter(item => item.id !== id);
      }
    });
  };

  // Elimina toda la línea de producto, sin importar la cantidad
  const eliminarDelCarrito = (id: string) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  const limpiarCarrito = () => {
    setCarrito([]);
  };

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  return (
    <CarritoContext.Provider 
      value={{ 
        carrito, 
        agregarAlCarrito, 
        eliminarDelCarrito, 
        incrementarCantidad, // <-- Exporta la nueva función
        disminuirCantidad, // <-- Exporta la nueva función
        limpiarCarrito, 
        total 
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