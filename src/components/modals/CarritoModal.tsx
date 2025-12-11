import { useState } from 'react';
import { useCarrito } from '../../context/CarritoProvider';
import { useAuth } from '../../context/AuthProvider';
import { crearPedido } from '../../utils/api'; // Importamos la función real
import Swal from 'sweetalert2';

const CarritoModal = () => {
  const { carrito, limpiarCarrito, total, disminuirCantidad, incrementarCantidad, eliminarDelCarrito } = useCarrito();
  const { usuario } = useAuth();
  const [procesando, setProcesando] = useState(false);

  const handleFinalizarCompra = async () => {
    // Si no hay usuario, el botón abre el login (manejado por bootstrap)
    if (!usuario) return;

    setProcesando(true);

    // Enviar los datos al backend
    const resultado = await crearPedido(carrito, total);

    setProcesando(false);

    if (resultado.success) {
      Swal.fire({
        title: "¡Pedido Exitoso!",
        text: `Tu pedido #${resultado.pedido.id} ha sido registrado correctamente.`,
        icon: "success",
        confirmButtonText: "Genial"
      });
      limpiarCarrito();
      
      // Cerrar el modal programáticamente
      const btnClose = document.querySelector('#modalCarrito .btn-close') as HTMLElement;
      if(btnClose) btnClose.click();
      
    } else {
      Swal.fire("Error", `No se pudo procesar el pedido: ${resultado.message}`, "error");
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
                        <td>
                          <div className="d-flex align-items-center justify-content-center">
                            {item.img && <img src={item.img} alt={item.nombre} width="40" className="me-2 rounded" />}
                            <span>{item.nombre}</span>
                          </div>
                        </td>
                        <td>
                          <div className="input-group input-group-sm justify-content-center" style={{width: '100px', margin: '0 auto'}}>
                            <button className="btn btn-outline-secondary" onClick={() => disminuirCantidad(item.id)}>-</button>
                            <span className="form-control text-center">{item.cantidad}</span>
                            <button className="btn btn-outline-secondary" onClick={() => incrementarCantidad(item.id)}>+</button>
                          </div>
                        </td>
                        <td>${item.precio.toLocaleString('es-CL')}</td>
                        <td>${(item.precio * item.cantidad).toLocaleString('es-CL')}</td>
                        <td>
                          <button className="btn btn-sm btn-danger" onClick={() => eliminarDelCarrito(item.id)}>
                            <i className="bi bi-trash"></i> Eliminar
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
              disabled={carrito.length === 0 || procesando}
              onClick={usuario ? handleFinalizarCompra : undefined}
              data-bs-toggle={!usuario ? "modal" : ""}
              data-bs-target={!usuario ? "#loginModal" : ""}
            >
              {procesando ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"/>
                  Procesando...
                </>
              ) : (
                'Finalizar Compra'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarritoModal;