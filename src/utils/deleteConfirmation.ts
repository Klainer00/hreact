import Swal from 'sweetalert2';

export const confirmDelete = async (itemName: string = 'elemento') => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `El ${itemName} será eliminado permanentemente`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    await Swal.fire({
      title: '¡Eliminado!',
      text: `El ${itemName} ha sido eliminado correctamente`,
      icon: 'success',
      confirmButtonColor: '#198754'
    });
    return true;
  }
  return false;
};

export const showDeleteConfirmation = async (tipo: string, nombre: string): Promise<boolean> => {
  try {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar el ${tipo} "${nombre}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    return result.isConfirmed;
  } catch (error) {
    return false;
  }
};