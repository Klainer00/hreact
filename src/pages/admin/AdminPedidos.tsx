import { useState, useEffect } from 'react';
import type { Pedido } from '../../interfaces/pedido';
import { loadPedidos } from '../../utils/storage';
import ModalPedidoDetalle from '../../components/modals/ModalPedidoDetalle';
const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carga los pedidos desde localStorage al montar la página
    setLoading(true);
    const pedidosGuardados = loadPedidos();
    // Los ordenamos del más nuevo al más viejo
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
          <table className="table table-hover table-sm">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>N° Items</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map(pedido => (
                <tr key={pedido.id}>
                  <td>{pedido.id}</td>
                  <td>{pedido.fecha}</td>
                  <td>{pedido.cliente.nombre} ({pedido.cliente.email})</td>
                  <td>{pedido.items.length}</td>
                  <td>${pedido.total.toLocaleString('es-CL')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default AdminPedidos;