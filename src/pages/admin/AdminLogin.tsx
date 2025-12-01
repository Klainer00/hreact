import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { RolUsuario } from '../../interfaces/rolUsuario';
import { Modal } from 'bootstrap';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  useEffect(() => {
    // Validar si es admin o vendedor
    const esAdmin = usuario && (
      usuario.rol === RolUsuario.Admin || 
      usuario.rol === 'ADMIN' || 
      usuario.rol === 'Administrador' ||
      usuario.rol === RolUsuario.Vendedor || 
      usuario.rol === 'VENDEDOR' || 
      usuario.rol === 'Vendedor'
    );

    // Si ya está autenticado como admin o vendedor, redirigir al dashboard
    if (esAdmin) {
      navigate('/admin/dashboard');
      return;
    }

    // Limpiar cualquier modal previo
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');

    // Esperar un poco antes de abrir el modal para asegurar limpieza
    const timeout = setTimeout(() => {
      const loginModalElement = document.getElementById('loginModal');
      if (loginModalElement) {
        const modal = new Modal(loginModalElement);
        modal.show();
        
        // Redirigir a home cuando se cierre el modal sin login exitoso
        const handleModalHide = () => {
          setTimeout(() => {
            // Validar nuevamente si es admin o vendedor
            const esAdminNow = usuario && (
              usuario.rol === RolUsuario.Admin || 
              usuario.rol === 'ADMIN' || 
              usuario.rol === 'Administrador' ||
              usuario.rol === RolUsuario.Vendedor || 
              usuario.rol === 'VENDEDOR' || 
              usuario.rol === 'Vendedor'
            );

            if (!esAdminNow) {
              // Limpiar completamente antes de redirigir
              const backdrops = document.querySelectorAll('.modal-backdrop');
              backdrops.forEach(backdrop => backdrop.remove());
              document.body.classList.remove('modal-open');
              document.body.style.removeProperty('overflow');
              document.body.style.removeProperty('padding-right');
              
              navigate('/');
            }
          }, 100);
          loginModalElement.removeEventListener('hidden.bs.modal', handleModalHide);
        };
        
        loginModalElement.addEventListener('hidden.bs.modal', handleModalHide);
      } else {
        // Si no hay modal disponible, redirigir a home
        navigate('/');
      }
    }, 200);

    return () => clearTimeout(timeout);
  }, [usuario, navigate]);

  // Mostrar una página de carga mientras se procesa
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Iniciando sesión...</p>
      </div>
    </div>
  );
};

export default AdminLogin;