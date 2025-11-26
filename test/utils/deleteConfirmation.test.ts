import { describe, it, expect, vi, beforeEach } from 'vitest';
import { showDeleteConfirmation } from '../../src/utils/deleteConfirmation';
import Swal from 'sweetalert2';

// Mock de SweetAlert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn()
  }
}));

const mockSwalFire = vi.mocked(Swal.fire);

describe('Pruebas de deleteConfirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar confirmación de eliminación con configuración correcta', async () => {
    // Arrange
    mockSwalFire.mockResolvedValue({ isConfirmed: true } as any);

    // Act
    const result = await showDeleteConfirmation('usuario', 'Juan Pérez');

    // Assert
    expect(mockSwalFire).toHaveBeenCalledWith({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar el usuario "Juan Pérez"? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    expect(result).toBe(true);
  });

  it('debe retornar false cuando se cancela', async () => {
    // Arrange
    mockSwalFire.mockResolvedValue({ isConfirmed: false } as any);

    // Act
    const result = await showDeleteConfirmation('producto', 'Manzana');

    // Assert
    expect(result).toBe(false);
  });

  it('debe personalizar el mensaje según el tipo de elemento', async () => {
    // Arrange
    mockSwalFire.mockResolvedValue({ isConfirmed: true } as any);

    // Act
    await showDeleteConfirmation('pedido', '#001');

    // Assert
    expect(mockSwalFire).toHaveBeenCalledWith(
      expect.objectContaining({
        text: '¿Deseas eliminar el pedido "#001"? Esta acción no se puede deshacer.'
      })
    );
  });

  it('debe manejar errores de Swal', async () => {
    // Arrange
    mockSwalFire.mockRejectedValue(new Error('Error de Swal'));

    // Act
    const result = await showDeleteConfirmation('usuario', 'Test');

    // Assert
    expect(result).toBe(false);
  });
});