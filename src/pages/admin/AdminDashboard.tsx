import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUsuarios, fetchProductos } from '../../utils/api';
import { loadPedidos } from '../../utils/storage';
import type { Usuario } from '../../interfaces/usuario';
import type { Producto } from '../../interfaces/producto';

const AdminDashboard = () => {
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [pedidoCount, setPedidoCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadStats = async () => {
      // --- 💡 INICIO DE LA CORRECCIÓN 💡 ---

      // 1. Cargar Usuarios desde localStorage (igual que AdminUsuarios.tsx)
      let usuariosGuardados: Usuario[] = JSON.parse(localStorage.getItem('usuarios') || 'null');
      if (!usuariosGuardados) {
        usuariosGuardados = await fetchUsuarios(); // Carga inicial desde JSON si no existe
        localStorage.setItem('usuarios', JSON.stringify(usuariosGuardados));
      }
      setUserCount(usuariosGuardados.length);

      // 2. Cargar Productos desde localStorage (igual que AdminProductos.tsx)
      let productosGuardados: Producto[] = JSON.parse(localStorage.getItem('productos') || 'null');
      if (!productosGuardados) {
        productosGuardados = await fetchProductos(); // Carga inicial desde JSON si no existe
        localStorage.setItem('productos', JSON.stringify(productosGuardados));
      }
      setProductCount(productosGuardados.length);

      // 3. Cargar Pedidos (esto ya estaba bien)
      const pedidos = loadPedidos();
      setPedidoCount(pedidos.length);
      
      // --- 💡 FIN DE LA CORRECCIÓN 💡 ---
    };
    
    loadStats();
  }, []); // Se ejecuta solo una vez al montar

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Dashboard</h1>
      </div>

      <div className="row g-4">
        {/* Tarjeta de Pedidos */}
        <div className="col-md-4">
          <div 
            className="card dashboard-card bg-primary text-white" 
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/admin/pedidos.html')}
          >
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
          <div 
            className="card dashboard-card bg-success text-white"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/admin/usuarios.html')}
          >
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
          <div 
            className="card dashboard-card bg-info text-white"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/admin/producto.html')}
          >
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
      <p>Bienvenido al panel de administración. Haz clic en las tarjetas de arriba para ir directamente a cada sección o utiliza la barra lateral para navegar.</p>
    </>
  );
};

export default AdminDashboard;