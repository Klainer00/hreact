import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { fetchUsuarios } from '../../utils/api';
import { RolUsuario } from '../../interfaces/rolUsuario';
import logo from '/img/Logo-convertido-a-pequeño-Photoroom.png'; 


const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const usuarios = await fetchUsuarios();
    const usuarioEncontrado = usuarios.find(u => 
      u.email === email && 
      u.password === password && 
      (u.rol === RolUsuario.Admin || u.rol === RolUsuario.Vendedor)
    );

    if (usuarioEncontrado) {
      login(usuarioEncontrado);
      navigate('/admin/usuarios.html'); // Redirige al dashboard
    } else {
      setError('Acceso denegado. Correo, contraseña o rol incorrectos.');
    }
  };

  return (
    // Replicamos la estructura de admin/index.html
    <div className="login-admin-body">
      <div className="login-admin-container">
        <div className="login-admin-card">
          <div className="text-center mb-4">
            <img src={logo} alt="Logo Huerto Hogar" style={{ width: '150px' }} />
          </div>
          <h2 className="text-center">Panel de Administración</h2>
          <form id="admin-login-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="mb-3">
              <label htmlFor="admin-email" className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-control"
                id="admin-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="admin-password" className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                id="admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Ingresar</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;