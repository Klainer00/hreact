import type { ItemCarrito } from './itemCarrito';
export interface Pedido {
  id: string; // Usaremos un timestamp o un ID simple
  fecha: string;
  cliente: {
    id: number;
    nombre: string;
    email: string;
  };
  items: ItemCarrito[];
  total: number;
}