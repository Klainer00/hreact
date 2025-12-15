import { useState, useEffect } from 'react';
import type { Producto } from '../../interfaces/producto';
import { fetchProductos, agregarProducto, actualizarProducto, eliminarProducto } from '../../utils/api';
import { loadPedidos } from '../../utils/storage';
import ModalProducto from '../../components/modals/ModalProducto';
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

  const handleEliminar = async (id: number) => {
    // Verificar si el producto está en algún pedido
    const pedidos = loadPedidos();
    const productoEnPedido = pedidos.some(pedido => 
      pedido.detalles.some((detalle: any) => detalle.productoId === id)
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

    const result = await Swal.fire({
      title: "¿Está seguro?",
      text: "¿Desea eliminar este producto? Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      // Llamar a la API
      const response = await eliminarProducto(id);
      
      if (response.success) {
        const nuevosProductos = productos.filter(p => p.id !== id);
        setProductos(nuevosProductos);
        localStorage.setItem('productos', JSON.stringify(nuevosProductos));
        
        Swal.fire({
          title: "Eliminado",
          text: "El producto ha sido eliminado exitosamente.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          title: "Error",
          text: response.message || "No se pudo eliminar el producto.",
          icon: "error"
        });
      }
    }
  };

  const handleSave = async (producto: Producto) => {
    try {
      let response;
      
      if (productoToEdit) {
        // Modo Editar - Llamar a la API
        response = await actualizarProducto(producto.id!, producto);
        
        if (response.success) {
          // Actualizar en el estado local
          const nuevosProductos = productos.map((p: Producto) => 
            p.id === producto.id ? { ...p, ...producto } : p
          );
          setProductos(nuevosProductos);
          localStorage.setItem('productos', JSON.stringify(nuevosProductos));
          
          Swal.fire({
            title: "Actualizado",
            text: "El producto ha sido actualizado exitosamente.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
          });
        }
      } else {
        // Modo Crear - Llamar a la API
        response = await agregarProducto(producto);
        
        if (response.success) {
          // Recargar productos desde la API para obtener el ID correcto
          const data = await fetchProductos();
          setProductos(data);
          localStorage.setItem('productos', JSON.stringify(data));
          
          Swal.fire({
            title: "Creado",
            text: "El producto ha sido creado exitosamente.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
          });
        }
      }
      
      if (response?.success) {
        setShowModal(false);
      } else {
        throw new Error(response?.message || 'Error desconocido');
      }
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error.message || "No se pudo guardar el producto.",
        icon: "error"
      });
    }
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
              <th>ID</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(prod => (
              <tr key={prod.id}>
                <td>{prod.id}</td>
                <td>
                  <img 
                    src={prod.imagenUrl?.startsWith('../') ? prod.imagenUrl.substring(3) : prod.imagenUrl} 
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
                    onClick={() => handleEditar(prod)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-danger btn-sm btn-eliminar ms-1" 
                    onClick={() => handleEliminar(prod.id!)}
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