import { useState } from 'react'; // <-- 1. IMPORTA 'useState'
import Swal from 'sweetalert2';
import type { Producto } from '../interfaces/producto';
import { useCarrito } from '../context/CarritoProvider';

interface Props {
  producto: Producto;
}

const ProductoCard = ({ producto }: Props) => {
  const { agregarAlCarrito } = useCarrito();
  
  // 2. AÑADE UN ESTADO PARA CONTROLAR EL COOLDOWN
  const [enCooldown, setEnCooldown] = useState(false);

  // 3. CONVIERTE LA FUNCIÓN EN 'async' para usar 'await'
  const handleAgregar = async () => {
    
    // 4. VERIFICA SI ESTÁ EN COOLDOWN
    // Si es 'true', no hagas nada.
    if (enCooldown) {
      return; 
    }

    // 5. ACTIVA EL COOLDOWN
    setEnCooldown(true);
    
    // Agrega el producto al carrito
    agregarAlCarrito(producto);

    // 6. MUESTRA LA ALERTA (con 'await' y 5 segundos)
    await Swal.fire({
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

    // 8. DESACTIVA EL COOLDOWN (después de que la alerta se cierra)
    setEnCooldown(false);
  };
  
  const rutaImagen = producto.imagen.startsWith('../') ? producto.imagen.substring(3) : producto.imagen;

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
              // 9. DESHABILITA EL BOTÓN si está en cooldown
              disabled={enCooldown} 
            >
              {/* 10. (Opcional) Cambia el texto mientras está en cooldown */}
              {enCooldown ? 'Agregado ✓' : 'Añadir al Carrito'}
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