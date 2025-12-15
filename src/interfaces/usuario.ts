import { RolUsuario } from "./rolUsuario";
export interface Usuario {
  id: number;
  rut: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  region?: string;
  comuna?: string;
  rol: RolUsuario | string; 
  password?: string;
  token?: string;
}