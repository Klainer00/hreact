import { describe, it, expect } from 'vitest';
import { checkRut } from '../../src/utils/checkrut';

describe('Pruebas para la utilidad checkRut', () => {

  it('debería validar un RUT válido con dígito verificador numérico', () => {
    const rut = '11111111-1';
    const resultado = checkRut(rut);
    expect(resultado.valid).toBe(true);
    expect(resultado.message).toBe('');
  });

  it('debería validar un RUT válido con dígito verificador "K"', () => {
    const resultado = checkRut('19816361-K');
    expect(resultado.valid).toBe(true);
  });

  it('debería invalidar un RUT con dígito verificador incorrecto', () => {
    const resultado = checkRut('11111111-2');
    expect(resultado.valid).toBe(false);
    expect(resultado.message).toBe('El dígito verificador es incorrecto.');
  });

  it('debería invalidar un RUT incompleto', () => {
    const resultado = checkRut('123-4');
    expect(resultado.valid).toBe(false);
    expect(resultado.message).toBe('RUT Incompleto.');
  });
});