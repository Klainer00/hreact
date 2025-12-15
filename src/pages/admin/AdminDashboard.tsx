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
      try {
        // 1. Cargar Usuarios desde la API y actualizar localStorage
        const usuariosActualizados = await fetchUsuarios();
        localStorage.setItem('usuarios', JSON.stringify(usuariosActualizados));
        setUserCount(usuariosActualizados.length);

        // 2. Cargar Productos desde la API y actualizar localStorage
        const productosActualizados = await fetchProductos();
        localStorage.setItem('productos', JSON.stringify(productosActualizados));
        setProductCount(productosActualizados.length);

        // 3. Cargar Pedidos desde localStorage
        const pedidos = loadPedidos();
        setPedidoCount(pedidos.length);
        
        console.log('📊 Dashboard actualizado:', {
          usuarios: usuariosActualizados.length,
          productos: productosActualizados.length,
          pedidos: pedidos.length
        });
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
        // Fallback a localStorage si falla la API
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        const productos = JSON.parse(localStorage.getItem('productos') || '[]');
        const pedidos = loadPedidos();
        setUserCount(usuarios.length);
        setProductCount(productos.length);
        setPedidoCount(pedidos.length);
      }
    };
    
    // Cargar estadísticas al montar
    loadStats();
    
    // Actualizar cada 5 segundos
    const interval = setInterval(loadStats, 5000);
    
    // Actualizar cuando la página recupera el foco
    const handleFocus = () => {
      console.log('🔄 Dashboard: Página recuperó el foco, actualizando...');
      loadStats();
    };
    window.addEventListener('focus', handleFocus);
    
    // Limpiar intervalos y listeners al desmontar
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
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