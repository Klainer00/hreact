import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import type { ItemCarrito } from '../interfaces/itemCarrito';
import type { Producto } from '../interfaces/producto';
import { loadCarrito, saveCarrito } from '../utils/storage';
import Swal from 'sweetalert2';

interface CarritoContextType {
  items: ItemCarrito[];
  carrito: ItemCarrito[];
  agregarItem: (producto: Producto) => boolean;
  agregarAlCarrito: (producto: Producto) => boolean;
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
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);

  // Cargar productos disponibles desde localStorage para validar stock
  useEffect(() => {
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    setProductosDisponibles(productos);
  }, []);

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
  const agregarAlCarrito = (producto: Producto) => {
    setCarrito(prev => {
      const productoIdString = String(producto.id);
      const existente = prev.find(item => item.id === productoIdString);
      
      if (existente) {
        return prev.map(item =>
          item.id === productoIdString ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      } else {
        // 2. CORRECCIÓN DE TYPEERROR: Manejar imagen nula/undefined y src=""
        const imagen = producto.imagen || '';
        const rutaImagenBase = imagen.startsWith('../') ? imagen.substring(3) : imagen;
        const rutaImagen = rutaImagenBase === '' ? undefined : rutaImagenBase; // undefined para evitar src=""
        
        return [...prev, {
          id: productoIdString, 
          nombre: producto.nombre,
          precio: producto.precio,
          img: rutaImagen,
          cantidad: 1,
          stock: producto.stock // <<-- AHORA GUARDAMOS EL STOCK
        }];
      }
    });
  };

  // CORRECCIÓN: Manejo de ID y Nulidad de Imagen
  const agregarItem = (producto: Producto) => {
    setCarrito(prev => {
      const productoIdString = String(producto.id);
      const existente = prev.find(item => item.id === productoIdString);
      
      if (existente) {
        return prev.map(item =>
          item.id === productoIdString ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      } else {
        // Manejo de imagen nula/undefined y src=""
        const imagen = producto.imagenUrl || '';
        const rutaImagenBase = imagen.startsWith('../') ? imagen.substring(3) : imagen;
        const rutaImagen = rutaImagenBase === '' ? undefined : rutaImagenBase; // undefined para evitar src=""
        
        return [...prev, {
          id: productoIdString, 
          nombre: producto.nombre,
          precio: producto.precio,
          img: rutaImagen,
          cantidad: 1,
          stock: producto.stock // <<-- AHORA GUARDAMOS EL STOCK
        }];
      }
    });
    
    return true; // Indica que la operación fue exitosa
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
      return;
    }
    
    // Buscar el producto para validar stock
    const producto = productosDisponibles.find(p => p.id === id);
    
    if (producto && cantidad > producto.stock) {
      Swal.fire({
        title: 'Stock insuficiente',
        text: `Solo hay ${producto.stock} unidades disponibles de "${producto.nombre}"`,
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      
      // Establecer la cantidad al máximo disponible
      setCarrito(prev =>
        prev.map(item =>
          Number(item.id) === id ? { ...item, cantidad: producto.stock } : item
        )
      );
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