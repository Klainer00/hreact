import { useState, useEffect } from 'react';
import type { Pedido } from '../../interfaces/pedido';
import { loadPedidos } from '../../utils/storage';
import ModalPedidoDetalle from '../../components/modals/ModalPedidoDetalle'; // <-- 1. Importar modal

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 2. Estado para manejar el modal
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

  useEffect(() => {
    setLoading(true);
    const pedidosGuardados = loadPedidos();
    setPedidos(pedidosGuardados.reverse()); 
    setLoading(false);
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
                <th>Acciones</th> {/* <-- 3. Nueva columna */}
              </tr>
            </thead>
            <tbody>
              {pedidos.map(pedido => (
                <tr key={pedido.id}>
                  <td>{pedido.id}</td>
                  <td>{pedido.fecha}</td>
                  <td>{pedido.cliente.nombre}</td>
                  <td>${pedido.total.toLocaleString('es-CL')}</td>
                  <td>
                    {/* 4. Botón para abrir modal */}
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