import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { regionesComunas } from '../../utils/regions';
import { checkRut } from '../../utils/validation';
import type { Usuario } from '../../interfaces/usuario';
import { RolUsuario } from '../../interfaces/rolUsuario';
import { saveUsuario } from '../../utils/storage'; // Para guardar el nuevo usuario

const RegistroModal = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({
    rut: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
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
    const emailRegex = /^[\w-\.]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/;
    if (!emailRegex.test(form.email)) err.email = "Email inválido o no permitido.";
    if (form.password.length < 4 || form.password.length > 10) err.password = "La contraseña debe tener entre 4 y 10 caracteres.";
    
    const rutValidation = checkRut(form.rut);
    if (!rutValidation.valid) err.rut = rutValidation.message;

    return err;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id.replace('reg-', '')]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      alert("Por favor corrige los errores del formulario.");
      return;
    }
    
    // Aquí deberíamos llamar a la API para registrar,
    // pero simulamos guardando en localStorage como en registro.js
    
    // En un caso real, la API nos devolvería el ID.
    const nuevoUsuario: Usuario = {
      ...form,
      id: Date.now(), // ID temporal
      rol: RolUsuario.Cliente,
      estado: 'Activo',
    };
    
    // Simulamos la lógica de registro.js
    // (Idealmente esto se haría en api.ts o storage.ts)
    // const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    // usuarios.push(nuevoUsuario);
    // localStorage.setItem('usuarios', JSON.stringify(usuarios));

    alert('¡Usuario registrado con éxito! Se iniciará tu sesión.');
    login(nuevoUsuario); // Auto-login
    // El modal se cerrará solo si el botón tiene data-bs-dismiss
  };

  return (
    <div className="modal fade" id="registroModal" tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
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
                  <input type="text" className={`form-control ${errors.rut ? 'is-invalid' : 'is-valid'}`} id="reg-rut" value={form.rut} onChange={handleChange} required placeholder="12345678-9" />
                  {errors.rut && <div className="invalid-feedback">{errors.rut}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="reg-nombre" className="form-label">Nombre</label>
                  <input type="text" className={`form-control ${errors.nombre ? 'is-invalid' : 'is-valid'}`} id="reg-nombre" value={form.nombre} onChange={handleChange} required />
                  {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="reg-apellido" className="form-label">Apellido</label>
                  <input type="text" className={`form-control ${errors.apellido ? 'is-invalid' : 'is-valid'}`} id="reg-apellido" value={form.apellido} onChange={handleChange} required />
                  {errors.apellido && <div className="invalid-feedback">{errors.apellido}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="reg-email" className="form-label">Email</label>
                  <input type="email" className={`form-control ${errors.email ? 'is-invalid' : 'is-valid'}`} id="reg-email" value={form.email} onChange={handleChange} required />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="reg-password" className="form-label">Contraseña</label>
                  <input type="password" className={`form-control ${errors.password ? 'is-invalid' : 'is-valid'}`} id="reg-password" value={form.password} onChange={handleChange} required />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="reg-direccion" className="form-label">Dirección</label>
                  <input type="text" className="form-control" id="reg-direccion" value={form.direccion} onChange={handleChange} required />
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="reg-fecha_nacimiento" className="form-label">Fecha de Nacimiento:</label>
                  <input type="date" className="form-control" id="reg-fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} />
                </div>
                
                <div className="col-md-6 mb-3">
                  <label htmlFor="reg-region" className="form-label">Región</label>
                  <select className="form-select" id="reg-region" value={form.region} onChange={handleChange} required>
                    <option value="">Seleccione una región</option>
                    {regionesComunas.regiones.map(r => (
                      <option key={r.region} value={r.region}>{r.region}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="reg-comuna" className="form-label">Comuna</label>
                  <select className="form-select" id="reg-comuna" value={form.comuna} onChange={handleChange} required disabled={!form.region}>
                    <option value="">Seleccione una comuna</option>
                    {comunas.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

              </div>
              <div className="modal-footer mt-3">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" className="btn btn-success" disabled={!isValid}>Registrarse</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroModal;