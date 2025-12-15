import { useState, useEffect, useMemo } from 'react';
import type { Producto } from '../interfaces/producto';
import { fetchProductos } from '../utils/api'; // Importamos la función real
import ProductoCard from '../components/ProductoCard';

const Productos = () => {
  const [todosLosProductos, setTodosLosProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para filtros
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');

  // Cargar productos desde el Backend al iniciar
  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);
      try {
        const data = await fetchProductos(); // Llamada a la API real
        console.log('📦 Productos cargados desde API:', data);
        setTodosLosProductos(data);
        // Guardar en localStorage para sincronización con el carrito
        localStorage.setItem('productos', JSON.stringify(data));
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError('Hubo un problema al cargar el catálogo. Intenta refrescar la página.');
      } finally {
        setLoading(false);
      }
    };
    cargarProductos();
    
    // Actualizar productos cada 5 segundos para mantener stock sincronizado
    const interval = setInterval(cargarProductos, 5000);
    return () => clearInterval(interval);
  }, []);

  // Obtener categorías únicas dinámicamente
  const categorias = useMemo(() => {
    const setDeCategorias = new Set(todosLosProductos.map(p => p.categoria));
    return ['Todas', ...Array.from(setDeCategorias)];
  }, [todosLosProductos]);

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    let productos = [...todosLosProductos];

    if (filtroCategoria !== 'Todas') {
      productos = productos.filter(p => p.categoria === filtroCategoria);
    }

    if (filtroBusqueda.trim() !== '') {
      productos = productos.filter(p => 
        p.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase())
      );
    }

    return productos;
  }, [todosLosProductos, filtroCategoria, filtroBusqueda]);

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Nuestro Catálogo</h2>

      {/* Buscador y Filtros */}
      <div className="row mb-4 g-3 align-items-center">
        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar producto por nombre..."
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value)}
          />
        </div>
        
        <div className="col-md-4">
          <select 
            className="form-select" 
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Lista de Productos */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
          <p className="mt-2">Cargando productos frescos...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : (
        <div id="product-list" className="row g-4">
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map(prod => (
              <ProductoCard key={prod.id} producto={prod} />
            ))
          ) : (
            <div className="col-12">
              <p className="text-center text-muted">No se encontraron productos.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Productos;