import { useState } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { fetchUsuarios } from '../../utils/api';
import Swal from 'sweetalert2';

const LoginModal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const usuarios = await fetchUsuarios();
      const usuarioEncontrado = usuarios.find(u => u.email === email && u.password === password);

      if (usuarioEncontrado) {
        // Cerrar modal manualmente
        const modalElement = document.querySelector('#loginModal') as HTMLElement;
        modalElement.style.display = 'none';
        modalElement.classList.remove('show');
        document.body.classList.remove('modal-open');
        
        // Remover backdrop
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        
        // Restaurar estilos del body
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

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

  return (
    <div className="modal fade" id="loginModal" tabIndex={-1}>
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