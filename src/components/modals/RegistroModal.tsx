import { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { regionesComunas } from '../../utils/regiones';
import { checkRut } from '../../utils/checkrut';
import type { Usuario } from '../../interfaces/usuario';
import { RolUsuario } from '../../interfaces/rolUsuario';
import Swal from 'sweetalert2';
import * as bootstrap from 'bootstrap';

const RegistroModal = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { login } = useAuth();
  const [form, setForm] = useState({
    rut: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    password2: '', // Para confirmar contraseña
    fecha_nacimiento: '',
    direccion: '',
    region: '',
    comuna: '',
  });

  // --- 💡 INICIO DE LA CORRECCIÓN 💡 ---
  // 1. Estado para 'poner en espera' al usuario que se va a loguear
  const [usuarioParaLogin, setUsuarioParaLogin] = useState<Usuario | null>(null);
  
  const [comunas, setComunas] = useState<string[]>([]);

  useEffect(() => {
    if (form.region) {
      const regionData = regionesComunas.regiones.find(r => r.region === form.region);
      setComunas(regionData ? regionData.comunas : []);
    } else {
      setComunas([]);
    }
  }, [form.region]);
  
  // 2. Este useEffect escucha el evento 'hidden.bs.modal' de Bootstrap
  // Se ejecuta DESPUÉS de que el modal se cierra por completo
  useEffect(() => {
    const modalElement = modalRef.current;
    if (!modalElement) return;

    const handleModalHidden = () => {
      // Si hay un usuario 'en espera', mostramos la alerta y hacemos login
      if (usuarioParaLogin) {
        Swal.fire(
          "¡Éxito!", 
          "Usuario registrado con éxito. Se iniciará tu sesión.", 
          "success"
        ).then(() => {
          // Hacemos el login DESPUÉS de cerrar la alerta
          login(usuarioParaLogin);
          setUsuarioParaLogin(null); // Limpiamos el estado de espera
          
          // Limpiamos el formulario para la próxima vez
          setForm({
            rut: '', nombre: '', apellido: '', email: '', password: '',
            password2: '', fecha_nacimiento: '', direccion: '',
            region: '', comuna: ''
          });
        });
      }
    };

    // Añadimos el listener de Bootstrap
    modalElement.addEventListener('hidden.bs.modal', handleModalHidden);

    // Limpiamos el listener al desmontar el componente
    return () => {
      modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
    };
  }, [usuarioParaLogin, login]); // Depende de estas variables

  // 3. El handleSubmit AHORA NO HACE await NI login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones (esto está bien)
    if (!isValid) {
      await Swal.fire("Error", "Por favor corrige los errores del formulario.", "error");
      return;
    }
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const rutDuplicado = usuarios.some((u: Usuario) => u.rut === form.rut);
    const emailDuplicado = usuarios.some((u: Usuario) => u.email === form.email);
    if (rutDuplicado) {
      await Swal.fire("Error", "El RUT ingresado ya se encuentra registrado.", "error");
      return;
    }
    if (emailDuplicado) {
      await Swal.fire("Error", "El Email ingresado ya se encuentra registrado.", "error");
      return;
    }

    // 4. Guardar usuario y ponerlo 'en espera'
    const maxId = usuarios.reduce((max: number, u: Usuario) => u.id > max ? u.id : max, 0);
    const nuevoUsuario: Usuario = {
      id: maxId + 1,
      rut: form.rut,
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      password: form.password,
      direccion: form.direccion,
      region: form.region,
      comuna: form.comuna,
      fecha_nacimiento: form.fecha_nacimiento,
      rol: RolUsuario.Cliente,
      estado: 'Activo',
    };
    
    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // 5. Ponemos el usuario en el estado 'de espera'
    setUsuarioParaLogin(nuevoUsuario);

    // 6. Cerramos el modal (esto disparará el useEffect de arriba)
    const modalInstance = bootstrap.Modal.getInstance(modalRef.current!);
    if (modalInstance) {
      modalInstance.hide();
    }
  };
  // --- 💡 FIN DE LA CORRECCIÓN 💡 ---

  // Lógica de validación (sin cambios)
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
      if (edad < 18) {
        err.fecha_nacimiento = "Debes ser mayor de 18 años para registrarte.";
      }
    }
    return err;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id.replace('reg-', '')]: value }));
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
                         id="reg-rut" value={form.rut} onChange={handleChange} 
                         required placeholder="12345678-9" />
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