import { checkRut } from './checkrut';
export interface TRegistroData {
  rut: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  fecha_nacimiento: string;
  direccion: string;
  region: string;
  comuna: string;
}

// Define la forma del objeto de errores
export type TRegistroErrores = Partial<Record<keyof TRegistroData, string>>;

/**
 * Valida los datos del formulario de registro.
 */
export const validarRegistro = (data: TRegistroData): TRegistroErrores => {
  const errores: TRegistroErrores = {};

  // Lógica de validación extraída de RegistroModal.tsx
  if (!data.nombre.trim()) errores.nombre = "El nombre es requerido.";
  if (!data.apellido.trim()) errores.apellido = "El apellido es requerido.";

  // Validación de Email (misma regex de tu modal)
  const emailRegex = /^[\w-\.]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/;
  if (!emailRegex.test(data.email)) {
    errores.email = "Email inválido o no permitido (solo @duoc.cl, @profesor.duoc.cl, @gmail.com).";
  }

  // Validación de Contraseña (misma lógica de tu modal)
  if (data.password.length < 4 || data.password.length > 10) {
    errores.password = "La contraseña debe tener entre 4 y 10 caracteres.";
  }

  // Validación de RUT (usando tu checkrut.ts)
  const rutValidation = checkRut(data.rut);
  if (!rutValidation.valid) {
    errores.rut = rutValidation.message;
  }
  
  // Validaciones de campos requeridos (basado en el formulario)
  if (!data.region) errores.region = "Debe seleccionar una región.";
  if (!data.comuna) errores.comuna = "Debe seleccionar una comuna.";
  if (!data.direccion.trim()) errores.direccion = "La dirección es requerida.";

  return errores;
};



export interface TLoginData {
  email: string;
  password: string;
}

export type TLoginErrores = Partial<Record<keyof TLoginData, string>>;

export const validarLogin = (data: TLoginData): TLoginErrores => {
  const errores: TLoginErrores = {};
  
  if (!data.email.trim()) {
    errores.email = 'El email es requerido.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errores.email = 'El formato del email no es válido.';
  }
  
  if (!data.password) {
    errores.password = 'La contraseña es requerida.';
  }
  
  return errores;
};



export interface TContactoData {
  'contact-name': string;
  'contact-email': string;
  'contact-subject': string; // Opcional
  'contact-message': string;
}

export type TContactoErrores = Partial<Record<string, string>>; // Claves dinámicas

/**
 * Valida los datos del formulario de contacto.
 */
export const validarContacto = (data: TContactoData): TContactoErrores => {
  const errores: TContactoErrores = {};
  
  if (!data['contact-name']?.trim()) {
    errores['contact-name'] = 'El nombre es requerido.';
  }
  
  if (!data['contact-email']?.trim()) {
    errores['contact-email'] = 'El email es requerido.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data['contact-email'])) {
    errores['contact-email'] = 'El formato del email no es válido.';
  }
  
  if (!data['contact-message']?.trim()) {
    errores['contact-message'] = 'El mensaje no puede estar vacío.';
  } else if (data['contact-message'].length < 10) {
    errores['contact-message'] = 'El mensaje debe tener al menos 10 caracteres.';
  }
  
  return errores;
};