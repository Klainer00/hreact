export interface ItemCarrito {
  id: string;
  nombre: string;
  precio: number;
  img?: string; // <-- CORRECCIÓN: Hacer la imagen opcional (string o undefined)
  cantidad: number;
  stock: number; // <<-- NUEVA PROPIEDAD
}