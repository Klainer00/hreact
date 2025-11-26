import type { Usuario } from '../interfaces/usuario';
import type { ItemCarrito } from '../interfaces/itemCarrito';

const USUARIO_KEY = 'usuarioLogueado';
const CARRITO_KEY = 'carrito';

// --- Funciones genéricas para localStorage ---
export function saveToLocalStorage(key: string, data: any): void {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (e) {
    console.error("Error guardando en localStorage", e);
  }
}

export function getFromLocalStorage(key: string): any {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) return null;
    return JSON.parse(serializedData);
  } catch (e) {
    console.error("Error recuperando de localStorage", e);
    return null;
  }
}

export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error("Error eliminando de localStorage", e);
  }
}

// --- Manejo de Usuario ---
export function loadUsuario(): Usuario | null {
  try {
    const serialisedState = localStorage.getItem(USUARIO_KEY);
    if (serialisedState === null) return null;
    return JSON.parse(serialisedState) as Usuario;
  } catch (e) {
    console.error("Error cargando usuario de localStorage", e);
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
    console.error("Error guardando usuario en localStorage", e);
  }
}

export function removeUsuario(): void {
  try {
    localStorage.removeItem(USUARIO_KEY);
  } catch (e) {
    console.error("Error eliminando usuario de localStorage", e);
  }
}

// --- Manejo de Carrito ---
export function loadCarrito(): ItemCarrito[] {
  try {
    const raw = localStorage.getItem(CARRITO_KEY);
    return raw ? (JSON.parse(raw) as ItemCarrito[]) : [];
  } catch (e) {
    console.error("Error cargando carrito de localStorage", e);
    return [];
  }
}

export function saveCarrito(carrito: ItemCarrito[]): void {
  try {
    const serialisedState = JSON.stringify(carrito);
    localStorage.setItem(CARRITO_KEY, serialisedState);
  } catch (e) {
    console.error("Error guardando carrito en localStorage", e);
  }
}

import type { Pedido } from '../interfaces/pedido'; 

const PEDIDOS_KEY = 'pedidos';

export function loadPedidos(): Pedido[] {
    try {
        const raw = localStorage.getItem(PEDIDOS_KEY);
        return raw ? (JSON.parse(raw) as Pedido[]) : [];
    } catch {
        return [];
    }
}

export function savePedidos(pedidos: Pedido[]): void {
    localStorage.setItem(PEDIDOS_KEY, JSON.stringify(pedidos));
}