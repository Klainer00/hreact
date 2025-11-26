import { describe, it, expect } from 'vitest';
import { regiones, obtenerComunasPorRegion } from '../../src/utils/regiones';

describe('Pruebas de regiones', () => {
  describe('regiones array', () => {
    it('debe contener todas las regiones de Chile', () => {
      expect(regiones).toHaveLength(16);
      expect(regiones[0]).toBe('Región de Arica y Parinacota');
      expect(regiones[15]).toBe('Región de Magallanes y de la Antártica Chilena');
    });

    it('debe incluir la Región Metropolitana', () => {
      expect(regiones).toContain('Región Metropolitana de Santiago');
    });
  });

  describe('obtenerComunasPorRegion', () => {
    it('debe retornar las comunas de la Región Metropolitana', () => {
      const comunas = obtenerComunasPorRegion('Región Metropolitana de Santiago');
      
      expect(comunas).toContain('Santiago');
      expect(comunas).toContain('Las Condes');
      expect(comunas).toContain('Providencia');
      expect(comunas).toContain('Ñuñoa');
      expect(comunas.length).toBeGreaterThan(30);
    });

    it('debe retornar las comunas de Valparaíso', () => {
      const comunas = obtenerComunasPorRegion('Región de Valparaíso');
      
      expect(comunas).toContain('Valparaíso');
      expect(comunas).toContain('Viña del Mar');
      expect(comunas).toContain('Quilpué');
    });

    it('debe retornar array vacío para región inexistente', () => {
      const comunas = obtenerComunasPorRegion('Región Inexistente');
      
      expect(comunas).toEqual([]);
    });

    it('debe manejar string vacío', () => {
      const comunas = obtenerComunasPorRegion('');
      
      expect(comunas).toEqual([]);
    });

    it('debe ser case sensitive', () => {
      const comunas = obtenerComunasPorRegion('región metropolitana de santiago');
      
      expect(comunas).toEqual([]);
    });
  });
});