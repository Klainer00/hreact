import { RolUsuario } from "./rolUsuario";
export interface Usuario {
  id: number;
  rut: string;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  email: string;
  direccion: string;
  region: string;
  comuna: string;
  rol: RolUsuario | string; 
  estado: string;
  password?: string;
}