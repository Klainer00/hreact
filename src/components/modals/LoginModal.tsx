import { useState, useRef } from 'react';
import { Modal } from 'bootstrap'; 
import { useAuth } from '../../context/AuthProvider';
import { loginUsuario, obtenerUsuarioPorId } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const LoginModal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Llamar al microservicio de login
      const response = await loginUsuario(email, password);

      if (response.success && response.usuario) {
        let usuario = response.usuario;
        
        console.log('📥 Usuario después del login:', usuario);
        console.log('📥 Rol del usuario (raw):', usuario.rol);
        console.log('📥 Tipo de rol:', typeof usuario.rol);
        
        // Obtener datos completos del usuario
        console.log('📥 Obteniendo datos completos del usuario...');
        const completoResponse = await obtenerUsuarioPorId(usuario.id);
        if (completoResponse.success && completoResponse.usuario) {
          usuario = completoResponse.usuario;
          console.log('✅ Datos completos obtenidos:', usuario);
          console.log('✅ Rol completo (raw):', usuario.rol);
          console.log('✅ Tipo de rol:', typeof usuario.rol);
        }
        
        // Determinar si es admin ANTES de hacer login
        // El backend puede retornar: "ADMIN", "Administrador", 1 (ID), o directamente el objeto rol
        const rolValue = usuario.rol;
        
        // Función auxiliar para extraer el nombre del rol
        const getRolName = (rol: any): string => {
          if (typeof rol === 'string') {
            return rol.toUpperCase();
          }
          if (typeof rol === 'number') {
            const rolMap: { [key: number]: string } = { 1: 'ADMIN', 2: 'USUARIO', 3: 'VENDEDOR' };
            return rolMap[rol] || 'USUARIO';
          }
          if (typeof rol === 'object' && rol !== null && 'nombre' in rol) {
            return String(rol.nombre).toUpperCase();
          }
          return 'USUARIO';
        };
        
        const rolStr = getRolName(rolValue);
        const esAdmin = rolStr === 'ADMIN' || rolStr === 'ADMINISTRADOR' || rolStr === 'VENDEDOR';
        
        console.log('🔍 Verificando rol:');
        console.log('  - rolValue:', rolValue);
        console.log('  - rolStr (uppercase):', rolStr);
        console.log('  - esAdmin:', esAdmin);
        
        // Login y resetear campos
        login(usuario);
        setError('');
        setEmail('');
        setPassword('');

        // Cerrar modal correctamente
        if (modalRef.current) {
          const modal = Modal.getInstance(modalRef.current);
          if (modal) {
            modal.hide();
          }
        }

        // Esperar a que el modal se cierre y LUEGO redirigir
        setTimeout(() => {
          console.log('⏳ Esperando 500ms...');
          console.log('Usuario en el setTimeout:', usuario);
          console.log('esAdmin en el setTimeout:', esAdmin);
          console.log('window.location.href antes de navigate:', window.location.href);
          
          // Limpiar backdrops de forma segura
          const backdrops = document.querySelectorAll('.modal-backdrop');
          backdrops.forEach(backdrop => {
            try {
              if (backdrop.parentNode) {
                backdrop.parentNode.removeChild(backdrop);
              }
            } catch (e) {
              // Ignorar errores de eliminación
            }
          });
          
          // Limpiar clases del body
          document.body.classList.remove('modal-open');
          document.body.style.removeProperty('overflow');
          document.body.style.removeProperty('padding-right');
          
          console.log('✅ Redirección iniciada...');
          console.log('esAdmin:', esAdmin);
          console.log('window.location.href después de limpiar:', window.location.href);
          
          // Redirigir según el rol
          if (esAdmin) {
            console.log('✅ Redirigiendo a /admin/dashboard');
            console.log('navigate function:', typeof navigate);
            navigate('/admin/dashboard');
            console.log('después de navigate:', window.location.href);
          } else {
            console.log('✅ Redirigiendo a /');
            navigate('/');
          }
        }, 500); // Aumentar tiempo para asegurar que el modal se cierre

      } else {
        setError(response.message || 'Correo o contraseña incorrectos.');
      }
    } catch (error) {
      setError('Error al intentar iniciar sesión.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRegistro = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (modalRef.current) {
      const loginModalInstance = Modal.getInstance(modalRef.current);
      
      if (loginModalInstance) {
        // Cerrar el modal de login
        loginModalInstance.hide();
        
        // Esperar a que el modal se cierre completamente
        const onHidden = () => {
          // Limpiar cualquier backdrop residual
          const backdrops = document.querySelectorAll('.modal-backdrop');
          backdrops.forEach(backdrop => backdrop.remove());
          
          // Limpiar clases del body
          document.body.classList.remove('modal-open');
          document.body.style.removeProperty('overflow');
          document.body.style.removeProperty('padding-right');
          
          // Abrir el modal de registro
          const registroModalElement = document.getElementById('registroModal');
          if (registroModalElement) {
            const registroModal = new Modal(registroModalElement);
            registroModal.show();
          }
          
          // Remover el listener
          modalRef.current?.removeEventListener('hidden.bs.modal', onHidden);
        };
        
        modalRef.current.addEventListener('hidden.bs.modal', onHidden);
      }
    }
  };

  return (
    <div className="modal fade" id="loginModal" tabIndex={-1} ref={modalRef}> 
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="w-100 text-center">Iniciar Sesión</h4>
            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div className="modal-body p-4">
            <div className="text-center mb-4">
              <img src="/img/Logo-convertido-a-pequeño-Photoroom.png" alt="Logo" style={{ width: 150 }} />
            </div>

            <form id="login-form-modal" onSubmit={handleSubmit}>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="mb-3">
                <label htmlFor="modal-email" className="form-label">Correo Electrónico</label>
                <input 
                  type="email" 
                  className="form-control" 
                  id="modal-email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required 
                />
              </div>
              <div className="mb-3">
                <label htmlFor="modal-password" className="form-label">Contraseña</label>
                <input 
                  type="password" 
                  className="form-control" 
                  id="modal-password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required 
                />
              </div>
              
              <div className="text-center mb-3">
                <a 
                  href="#"
                  onClick={handleOpenRegistro}
                  style={{ textDecoration: 'none', cursor: 'pointer' }}
                >
                  ¿No tienes cuenta? Regístrate aquí
                </a>
              </div>

              <div className="text-center">
                <button 
                  type="submit" 
                  className="btn btn-success w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Verificando...
                    </>
                  ) : (
                    'Ingresar'
                  )}
                </button>
              </div>
              
              <div className="text-center mt-3">
                <small className="text-muted">
                  El sistema detectará automáticamente tu rol y te redirigirá
                </small>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;