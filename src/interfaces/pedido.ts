export interface DetallePedido {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  usuarioId: number;
  fecha: string;
  total: number;
  estado: string;
  direccionEnvio?: string;
  comunaEnvio?: string;
  regionEnvio?: string;
  detalles: DetallePedido[];
}