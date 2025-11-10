import { useState, useEffect } from 'react';
import type { Usuario } from '../../interfaces/usuario';
import { fetchUsuarios } from '../../utils/api';
import ModalUsuario from '../../components/modals/ModalUsuario';

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null);

  useEffect(() => {
    setLoading(true);
    let usuariosGuardados = JSON.parse(localStorage.getItem('usuarios') || 'null');
    
    if (!usuariosGuardados) {
      fetchUsuarios().then(data => {
        localStorage.setItem('usuarios', JSON.stringify(data));
        setUsuarios(data);
        setLoading(false);
      });
    } else {
      setUsuarios(usuariosGuardados);
      setLoading(false);
    }
  }, []);

  const handleAgregar = () => {
    setUsuarioToEdit(null); 
    setShowModal(true);
  };

  const handleEditar = (usuario: Usuario) => {
    setUsuarioToEdit(usuario); 
    setShowModal(true);
  };

  const handleEliminar = (id: number) => {
    if (window.confirm("¿Está seguro de que desea eliminar a este usuario?")) {
      const nuevosUsuarios = usuarios.filter(u => u.id !== id);
      setUsuarios(nuevosUsuarios);
      localStorage.setItem('usuarios', JSON.stringify(nuevosUsuarios));
    }
  };

  const handleSave = (usuario: Usuario) => {
    let nuevosUsuarios;
    if (usuarioToEdit) {
      // Modo Editar
      nuevosUsuarios = usuarios.map(u => 
        u.id === usuario.id ? { ...u, ...usuario } : u
      );
    } else {
      // --- LÓGICA DE ID AUTO-INCREMENTAL (USUARIO) ---
      const maxId = usuarios.reduce((max, u) => u.id > max ? u.id : max, 0);
      const nuevoUsuarioConId = { ...usuario, id: maxId + 1 };
      nuevosUsuarios = [...usuarios, nuevoUsuarioConId];
    }
    
    setUsuarios(nuevosUsuarios);
    localStorage.setItem('usuarios', JSON.stringify(nuevosUsuarios));
    setShowModal(false); 
  };

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
      <div className="table-responsive">
        <table className="table table-hover table-sm">
          {/* ... (thead) ... */}
          <thead>
            <tr>
              <th>ID</th><th>Rut</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.rut}</td>
                <td>{user.nombre} {user.apellido}</td>
                <td>{user.email}</td>
                <td>{user.rol}</td>
                <td>{user.estado}</td>
                <td>
                  <button 
                    className="btn btn-primary btn-sm btn-editar" 
                    onClick={() => handleEditar(user)} // <-- 6. Conectar botón
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-danger btn-sm btn-eliminar ms-1" 
                    onClick={() => handleEliminar(user.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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