import { useCarrito } from '../../context/CarritoProvider';
import { useAuth } from '../../context/AuthProvider';

const CarritoModal = () => {
  // 1. Obtener las nuevas funciones del hook
  const { 
    carrito, 
    eliminarDelCarrito, 
    incrementarCantidad, 
    disminuirCantidad, 
    limpiarCarrito, 
    total 
  } = useCarrito();
  
  const { usuario } = useAuth();

  const handleFinalizarCompra = () => {
    if (usuario) {
      alert("PAGO EXITOSO. ¡Gracias por su compra!");
      limpiarCarrito();
    } else {
      alert("Debes iniciar sesión para finalizar la compra.");
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
                        
                        {/* 2. Reemplazo del Input por Botones + y - */}
                        <td>
                          <div className="input-group input-group-sm" style={{ width: '120px', margin: 'auto' }}>
                            <button 
                              className="btn btn-outline-secondary" 
                              type="button"
                              onClick={() => disminuirCantidad(item.id)}
                            >
                              -
                            </button>
                            <span className="form-control text-center">{item.cantidad}</span>
                            <button 
                              className="btn btn-outline-secondary" 
                              type="button"
                              onClick={() => incrementarCantidad(item.id)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        
                        <td>${item.precio.toLocaleString('es-CL')}</td>
                        <td>${(item.precio * item.cantidad).toLocaleString('es-CL')}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-danger" 
                            title="Eliminar producto"
                            onClick={() => eliminarDelCarrito(item.id)}
                          >
                            {/* Icono de basura (opcional pero recomendado) */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                            </svg>
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
              data-bs-dismiss={usuario ? "modal" : ""} // Cierra el modal solo si el pago es exitoso
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