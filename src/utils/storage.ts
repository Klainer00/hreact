import type { Usuario } from '../interfaces/usuario';
import type { ItemCarrito } from '../interfaces/itemCarrito';


const USUARIO_KEY = 'usuarioLogueado';
const CARRITO_KEY = 'carrito';

// --- Manejo de Usuario ---
export function loadUsuario(): Usuario | null {
  try {
    const serialisedState = localStorage.getItem(USUARIO_KEY);
    if (serialisedState === null) return null;
    return JSON.parse(serialisedState) as Usuario;
  } catch (e) {
    console.warn("Error cargando usuario de localStorage", e);
    return null;
  }
}


export function saveUsuario(usuario: Usuario | null): void {
  try {
    if (usuario === null) {
      localStorage.removeItem(USUARIO_KEY);
    } else {
      const serialisedState = JSON.stringify(usuario);
      localStorage.setItem(USUARIO_KEY, serialisedState);
    }
  } catch (e) {
    console.warn("Error guardando usuario en localStorage", e);
  }
}

// --- Manejo de Carrito ---
export function loadCarrito(): ItemCarrito[] {
  try {
    const raw = localStorage.getItem(CARRITO_KEY);
    return raw ? (JSON.parse(raw) as ItemCarrito[]) : [];
  } catch {
    return [];
  }
}

export function saveCarrito(carrito: ItemCarrito[]): void {
  localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
}