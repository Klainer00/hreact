import { useState, useEffect } from 'react';
import { useCarrito } from '../../context/CarritoProvider';
import { useAuth } from '../../context/AuthProvider';
import { crearPedido, fetchProductos } from '../../utils/api';
import Swal from 'sweetalert2';

const CarritoModal = () => {
  const { carrito, limpiarCarrito, total, disminuirCantidad, incrementarCantidad, eliminarDelCarrito, actualizarCantidad } = useCarrito();
  const { usuario } = useAuth();
  const [procesando, setProcesando] = useState(false);
  const [intentoFinalizarSinLogin, setIntentoFinalizarSinLogin] = useState(false);

  // Cuando el usuario inicia sesión después de intentar finalizar compra
  useEffect(() => {
    if (usuario && intentoFinalizarSinLogin) {
      setIntentoFinalizarSinLogin(false);
      // Cerrar el modal de login si está abierto
      const loginModal = document.querySelector('#loginModal');
      if (loginModal) {
        const bsModal = (window as any).bootstrap.Modal.getInstance(loginModal);
        if (bsModal) {
          bsModal.hide();
        }
      }
      // Pequeño delay para que el modal de login se cierre completamente
      setTimeout(() => {
        handleFinalizarCompra();
      }, 500);
    }
  }, [usuario]);

  const handleFinalizarCompra = async () => {
    // Si no hay usuario, el botón abre el login (manejado por bootstrap)
    if (!usuario) return;

    setProcesando(true);

    // Validar stock antes de enviar el pedido
    try {
      const productosDisponibles = await fetchProductos();
      let hayProblemas = false;
      let mensajeProblemas = "";

      for (const item of carrito) {
        const productoActual = productosDisponibles.find((p: any) => p.id === item.id);
        if (productoActual) {
          if (productoActual.stock === 0) {
            mensajeProblemas += `\n• ${item.nombre}: Sin stock (tienes ${item.cantidad} en el carrito)`;
            hayProblemas = true;
          } else if (item.cantidad > productoActual.stock) {
            mensajeProblemas += `\n• ${item.nombre}: Solo quedan ${productoActual.stock} unidades (tienes ${item.cantidad} en el carrito)`;
            hayProblemas = true;
          }
        }
      }

      if (hayProblemas) {
        setProcesando(false);
        const result = await Swal.fire({
          title: 'Stock Insuficiente',
          html: `<div style="text-align: left;">Los siguientes productos tienen problemas de stock:${mensajeProblemas}</div>`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Ajustar Automáticamente',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#28a745',
          cancelButtonColor: '#6c757d'
        });

        if (result.isConfirmed) {
          // Ajustar cantidades automáticamente
          for (const item of carrito) {
            const productoActual = productosDisponibles.find((p: any) => p.id === item.id);
            if (productoActual && item.cantidad > productoActual.stock) {
              actualizarCantidad(Number(item.id), Math.max(1, productoActual.stock));
            }
          }
          Swal.fire({
            title: 'Cantidades Ajustadas',
            text: 'Las cantidades se han ajustado al stock disponible. Ahora puedes finalizar tu compra.',
            icon: 'success',
            confirmButtonText: 'Entendido'
          });
        }
        return;
      }
    } catch (error) {
      console.error('Error validando stock:', error);
    }

    // Usar la dirección del usuario que ya tiene registrada
    const direccion = usuario.direccion || '';
    const comuna = usuario.comuna || '';
    const region = usuario.region || '';

    // Validar que el usuario tenga dirección completa
    if (!direccion || !comuna || !region) {
      setProcesando(false);
      Swal.fire({
        title: 'Dirección Incompleta',
        text: 'Por favor actualiza tu dirección de envío en tu perfil antes de realizar un pedido.',
        icon: 'warning',
        confirmButtonText: 'Ir a Mi Perfil',
        showCancelButton: true,
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/perfil.html';
        }
      });
      return;
    }

    // Enviar los datos al backend usando la dirección del usuario
    const resultado = await crearPedido(carrito, direccion, comuna, region);

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
      // Mensaje más claro para error de stock
      const mensajeError = resultado.message || "Error desconocido";
      let titulo = "Error en el pedido";
      let texto = mensajeError;
      
      if (mensajeError.includes("Stock insuficiente") || mensajeError.includes("400")) {
        titulo = "Stock Insuficiente";
        texto = "Uno o más productos en tu carrito no tienen stock suficiente. Por favor, reduce la cantidad o elimina el producto.";
      }
      
      Swal.fire({
        title: titulo,
        text: texto,
        icon: "error",
        confirmButtonText: "Entendido"
      });
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
              onClick={() => {
                if (usuario) {
                  handleFinalizarCompra();
                } else {
                  setIntentoFinalizarSinLogin(true);
                }
              }}
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