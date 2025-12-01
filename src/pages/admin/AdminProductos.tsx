import { useState, useEffect } from 'react';
import type { Producto } from '../../interfaces/producto';
import { fetchProductos } from '../../utils/api';
import { loadPedidos } from '../../utils/storage'; // Importar función para cargar pedidos
import ModalProducto from '../../components/modals/ModalProducto'; // <-- 1. Importar el modal
import Swal from 'sweetalert2';

const AdminProductos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  // --- 2. Estados para manejar el modal ---
  const [showModal, setShowModal] = useState(false);
  const [productoToEdit, setProductoToEdit] = useState<Producto | null>(null);

  useEffect(() => {
    const loadProductos = async () => {
      try {
        setLoading(true);
        console.log('📥 Cargando productos desde la API...');
        
        // Cargar desde la API
        const data = await fetchProductos();
        console.log('✅ Productos cargados:', data);
        
        // Guardar en localStorage también para offline
        localStorage.setItem('productos', JSON.stringify(data));
        
        setProductos(data);
      } catch (error) {
        console.error('❌ Error cargando productos:', error);
        
        // Si hay error, intentar cargar desde localStorage
        const productosGuardados = JSON.parse(localStorage.getItem('productos') || '[]');
        setProductos(productosGuardados);
        
        await Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los productos desde la API. Mostrando datos locales.',
          icon: 'warning'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadProductos();
  }, []);

  // --- 3. Funciones para abrir el modal ---
  const handleAgregar = () => {
    setProductoToEdit(null); // Modo "Crear"
    setShowModal(true);
  };

  const handleEditar = (producto: Producto) => {
    setProductoToEdit(producto); // Modo "Editar"
    setShowModal(true);
  };

  const handleEliminar = (codigo: string) => {
    // Verificar si el producto está en algún pedido
    const pedidos = loadPedidos();
    const productoEnPedido = pedidos.some(pedido => 
      pedido.items.some(item => item.id === codigo)
    );

    if (productoEnPedido) {
      Swal.fire({
        title: "No se puede eliminar",
        text: "Este producto no puede ser eliminado porque está asociado a uno o más pedidos.",
        icon: "warning",
        confirmButtonText: "Entendido"
      });
      return;
    }

    Swal.fire({
      title: "¿Está seguro?",
      text: "¿Desea eliminar este producto? Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevosProductos = productos.filter(p => p.codigo !== codigo);
        setProductos(nuevosProductos);
        localStorage.setItem('productos', JSON.stringify(nuevosProductos));
        
        Swal.fire({
          title: "Eliminado",
          text: "El producto ha sido eliminado exitosamente.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  // --- 4. Función para guardar cambios (Crear o Editar) ---
  const handleSave = (producto: Producto) => {
    let nuevosProductos;
    const productosGuardados = JSON.parse(localStorage.getItem('productos') || '[]');

    if (productoToEdit) {
      // Modo Editar
      nuevosProductos = productosGuardados.map((p: Producto) => 
        p.codigo === producto.codigo ? { ...p, ...producto } : p
      );
    } else {
      // Modo Crear
      // Validar que el código no exista
      const codigoExiste = productosGuardados.some((p: Producto) => p.codigo === producto.codigo);
      if (codigoExiste) {
        Swal.fire("Error", "El código (SKU) de ese producto ya existe.", "error");
        return;
      }
      nuevosProductos = [...productosGuardados, producto];
    }
    
    setProductos(nuevosProductos);
    localStorage.setItem('productos', JSON.stringify(nuevosProductos));
    setShowModal(false); // Cierra el modal
  };

  if (loading) {
    return <div>Cargando productos...</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Gestión de Productos</h1>
        <button 
          type="button" 
          className="btn btn-sm btn-outline-success"
          onClick={handleAgregar} // <-- 5. Conectar botón
        >
          + Agregar Nuevo Producto
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-sm admin-table">
          <thead className="table-light">
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
                  <img 
                    src={prod.imagen.startsWith('../') ? prod.imagen.substring(3) : prod.imagen} 
                    alt={prod.nombre} 
                    width="50" 
                  />
                </td>
                <td>{prod.nombre}</td>
                <td>${prod.precio.toLocaleString('es-CL')}</td>
                <td>{prod.stock}</td>
                <td>
                  <button 
                    className="btn btn-primary btn-sm btn-editar" 
                    onClick={() => handleEditar(prod)} // <-- 6. Conectar botón
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-danger btn-sm btn-eliminar ms-1" 
                    onClick={() => handleEliminar(prod.codigo)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 7. Renderizar el modal */}
      <ModalProducto 
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        productoToEdit={productoToEdit}
      />
    </>
  );
};

export default AdminProductos;