import type { Usuario } from '../interfaces/usuario';
import type { Producto } from '../interfaces/producto';

const MICROSERVICE_URL = import.meta.env.VITE_API_USUARIOS_URL || '/api/usuarios';

// ==================== HELPERS ====================

/**
 * Intenta parsear la respuesta como JSON si es válida
 * Si no es válido, devuelve un objeto con mensaje genérico
 */
const parseResponseJson = async (response: Response): Promise<any> => {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (e) {
      return { message: 'Respuesta inválida del servidor' };
    }
  }
  
  return { message: 'Respuesta inválida del servidor' };
};

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
    
    const data = await parseResponseJson(response);
    
    if (!response.ok) {
      throw new Error(data.message || 'Error al registrar usuario');
    }
    
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


export const obtenerUsuarioPorId = async (id: number): Promise<{ success: boolean; usuario?: Usuario; message: string }> => {
  try {
    console.log('📤 Obteniendo usuario completo por ID:', id);
    
    const response = await fetch(`/api/usuarios/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      throw new Error('Error al obtener usuario');
    }

    const data = await parseResponseJson(response);
    const usuarioData = data.usuario || data;
    
    console.log('📥 Datos brutos del usuario:', usuarioData);
    console.log('📥 Rol bruto:', usuarioData.rol);
    console.log('📥 Tipo de rol bruto:', typeof usuarioData.rol);
    
    // Normalizar rol: si es un número (ID), convertir a nombre
    let rolNormalizado: string | any = usuarioData.rol;
    
    // Si el rol es un objeto con propiedad 'nombre'
    if (typeof usuarioData.rol === 'object' && usuarioData.rol !== null && 'nombre' in usuarioData.rol) {
      console.log('📥 Rol es un objeto, extrayendo nombre:', usuarioData.rol.nombre);
      rolNormalizado = usuarioData.rol.nombre; // Extraer la propiedad 'nombre'
    } 
    // Si es un número (ID), convertir a nombre
    else if (typeof usuarioData.rol === 'number') {
      const rolMap: { [key: number]: string } = {
        1: 'ADMIN',
        2: 'USUARIO',
        3: 'VENDEDOR'
      };
      rolNormalizado = rolMap[usuarioData.rol] || 'USUARIO';
    } 
    // Si es un string, convertir a uppercase
    else if (typeof usuarioData.rol === 'string') {
      rolNormalizado = usuarioData.rol.toUpperCase();
    }
    
    console.log('📥 Rol normalizado:', rolNormalizado);
    
    const usuarioCompleto: Usuario = {
      id: usuarioData.id || 0,
      nombre: usuarioData.nombre || '',
      apellido: usuarioData.apellido || '',
      email: usuarioData.email || '',
      rut: usuarioData.rut || '',
      fecha_nacimiento: usuarioData.fecha_nacimiento || usuarioData.fechaNacimiento || '',
      direccion: usuarioData.direccion || '',
      region: usuarioData.region || '',
      comuna: usuarioData.comuna || '',
      rol: rolNormalizado || 'USUARIO',
      estado: usuarioData.estado || 'activo',
    };

    console.log('✅ Usuario completo construido:', usuarioCompleto);
    console.log('✅ Rol del usuario construido:', usuarioCompleto.rol);
    console.log('✅ Tipo de rol construido:', typeof usuarioCompleto.rol);
    
    return {
      success: true,
      usuario: usuarioCompleto,
      message: 'Usuario obtenido correctamente',
    };
  } catch (error: any) {
    console.error('❌ Error obtaining usuario por ID:', error);
    return {
      success: false,
      message: error.message || 'Error al obtener usuario',
    };
  }
};

export const obtenerUsuarioCompleto = async (email: string, id?: number, token?: string): Promise<{ success: boolean; usuario?: Usuario; message: string }> => {
  try {
    // Obtener el token del localStorage si no se proporciona
    const authToken = token || localStorage.getItem('authToken');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    console.log('📤 Obteniendo usuario completo con token:', authToken ? '✓' : '✗');

    // Primero intentar por ID si está disponible
    if (id) {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'GET',
        headers,
      });

      if (response.ok) {
        const data = await parseResponseJson(response);
        const usuarioData = data.usuario || data;
        
        const usuarioCompleto: Usuario = {
          id: usuarioData.id || 0,
          nombre: usuarioData.nombre || '',
          apellido: usuarioData.apellido || '',
          email: usuarioData.email || '',
          rut: usuarioData.rut || '',
          fecha_nacimiento: usuarioData.fecha_nacimiento || usuarioData.fechaNacimiento || '',
          direccion: usuarioData.direccion || '',
          region: usuarioData.region || '',
          comuna: usuarioData.comuna || '',
          rol: usuarioData.rol || 'usuario',
          estado: usuarioData.estado || 'activo',
        };

        console.log('✅ Usuario obtenido por ID:', usuarioCompleto);
        return {
          success: true,
          usuario: usuarioCompleto,
          message: 'Usuario obtenido correctamente',
        };
      }
    }

    // Si no funciona por ID, obtener todos y buscar por email
    const usuariosResponse = await fetch(`/api/usuarios`, {
      method: 'GET',
      headers,
    });

    if (!usuariosResponse.ok) {
      console.log('📥 Status al obtener usuarios:', usuariosResponse.status);
      throw new Error('Error al obtener lista de usuarios');
    }

    const usuariosList = await parseResponseJson(usuariosResponse);
    const usuariosArray = Array.isArray(usuariosList) ? usuariosList : (usuariosList.usuarios || []);

    console.log('📥 Usuarios obtenidos:', usuariosArray.length);

    const usuarioEncontrado = usuariosArray.find((u: any) => u.email === email);

    if (!usuarioEncontrado) {
      console.warn('⚠️ Usuario no encontrado en la lista');
      throw new Error('Usuario no encontrado');
    }

    const usuarioCompleto: Usuario = {
      id: usuarioEncontrado.id || 0,
      nombre: usuarioEncontrado.nombre || '',
      apellido: usuarioEncontrado.apellido || '',
      email: usuarioEncontrado.email || '',
      rut: usuarioEncontrado.rut || '',
      fecha_nacimiento: usuarioEncontrado.fecha_nacimiento || usuarioEncontrado.fechaNacimiento || '',
      direccion: usuarioEncontrado.direccion || '',
      region: usuarioEncontrado.region || '',
      comuna: usuarioEncontrado.comuna || '',
      rol: usuarioEncontrado.rol || 'usuario',
      estado: usuarioEncontrado.estado || 'activo',
    };

    console.log('✅ Usuario obtenido por email:', usuarioCompleto);
    return {
      success: true,
      usuario: usuarioCompleto,
      message: 'Usuario obtenido correctamente',
    };
  } catch (error: any) {
    console.error('❌ Error obtaining usuario completo:', error);
    return {
      success: false,
      message: error.message || 'Error al obtener usuario',
    };
  }
};

export const loginUsuario = async (email: string, password: string): Promise<{ success: boolean; usuario?: Usuario; token?: string; message: string }> => {
  try {
    const payload = { email, contraseña: password };
    
    console.log('📤 Enviando login:', payload);
    
    const response = await fetch(`/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await parseResponseJson(response);
    
    console.log('📥 Response data:', data);
    console.log('📥 Rol en respuesta:', data.rol);
    
    if (!response.ok) {
      // Error específico para 403
      if (response.status === 403) {
        throw new Error('⚠️ El servidor rechazó la solicitud (403). El backend puede necesitar reiniciarse con los cambios de seguridad actualizados.');
      }
      throw new Error(data.message || data.mensaje || 'Credenciales inválidas');
    }
    
    // El backend puede devolver: { id, nombre, email, rol, token } o { usuario: {...}, token: ... }
    const usuarioData = data.usuario || data;
    
    console.log('📥 Datos del usuario en login:', usuarioData);
    console.log('📥 Rol en usuarioData:', usuarioData.rol);
    
    // Normalizar rol: si es un número (ID), convertir a nombre
    let rolNormalizado: string | any = usuarioData.rol;
    if (typeof usuarioData.rol === 'number') {
      const rolMap: { [key: number]: string } = {
        1: 'ADMIN',
        2: 'USUARIO',
        3: 'VENDEDOR'
      };
      rolNormalizado = rolMap[usuarioData.rol] || 'USUARIO';
    } else if (typeof usuarioData.rol === 'string') {
      rolNormalizado = usuarioData.rol.toUpperCase();
    }
    
    console.log('📥 Rol normalizado:', rolNormalizado);
    
    // Asegurar que el usuario tiene toda la información necesaria
    const usuarioCompleto: Usuario = {
      id: usuarioData.id || 0,
      nombre: usuarioData.nombre || '',
      apellido: usuarioData.apellido || '',
      email: usuarioData.email || email,
      rut: usuarioData.rut || '',
      fecha_nacimiento: usuarioData.fecha_nacimiento || usuarioData.fechaNacimiento || '',
      direccion: usuarioData.direccion || '',
      region: usuarioData.region || '',
      comuna: usuarioData.comuna || '',
      rol: rolNormalizado || 'USUARIO',
      estado: usuarioData.estado || 'activo',
    };
    
    console.log('✅ Usuario completo desde login:', usuarioCompleto);
    console.log('✅ Rol del usuario:', usuarioCompleto.rol);
    
    // Guardar token si la API lo devuelve
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    
    return {
      success: true,
      usuario: usuarioCompleto,
      token: data.token,
      message: 'Sesión iniciada correctamente',
    };
  } catch (error: any) {
    console.error('Error logging in usuario:', error);
    return {
      success: false,
      message: error.message || 'Error al iniciar sesión',
    };
  }
};

/**
 * Registra un nuevo usuario usando el endpoint /api/auth/register
 * Este es el endpoint del microservicio de autenticación
 */
export const registroMicroservicio = async (usuarioData: {
  rut: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  direccion: string;
  region: string;
  comuna: string;
  fechaNacimiento: string;
}): Promise<{ success: boolean; usuario?: Usuario; user?: Usuario; message: string }> => {
  try {
    // Mapear campos exactamente como espera RegisterRequestDto
    const payload = {
      rut: usuarioData.rut,
      nombre: usuarioData.nombre,
      apellido: usuarioData.apellido,
      email: usuarioData.email,
      correo: usuarioData.email, // Para compatibilidad
      contraseña: usuarioData.password, // ← El DTO espera 'contraseña', NO 'password'
      direccion: usuarioData.direccion,
      region: usuarioData.region,
      comuna: usuarioData.comuna,
      fechaNacimiento: usuarioData.fechaNacimiento, // camelCase correcto
    };
    
    console.log('📤 Enviando datos de registro:', payload);
    
    const response = await fetch(`/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await parseResponseJson(response);
    
    console.log('📥 Response data:', data);

    if (!response.ok) {
      // Manejar específicamente el 500 (Error interno del servidor)
      if (response.status === 500) {
        console.error('⚠️ Error 500 del servidor. Revisar logs del backend.');
        throw new Error('⚠️ Error interno del servidor (500). El backend puede necesitar actualización o revisar los datos enviados.');
      }
      // Manejar específicamente el 409 (Conflict - Usuario duplicado)
      if (response.status === 409) {
        throw new Error(data.mensaje || 'El usuario ya se encuentra registrado');
      }
      // Manejar otros errores
      if (response.status === 400) {
        throw new Error(data.mensaje || 'Datos inválidos. Revisa el formulario.');
      }
      throw new Error(data.mensaje || data.message || 'Error al registrar usuario');
    }

    return {
      success: true,
      usuario: data,
      user: data,
      message: 'Usuario registrado correctamente',
    };
  } catch (error: any) {
    console.error('❌ Error registering usuario:', error);
    return {
      success: false,
      message: error.message || 'Error al registrar usuario',
    };
  }
};

export const actualizarUsuario = async (id: number, usuario: Partial<Usuario>): Promise<{ success: boolean; usuario?: Usuario; message: string }> => {
  try {
    console.log('📤 Actualizando usuario ID:', id, usuario);
    
    const response = await fetch(`${MICROSERVICE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usuario),
    });

    console.log('📥 Response status:', response.status);

    const data = await parseResponseJson(response);

    if (!response.ok) {
      console.error('❌ Error al actualizar:', data);
      throw new Error(data.message || data.mensaje || 'Error al actualizar usuario');
    }

    console.log('✅ Usuario actualizado:', data);
    
    return {
      success: true,
      usuario: data,
      message: 'Usuario actualizado correctamente',
    };
  } catch (error: any) {
    console.error('❌ Error updating usuario:', error);
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