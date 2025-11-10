// src/pages/Perfil.tsx (Método Recomendado)

import { useAuth } from '../context/AuthProvider'; // <-- Usamos el hook
import { Navigate } from 'react-router-dom';

const Perfil = () => {
  // 1. Obtenemos el usuario desde el contexto
  const { usuario } = useAuth(); //


  if (!usuario) {
    return <Navigate to="/index.html" replace />;
  }

  // 3. Mostramos los datos (el JSX es idéntico)
  return (
    <main className="container my-5">
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <h2 className="text-center mb-4">Mi Perfil</h2>
          <div className="card shadow-sm">
            <div className="card-body p-4">
              
              <div className="mb-3">
                <strong>Nombre:</strong>
                <p className="form-control-plaintext">{usuario.nombre} {usuario.apellido}</p>
              </div>

              <div className="mb-3">
                <strong>Email:</strong>
                <p className="form-control-plaintext">{usuario.email}</p>
              </div>

              <div className="mb-3">
                <strong>RUT:</strong>
                <p className="form-control-plaintext">{usuario.rut}</p>
              </div>
              
              <div className="mb-3">
                <strong>Dirección:</strong>
                <p className="form-control-plaintext">
                  {usuario.direccion || 'No especificada'}, {usuario.comuna}, {usuario.region}
                </p>
              </div>

              <div className="mb-3">
                <strong>Fecha de Nacimiento:</strong>
                <p className="form-control-plaintext">{usuario.fecha_nacimiento || 'No especificada'}</p>
              </div>

              <button className="btn btn-outline-primary" disabled>
                Editar Perfil (Próximamente)
              </button>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Perfil;