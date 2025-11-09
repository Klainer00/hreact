import Swal from 'sweetalert2';
import type { Producto } from '../interfaces/producto';
import { useCarrito } from '../context/CarritoProvider';

interface Props {
  producto: Producto;
}

const ProductoCard = ({ producto }: Props) => {
  const { agregarAlCarrito } = useCarrito();

  const handleAgregar = () => {
    agregarAlCarrito(producto);

    Swal.fire({
      title: "¡Producto Agregado!",
      text: `"${producto.nombre}" se ha añadido a tu carrito.`,
      icon: "success",
      toast: true,
      position: "bottom-end", // <-- 1. POSICIÓN CAMBIADA
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      didOpen: (toast) => { // <-- 2. ESTO EVITA PROBLEMAS DE FOCO CON EL MODAL
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
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