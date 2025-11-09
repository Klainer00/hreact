import type { Producto } from '../interfaces/producto';
import { useCarrito } from '../context/CarritoProvider';

interface Props {
  producto: Producto;
}

const ProductoCard = ({ producto }: Props) => {
  const { agregarAlCarrito } = useCarrito();

  const handleAgregar = () => {
    // Aquí puedes agregar lógica de Toast como en main.js
    // Por ahora solo lo agrega
    agregarAlCarrito(producto, 1);
  };
  
  // Corregir ruta de imagen (ej: de ../img/manzana.png a /img/manzana.png)
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