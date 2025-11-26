export const formatRutOnType = (value: string): string => {
  // Limpiar el valor manteniendo solo números y K/k
  const cleanValue = value.replace(/[^0-9kK]/g, '');
  
  if (cleanValue.length === 0) {
    return '';
  }

  if (cleanValue.length === 1) {
    return cleanValue;
  }

  let body = cleanValue.slice(0, -1);
  const dv = cleanValue.slice(-1);

  // Agregar puntos cada 3 dígitos
  body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${body}-${dv}`;
};

export const formatRut = (value: string): string => {
  // Si el valor ya tiene formato (puntos pero sin guión), mantenerlo
  if (value.includes('.') && !value.includes('-')) {
    return value;
  }
  
  // Limpiar el valor manteniendo solo números y K/k
  const cleanValue = value.replace(/[^0-9kK]/g, '');
  
  if (cleanValue.length === 0) {
    return '';
  }

  if (cleanValue.length === 1) {
    return cleanValue;
  }

  let body = cleanValue.slice(0, -1);
  let dv = cleanValue.slice(-1);

  // Agregar puntos cada 3 dígitos
  body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${body}-${dv}`;
};