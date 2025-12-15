import type { ReactNode } from 'react';
import { createContext, useState, useEffect, useContext, useMemo } from 'react';
import type { ItemCarrito } from '../interfaces/itemCarrito';
import type { Producto } from '../interfaces/producto';
import { loadCarrito, saveCarrito } from '../utils/storage';
import Swal from 'sweetalert2';

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
  
  // CORRECCIÓN: Lógica, Tipos y Manejo de Imagen + Validación de Stock
  const agregarAlCarrito = (producto: Producto) => {
    setCarrito(prev => {
      // 1. CORRECCIÓN DE TIPOS Y LÓGICA: Usar ID real y convertir a string
      const productoIdString = producto.id ? producto.id.toString() : ''; 
      
      const existente = prev.find(item => item.id === productoIdString); 
      
      if (existente) {
        // Validar que no exceda el stock disponible
        if (existente.cantidad >= producto.stock) {
          Swal.fire({
            title: 'Stock insuficiente',
            text: `Solo hay ${producto.stock} unidades disponibles de "${producto.nombre}"`,
            icon: 'warning',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          return prev; // No modificar el carrito
        }
        
        return prev.map(item =>
          item.id === productoIdString ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      } else {
        // Verificar que haya stock disponible
        if (producto.stock <= 0) {
          Swal.fire({
            title: 'Sin stock',
            text: `"${producto.nombre}" no está disponible en este momento`,
            icon: 'error',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          return prev; // No agregar al carrito
        }
        
        // 2. CORRECCIÓN DE TYPEERROR: Manejar imagen nula/undefined y src=""
        const imagen = producto.imagenUrl || '';
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
  };

  // CORRECCIÓN: Manejo de ID y Nulidad de Imagen + Validación de Stock
  const agregarItem = (producto: Producto) => {
    setCarrito(prev => {
      const existente = prev.find(item => Number(item.id) === producto.id);
      if (existente) {
        // Validar stock antes de incrementar
        if (existente.cantidad >= producto.stock) {
          Swal.fire({
            title: 'Stock insuficiente',
            text: `Solo hay ${producto.stock} unidades disponibles de "${producto.nombre}"`,
            icon: 'warning',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          return prev;
        }
        
        return prev.map(item =>
          Number(item.id) === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      } else {
        // Verificar que haya stock disponible
        if (producto.stock <= 0) {
          Swal.fire({
            title: 'Sin stock',
            text: `"${producto.nombre}" no está disponible en este momento`,
            icon: 'error',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          return prev;
        }
        
        // Manejo de imagen nula/undefined y src=""
        const imagen = producto.imagenUrl || '';
        const rutaImagenBase = imagen.startsWith('../') ? imagen.substring(3) : imagen;
        const rutaImagen = rutaImagenBase === '' ? undefined : rutaImagenBase;

        return [...prev, {
          id: producto.id ? producto.id.toString() : '', // Aseguramos que el ID exista y sea string
          nombre: producto.nombre,
          precio: producto.precio,
          img: rutaImagen, // Usamos la ruta segura
          cantidad: 1
        }];
      }
    });
  };

  const incrementarCantidad = (id: string) => {
    // Buscar el producto en la lista de productos disponibles
    const producto = productosDisponibles.find(p => p.id?.toString() === id);
    
    setCarrito(prev => {
      const item = prev.find(i => i.id === id);
      
      if (item && producto) {
        // Validar que no exceda el stock
        if (item.cantidad >= producto.stock) {
          Swal.fire({
            title: 'Stock insuficiente',
            text: `Solo hay ${producto.stock} unidades disponibles`,
            icon: 'warning',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
          return prev; // No modificar
        }
      }
      
      return prev.map(item =>
        item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
      );
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
