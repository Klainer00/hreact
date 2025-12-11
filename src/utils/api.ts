import type { Usuario } from '../interfaces/usuario';
import type { Producto } from '../interfaces/producto';

// Usamos ruta relativa '/api' para que el proxy de Vite redirija al puerto 8080
const API_BASE_URL = '/api';

// --- HELPERS (Ayudas para manejar tokens y errores) ---

// Obtener el token guardado en el navegador
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Crear las cabeceras (Headers) para las peticiones
const getHeaders = (auth = false): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  // Si la petición requiere autenticación, agregamos el token
  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// Función para manejar las respuestas del servidor
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let mensaje = 'Error en la solicitud';
    try {
      const errorData = await response.json();
      mensaje = errorData.message || errorData.mensaje || mensaje;
    } catch {
      mensaje = await response.text();
    }
    throw new Error(`Error ${response.status}: ${mensaje}`);
  }
  // Si la respuesta es exitosa pero no tiene contenido (ej: borrar algo)
  if (response.status === 204) return null;
  
  return response.json();
};

// ==================== AUTENTICACIÓN (Auth Service) ====================

export const loginUsuario = async (email: string, password: string) => {
  try {
    const data = await handleResponse(await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, contraseña: password }) // El backend espera 'contraseña'
    }));
    
    // Guardar el token si el login es exitoso
    if (data.token) localStorage.setItem('authToken', data.token);
    return { success: true, usuario: data.usuario || data, token: data.token };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const registroMicroservicio = async (datos: any) => {
  try {
    // Adaptamos los datos al formato que espera Java
    const payload = {
      rut: datos.rut,
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      contraseña: datos.password, // Importante: 'contraseña' para Java
      direccion: datos.direccion,
      region: datos.region,
      comuna: datos.comuna,
      fechaNacimiento: datos.fecha_nacimiento
    };

    const data = await handleResponse(await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    }));
    return { success: true, usuario: data, message: 'Registro exitoso' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ==================== USUARIOS (Admin) ====================

export const fetchUsuarios = async (): Promise<Usuario[]> => {
  try {
    const data = await handleResponse(await fetch(`${API_BASE_URL}/usuarios`, {
      headers: getHeaders(true) // Requiere Token
    }));
    return data.content || data; // Maneja si devuelve lista o página
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    return [];
  }
};

export const eliminarUsuario = async (id: number) => {
  try {
    await handleResponse(await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    }));
    return { success: true, message: 'Usuario eliminado' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const actualizarUsuario = async (id: number, usuario: Partial<Usuario>) => {
  try {
    await handleResponse(await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(usuario)
    }));
    return { success: true, message: 'Usuario actualizado' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const verificarUsuarioTienePedidos = async (id: number) => {
  // Stub temporal para evitar errores hasta que implementes pedidos por usuario
  return { success: true, tienePedidos: false, cantidad: 0 };
};


// ==================== PRODUCTOS (Productos Service) ====================

export const fetchProductos = async (): Promise<Producto[]> => {
  try {
    // ?size=100 trae los primeros 100 productos (para simplificar la paginación)
    const data = await handleResponse(await fetch(`${API_BASE_URL}/productos?size=100`));
    return data.content || data;
  } catch (error) {
    console.error('Error cargando productos:', error);
    return [];
  }
};

export const fetchProductoById = async (id: number): Promise<Producto | null> => {
  try {
    return await handleResponse(await fetch(`${API_BASE_URL}/productos/${id}`));
  } catch {
    return null;
  }
};

export const agregarProducto = async (producto: any) => {
  try {
    await handleResponse(await fetch(`${API_BASE_URL}/productos`, {
      method: 'POST',
      headers: getHeaders(true), // Solo admin (con token)
      body: JSON.stringify(producto)
    }));
    return { success: true, message: 'Producto creado' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const actualizarProducto = async (id: number, producto: any) => {
  try {
    await handleResponse(await fetch(`${API_BASE_URL}/productos/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(producto)
    }));
    return { success: true, message: 'Producto actualizado' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const eliminarProducto = async (id: number) => {
  try {
    await handleResponse(await fetch(`${API_BASE_URL}/productos/${id}`, {
      method: 'DELETE',
      headers: getHeaders(true)
    }));
    return { success: true, message: 'Producto eliminado' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ==================== PEDIDOS (Pedidos Service) ====================

export const crearPedido = async (items: any[], total: number) => {
  try {
    // Transformamos el carrito al formato que espera Java (PedidoDTO)
    const payload = {
      items: items.map(item => ({
        // Asegúrate de que tu carrito tenga el ID real de la base de datos
        productoId: item.id, 
        cantidad: item.cantidad,
        precioUnitario: item.precio
      })),
      total: total
    };

    const data = await handleResponse(await fetch(`${API_BASE_URL}/pedidos`, {
      method: 'POST',
      headers: getHeaders(true), // Requiere estar logueado
      body: JSON.stringify(payload)
    }));
    return { success: true, pedido: data };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ==================== CONTACTO (Contacto Service) ====================

export const enviarMensajeContacto = async (datos: any) => {
  try {
    await handleResponse(await fetch(`${API_BASE_URL}/contacto`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(datos)
    }));
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// Helper para evitar que AdminDashboard falle si llama a esta función
export const fetchAdmins = async (): Promise<Usuario[]> => {
    const usuarios = await fetchUsuarios();
    return usuarios.filter(u => 
        (typeof u.rol === 'string' && u.rol.toUpperCase() === 'ADMIN') ||
        (typeof u.rol === 'object' && (u.rol as any).nombre === 'ADMIN')
    );
};