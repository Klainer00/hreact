import { useState, useEffect } from 'react';
import type { Usuario } from '../../interfaces/usuario';
import { fetchUsuarios, registrarUsuario, actualizarUsuario, eliminarUsuario, verificarUsuarioTienePedidos } from '../../utils/api';
import ModalUsuario from '../../components/modals/ModalUsuario'; 
import Swal from 'sweetalert2'; 

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null);

  // Helper function to extract role name from any format
  const getRolName = (rol: any): string => {
    if (typeof rol === 'object' && rol !== null && 'nombre' in rol) {
      return rol.nombre;
    }
    if (typeof rol === 'string') {
      return rol;
    }
    return String(rol);
  };

  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        setLoading(true);
        console.log('Cargando usuarios desde la API...');
        
        // Cargar desde la API
        const data = await fetchUsuarios();
        console.log('Usuarios cargados:', data);
        
        // Guardar en localStorage también para offline
        localStorage.setItem('usuarios', JSON.stringify(data));
        
        setUsuarios(data);
      } catch (error) {
        console.error(' Error cargando usuarios:', error);
        
        // Si hay error, intentar cargar desde localStorage
        const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios') || '[]');
        setUsuarios(usuariosGuardados);
        
        await Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los usuarios desde la API. Mostrando datos locales.',
          icon: 'warning'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadUsuarios();
  }, []);

  const handleAgregar = () => {
    setUsuarioToEdit(null); 
    setShowModal(true);
  };

  const handleEditar = (usuario: Usuario) => {
    setUsuarioToEdit(usuario); 
    setShowModal(true);
  };

  const handleEliminar = async (usuario: Usuario) => {
    // Validar que el usuario a eliminar tenga todos los datos necesarios
    if (!usuario.id || !usuario.nombre || !usuario.apellido) {
      await Swal.fire({
        title: 'Error',
        text: 'Datos de usuario incompletos. No se puede eliminar.',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // VALIDACIÓN 1: Verificar si es administrador o vendedor
    const rolName = getRolName(usuario.rol).toUpperCase();
    console.log(`🔐 Verificando rol del usuario: ${usuario.nombre} ${usuario.apellido} - Rol: ${rolName}`);
    
    const esAdmin = rolName === 'ADMIN' || 
                    rolName === 'ADMINISTRADOR' ||
                    rolName === 'VENDEDOR';

    if (esAdmin) {
      console.log(`🛡️ Usuario con rol protegido: ${rolName}`);
      await Swal.fire({
        title: 'No se puede eliminar 🛡️',
        html: `<p>Los usuarios con rol <strong>${rolName}</strong> no pueden ser eliminados.</p><p class="text-muted">Solo se pueden eliminar usuarios con rol de cliente.</p>`,
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    
    console.log(`✅ Usuario con rol CLIENTE puede ser evaluado para eliminación`);
    

    // VALIDACIÓN 2: Verificar si el usuario tiene pedidos asociados
    console.log(`🔍 Verificando pedidos para usuario: ${usuario.nombre} ${usuario.apellido} (ID: ${usuario.id})`);
    
    const resultadoPedidos = await verificarUsuarioTienePedidos(usuario.id);
    
    console.log('📊 Resultado verificación:', resultadoPedidos);
    
    // Si hubo error al verificar pedidos, NO permitir eliminar por seguridad
    if (!resultadoPedidos.success) {
      await Swal.fire({
        title: 'Error al verificar pedidos ⚠️',
        html: `<p>No se pudo verificar si <strong>${usuario.nombre} ${usuario.apellido}</strong> tiene pedidos asociados.</p><p class="text-muted mt-2">Por seguridad, no se puede proceder con la eliminación. Verifica la conexión con el backend.</p>`,
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    
    // Si tiene pedidos, bloquear eliminación
    if (resultadoPedidos.tienePedidos) {
      await Swal.fire({
        title: 'No se puede eliminar 📦',
        html: `<p><strong>${usuario.nombre} ${usuario.apellido}</strong> tiene <strong>${resultadoPedidos.cantidad}</strong> pedido(s) asociado(s).</p><p class="text-muted mt-2">No es posible eliminar usuarios con pedidos en el sistema para mantener la integridad de los datos históricos.</p>`,
        icon: 'warning',
        confirmButtonColor: '#ffc107',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    
    // Usuario no tiene pedidos, puede ser eliminado
    console.log(`✅ Usuario ${usuario.id} no tiene pedidos. Puede ser eliminado.`);

    // Confirmación final antes de eliminar
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      html: `<p>Vas a eliminar a:</p><strong>${usuario.nombre} ${usuario.apellido}</strong><br/><em>${usuario.email}</em><p style="color: #dc3545; margin-top: 10px;">⚠️ Esta acción es <strong>irreversible</strong></p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar permanentemente',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        // Mostrar loading
        Swal.fire({
          title: 'Eliminando...',
          html: 'Por favor espera mientras se elimina el usuario de la base de datos.',
          icon: 'info',
          allowOutsideClick: false,
          didOpen: async () => {
            Swal.showLoading();
            
            // Llamar a la API para eliminar el usuario
            const response = await eliminarUsuario(usuario.id);
            
            if (response.success) {
              // Actualizar la lista local
              const nuevosUsuarios = usuarios.filter(u => u.id !== usuario.id);
              setUsuarios(nuevosUsuarios);
              localStorage.setItem('usuarios', JSON.stringify(nuevosUsuarios));
              
              await Swal.fire({
                title: '¡Eliminado! ✅',
                text: `El usuario ${usuario.nombre} ha sido eliminado correctamente de la base de datos.`,
                icon: 'success',
                confirmButtonColor: '#28a745',
                timer: 2000,
                showConfirmButton: true
              });
            } else {
              await Swal.fire({
                title: 'Error',
                text: response.message || 'Ocurrió un error al eliminar el usuario.',
                icon: 'error',
                confirmButtonColor: '#dc3545'
              });
            }
          }
        });
      } catch (error: any) {
        console.error('Error al eliminar:', error);
        await Swal.fire({
          title: 'Error',
          text: error.message || 'Ocurrió un error inesperado al eliminar el usuario.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    }
  };

  const handleSave = async (usuario: Usuario) => {
    const isEditing = usuarioToEdit !== null;
    
    try {
      let response;
      let usuarioGuardado: Usuario | undefined;
      
      if (isEditing) {
        // Actualizar usuario existente - IMPORTANTE: enviar TODOS los campos
        const usuarioActualizar: Partial<Usuario> = {
          id: usuario.id,
          nombre: usuario.nombre || '',
          apellido: usuario.apellido || '', // ← CRÍTICO: Este campo NO puede ser null
          email: usuario.email || '',
          rut: usuario.rut || '',
          direccion: usuario.direccion || '',
          region: usuario.region || '',
          comuna: usuario.comuna || '',
          rol: usuario.rol || 'USUARIO',
          // Solo incluir password si no está vacío
          ...(usuario.password && usuario.password.trim() !== '' && { password: usuario.password })
        };
        
        console.log('📤 Datos a actualizar:', usuarioActualizar);
        response = await actualizarUsuario(usuario.id, usuarioActualizar);
        
        console.log('📥 Respuesta del backend:', response);
        
        if (response.success && response.usuario) {
          usuarioGuardado = response.usuario;
        } else if (response.success) {
          // Si el backend no devuelve el usuario pero la operación fue exitosa, usar los datos locales
          usuarioGuardado = { ...usuarioActualizar, id: usuario.id } as Usuario;
        } else {
          throw new Error(response.message || 'Error al actualizar usuario');
        }
      } else {
        // Crear nuevo usuario
        const nuevoUsuario: Omit<Usuario, 'id'> = {
          nombre: usuario.nombre || '',
          apellido: usuario.apellido || '',
          email: usuario.email || '',
          rut: usuario.rut || '',
          direccion: usuario.direccion || '',
          region: usuario.region || '',
          comuna: usuario.comuna || '',
          rol: usuario.rol || 'USUARIO',
          password: usuario.password || '',
        };
        
        console.log('📤 Datos a crear:', nuevoUsuario);
        response = await registrarUsuario(nuevoUsuario);
        
        if (response.success && response.usuario) {
          usuarioGuardado = response.usuario;
        } else if (response.success) {
          // Generar ID local si el backend no lo devuelve
          const maxId = usuarios.reduce((max, u) => u.id > max ? u.id : max, 0);
          usuarioGuardado = { ...nuevoUsuario, id: maxId + 1 } as Usuario;
        } else {
          throw new Error(response.message || 'Error al crear usuario');
        }
      }
      
      if (usuarioGuardado) {
        // Actualizar la lista local
        let nuevosUsuarios;
        if (isEditing) {
          nuevosUsuarios = usuarios.map(u => u.id === usuarioGuardado!.id ? usuarioGuardado! : u);
        } else {
          nuevosUsuarios = [...usuarios, usuarioGuardado];
        }
        
        setUsuarios(nuevosUsuarios);
        localStorage.setItem('usuarios', JSON.stringify(nuevosUsuarios));
        setShowModal(false);

        await Swal.fire({
          title: '¡Éxito!',
          text: isEditing 
            ? `El usuario ${usuario.nombre} ha sido actualizado en la base de datos.`
            : `El usuario ${usuario.nombre} ha sido creado en la base de datos.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        throw new Error(response?.message || 'Error desconocido');
      }
    } catch (error: any) {
      console.error('Error guardando usuario:', error);
      await Swal.fire({
        title: 'Error',
        text: error.message || (isEditing 
          ? 'Ocurrió un error al actualizar el usuario en la base de datos.'
          : 'Ocurrió un error al crear el usuario en la base de datos.'),
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido'
      });
    }
  };

  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Gestión de Usuarios</h1>
        <div className="d-flex gap-2">
          <button 
            type="button" 
            className="btn btn-sm btn-outline-success"
            onClick={handleAgregar}
          >
            + Agregar Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-sm admin-table">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Rut</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.rut}</td>
                <td>{user.nombre} {user.apellido}</td>
                <td>{user.email}</td>
                <td>{getRolName(user.rol)}</td>
                <td>
                  <button 
                    className="btn btn-primary btn-sm btn-editar" 
                    onClick={() => handleEditar(user)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-danger btn-sm btn-eliminar ms-1" 
                    onClick={() => handleEliminar(user)} 
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <ModalUsuario 
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        usuarioToEdit={usuarioToEdit}
      />
    </>
  );
};

export default AdminUsuarios;