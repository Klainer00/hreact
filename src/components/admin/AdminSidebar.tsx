import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { useRef, useEffect } from 'react'; // <-- 1. Importar useRef y useEffect
import * as bootstrap from 'bootstrap'; // <-- 2. Importar Bootstrap JS

const AdminSidebar = () => {
  const { usuario, logout } = useAuth();
  const dropdownToggleRef = useRef<HTMLAnchorElement>(null); // <-- 3. Crear una Ref para el enlace

  // 4. Este hook "activa" el dropdown de Bootstrap manualmente
  useEffect(() => {
    const toggleEl = dropdownToggleRef.current;
    if (toggleEl) {
      // Creamos una nueva instancia de Dropdown para ese elemento
      const dropdown = new bootstrap.Dropdown(toggleEl);

      // (Opcional) Limpiamos la instancia cuando el componente se destruye
      return () => {
        dropdown.dispose();
      };
    }
  }, []); // El array vacío [] asegura que se ejecute solo una vez

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
          {/* 5. Asignamos la Ref al enlace */}
          <a 
            href="#" 
            className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" 
            id="dropdownUser1" 
            data-bs-toggle="dropdown" // Mantenemos esto por si acaso
            ref={dropdownToggleRef} // <-- 5. Asignar la Ref
          >
            <strong>{usuario ? usuario.email : 'Admin'}</strong>
          </a>
          
          <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
            <li><NavLink className="dropdown-item" to="/">Volver al sitio</NavLink></li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <a 
                className="dropdown-item" 
                href="#" 
                onClick={(e) => {
                  e.preventDefault(); 
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