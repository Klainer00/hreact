import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import type { ItemCarrito } from '../interfaces/itemCarrito';
import type { Producto } from '../interfaces/producto';
import { loadCarrito, saveCarrito } from '../utils/storage';

interface CarritoContextType {
  items: ItemCarrito[];
  carrito: ItemCarrito[];
  agregarItem: (producto: Producto) => boolean; // Cambiado a boolean
  agregarAlCarrito: (producto: Producto) => boolean; // Cambiado a boolean
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
  
  // CORRECCIÓN: Lógica, Tipos y Manejo de Imagen
  const agregarAlCarrito = (producto: Producto): boolean => {
    const productoIdString = producto.id ? producto.id.toString() : ''; 
    const existente = carrito.find(item => item.id === productoIdString); 
    
    // 1. VALIDACIÓN DE STOCK: Si ya existe y la cantidad actual es igual o mayor al stock, no se agrega.
    if (existente && existente.cantidad >= producto.stock) {
      return false; // Indica que falló por stock
    }
    
    setCarrito(prev => {
      if (existente) {
        // 2. Incrementa la cantidad
        return prev.map(item =>
          item.id === productoIdString ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      } else {
        // 3. Agrega el nuevo producto
        // Manejo de imagen nula/undefined y src=""
        const imagen = producto.imagen || '';
        const rutaImagenBase = imagen.startsWith('../') ? imagen.substring(3) : imagen;
        const rutaImagen = rutaImagenBase === '' ? undefined : rutaImagenBase; // undefined para evitar src=""
        
        return [...prev, {
          id: productoIdString, 
          nombre: producto.nombre,
          precio: producto.precio,
          img: rutaImagen,
          cantidad: 1
        }];
      }
    });
    
    return true; // Indica que la operación fue exitosa
  };

  // CORRECCIÓN: Manejo de ID y Nulidad de Imagen
  const agregarItem = (producto: Producto): boolean => {
    const productoIdString = producto.id ? producto.id.toString() : ''; 
    const existente = carrito.find(item => item.id === productoIdString); 
    
    // 1. VALIDACIÓN DE STOCK: Si ya existe y la cantidad actual es igual o mayor al stock, no se agrega.
    if (existente && existente.cantidad >= producto.stock) {
      return false; // Indica que falló por stock
    }
    
    setCarrito(prev => {
      if (existente) {
        // 2. Incrementa la cantidad
        return prev.map(item =>
          item.id === productoIdString ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      } else {
        // 3. Agrega el nuevo producto
        // Manejo de imagen nula/undefined y src=""
        const imagen = producto.imagen || '';
        const rutaImagenBase = imagen.startsWith('../') ? imagen.substring(3) : imagen;
        const rutaImagen = rutaImagenBase === '' ? undefined : rutaImagenBase; // undefined para evitar src=""
        
        return [...prev, {
          id: productoIdString, 
          nombre: producto.nombre,
          precio: producto.precio,
          img: rutaImagen,
          cantidad: 1
        }];
      }
    });
    
    return true; // Indica que la operación fue exitosa
  };

  const incrementarCantidad = (id: string) => {
    setCarrito(prev => {
      const itemExistente = prev.find(item => item.id === id);
      
      // NOTA: La validación de stock al incrementar es más compleja aquí, ya que el itemCarrito
      // no contiene el stock del producto original. Para una solución completa, el itemCarrito
      // debería almacenar el stock o se debería re-consultar la API.
      // Por ahora, la validación principal se hace en 'agregarAlCarrito'.
      
      if (itemExistente) {
        return prev.map(item =>
          item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return prev;
    });
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