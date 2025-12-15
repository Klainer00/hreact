import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Navigate } from 'react-router-dom';
import { actualizarUsuario, fetchPedidos } from '../utils/api';
import type { Usuario } from '../interfaces/usuario';
import type { Pedido } from '../interfaces/pedido';
import Swal from 'sweetalert2';

const Perfil = () => {
  const { usuario, updateUsuario } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Usuario>>(usuario || {});
  const [activeTab, setActiveTab] = useState('perfil'); // 'perfil' o 'pedidos'
  const [pedidosUsuario, setPedidosUsuario] = useState<Pedido[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);

  if (!usuario) {
    return <Navigate to="/index.html" replace />;
  }

  // Cargar pedidos del usuario desde la API
  useEffect(() => {
    const cargarPedidos = async () => {
      if (activeTab === 'pedidos' && usuario?.id) {
        setLoadingPedidos(true);
        try {
          const pedidos = await fetchPedidos();
          // Filtrar pedidos por usuario actual
          const misPedidos = pedidos.filter((p: Pedido) => p.usuarioId === usuario.id);
          setPedidosUsuario(misPedidos);
        } catch (error) {
          console.error('Error cargando pedidos:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar tus pedidos. Intenta más tarde.',
            icon: 'error',
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 3000
          });
        } finally {
          setLoadingPedidos(false);
        }
      }
    };
    
    cargarPedidos();
  }, [activeTab, usuario?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    try {
      // Preparar datos para actualizar
      const usuarioActualizado = { ...usuario, ...formData } as Usuario;
      
      // Actualizar en el backend
      actualizarUsuario(usuario.id, usuarioActualizado).then((res) => {
        if (res.success) {
          // Actualizar en localStorage
          const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
          const updatedUsuarios = usuarios.map((u: any) => 
            u.id === usuario.id ? usuarioActualizado : u
          );
          localStorage.setItem('usuarios', JSON.stringify(updatedUsuarios));
          
          // Actualizar el contexto
          updateUsuario(usuarioActualizado);
          
          setEditMode(false);
          Swal.fire({
            title: "Perfil actualizado",
            text: "Tu perfil ha sido actualizado exitosamente.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          throw new Error(res.message || 'Error al actualizar');
        }
      }).catch((error: any) => {
        console.error('Error al actualizar perfil:', error);
        Swal.fire({
          title: "Error",
          text: error.message || "No se pudo actualizar el perfil. Intenta nuevamente.",
          icon: "error"
        });
      });
    } catch (error: any) {
      console.error('Error:', error);
      Swal.fire({
        title: "Error",
        text: error.message || "No se pudo actualizar el perfil. Intenta nuevamente.",
        icon: "error"
      });
    }
  };

  const handleCancel = () => {
    setFormData(usuario);
    setEditMode(false);
  };

  return (
    <main className="container my-5">
      <div className="row">
        <div className="col-12">
          <h2 className="text-center mb-4">Mi Cuenta</h2>
          
          {/* Navegación por pestañas */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'perfil' ? 'active' : ''}`}
                onClick={() => setActiveTab('perfil')}
              >
                Mi Perfil
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'pedidos' ? 'active' : ''}`}
                onClick={() => setActiveTab('pedidos')}
              >
                Mis Pedidos ({pedidosUsuario.length})
              </button>
            </li>
          </ul>

          {/* Contenido de pestañas */}
          {activeTab === 'perfil' && (
            <div className="card shadow-sm border-0">
              <div className="card-body p-3 p-sm-4 p-md-5">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4 gap-3">
                  <h5 className="card-title mb-0 fs-5">Información Personal</h5>
                  {!editMode ? (
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => setEditMode(true)}
                    >
                      Editar Perfil
                    </button>
                  ) : (
                    <div className="d-flex gap-2 flex-wrap">
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={handleSave}
                      >
                        Guardar
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={handleCancel}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>

                <hr className="my-4" />

                {/* Formulario de perfil */}
                <div className="row g-3 g-md-4">
                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <strong className="d-block mb-2" style={{ fontSize: '0.95rem' }}>RUT</strong>
                      <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>{usuario.rut || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <strong className="d-block mb-2" style={{ fontSize: '0.95rem' }}>Email</strong>
                      <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>{usuario.email || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="row g-3 g-md-4 mt-2">
                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <strong className="d-block mb-2" style={{ fontSize: '0.95rem' }}>Nombre</strong>
                      {editMode ? (
                        <input
                          type="text"
                          className="form-control"
                          name="nombre"
                          value={formData.nombre || ''}
                          onChange={handleInputChange}
                          placeholder="Nombre"
                        />
                      ) : (
                        <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>{usuario.nombre || '-'}</p>
                      )}
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <strong className="d-block mb-2" style={{ fontSize: '0.95rem' }}>Apellido</strong>
                      {editMode ? (
                        <input
                          type="text"
                          className="form-control"
                          name="apellido"
                          value={formData.apellido || ''}
                          onChange={handleInputChange}
                          placeholder="Apellido"
                        />
                      ) : (
                        <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>{usuario.apellido || '-'}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row g-3 g-md-4 mt-2">
                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <strong className="d-block mb-2" style={{ fontSize: '0.95rem' }}>Teléfono</strong>
                      {editMode ? (
                        <input
                          type="text"
                          className="form-control"
                          name="telefono"
                          value={formData.telefono || ''}
                          onChange={handleInputChange}
                          placeholder="Teléfono"
                        />
                      ) : (
                        <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>{usuario.telefono || '-'}</p>
                      )}
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <strong className="d-block mb-2" style={{ fontSize: '0.95rem' }}>Dirección</strong>
                      {editMode ? (
                        <input
                          type="text"
                          className="form-control"
                          name="direccion"
                          value={formData.direccion || ''}
                          onChange={handleInputChange}
                          placeholder="Ingresa tu dirección"
                        />
                      ) : (
                        <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>
                          {usuario.direccion || '-'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row g-3 g-md-4 mt-2">
                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <strong className="d-block mb-2" style={{ fontSize: '0.95rem' }}>Comuna</strong>
                      {editMode ? (
                        <input
                          type="text"
                          className="form-control"
                          name="comuna"
                          value={formData.comuna || ''}
                          onChange={handleInputChange}
                          placeholder="Comuna"
                        />
                      ) : (
                        <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>{usuario.comuna || '-'}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-12 col-sm-6">
                    <div className="mb-3">
                      <strong className="d-block mb-2" style={{ fontSize: '0.95rem' }}>Región</strong>
                      {editMode ? (
                        <input
                          type="text"
                          className="form-control"
                          name="region"
                          value={formData.region || ''}
                          onChange={handleInputChange}
                          placeholder="Región"
                        />
                      ) : (
                        <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>{usuario.region || '-'}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row g-3 g-md-4 mt-2">
                  <div className="col-12">
                    <div className="mb-3">
                      <strong className="d-block mb-2" style={{ fontSize: '0.95rem' }}>Rol</strong>
                      <p className="text-muted mb-0" style={{ fontSize: '1rem' }}>
                        <span className={`badge ${usuario.rol === 'ADMIN' ? 'bg-danger' : 'bg-primary'}`}>
                          {usuario.rol || 'CLIENTE'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pestaña de Pedidos */}
          {activeTab === 'pedidos' && (
            <div className="card shadow-sm border-0">
              <div className="card-body p-3 p-sm-4 p-md-5">
                <h5 className="card-title mb-4 fs-5">Mis Pedidos</h5>
                
                {loadingPedidos ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-3 text-muted">Cargando tus pedidos...</p>
                  </div>
                ) : pedidosUsuario.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted mb-3">Aún no has realizado ningún pedido.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.location.href = '/productos.html'}
                    >
                      Ir a Productos
                    </button>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Pedido #</th>
                          <th>Fecha</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Estado</th>
                          <th>Detalles</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedidosUsuario.map(pedido => (
                          <tr key={pedido.id}>
                            <td>#{pedido.id}</td>
                            <td>{new Date(pedido.fecha).toLocaleDateString('es-CL')}</td>
                            <td>{pedido.detalles?.length || 0} productos</td>
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
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => {
                                  Swal.fire({
                                    title: `Pedido #${pedido.id}`,
                                    html: `
                                      <div class="text-start">
                                        <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleDateString('es-CL')}</p>
                                        <p><strong>Estado:</strong> <span class="badge bg-primary">${pedido.estado || 'PENDIENTE'}</span></p>
                                        ${pedido.direccionEnvio ? `<p><strong>Dirección:</strong> ${pedido.direccionEnvio}, ${pedido.comunaEnvio}, ${pedido.regionEnvio}</p>` : ''}
                                        <p><strong>Productos:</strong></p>
                                        <ul>
                                          ${pedido.detalles?.map(detalle => 
                                            `<li>Producto ID: ${detalle.productoId} x${detalle.cantidad} - $${(detalle.precioUnitario * detalle.cantidad).toLocaleString('es-CL')}</li>`
                                          ).join('') || '<li>No hay detalles</li>'}
                                        </ul>
                                        <p><strong>Total:</strong> $${pedido.total?.toLocaleString('es-CL') || '0'}</p>
                                      </div>
                                    `,
                                    confirmButtonText: "Cerrar",
                                    width: '600px'
                                  });
                                }}
                              >
                                Ver Detalle
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Perfil;