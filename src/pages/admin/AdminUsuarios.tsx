import { useState, useEffect } from 'react';
import type { Usuario } from '../../interfaces/usuario';
import { fetchUsuarios } from '../../utils/api';
// Importaríamos funciones de storage para CUD (Crear, Actualizar, Borrar)

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lógica de carga de usuarios.js
    const cargarDatos = async () => {
      setLoading(true);
      // En una app real, aquí también se implementaría la lógica de
      // guardar/leer de localStorage para persistencia
      const data = await fetchUsuarios();
      setUsuarios(data);
      setLoading(false);
    };
    cargarDatos();
  }, []);

  if (loading) {
    return <div>Cargando usuarios...</div>;
  }

  // Aquí iría la lógica de los modales para Agregar/Editar/Eliminar

  return (
    <>
      <div className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Gestión de Usuarios</h1>
        <button type="button" className="btn btn-sm btn-outline-success">
          + Agregar Nuevo Usuario
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover table-sm">
          <thead>
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
                <td>{user.rol}</td>
                <td>{user.estado}</td>
                <td>
                  <button className="btn btn-primary btn-sm btn-editar" data-id={user.id}>Editar</button>
                  <button className="btn btn-danger btn-sm btn-eliminar ms-1" data-id={user.id}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Aquí irían los modales de Bootstrap para Agregar/Editar */}
    </>
  );
};

export default AdminUsuarios;