import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider'; // <-- 1. Importar el hook de autenticación

const AdminSidebar = () => {
  const { usuario, logout } = useAuth(); // <-- 2. Obtener la función 'logout'

  return (
    <nav id="sidebarMenu" className="sidebar">
      <div className="position-sticky pt-3">
        <div className="text-center mb-3 p-3">
          <img src="/img/Logo-convertido-a-pequeño-Photoroom.png" alt="Logo" width="100" />
          <h5 className="mt-2">Huerto Hogar</h5>
          {usuario && <span className="text-muted small">¡Hola, {usuario.nombre}!</span>}
        </div>
        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/dashboard" end>
              Dashboard
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/usuarios.html">
              Usuarios
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/producto.html">
              Productos
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/admin/pedidos.html">
              Pedidos
            </NavLink>
          </li>
        </ul>
        
        <hr className="text-white-50" />
        <div className="dropdown p-3">
          <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown">
            <strong>{usuario ? usuario.email : 'Admin'}</strong>
          </a>
          <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
            <li><NavLink className="dropdown-item" to="/">Volver al sitio</NavLink></li>
            <li><hr className="dropdown-divider" /></li>
            {/* 3. Conectar la función 'logout' al evento onClick */}
            <li>
              <a 
                className="dropdown-item" 
                href="#" 
                onClick={(e) => {
                  e.preventDefault(); // Evita que el enlace recargue la página
                  logout();
                }}
              >
                Cerrar Sesión
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default AdminSidebar;