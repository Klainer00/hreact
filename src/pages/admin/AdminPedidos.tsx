import { useState, useEffect } from 'react';
import type { Pedido } from '../../interfaces/pedido';
import { fetchPedidos } from '../../utils/api';
import { loadPedidos } from '../../utils/storage';
import ModalPedidoDetalle from '../../components/modals/ModalPedidoDetalle'; // <-- 1. Importar modal
import Swal from 'sweetalert2';

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 2. Estado para manejar el modal
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        setLoading(true);
        console.log('📦 Cargando pedidos desde la API como ADMIN...');
        console.log('🔑 Token presente:', !!localStorage.getItem('authToken'));
        
        // Cargar desde la API con parámetro isAdmin=true
        const data = await fetchPedidos(true);
        console.log('✅ Pedidos cargados:', data.length, 'pedidos');
        console.log('📋 Datos:', data);
        
        // Guardar en localStorage también
        if (data.length > 0) {
          localStorage.setItem('pedidos', JSON.stringify(data));
        }
        
        setPedidos(data.reverse()); // Mostrar los más recientes primero
      } catch (error) {
        console.error('❌ Error cargando pedidos:', error);
        
        // Si hay error, intentar cargar desde localStorage
        const pedidosGuardados = loadPedidos();
        console.log('💾 Pedidos desde localStorage:', pedidosGuardados.length);
        setPedidos(pedidosGuardados.reverse());
        
        if (pedidosGuardados.length === 0) {
          await Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los pedidos. Verifica que hayas iniciado sesión correctamente.',
            icon: 'warning'
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    // Cargar pedidos inmediatamente
    cargarPedidos();
    
    // Actualizar pedidos cada 5 segundos
    const interval = setInterval(() => {
      console.log('🔄 Auto-actualización de pedidos...');
      cargarPedidos();
    }, 5000);
    
    // Actualizar cuando la página recupera el foco
    const handleFocus = () => {
      console.log('👁️ Página recuperó foco, actualizando pedidos...');
      cargarPedidos();
    };
    window.addEventListener('focus', handleFocus);
    
    // Limpiar intervalos y listeners
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  if (loading) {
    return <div>Cargando pedidos...</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Gestión de Pedidos</h1>
      </div>

      <div className="table-responsive">
        {pedidos.length === 0 ? (
          <p className="text-muted">Aún no se han realizado pedidos.</p>
        ) : (
          <table className="table table-hover table-sm admin-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(pedido => (
                <tr key={pedido.id}>
                  <td>{pedido.id}</td>
                  <td>{new Date(pedido.fecha).toLocaleDateString('es-CL')}</td>
                  <td>Usuario ID: {pedido.usuarioId}</td>
                  <td>${pedido.total?.toLocaleString('es-CL') || '0'}</td>
                  <td>
                    <span className={`badge ${
                      pedido.estado === 'ENTREGADO' ? 'bg-success' :
                      pedido.estado === 'CANCELADO' ? 'bg-danger' :
                      pedido.estado === 'EN_CAMINO' ? 'bg-info' :
                      'bg-warning'
                    }`}>
                      {pedido.estado || 'PENDIENTE'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => setPedidoSeleccionado(pedido)}
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 5. Renderizar el modal */}
      <ModalPedidoDetalle
        pedido={pedidoSeleccionado}
        onClose={() => setPedidoSeleccionado(null)}
      />
    </>
  );
};

export default AdminPedidos;