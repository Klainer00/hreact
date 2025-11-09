import { useState, useEffect } from 'react';
import type { Producto } from '../../interfaces/producto';
import { fetchProductos } from '../../utils/api';

const AdminProductos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lógica de carga de productosadmin.js
    const cargarDatos = async () => {
      setLoading(true);
      const data = await fetchProductos();
      setProductos(data);
      setLoading(false);
    };
    cargarDatos();
  }, []);

  if (loading) {
    return <div>Cargando productos...</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Gestión de Productos</h1>
        <button type="button" className="btn btn-sm btn-outline-success">
          + Agregar Nuevo Producto
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-sm">
          <thead>
            <tr>
              <th>Código</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(prod => (
              <tr key={prod.codigo}>
                <td>{prod.codigo}</td>
                <td>
                  <img src={prod.imagen.startsWith('../') ? prod.imagen.substring(3) : prod.imagen} alt={prod.nombre} width="50" />
                </td>
                <td>{prod.nombre}</td>
                <td>${prod.precio.toLocaleString('es-CL')}</td>
                <td>{prod.stock}</td>
                <td>
                  <button className="btn btn-primary btn-sm btn-editar" data-id={prod.codigo}>Editar</button>
                  <button className="btn btn-danger btn-sm btn-eliminar ms-1" data-id={prod.codigo}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modales de Bootstrap para Agregar/Editar Producto */}
    </>
  );
};

export default AdminProductos;