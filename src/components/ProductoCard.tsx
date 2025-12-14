import { useState } from 'react'; // <-- 1. IMPORTA 'useState'
import Swal from 'sweetalert2';
import type { Producto } from '../interfaces/producto';
import { useCarrito } from '../context/CarritoProvider';

interface Props {
  producto: Producto;
}

const ProductoCard = ({ producto }: Props) => {
  const { agregarAlCarrito } = useCarrito();
  
  // 2. ESTADO PARA CONTROLAR EL COOLDOWN DE LA ALERTA
  const [alertaEnCooldown, setAlertaEnCooldown] = useState(false);

  const handleAgregar = () => {
    // 3. LA ACCIÓN DE AGREGAR AL CARRITO SIEMPRE SE EJECUTA
    agregarAlCarrito(producto);

    // 4. SI LA ALERTA ESTÁ EN COOLDOWN, SALIMOS TEMPRANO
    // (El producto ya se agregó, pero no mostramos la alerta)
    if (alertaEnCooldown) {
      return;
    }

    // 5. SI NO ESTÁ EN COOLDOWN, ACTIVAMOS EL COOLDOWN
    setAlertaEnCooldown(true);

    // 6. MOSTRAMOS LA ALERTA (con 5 segundos)
    Swal.fire({
      title: "¡Producto Agregado!",
      text: `"${producto.nombre}" se ha añadido a tu carrito.`,
      icon: "success",
      toast: true,
      position: "bottom-end", 
      showConfirmButton: false,
      timer: 5000, // <-- 7. CAMBIADO A 5 SEGUNDOS
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    
    // 8. DESPUÉS DE 5 SEGUNDOS, RESETEAMOS EL COOLDOWN
    // Esto permite que la próxima vez que el usuario haga clic
    // (después de 5s) se vuelva a mostrar la alerta.
    setTimeout(() => {
      setAlertaEnCooldown(false);
    }, 5000); // 5 segundos
  };
  
  const imagen = producto.imagen || ''; // Aseguramos que sea un string vacío si es null/undefined
  const rutaImagen = imagen.startsWith('../') ? imagen.substring(3) : imagen;

  return (
    <div className="col-lg-3 col-md-6">
      <div className="card h-100 shadow-sm">
        <img src={rutaImagen} className="card-img-top" alt={producto.nombre} />
        <div className="card-body text-center">
          <h5 className="card-title">{producto.nombre}</h5>
          <p className="card-text price">${producto.precio.toLocaleString('es-CL')} / kg</p>
          {producto.stock > 0 ? (
            <button 
              className="btn btn-success add-to-cart" 
              onClick={handleAgregar}
              // IMPORTANTE: El botón ya NO tiene la propiedad "disabled"
            >
              Añadir al Carrito
            </button>
          ) : (
            <button className="btn btn-secondary" disabled>Sin Stock</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductoCard;