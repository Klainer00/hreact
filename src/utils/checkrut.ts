export function checkRut(rut: string): { valid: boolean; message: string } {
  let valor = rut.replace(/\./g, '').replace('-', ''); 
  
  if (valor.length === 0) {
    return { valid: false, message: "El RUT está vacío" };
  }

  const cuerpo = valor.slice(0, -1);
  let dv = valor.slice(-1).toUpperCase();

  if (cuerpo.length < 7) {
    return { valid: false, message: "RUT Incompleto" };
  }

  let suma = 0;
  let multiplo = 2;

  for (let i = 1; i <= cuerpo.length; i++) {
    const index = multiplo * parseInt(valor.charAt(cuerpo.length - i));
    suma = suma + index;
    if (multiplo < 7) { 
      multiplo = multiplo + 1; 
    } else { 
      multiplo = 2; 
    }
  }

  const dvEsperado = 11 - (suma % 11);
  const dvNumerico = (dv === 'K') ? 10 : (dv === '0' ? 11 : parseInt(dv));

  if (dvEsperado !== dvNumerico) {
    return { valid: false, message: "RUT Inválido" };
  }

  return { valid: true, message: "" };
}