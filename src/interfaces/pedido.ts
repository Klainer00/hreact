import type { ItemCarrito } from './itemCarrito'; 

export interface Pedido {
  id: number;
  fecha: string;
  cliente: {
    id: number;
    nombre: string;
    email: string;
    direccion: string;
    comuna: string;
    region: string;
  };
  items: ItemCarrito[];
  total: number;
}