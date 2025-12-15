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
            
            <div className="row mb-4">
              <div className="col-md-6">
                <h6 className="text-muted">Información del Pedido</h6>
                <ul className="list-unstyled">
                  <li><strong>Usuario ID:</strong> {pedido.usuarioId}</li>
                  <li><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString('es-CL')}</li>
                  <li><strong>Estado:</strong> <span className={`badge ${
                    pedido.estado === 'ENTREGADO' ? 'bg-success' :
                    pedido.estado === 'CANCELADO' ? 'bg-danger' :
                    pedido.estado === 'EN_CAMINO' ? 'bg-info' :
                    'bg-warning'
                  }`}>{pedido.estado || 'PENDIENTE'}</span></li>
                </ul>
              </div>
              
              {pedido.direccionEnvio && (
                <div className="col-md-6">
                  <h6 className="text-muted">Dirección de Envío</h6>
                  <address>
                    {pedido.direccionEnvio}<br/>
                    {pedido.comunaEnvio}<br/>
                    {pedido.regionEnvio}
                  </address>
                </div>
              )}
            </div>

            <h6 className="text-muted mb-3">Productos del Pedido</h6>
            <div className="table-responsive">
              <table className="table table-sm table-striped">
                <thead>
                  <tr>
                    <th>Producto ID</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.detalles?.map((detalle, index) => (
                    <tr key={index}>
                      <td>Producto #{detalle.productoId}</td>
                      <td>{detalle.cantidad}</td>
                      <td>${detalle.precioUnitario?.toLocaleString('es-CL') || '0'}</td>
                      <td>${((detalle.precioUnitario || 0) * detalle.cantidad).toLocaleString('es-CL')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="fw-bold">
                    <td colSpan={3} className="text-end">Total:</td>
                    <td>${pedido.total?.toLocaleString('es-CL') || '0'}</td>
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