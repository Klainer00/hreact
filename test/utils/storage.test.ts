import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  saveToLocalStorage, 
  getFromLocalStorage, 
  removeFromLocalStorage 
} from '../../src/utils/storage';

// Mock de localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Pruebas de storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveToLocalStorage', () => {
    it('debe guardar un objeto en localStorage', () => {
      const testData = { id: 1, name: 'Test' };
      
      saveToLocalStorage('test-key', testData);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'test-key', 
        JSON.stringify(testData)
      );
    });

    it('debe guardar un string en localStorage', () => {
      const testData = 'test string';
      
      saveToLocalStorage('test-key', testData);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'test-key', 
        JSON.stringify(testData)
      );
    });

    it('debe manejar errores al guardar', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      saveToLocalStorage('test-key', { data: 'test' });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('getFromLocalStorage', () => {
    it('debe recuperar y parsear datos del localStorage', () => {
      const testData = { id: 1, name: 'Test' };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData));
      
      const result = getFromLocalStorage('test-key');
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
      expect(result).toEqual(testData);
    });

    it('debe retornar null si no existe la clave', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      const result = getFromLocalStorage('non-existent-key');
      
      expect(result).toBeNull();
    });

    it('debe manejar JSON inválido', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = getFromLocalStorage('test-key');
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('removeFromLocalStorage', () => {
    it('debe eliminar un item del localStorage', () => {
      removeFromLocalStorage('test-key');
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test-key');
    });

    it('debe manejar errores al eliminar', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Remove error');
      });
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      removeFromLocalStorage('test-key');
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});