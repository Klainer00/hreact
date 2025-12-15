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

  const validarYAjustarStock = async () => {
    try {
      const productos = await fetchProductos();
      let hayProblemas = false;
      let mensajeProblemas = '';
      const productosSinStock: string[] = [];
      const productosStockInsuficiente: Array<{nombre: string, disponible: number, solicitado: number}> = [];
      
      // Verificar stock de cada producto
      carrito.forEach(item => {
        const prod = productos.find((p: any) => String(p.id) === item.id);
        if (!prod) {
          hayProblemas = true;
          productosSinStock.push(item.nombre);
        } else if (prod.stock === 0) {
          hayProblemas = true;
          productosSinStock.push(item.nombre);
        } else if (item.cantidad > prod.stock) {
          hayProblemas = true;
          productosStockInsuficiente.push({
            nombre: item.nombre,
            disponible: prod.stock,
            solicitado: item.cantidad
          });
        }
      });

      // Construir mensaje de error
      if (productosSinStock.length > 0) {
        mensajeProblemas += '<div style="text-align: left; margin-bottom: 10px;"><strong>❌ Sin stock:</strong><ul>';
        productosSinStock.forEach(nombre => {
          mensajeProblemas += `<li>${nombre}</li>`;
        });
        mensajeProblemas += '</ul></div>';
      }

      if (productosStockInsuficiente.length > 0) {
        mensajeProblemas += '<div style="text-align: left;"><strong>⚠️ Stock insuficiente:</strong><ul>';
        productosStockInsuficiente.forEach(item => {
          mensajeProblemas += `<li>${item.nombre}: Solo ${item.disponible} disponibles (tienes ${item.solicitado} en el carrito)</li>`;
        });
        mensajeProblemas += '</ul></div>';
      }

      if (hayProblemas) {
        const result = await Swal.fire({
          title: 'Stock Insuficiente',
          html: mensajeProblemas,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: productosSinStock.length > 0 ? 'Eliminar productos sin stock' : 'Ajustar cantidades',
          cancelButtonText: 'Revisar manualmente',
          confirmButtonColor: '#28a745',
          cancelButtonColor: '#6c757d'
        });

        if (result.isConfirmed) {
          // Eliminar productos sin stock
          productosSinStock.forEach(nombre => {
            const item = carrito.find(i => i.nombre === nombre);
            if (item) {
              eliminarDelCarrito(item.id);
            }
          });

          // Ajustar cantidades de productos con stock insuficiente
          productosStockInsuficiente.forEach(item => {
            const carritoItem = carrito.find(i => i.nombre === item.nombre);
            if (carritoItem) {
              actualizarCantidad(Number(carritoItem.id), item.disponible);
            }
          });

          // Mostrar mensaje de confirmación
          await Swal.fire({
            title: 'Carrito Actualizado',
            text: 'Las cantidades se han ajustado al stock disponible. Puedes finalizar tu compra ahora.',
            icon: 'success',
            confirmButtonText: 'Entendido'
          });
          
          return true;
        }
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error al validar stock:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo validar el stock. Por favor intenta nuevamente.',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
      return false;
    }
  };

  const handleFinalizarCompra = async () => {
    if (!usuario) {
      Swal.fire({
        title: 'Debes iniciar sesión',
        text: 'Para finalizar tu compra necesitas estar registrado',
        icon: 'info',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Validar que el usuario tenga dirección registrada
    if (!usuario.direccion || !usuario.comuna || !usuario.region) {
      await Swal.fire({
        title: 'Información incompleta',
        text: 'Tu perfil no tiene una dirección completa. Por favor actualiza tu información en la sección de perfil.',
        icon: 'warning',
        confirmButtonText: 'Ir a perfil',
        showCancelButton: true,
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/perfil.html';
        }
      });
      return;
    }

    // Primera validación: Verificar stock antes de procesar
    const stockValido = await validarYAjustarStock();
    if (!stockValido) return;

    setProcesando(true);

    try {
      // Segunda validación: Verificar nuevamente justo antes de enviar
      const productosActuales = await fetchProductos();
      let errorStock = false;
      let mensajeError = '';

      for (const item of carrito) {
        const productoActual = productosActuales.find((p: any) => String(p.id) === item.id);
        if (!productoActual || productoActual.stock < item.cantidad) {
          errorStock = true;
          mensajeError = productoActual 
            ? `El producto "${item.nombre}" solo tiene ${productoActual.stock} unidades disponibles`
            : `El producto "${item.nombre}" ya no está disponible`;
          break;
        }
      }

      if (errorStock) {
        setProcesando(false);
        await Swal.fire({
          title: 'Stock Actualizado',
          text: mensajeError + '. Por favor revisa tu carrito.',
          icon: 'error',
          confirmButtonText: 'Revisar Carrito'
        });
        // Volver a validar y ajustar
        await validarYAjustarStock();
        return;
      }

      const pedidoData = {
        usuarioId: usuario.id,
        direccionEnvio: usuario.direccion,
        comunaEnvio: usuario.comuna,
        regionEnvio: usuario.region,
        total: total,
        detalles: carrito.map(item => ({
          productoId: Number(item.id),
          cantidad: item.cantidad,
          precioUnitario: item.precio
        }))
      };

      const resultado = await crearPedido(pedidoData);

      if (resultado.success || resultado.id) {
        // Limpiar el carrito ANTES de mostrar el mensaje
        limpiarCarrito();
        
        // Cerrar el modal del carrito
        const modalElement = document.getElementById('modalCarrito');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
        
        await Swal.fire({
          title: '¡Pedido realizado!',
          text: 'Tu pedido ha sido procesado exitosamente',
          icon: 'success',
          confirmButtonText: 'Ver mis pedidos'
        });

        window.location.href = '/perfil.html';
      } else {
        throw new Error(resultado.message || 'Error al procesar el pedido');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'No se pudo procesar tu pedido';
      
      // Verificar si es un error de stock
      if (errorMessage.toLowerCase().includes('stock') || 
          errorMessage.toLowerCase().includes('insuficiente') ||
          errorMessage.toLowerCase().includes('disponible')) {
        await Swal.fire({
          title: 'Stock Insuficiente',
          text: 'Uno o más productos no tienen stock suficiente. Vamos a actualizar tu carrito.',
          icon: 'warning',
          confirmButtonText: 'Actualizar Carrito'
        });
        
        // Re-validar y ajustar stock
        await validarYAjustarStock();
      } else {
        await Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'Entendido'
        });
      }
    } finally {
      setProcesando(false);
    }
  };

  const handleObsoleto = async () => {
    // Si no hay usuario, el botón abre el login (manejado por bootstrap)
    if (!usuario) return;

    setProcesando(true);

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
    const pedidoData = {
      usuarioId: usuario.id,
      direccionEnvio: direccion,
      comunaEnvio: comuna,
      regionEnvio: region,
      total: total,
      detalles: carrito.map(item => ({
        productoId: Number(item.id),
        cantidad: item.cantidad,
        precioUnitario: item.precio
      }))
    };
    
    const resultado = await crearPedido(pedidoData);

    setProcesando(false);

    if (resultado.success || resultado.id) {
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
                          <div className="input-group input-group-sm justify-content-center" style={{width: '120px', margin: '0 auto'}}>
                            <button className="btn btn-outline-secondary" onClick={() => disminuirCantidad(item.id)}>-</button>
                            <span className="form-control text-center">{item.cantidad}</span>
                            <button 
                              className="btn btn-outline-secondary" 
                              onClick={() => incrementarCantidad(item.id)}
                              disabled={!!(item.stock && item.cantidad >= item.stock)}
                              title={item.stock && item.cantidad >= item.stock ? `Stock máximo: ${item.stock}` : ''}
                            >
                              +
                            </button>
                          </div>
                          {item.stock && (
                            <small className="text-muted d-block mt-1">
                              Stock: {item.stock}
                            </small>
                          )}
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