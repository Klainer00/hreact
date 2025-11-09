import { useState, useEffect, useMemo } from 'react';
import type { Producto } from '../interfaces/producto';
import { fetchProductos } from '../utils/api';
import ProductoCard from '../components/ProductoCard';

const Productos = () => {
  // --- Estados ---
  // 1. Almacena la lista COMPLETA de productos (nuestra "fuente de verdad")
  const [todosLosProductos, setTodosLosProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 2. Estados para los filtros
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas'); // 'Todas' será el valor por defecto

  // --- Carga de Datos ---
  useEffect(() => {
    const cargarProductos = async () => {
      setLoading(true);
      const data = await fetchProductos();
      setTodosLosProductos(data);
      setLoading(false);
    };
    cargarProductos();
  }, []); // Se ejecuta solo una vez al montar el componente

  // --- Lógica de Filtrado ---

  // 3. Obtenemos las categorías únicas de los productos (usando useMemo para eficiencia)
  const categorias = useMemo(() => {
    const setDeCategorias = new Set(todosLosProductos.map(p => p.categoria));
    return ['Todas', ...Array.from(setDeCategorias)];
  }, [todosLosProductos]);

  // 4. Filtramos los productos basándonos en los estados (usando useMemo)
  // Esta lista se recalcula SOLO si los productos o los filtros cambian
  const productosFiltrados = useMemo(() => {
    let productos = [...todosLosProductos];

    // Primero, filtrar por categoría
    if (filtroCategoria !== 'Todas') {
      productos = productos.filter(p => p.categoria === filtroCategoria);
    }

    // Segundo, filtrar por búsqueda
    if (filtroBusqueda.trim() !== '') {
      productos = productos.filter(p => 
        p.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase())
      );
    }

    return productos;
  }, [todosLosProductos, filtroCategoria, filtroBusqueda]);


  // --- Renderizado ---
  return (
    <main className="container my-5">
      <h2 className="text-center mb-4">Nuestro Catálogo</h2>

      {/* 5. Barra de Búsqueda y Filtros */}
      <div className="row mb-4 g-3 align-items-center">
        {/* Barra de Búsqueda */}
        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar producto por nombre..."
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value)}
          />
        </div>
        
        {/* Filtro de Categoría */}
        <div className="col-md-4">
          <div className="input-group">
            <label className="input-group-text" htmlFor="filtro-categoria">Categoría</label>
            <select 
              className="form-select" 
              id="filtro-categoria"
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
      </div>
      
      {/* 6. Lista de Productos Filtrados */}
      {loading ? (
        <div className="text-center">Cargando productos...</div>
      ) : (
        <div id="product-list" className="row g-4">
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map(prod => (
              <ProductoCard key={prod.codigo} producto={prod} />
            ))
          ) : (
            <div className="col-12">
              <p className="text-center text-muted">No se encontraron productos que coincidan con tu búsqueda.</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default Productos;