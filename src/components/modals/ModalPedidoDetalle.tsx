import type { Pedido } from '../../interfaces/pedido';

interface Props {
  pedido: Pedido | null;
  onClose: () => void;
}

const ModalPedidoDetalle = ({ pedido, onClose }: Props) => {
  
  if (!pedido) {
    return null;
  }

  return (
    <div className="modal show" tabIndex={-1} style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Detalle del Pedido #{pedido.id}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            
            {/* 1. Información del Cliente */}
            <h4>Información del Cliente</h4>
            <ul className="list-group list-group-flush mb-4">
              <li className="list-group-item"><strong>Cliente:</strong> {pedido.cliente.nombre}</li>
              <li className="list-group-item"><strong>Email:</strong> {pedido.cliente.email}</li>
              <li className="list-group-item"><strong>Fecha del Pedido:</strong> {pedido.fecha}</li>
            </ul>
            
            {/* 2. Dirección de Envío */}
            <h4>Dirección de Envío</h4>
            <address className="list-group-item">
              {pedido.cliente.direccion}<br/>
              {pedido.cliente.comuna}<br/>
              {pedido.cliente.region}
            </address>

            {/* 3. Items del Pedido */}
            <h4 className="mt-4">Items Comprados</h4>
            <div className="table-responsive">
              <table className="table table-sm table-striped">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Precio Unit.</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.items.map(item => (
                    <tr key={item.id}>
                      <td>{item.nombre}</td>
                      <td>${item.precio.toLocaleString('es-CL')}</td>
                      <td>x {item.cantidad}</td>
                      <td>${(item.precio * item.cantidad).toLocaleString('es-CL')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="fw-bold">
                    <td colSpan={3} className="text-end">Total Pagado:</td>
                    <td>${pedido.total.toLocaleString('es-CL')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalPedidoDetalle;