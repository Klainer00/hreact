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