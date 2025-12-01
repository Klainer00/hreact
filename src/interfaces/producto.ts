export interface Producto {
  id?: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  stock_critico: number;
  categoria: string;
  imagen: string;
}