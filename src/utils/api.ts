import type { Usuario } from '../interfaces/usuario';
import type { Producto } from '../interfaces/producto';

const MICROSERVICE_URL = 'http://localhost:8180/api/usuarios';

// ==================== USUARIOS (Microservicio) ====================

export const fetchUsuarios = async (): Promise<Usuario[]> => {
  try {
    const response = await fetch(`${MICROSERVICE_URL}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Error al cargar usuarios');
    const data = await response.json();
    return data as Usuario[];
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    const usuariosLocal = localStorage.getItem('usuarios');
    return usuariosLocal ? JSON.parse(usuariosLocal) : [];
  }
};

export const registrarUsuario = async (usuario: Omit<Usuario, 'id'>): Promise<{ success: boolean; usuario?: Usuario; message: string }> => {
  try {
    const response = await fetch(`${MICROSERVICE_URL}/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usuario),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al registrar usuario');
    }
    
    const data = await response.json();
    return {
      success: true,
      usuario: data,
      message: 'Usuario registrado correctamente',
    };
  } catch (error: any) {
    console.error('Error registering usuario:', error);
    return {
      success: false,
      message: error.message || 'Error al registrar usuario',
    };
  }
};

export const actualizarUsuario = async (id: number, usuario: Partial<Usuario>): Promise<{ success: boolean; usuario?: Usuario; message: string }> => {
  try {
    const response = await fetch(`${MICROSERVICE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usuario),
    });
    
    if (!response.ok) throw new Error('Error al actualizar usuario');
    
    const data = await response.json();
    return {
      success: true,
      usuario: data,
      message: 'Usuario actualizado correctamente',
    };
  } catch (error: any) {
    console.error('Error updating usuario:', error);
    return {
      success: false,
      message: error.message || 'Error al actualizar usuario',
    };
  }
};

export const eliminarUsuario = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${MICROSERVICE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) throw new Error('Error al eliminar usuario');
    
    return {
      success: true,
      message: 'Usuario eliminado correctamente',
    };
  } catch (error: any) {
    console.error('Error deleting usuario:', error);
    return {
      success: false,
      message: error.message || 'Error al eliminar usuario',
    };
  }
};

export const fetchAdmins = async (): Promise<Usuario[]> => {
  try {
    const response = await fetch(`${MICROSERVICE_URL}?rol=Admin`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Error al cargar administradores');
    const data = await response.json();
    return data as Usuario[];
  } catch (error) {
    console.error('Error fetching admins:', error);
    const usuariosLocal = localStorage.getItem('usuarios');
    if (usuariosLocal) {
      const usuarios = JSON.parse(usuariosLocal);
      return usuarios.filter((u: Usuario) => u.rol === 'Admin');
    }
    return [];
  }
};

// ==================== PRODUCTOS (LocalStorage) ====================

const productosIniciales: Producto[] = [
  {
    id: 1,
    codigo: 'FR001',
    nombre: 'Manzanas Fuji',
    descripcion: 'Manzanas Fuji frescas y crujientes, cultivadas localmente.',
    precio: 1200,
    stock: 150,
    stock_critico: 20,
    categoria: 'Frutas',
    imagen: '/img/manzanaFuji.png'
  },
  {
    id: 2,
    codigo: 'FR002',
    nombre: 'Naranjas Valencia',
    descripcion: 'Naranjas dulces y jugosas, perfectas para zumo o comer.',
    precio: 1000,
    stock: 120,
    stock_critico: 15,
    categoria: 'Frutas',
    imagen: '/img/naranja_valencia.png'
  },
  {
    id: 3,
    codigo: 'FR003',
    nombre: 'Plátanos Cavendish',
    descripcion: 'Plátanos maduros, fuente natural de potasio.',
    precio: 800,
    stock: 200,
    stock_critico: 30,
    categoria: 'Frutas',
    imagen: '/img/platano_caverdish.png'
  },
  {
    id: 4,
    codigo: 'VR001',
    nombre: 'Zanahorias Orgánicas',
    descripcion: 'Zanahorias frescas y orgánicas, sin pesticidas.',
    precio: 900,
    stock: 100,
    stock_critico: 20,
    categoria: 'Verduras',
    imagen: '/img/zanahorias.png'
  },
  {
    id: 5,
    codigo: 'VR002',
    nombre: 'Lechuga Costina',
    descripcion: 'Lechuga fresca y crujiente para tus ensaladas.',
    precio: 700,
    stock: 80,
    stock_critico: 10,
    categoria: 'Verduras',
    imagen: '/img/lechuga.png'
  },
  {
    id: 6,
    codigo: 'VR003',
    nombre: 'Pimientos Tricolor',
    descripcion: 'Pack de pimientos frescos (rojo, verde, amarillo).',
    precio: 1500,
    stock: 60,
    stock_critico: 10,
    categoria: 'Verduras',
    imagen: '/img/pimienton.png'
  },
  {
    id: 7,
    codigo: 'PO001',
    nombre: 'Miel Orgánica',
    descripcion: 'Miel de abeja 100% natural, 500g.',
    precio: 5000,
    stock: 50,
    stock_critico: 5,
    categoria: 'Procesados',
    imagen: '/img/miel.png'
  },
  {
    id: 8,
    codigo: 'PO002',
    nombre: 'Huevos de Campo',
    descripcion: 'Docena de huevos de gallina feliz.',
    precio: 3000,
    stock: 40,
    stock_critico: 10,
    categoria: 'Procesados',
    imagen: '/img/huevos.png'
  },
  {
    id: 9,
    codigo: 'PO003',
    nombre: 'Quinua Orgánica',
    descripcion: 'Quinua orgánica y limpia, bolsa de 500g.',
    precio: 1500,
    stock: 0,
    stock_critico: 5,
    categoria: 'Procesados',
    imagen: '/img/quinua.png'
  },
  {
    id: 10,
    codigo: 'PL001',
    nombre: 'Leche Entera',
    descripcion: 'Leche fresca entera de vaca, 1 litro.',
    precio: 1100,
    stock: 30,
    stock_critico: 5,
    categoria: 'Lácteos',
    imagen: '/img/leche.png'
  }
];

export const initProductos = (): void => {
  const productosExistentes = localStorage.getItem('productos');
  if (!productosExistentes) {
    localStorage.setItem('productos', JSON.stringify(productosIniciales));
  }
};

export const fetchProductos = async (): Promise<Producto[]> => {
  try {
    initProductos();
    const productosLocal = localStorage.getItem('productos');
    return productosLocal ? JSON.parse(productosLocal) : productosIniciales;
  } catch (error) {
    console.error('Error fetching productos:', error);
    return productosIniciales;
  }
};

export const fetchProductosByCategoria = async (categoria: string): Promise<Producto[]> => {
  try {
    const productos = await fetchProductos();
    return productos.filter(p => p.categoria === categoria);
  } catch (error) {
    console.error('Error fetching productos by categoria:', error);
    return [];
  }
};

export const fetchProductoById = async (id: number): Promise<Producto | null> => {
  try {
    const productos = await fetchProductos();
    return productos.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Error fetching producto by id:', error);
    return null;
  }
};

export const buscarProductos = async (query: string): Promise<Producto[]> => {
  try {
    const productos = await fetchProductos();
    const queryLower = query.toLowerCase();
    return productos.filter(p => 
      p.nombre.toLowerCase().includes(queryLower) ||
      p.descripcion.toLowerCase().includes(queryLower) ||
      p.codigo.toLowerCase().includes(queryLower)
    );
  } catch (error) {
    console.error('Error searching productos:', error);
    return [];
  }
};

export const actualizarProducto = async (id: number, producto: Partial<Producto>): Promise<{ success: boolean; message: string }> => {
  try {
    const productos = await fetchProductos();
    const index = productos.findIndex(p => p.id === id);
    
    if (index === -1) {
      return { success: false, message: 'Producto no encontrado' };
    }
    
    productos[index] = { ...productos[index], ...producto };
    localStorage.setItem('productos', JSON.stringify(productos));
    
    return { success: true, message: 'Producto actualizado correctamente' };
  } catch (error: any) {
    console.error('Error updating producto:', error);
    return { success: false, message: error.message };
  }
};

export const eliminarProducto = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const productos = await fetchProductos();
    const productosFiltrados = productos.filter(p => p.id !== id);
    
    if (productosFiltrados.length === productos.length) {
      return { success: false, message: 'Producto no encontrado' };
    }
    
    localStorage.setItem('productos', JSON.stringify(productosFiltrados));
    return { success: true, message: 'Producto eliminado correctamente' };
  } catch (error: any) {
    console.error('Error deleting producto:', error);
    return { success: false, message: error.message };
  }
};

export const agregarProducto = async (producto: Omit<Producto, 'id'>): Promise<{ success: boolean; producto?: Producto; message: string }> => {
  try {
    const productos = await fetchProductos();
    const nuevoId = Math.max(...productos.map(p => p.id || 0), 0) + 1;
    const nuevoProducto: Producto = { ...producto, id: nuevoId };
    
    productos.push(nuevoProducto);
    localStorage.setItem('productos', JSON.stringify(productos));
    
    return { success: true, producto: nuevoProducto, message: 'Producto agregado correctamente' };
  } catch (error: any) {
    console.error('Error adding producto:', error);
    return { success: false, message: error.message };
  }
};