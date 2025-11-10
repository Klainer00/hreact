export const formatRutOnType = (value: string): string => {
  const cleanValue = value.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (cleanValue.length === 0) {
    return '';
  }

  if (cleanValue.length === 1) {
    return cleanValue;
  }

  let body = cleanValue.slice(0, -1);
  const dv = cleanValue.slice(-1);

  body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${body}-${dv}`;
};