export function checkRut(rut: string): { valid: boolean; message: string } {
  let valor = rut.replace(/\./g, '').replace('-', ''); // Limpia puntos y guión
  
  if (valor.length === 0) {
    return { valid: false, message: "El RUT está vacío." };
  }

  const cuerpo = valor.slice(0, -1);
  let dv = valor.slice(-1).toUpperCase();

  if (cuerpo.length < 7) {
    return { valid: false, message: "RUT Incompleto." };
  }

  let suma = 0;
  let multiplo = 2;

  for (let i = 1; i <= cuerpo.length; i++) {
    const index = multiplo * parseInt(cuerpo.charAt(cuerpo.length - i));
    suma = suma + index;
    if (multiplo < 7) { 
      multiplo = multiplo + 1; 
    } else { 
      multiplo = 2; 
    }
  }

  const dvCalculado = 11 - (suma % 11);
  let dvEsperado;
  
  if (dvCalculado === 11) {
    dvEsperado = '0';
  } else if (dvCalculado === 10) {
    dvEsperado = 'K';
  } else {
    dvEsperado = dvCalculado.toString();
  }

  if (dvEsperado !== dv) {
    return { valid: false, message: "El dígito verificador es incorrecto." };
  }

  return { valid: true, message: "" };
}