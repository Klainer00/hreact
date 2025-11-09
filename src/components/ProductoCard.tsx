import Swal from 'sweetalert2'; // Para la alerta
import type { Producto } from '../interfaces/producto'; // <-- Tu ruta
import { useCarrito } from '../context/CarritoProvider'; // Para la lógica del carrito

// Define las 'props' que recibirá el componente
interface Props {
  producto: Producto;
}

const ProductoCard = ({ producto }: Props) => {
  // Obtiene la función para agregar al carrito desde el contexto
  const { agregarAlCarrito } = useCarrito();

  const handleAgregar = () => {
    // 1. Llama a la función del carrito
    agregarAlCarrito(producto);

    // 2. Muestra la alerta SweetAlert
    Swal.fire({
      title: "¡Producto Agregado!",
      text: `"${producto.nombre}" se ha añadido a tu carrito.`,
      icon: "success",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });
  };
  
  // Arregla la ruta de la imagen (ej: de ../img/manzana.png a /img/manzana.png)
  // Tu JSON de productos tiene rutas mixtas.
  const rutaImagen = producto.imagen.startsWith('../') 
    ? producto.imagen.substring(3) 
    : producto.imagen;

  return (
    <div className="col-lg-3 col-md-6">
      <div className="card h-100 shadow-sm">
        {/* Usamos la ruta de imagen corregida */}
        <img src={rutaImagen} className="card-img-top" alt={producto.nombre} />
        <div className="card-body text-center">
          <h5 className="card-title">{producto.nombre}</h5>
          <p className="card-text price">${producto.precio.toLocaleString('es-CL')} / kg</p>
          
          {/* Lógica para mostrar botón de "Añadir" o "Sin Stock" */}
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