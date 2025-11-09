import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useContext } from 'react';
import type { ItemCarrito } from '../interfaces/itemCarrito'; 
import type { Producto } from '../interfaces/producto'; 
import { loadCarrito, saveCarrito } from '../utils/storage'; 

interface CarritoContextType {
  carrito: ItemCarrito[];
  agregarAlCarrito: (producto: Producto, cantidad: number) => void;
  eliminarDelCarrito: (id: string) => void;
  actualizarCantidad: (id: string, cantidad: number) => void;
  limpiarCarrito: () => void;
  total: number;
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined);

export const CarritoProvider = ({ children }: { children: ReactNode }) => {
  const [carrito, setCarrito] = useState<ItemCarrito[]>(() => loadCarrito());

  useEffect(() => {
    saveCarrito(carrito);
  }, [carrito]);

  const agregarAlCarrito = (producto: Producto, cantidad: number) => {
    setCarrito(prev => {
      const existente = prev.find(item => item.id === producto.codigo);
      if (existente) {
        return prev.map(item => 
          item.id === producto.codigo ? { ...item, cantidad: item.cantidad + cantidad } : item
        );
      } else {
        // Corrige la ruta de la imagen
        const rutaImagen = producto.imagen.startsWith('../') ? producto.imagen.substring(3) : producto.imagen;
        return [...prev, {
          id: producto.codigo,
          nombre: producto.nombre,
          precio: producto.precio,
          img: rutaImagen, // Usa la ruta corregida
          cantidad: cantidad
        }];
      }
    });
  };

  const eliminarDelCarrito = (id: string) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  };

  const actualizarCantidad = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(id);
    } else {
      setCarrito(prev => prev.map(item => 
        item.id === id ? { ...item, cantidad } : item
      ));
    }
  };

  const limpiarCarrito = () => {
    setCarrito([]);
  };

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  return (
    <CarritoContext.Provider value={{ carrito, agregarAlCarrito, eliminarDelCarrito, actualizarCantidad, limpiarCarrito, total }}>
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return context;
};