import { useState, useEffect } from 'react';
import type { Producto } from '../interfaces/producto';
import { fetchProductos } from '../utils/api';
import ProductoCard from '../components/ProductoCard';

const Productos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);
      const data = await fetchProductos();
      setProductos(data);
      setLoading(false);
    };
    cargarProductos();
  }, []);

  return (
    <main className="container my-5">
      <h2 className="text-center mb-4">Nuestro Catálogo</h2>
      
      {loading ? (
        <div className="text-center">Cargando productos...</div>
      ) : (
        <div id="product-list" className="row g-4">
          {productos.map(prod => (
            <ProductoCard key={prod.codigo} producto={prod} />
          ))}
        </div>
      )}
    </main>
  );
};

export default Productos;