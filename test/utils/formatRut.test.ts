import { describe, it, expect } from 'vitest';
import { formatRut } from '../../src/utils/formatRut';

describe('Pruebas de formatRut', () => {
  it('debe formatear un RUT sin puntos ni guión', () => {
    const resultado = formatRut('123456789');
    expect(resultado).toBe('12.345.678-9');
  });

  it('debe formatear un RUT que ya tiene algunos separadores', () => {
    const resultado = formatRut('12345678-9');
    expect(resultado).toBe('12.345.678-9');
  });

  it('debe formatear un RUT con puntos pero sin guión', () => {
    const resultado = formatRut('12.345.678');
    expect(resultado).toBe('12.345.678');
  });

  it('debe manejar RUTs cortos correctamente', () => {
    const resultado = formatRut('1234567');
    expect(resultado).toBe('123.456-7');
  });

  it('debe manejar RUTs muy cortos', () => {
    const resultado = formatRut('12345');
    expect(resultado).toBe('1.234-5');
  });

  it('debe manejar string vacío', () => {
    const resultado = formatRut('');
    expect(resultado).toBe('');
  });

  it('debe manejar RUT con K mayúscula', () => {
    const resultado = formatRut('12345678K');
    expect(resultado).toBe('12.345.678-K');
  });

  it('debe manejar RUT con k minúscula', () => {
    const resultado = formatRut('12345678k');
    expect(resultado).toBe('12.345.678-k');
  });

  it('debe eliminar caracteres no válidos', () => {
    const resultado = formatRut('12a34b56c78d9');
    expect(resultado).toBe('12.345.678-9');
  });
});