import { useCarrito } from '../../context/CarritoProvider';
import { useAuth } from '../../context/AuthProvider';

const CarritoModal = () => {
  const { carrito, eliminarDelCarrito, actualizarCantidad, limpiarCarrito, total } = useCarrito();
  const { usuario } = useAuth();

  const handleFinalizarCompra = () => {
    if (usuario) {
      alert("PAGO EXITOSO. ¡Gracias por su compra!");
      limpiarCarrito();
      // El modal se cierra con data-bs-dismiss="modal"
    } else {
      alert("Debes iniciar sesión para finalizar la compra.");
      // Cierra este modal y abre el de login
      // Esto requiere JS de Bootstrap o un manejo de estado más complejo
    }
  };

  return (
    <div className="modal fade" id="modalCarrito" tabIndex={-1}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title">Carrito de Compras</h5>
            <button className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div className="modal-body">
            {carrito.length === 0 ? (
              <p className="text-center text-muted">Tu carrito está vacío.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle text-center">
                  <thead className="table-light">
                    <tr>
                      <th>Imagen</th>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unitario</th>
                      <th>Subtotal</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carrito.map(item => (
                      <tr key={item.id}>
                        <td><img src={item.img} alt={item.nombre} width="50" className="rounded" /></td>
                        <td>{item.nombre}</td>
                        <td>
                          <input 
                            type="number" 
                            min="1" 
                            value={item.cantidad} 
                            className="form-control form-control-sm w-75 mx-auto" 
                            onChange={(e) => actualizarCantidad(item.id, parseInt(e.target.value))}
                          />
                        </td>
                        <td>${item.precio.toLocaleString('es-CL')}</td>
                        <td>${(item.precio * item.cantidad).toLocaleString('es-CL')}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-danger" 
                            onClick={() => eliminarDelCarrito(item.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="text-end mt-3">
              <h4>Total: <span className="text-success fw-bold">${total.toLocaleString('es-CL')}</span></h4>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" data-bs-dismiss="modal">Seguir Comprando</button>
            <button 
              className="btn btn-success" 
              id="btnFinalizarCompra"
              onClick={handleFinalizarCompra}
              disabled={carrito.length === 0}
            >
              Finalizar Compra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarritoModal;