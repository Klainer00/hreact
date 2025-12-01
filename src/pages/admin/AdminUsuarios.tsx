import { useState, useEffect } from 'react';
import type { Usuario } from '../../interfaces/usuario';
import { RolUsuario } from '../../interfaces/rolUsuario'; 
import { fetchUsuarios } from '../../utils/api';
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
        console.log('📥 Cargando usuarios desde la API...');
        
        // Cargar desde la API
        const data = await fetchUsuarios();
        console.log('✅ Usuarios cargados:', data);
        
        // Guardar en localStorage también para offline
        localStorage.setItem('usuarios', JSON.stringify(data));
        
        setUsuarios(data);
      } catch (error) {
        console.error('❌ Error cargando usuarios:', error);
        
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
    // Verificar si es admin
    const esAdmin = usuario.rol === RolUsuario.Admin || 
                    usuario.rol === 'ADMIN' || 
                    usuario.rol === 'Administrador';

    if (esAdmin) {
      await Swal.fire({
        title: 'Acción Denegada',
        text: 'No puedes eliminar a un usuario Administrador.',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    // Confirmar eliminación
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al usuario ${usuario.nombre} ${usuario.apellido}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const nuevosUsuarios = usuarios.filter(u => u.id !== usuario.id);
        setUsuarios(nuevosUsuarios);
        localStorage.setItem('usuarios', JSON.stringify(nuevosUsuarios));
        
        await Swal.fire({
          title: '¡Eliminado!',
          text: 'El usuario ha sido eliminado correctamente.',
          icon: 'success',
          timer: 1500, // <-- Añadido timer
          showConfirmButton: false // <-- Añadido
        });
      } catch (error) {
        await Swal.fire({
          title: 'Error',
          text: 'Ocurrió un error al eliminar el usuario.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    }
  };

  // --- 💡 INICIO DE LA CORRECCIÓN 💡 ---
  const handleSave = async (usuario: Usuario) => {
    // 1. Declarar 'isEditing' FUERA del try/catch
    const isEditing = usuarioToEdit !== null; 
    
    try {
      let nuevosUsuarios;
      
      if (isEditing) {
        nuevosUsuarios = usuarios.map(u => 
          u.id === usuario.id ? { ...u, ...usuario } : u
        );
      } else {
        const maxId = usuarios.reduce((max, u) => u.id > max ? u.id : max, 0);
        const nuevoUsuarioConId = { ...usuario, id: maxId + 1 };
        nuevosUsuarios = [...usuarios, nuevoUsuarioConId];
      }
      
      setUsuarios(nuevosUsuarios);
      localStorage.setItem('usuarios', JSON.stringify(nuevosUsuarios));
      setShowModal(false);

      // 2. Mostrar mensaje de éxito
      await Swal.fire({
        title: '¡Éxito!',
        text: isEditing 
          ? `El usuario ${usuario.nombre} ha sido actualizado.`
          : `El usuario ${usuario.nombre} ha sido creado.`,
        icon: 'success',
        timer: 1500, // <-- Añadido timer
        showConfirmButton: false // <-- Añadido
      });

    } catch (error) {
      // 3. Ahora 'isEditing' SÍ es accesible aquí
      await Swal.fire({
        title: 'Error',
        text: isEditing 
          ? 'Ocurrió un error al actualizar el usuario.'
          : 'Ocurrió un error al crear el usuario.',
        icon: 'error',
        confirmButtonColor: '#dc3545',
        confirmButtonText: 'Entendido'
      });
    }
  };
  // --- 💡 FIN DE LA CORRECCIÓN 💡 ---

  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Gestión de Usuarios</h1>
        <button 
          type="button" 
          className="btn btn-sm btn-outline-success"
          onClick={handleAgregar}
        >
          + Agregar Nuevo Usuario
        </button>
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