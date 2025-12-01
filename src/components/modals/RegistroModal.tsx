import { useState, useMemo, useEffect, useRef } from 'react';
import { Modal } from 'bootstrap'; 
import { useAuth } from '../../context/AuthProvider';
import { registroMicroservicio, loginUsuario, obtenerUsuarioPorId } from '../../utils/api';
import { regionesComunas } from '../../utils/regiones';
import { checkRut } from '../../utils/checkrut';
import { formatRutOnType } from '../../utils/formatRut';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const RegistroModal = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    rut: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    password2: '', 
    fecha_nacimiento: '',
    direccion: '',
    region: '',
    comuna: '',
  });

  const [comunas, setComunas] = useState<string[]>([]);

  useEffect(() => {
    if (form.region) {
      const regionData = regionesComunas.regiones.find(r => r.region === form.region);
      setComunas(regionData ? regionData.comunas : []);
    } else {
      setComunas([]);
    }
  }, [form.region]);

  const errors = useMemo(() => {
    const err: Partial<Record<keyof typeof form, string>> = {};
    if (!form.nombre.trim()) err.nombre = "El nombre es requerido.";
    if (!form.apellido.trim()) err.apellido = "El apellido es requerido.";
    if (!form.direccion.trim()) err.direccion = "La dirección es requerida.";
    if (!form.region) err.region = "La región es requerida.";
    if (!form.comuna) err.comuna = "La comuna es requerida.";
    const rutValidation = checkRut(form.rut);
    if (!rutValidation.valid) err.rut = rutValidation.message;
    const emailRegex = /^[\w-\.]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/;
    if (!emailRegex.test(form.email.trim())) {
      err.email = "Email inválido. Solo se permiten dominios @duoc.cl, @profesor.duoc.cl o @gmail.com.";
    }
    if (!form.password) {
      err.password = "La contraseña es requerida.";
    } else if (form.password.length < 4 || form.password.length > 10) {
      err.password = "La contraseña debe tener entre 4 y 10 caracteres.";
    }
    if (form.password !== form.password2) {
      err.password2 = "Las contraseñas no coinciden.";
    }
    if (!form.fecha_nacimiento) {
      err.fecha_nacimiento = "La fecha de nacimiento es requerida.";
    } else {
      const hoy = new Date();
      const nacimiento = new Date(form.fecha_nacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const m = hoy.getMonth() - nacimiento.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      if (edad < 18 || edad > 120) {
        err.fecha_nacimiento = "Debes ser mayor de 18 años para registrarte.";
      }
    }
    return err;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const inputId = id.replace('reg-', '');

    if (inputId === 'rut') {
      const formattedRut = formatRutOnType(value);
      setForm(prev => ({ ...prev, [inputId]: formattedRut }));
    } else {
      setForm(prev => ({ ...prev, [inputId]: value }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      await Swal.fire("Error", "Por favor corrige los errores del formulario.", "error");
      return;
    }

    try {
      const response = await registroMicroservicio({
        rut: form.rut,
        nombre: form.nombre,
        apellido: form.apellido,
        email: form.email.trim(),
        password: form.password,
        direccion: form.direccion,
        region: form.region,
        comuna: form.comuna,
        fechaNacimiento: form.fecha_nacimiento,
      });

      if (response.success) {
        // Cerrar modal correctamente
        const modalElement = modalRef.current;
        if (modalElement) {
          const modalInstance = Modal.getInstance(modalElement);
          if (modalInstance) {
            modalInstance.hide();
          }
        }

        // Esperar a que el modal se cierre
        setTimeout(async () => {
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

          await Swal.fire({
            title: "¡Éxito!",
            text: "Usuario registrado con éxito.",
            icon: "success",
            allowOutsideClick: false,
            timer: 1500,
            showConfirmButton: false
          });
          
          // Hacer login automático para obtener token y datos completos
          const loginResponse = await loginUsuario(form.email, form.password);
          
          if (loginResponse.success && loginResponse.usuario) {
            let usuario = loginResponse.usuario;
            
            console.log('📥 Usuario después del registro automático:', usuario);
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
            
            // Guardar token
            if (loginResponse.token) {
              localStorage.setItem('authToken', loginResponse.token);
            }
            
            // Login con los datos completos del usuario
            login(usuario);
            
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
            
            // Redirigir según el rol
            if (esAdmin) {
              console.log('✅ Redirigiendo a /admin/dashboard');
              navigate('/admin/dashboard');
            } else {
              console.log('✅ Redirigiendo a /');
              navigate('/');
            }
          }
        }, 500); // Aumentar tiempo para asegurar que el modal se cierre
        
      } else {
        await Swal.fire("Error", response.message || "Ocurrió un error en el registro.", "error");
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      await Swal.fire("Error", "No se pudo conectar con el microservicio. Asegúrate de que esté corriendo en http://localhost:8180.", "error");
    }
  };


  const getValidationClass = (fieldName: keyof typeof form) => {
    if (!form[fieldName]) return ''; 
    return errors[fieldName] ? 'is-invalid' : 'is-valid';
  };

  return (
    <div className="modal fade" id="registroModal" ref={modalRef} tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="w-100 text-center">Crear una Cuenta</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div className="modal-body">
            <form id="formRegistroModal" onSubmit={handleSubmit} noValidate>
              <div className="row">
                
                <div className="col-md-6 mb-3">
                  <label htmlFor="reg-rut" className="form-label">RUT</label>
                  <input type="text" className={`form-control ${getValidationClass('rut')}`} 
                         id="reg-rut" 
                         maxLength={12} 
                         value={form.rut} onChange={handleChange} 
                         required />
                  {errors.rut && <div className="invalid-feedback">{errors.rut}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="reg-nombre" className="form-label">Nombre</label>
                  <input type="text" className={`form-control ${getValidationClass('nombre')}`} 
                         id="reg-nombre" value={form.nombre} onChange={handleChange} required />
                  {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="reg-apellido" className="form-label">Apellido</label>
                  <input type="text" className={`form-control ${getValidationClass('apellido')}`} 
                         id="reg-apellido" value={form.apellido} onChange={handleChange} required />
                  {errors.apellido && <div className="invalid-feedback">{errors.apellido}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="reg-email" className="form-label">Email</label>
                  <input type="email" className={`form-control ${getValidationClass('email')}`} 
                         id="reg-email" value={form.email} onChange={handleChange} required />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="reg-password" className="form-label">Contraseña</label>
                  <input type="password" className={`form-control ${getValidationClass('password')}`} 
                         id="reg-password" value={form.password} onChange={handleChange} required />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="reg-password2" className="form-label">Confirmar Contraseña</label>
                  <input type="password" className={`form-control ${getValidationClass('password2')}`} 
                         id="reg-password2" value={form.password2} onChange={handleChange} required />
                  {errors.password2 && <div className="invalid-feedback">{errors.password2}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="reg-fecha_nacimiento" className="form-label">Fecha de Nacimiento</label>
                  <input type="date" className={`form-control ${getValidationClass('fecha_nacimiento')}`} 
                         id="reg-fecha_nacimiento" value={form.fecha_nacimiento} 
                         onChange={handleChange} required />
                  {errors.fecha_nacimiento && <div className="invalid-feedback">{errors.fecha_nacimiento}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="reg-direccion" className="form-label">Dirección</label>
                  <input type="text" className={`form-control ${getValidationClass('direccion')}`} 
                         id="reg-direccion" value={form.direccion} onChange={handleChange} required />
                  {errors.direccion && <div className="invalid-feedback">{errors.direccion}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="reg-region" className="form-label">Región</label>
                  <select className={`form-select ${getValidationClass('region')}`} 
                          id="reg-region" value={form.region} onChange={handleChange} required>
                    <option value="">Seleccione una región</option>
                    {regionesComunas.regiones.map(r => (
                      <option key={r.region} value={r.region}>{r.region}</option>
                    ))}
                  </select>
                  {errors.region && <div className="invalid-feedback">{errors.region}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="reg-comuna" className="form-label">Comuna</label>
                  <select className={`form-select ${getValidationClass('comuna')}`} 
                          id="reg-comuna" value={form.comuna} onChange={handleChange} 
                          required disabled={!form.region}>
                    <option value="">Seleccione una comuna</option>
                    {comunas.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.comuna && <div className="invalid-feedback">{errors.comuna}</div>}
                </div>
              </div>

              <div className="modal-footer mt-3">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success" disabled={!isValid}>
                  Registrarse
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroModal;
