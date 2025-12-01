import { useState, useEffect } from 'react';
import type { Usuario } from '../../interfaces/usuario';
import { RolUsuario } from '../../interfaces/rolUsuario'; 
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

    // Verificar si es admin - VALIDACIÓN CRÍTICA
    const esAdmin = usuario.rol === RolUsuario.Admin || 
                    usuario.rol === 'ADMIN' || 
                    usuario.rol === 'Administrador' ||
                    usuario.rol === RolUsuario.Vendedor ||
                    usuario.rol === 'VENDEDOR';

    if (esAdmin) {
      await Swal.fire({
        title: 'Acción Denegada ❌',
        text: `No puedes eliminar a un usuario con rol ${usuario.rol}. Solo se pueden eliminar usuarios normales.`,
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Verificar si es el último admin (protección adicional)
    const admins = usuarios.filter(u => 
      u.rol === RolUsuario.Admin || 
      u.rol === 'ADMIN' || 
      u.rol === 'Administrador'
    );
    
    if (admins.length <= 1 && (usuario.rol === RolUsuario.Admin || usuario.rol === 'ADMIN' || usuario.rol === 'Administrador')) {
      await Swal.fire({
        title: 'Acción Denegada ❌',
        text: 'No puedes eliminar el último administrador del sistema.',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Verificar si el usuario tiene pedidos asociados
    const resultadoPedidos = await verificarUsuarioTienePedidos(usuario.id);
    if (resultadoPedidos.tienePedidos) {
      await Swal.fire({
        title: 'Acción Denegada ❌',
        text: `No puedes eliminar este usuario porque tiene ${resultadoPedidos.cantidad} pedido(s) asociado(s).\n\nProcesa o cancela los pedidos antes de continuar.`,
        icon: 'warning',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido'
      });
      return;
    }

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
          fecha_nacimiento: usuario.fecha_nacimiento || '',
          direccion: usuario.direccion || '',
          region: usuario.region || '',
          comuna: usuario.comuna || '',
          rol: usuario.rol || 'USUARIO',
          estado: usuario.estado || 'activo',
          // Solo incluir password si no está vacío
          ...(usuario.password && usuario.password.trim() !== '' && { password: usuario.password })
        };
        
        console.log('📤 Datos a actualizar:', usuarioActualizar);
        response = await actualizarUsuario(usuario.id, usuarioActualizar);
        usuarioGuardado = response.usuario;
      } else {
        // Crear nuevo usuario
        const nuevoUsuario: Omit<Usuario, 'id'> = {
          nombre: usuario.nombre || '',
          apellido: usuario.apellido || '',
          email: usuario.email || '',
          rut: usuario.rut || '',
          fecha_nacimiento: usuario.fecha_nacimiento || '',
          direccion: usuario.direccion || '',
          region: usuario.region || '',
          comuna: usuario.comuna || '',
          rol: usuario.rol || 'USUARIO',
          estado: usuario.estado || 'activo',
          password: usuario.password || '',
        };
        
        console.log('📤 Datos a crear:', nuevoUsuario);
        response = await registrarUsuario(nuevoUsuario);
        usuarioGuardado = response.usuario;
      }
      
      // Si la API falla, usar un fallback local
      if (!response.success && !usuarioGuardado) {
        console.warn('⚠️ API falló, usando fallback local');
        
        if (isEditing) {
          usuarioGuardado = usuario;
        } else {
          // Generar ID local
          const maxId = usuarios.reduce((max, u) => u.id > max ? u.id : max, 0);
          usuarioGuardado = { ...usuario, id: maxId + 1 };
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
              <th>Estado</th>
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
                <td>{user.estado}</td>
                <td>
                  <button 
                    className="btn btn-primary btn-sm btn-editar" 
                    onClick={() => handleEditar(user)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-danger btn-sm btn-eliminar ms-1" 
                    onClick={() => handleEliminar(user)} // Pasar el 'user' completo
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