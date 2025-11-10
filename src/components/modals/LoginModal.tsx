import { useState, useRef } from 'react';
import { Modal } from 'bootstrap'; 
import { useAuth } from '../../context/AuthProvider';
import { fetchUsuarios } from '../../utils/api';
import Swal from 'sweetalert2';

const LoginModal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  
  const modalRef = useRef<HTMLDivElement>(null); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const usuarios = await fetchUsuarios();
      const usuarioEncontrado = usuarios.find(u => u.email === email && u.password === password);

      if (usuarioEncontrado) {
        
        if (modalRef.current) {
          const modal = Modal.getInstance(modalRef.current);
          modal?.hide();
        }
        
        // Login y resetear campos
        login(usuarioEncontrado);
        setError('');
        setEmail('');
        setPassword('');

        // Mostrar mensaje de éxito
        await Swal.fire({
          title: '¡Bienvenido!',
          text: `Has iniciado sesión como ${usuarioEncontrado.nombre}`,
          icon: 'success',
          confirmButtonColor: '#198754'
        });

      } else {
        setError('Correo o contraseña incorrectos.');
      }
    } catch (error) {
      setError('Error al intentar iniciar sesión.');
      console.error('Error:', error);
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
                <button type="submit" className="btn btn-success w-100">Ingresar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;