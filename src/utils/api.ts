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
    
    // 1. Leemos el cuerpo UNA sola vez como texto
    const errorText = await response.text();

    // 2. Intentamos ver si es JSON
    try {
      const errorData = JSON.parse(errorText);
      mensaje = errorData.message || errorData.mensaje || mensaje;
    } catch {
      // 3. Si no era JSON, usamos el texto tal cual (puede ser el error HTML de Tomcat)
      if (errorText) mensaje = errorText;
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
      body: JSON.stringify({ email, password }) // El backend espera 'password'
    }));
    
    // Guardar el token y el rol si el login es exitoso
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.rol);
      localStorage.setItem('userEmail', data.email);
      
      // Obtener datos completos del usuario (incluyendo ID)
      try {
        const usuarios = await handleResponse(await fetch(`${API_BASE_URL}/usuarios`, {
          headers: getHeaders()
        }));
        
        console.log('📋 Usuarios obtenidos:', usuarios?.length || 0);
        
        if (usuarios && usuarios.length > 0) {
          // Filtrar por email ya que el backend devuelve todos los usuarios
          const usuarioCompleto = usuarios.find((u: any) => u.email === email);
          
          console.log('👤 Usuario encontrado:', usuarioCompleto ? 'Sí' : 'No', usuarioCompleto?.email);
          
          if (usuarioCompleto) {
            // Combinar datos del login con datos completos del usuario
            const usuarioFinal = {
              ...usuarioCompleto,
              token: data.token,
              rol: data.rol
            };
            console.log('✅ Usuario final con ID:', usuarioFinal.id, usuarioFinal.email);
            return { success: true, usuario: usuarioFinal, token: data.token, rol: data.rol };
          }
        }
      } catch (userError) {
        console.error('❌ Error obteniendo datos completos del usuario:', userError);
      }
    }
    return { success: true, usuario: data, token: data.token, rol: data.rol };
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
      password: datos.password, // Importante: 'password' para Java Spring Boot
      telefono: datos.telefono || '',
      direccion: datos.direccion || '',
      region: datos.region || '',
      comuna: datos.comuna || ''
    };

    const data = await handleResponse(await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    }));
    
    // Guardar el token si el registro es exitoso
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.rol);
      localStorage.setItem('userEmail', data.email);
      
      // Obtener datos completos del usuario (incluyendo ID)
      try {
        const usuarios = await handleResponse(await fetch(`${API_BASE_URL}/usuarios`, {
          headers: getHeaders()
        }));
        
        if (usuarios && usuarios.length > 0) {
          // Filtrar por email ya que el backend devuelve todos los usuarios
          const usuarioCompleto = usuarios.find((u: any) => u.email === datos.email);
          
          if (usuarioCompleto) {
            const usuarioFinal = {
              ...usuarioCompleto,
              token: data.token,
              rol: data.rol
            };
            return { success: true, usuario: usuarioFinal, message: 'Registro exitoso', token: data.token };
          }
        }
      } catch (userError) {
        console.warn('No se pudieron obtener datos completos del usuario:', userError);
      }
    }
    
    return { success: true, usuario: data, message: 'Registro exitoso', token: data.token };
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

// --- ESTA ES LA FUNCIÓN QUE FALTABA ---
export const obtenerUsuarioPorId = async (id: number) => {
  try {
    const data = await handleResponse(await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      headers: getHeaders(true) // Requiere Token
    }));
    return { success: true, usuario: data };
  } catch (error: any) {
    console.error('Error obteniendo usuario:', error);
    return { success: false, message: error.message };
  }
};
// -------------------------------------

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
    console.log(`🔄 API: Actualizando usuario ID ${id}`);
    console.log('📤 Datos enviados:', usuario);
    console.log('🌐 URL:', `${API_BASE_URL}/usuarios/${id}`);
    console.log('🔑 Headers:', getHeaders(true));
    
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: JSON.stringify(usuario)
    });
    
    console.log('📡 Status de respuesta:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response body:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || 'Error desconocido' };
      }
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Usuario actualizado recibido:', data);
    
    return { 
      success: true, 
      message: 'Usuario actualizado',
      usuario: data // Devolver el usuario actualizado desde el backend
    };
  } catch (error: any) {
    console.error('❌ Error en actualizarUsuario:', error);
    console.error('❌ Error stack:', error.stack);
    return { success: false, message: error.message, usuario: undefined };
  }
};

export const verificarUsuarioTienePedidos = async (usuarioId: number): Promise<{success: boolean, tienePedidos: boolean, cantidad: number}> => {
  try {
    const token = localStorage.getItem('authToken');
    
    // Usar el endpoint de admin que trae todos los pedidos
    const response = await fetch(`${API_BASE_URL}/pedidos/admin?size=1000`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`🔍 Verificando pedidos para usuario ${usuarioId}, status:`, response.status);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    const pedidosArray = Array.isArray(data) ? data : (data.content || []);
    
    // Filtrar pedidos que pertenecen al usuario específico
    const pedidosUsuario = pedidosArray.filter((pedido: any) => {
      const pedidoUserId = pedido.usuarioId || pedido.usuario?.id || pedido.usuario_id;
      return pedidoUserId === usuarioId || pedidoUserId === String(usuarioId);
    });
    
    console.log(`📦 Usuario ${usuarioId} tiene ${pedidosUsuario.length} pedido(s) en total de ${pedidosArray.length}`);
    
    return {
      success: true,
      tienePedidos: pedidosUsuario.length > 0,
      cantidad: pedidosUsuario.length
    };
  } catch (error) {
    console.error('❌ Error al verificar pedidos:', error);
    // En caso de error, retornamos error y NO permitimos eliminar
    return { success: false, tienePedidos: false, cantidad: 0 };
  }
};

export const verificarUsuarioTienePedidosOBSOLETO = async (id: number) => {
  try {
    console.log('Verificando pedidos para usuario ID:', id);
    
    // Consultar pedidos del usuario desde el backend
    const response = await fetch(`${API_BASE_URL}/pedidos/usuario/${id}`, {
      headers: getHeaders(true) // Requiere autenticación
    });
    
    if (!response.ok) {
      // Si el usuario no existe o no tiene pedidos, retornar false
      if (response.status === 404) {
        return { success: true, tienePedidos: false, cantidad: 0 };
      }
      throw new Error(`Error ${response.status}`);
    }
    
    const pedidos = await response.json();
    
    // Si es un array, contar los pedidos
    if (Array.isArray(pedidos)) {
      const pedidosPendientes = pedidos.filter(p => 
        p.estado && p.estado.toUpperCase() !== 'ENTREGADO' && p.estado.toUpperCase() !== 'CANCELADO'
      );
      
      return { 
        success: true, 
        tienePedidos: pedidosPendientes.length > 0, 
        cantidad: pedidosPendientes.length 
      };
    }
    
    // Si es un objeto paginado, verificar content
    if (pedidos.content && Array.isArray(pedidos.content)) {
      const pedidosPendientes = pedidos.content.filter((p: any) => 
        p.estado && p.estado.toUpperCase() !== 'ENTREGADO' && p.estado.toUpperCase() !== 'CANCELADO'
      );
      
      return { 
        success: true, 
        tienePedidos: pedidosPendientes.length > 0, 
        cantidad: pedidosPendientes.length 
      };
    }
    
    return { success: true, tienePedidos: false, cantidad: 0 };
  } catch (error: any) {
    console.error('Error verificando pedidos:', error);
    // En caso de error, ser conservador y no permitir eliminar
    return { success: false, tienePedidos: true, cantidad: 0, message: error.message };
  }
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

export const fetchPedidos = async (isAdmin: boolean = false, usuarioId?: number) => {
  try {
    const token = localStorage.getItem('authToken');
    
    // Si es admin, usar el endpoint administrativo
    const endpoint = isAdmin 
      ? `${API_BASE_URL}/pedidos/admin?size=100` 
      : `${API_BASE_URL}/pedidos?size=100`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    // Agregar X-User-ID si se proporciona (requerido por el backend)
    if (usuarioId) {
      headers['X-User-ID'] = usuarioId.toString();
    }
    
    const response = await fetch(endpoint, { headers });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }
    
    const data = await response.json();
    return data.content || data; // Maneja paginación o lista directa
  } catch (error) {
    console.error('Error cargando pedidos:', error);
    return [];
  }
};

export const crearPedido = async (pedidoData: any) => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!pedidoData.usuarioId) {
      return { success: false, message: 'Usuario no autenticado' };
    }

    // Transformamos al formato que espera Java (PedidoDTO)
    const payload = {
      usuarioId: pedidoData.usuarioId,
      direccionEnvio: pedidoData.direccionEnvio,
      comunaEnvio: pedidoData.comunaEnvio,
      regionEnvio: pedidoData.regionEnvio,
      total: pedidoData.total,
      detalles: pedidoData.detalles.map((item: any) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario
      }))
    };

    console.log('Enviando pedido:', payload);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-User-ID': pedidoData.usuarioId.toString()
    };

    const data = await handleResponse(await fetch(`${API_BASE_URL}/pedidos`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    }));
    return { success: true, pedido: data, id: data.id };
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

// El panel de admin busca "registrarUsuario", así que reutilizamos la función de registro existente
export const registrarUsuario = async (datos: any) => {
  return await registroMicroservicio(datos);
};