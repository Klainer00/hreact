import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Producto } from '../interfaces/producto';
import { fetchProductos } from '../utils/api';
import ProductoCard from '../components/ProductoCard';

const Home = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDestacados = async () => {
      setLoading(true);
      const todosLosProductos = await fetchProductos();
      // Simula "destacados" tomando solo los primeros 4
      setProductos(todosLosProductos.slice(0, 4)); 
      setLoading(false);
    };
    cargarDestacados();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <header className="hero text-dark text-center py-5">
        <div className="container py-5">
          <h1 className="display-3">TIENDA ONLINE</h1>
          <p className="lead mb-4">Llevamos la frescura y calidad de los productos del campo directamente a tu puerta.</p>
          <Link to="/productos.html" className="btn btn-lg btn-light">Ver Productos</Link>
        </div>
      </header>

      {/* Productos Destacados */}
      <section className="container my-5">
        <h2 className="text-center mb-4">Productos Destacados</h2>
        {loading ? (
          <div className="text-center">Cargando productos...</div>
        ) : (
          <div className="row g-4">
            {productos.map(prod => (
              <ProductoCard key={prod.id} producto={prod} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default Home;