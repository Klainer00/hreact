import type { Usuario } from '../interfaces/usuario';
import type { Producto } from '../interfaces/producto';
const BASE_URL = '/data'; 

export const fetchUsuarios = async (): Promise<Usuario[]> => {
  try {
    const response = await fetch(`${BASE_URL}/usuarios.json`);
    if (!response.ok) throw new Error('Error al cargar usuarios');
    const data = await response.json();
    return data.usuarios as Usuario[];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchProductos = async (): Promise<Producto[]> => {
  try {
    const response = await fetch(`${BASE_URL}/productos.json`);
    if (!response.ok) throw new Error('Error al cargar productos');
    const data = await response.json();
    return data.productos as Producto[];
  } catch (error) {
    console.error(error);
    return [];
  }
};