import { useState, useEffect } from 'react';
import { fetchProductos } from '../../utils/api'; // fetchProductos está bien, no los modificamos
import { loadPedidos } from '../../utils/storage';
import type { Usuario } from '../../interfaces/usuario';
import type { Producto } from '../../interfaces/producto';
import type { Pedido } from '../../interfaces/pedido';

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [pedidoCount, setPedidoCount] = useState(0);

  // 💡 INICIO DE LA CORRECCIÓN
  // Usamos 'useEffect' para cargar datos cuando el componente aparece.
  useEffect(() => {
    const loadStats = async () => {
      // 1. Cargamos productos y pedidos como antes
      const [products, pedidos] = await Promise.all([
        fetchProductos(),
        loadPedidos()
      ]);
      
      // 2. Cargamos los usuarios DESDE LOCALSTORAGE
      // Esta es la misma lógica que usa AdminUsuarios.tsx para obtener la lista
      const usuariosGuardados: Usuario[] = JSON.parse(localStorage.getItem('usuarios') || '[]');
      
      // 3. Actualizamos los contadores
      setUserCount(usuariosGuardados.length);
      setProductCount(products.length);
      setPedidoCount(pedidos.length);
    };
    
    loadStats();
    
    // Opcional: Escuchar cambios en localStorage para actualizar en tiempo real
    // (Esto es más avanzado, por ahora lo cargamos al inicio)

  }, []); // El array vacío '[]' hace que se ejecute solo una vez al montar

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Dashboard</h1>
      </div>

      <div className="row g-4">
        {/* Tarjeta de Pedidos */}
        <div className="col-md-4">
          <div className="card dashboard-card bg-primary text-white">
            <div className="card-body">
              <div>
                <h5 className="card-title">Total Pedidos</h5>
                <h2 className="display-4">{pedidoCount}</h2>
              </div>
              <div className="card-icon">🛒</div>
            </div>
          </div>
        </div>

        {/* Tarjeta de Usuarios */}
        <div className="col-md-4">
          <div className="card dashboard-card bg-success text-white">
            <div className="card-body">
              <div>
                <h5 className="card-title">Total Usuarios</h5>
                <h2 className="display-4">{userCount}</h2>
              </div>
              <div className="card-icon">👥</div>
            </div>
          </div>
        </div>

        {/* Tarjeta de Productos */}
        <div className="col-md-4">
          <div className="card dashboard-card bg-info text-white">
            <div className="card-body">
              <div>
                <h5 className="card-title">Total Productos</h5>
                <h2 className="display-4">{productCount}</h2>
              </div>
              <div className="card-icon">📦</div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-5">Acciones Rápidas</h2>
      <p>Bienvenido al panel de administración. Utiliza la barra lateral para gestionar usuarios, productos y pedidos.</p>
    </>
  );
};

export default AdminDashboard;