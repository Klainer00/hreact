import { useState } from 'react';
import Swal from 'sweetalert2';
import type { Producto } from '../interfaces/producto';
import { useCarrito } from '../context/CarritoProvider';

interface Props {
  producto: Producto;
}

const ProductoCard = ({ producto }: Props) => {
  const { agregarAlCarrito } = useCarrito();
  
  const [alertaEnCooldown, setAlertaEnCooldown] = useState(false);

  const handleAgregar = () => {
    agregarAlCarrito(producto);

    if (alertaEnCooldown) {
      return;
    }

    setAlertaEnCooldown(true);

    Swal.fire({
      title: "¡Producto Agregado!",
      text: `"${producto.nombre}" se ha añadido a tu carrito.`,
      icon: "success",
      toast: true,
      position: "bottom-end", 
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    
    setTimeout(() => {
      setAlertaEnCooldown(false);
    }, 5000);
  };
  
  // CORRECCIÓN DE IMAGEN: Manejo de null/undefined y src=""
  const imagen = producto.imagen || '';
  const rutaImagenBase = imagen.startsWith('../') ? imagen.substring(3) : imagen;
  const rutaImagen = rutaImagenBase === '' ? undefined : rutaImagenBase; // undefined para evitar src=""

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