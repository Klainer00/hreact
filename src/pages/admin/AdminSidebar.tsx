import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';

const AdminSidebar = () => {
  const { usuario, logout } = useAuth();

  return (
    <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
      <div className="position-sticky pt-3">
        <div className="text-center mb-3">
          <img src="/img/Logo-convertido-a-pequeño-Photoroom.png" alt="Logo" width="100" />
          <h5 className="mt-2">Huerto Hogar</h5>
          {usuario && <span className="text-muted small">¡Hola, {usuario.nombre}!</span>}
        </div>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/usuarios.html">
              Gestión de Usuarios
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/producto.html">
              Gestión de Productos
            </NavLink>
          </li>
          {/* Agrega más enlaces de admin aquí */}
        </ul>
        
        <hr />
        <div className="dropdown p-3">
          <a href="#" className="d-flex align-items-center text-dark text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown">
            <strong>{usuario ? usuario.email : 'Admin'}</strong>
          </a>
          <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
            <li><a className="dropdown-item" href="#" onClick={logout}>Cerrar Sesión</a></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default AdminSidebar;