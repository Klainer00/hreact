import { useState, useEffect, useMemo } from 'react';
import type { Usuario } from '../../interfaces/usuario';
import { RolUsuario } from '../../interfaces/rolUsuario';
import { checkRut } from '../../utils/checkrut';

interface Props {
  show: boolean;
  onClose: () => void;
  onSave: (usuario: Usuario) => void;
  usuarioToEdit: Usuario | null;
}

const ModalUsuario = ({ show, onClose, onSave, usuarioToEdit }: Props) => {
  const initialState: Usuario = {
    id: 0,
    rut: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    fecha_nacimiento: '',
    direccion: '',
    region: '',
    comuna: '',
    rol: RolUsuario.Cliente,
    estado: 'Activo',
  };
  
  const [form, setForm] = useState<Usuario>(initialState);
  const isEditMode = useMemo(() => !!usuarioToEdit, [usuarioToEdit]);

  // Cargar datos del usuario cuando se abre en modo edición
  useEffect(() => {
    if (usuarioToEdit) {
      setForm(usuarioToEdit);
    } else {
      setForm(initialState);
    }
  }, [usuarioToEdit, show]); // Se resetea cada vez que el modal se abre

  const errors = useMemo(() => {
    const err: Partial<Record<keyof Usuario, string>> = {};
    if (!form.nombre.trim()) err.nombre = "El nombre es requerido.";
    if (!form.apellido.trim()) err.apellido = "El apellido es requerido.";
    if (!form.email.includes('@')) err.email = "Email inválido.";
    if (!isEditMode && !form.password) err.password = "La contraseña es requerida al crear.";
    const rutValidation = checkRut(form.rut);
    if (!rutValidation.valid) err.rut = rutValidation.message;
    return err;
  }, [form, isEditMode]);

  const isValid = Object.keys(errors).length === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSave(form);
  };

  // Lógica para mostrar/ocultar el modal manualmente
  // (Bootstrap JS a veces es conflictivo con React)
  if (!show) {
    return null;
  }

  return (
    <div className="modal show" tabIndex={-1} style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{isEditMode ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit} noValidate>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="rut" className="form-label">RUT</label>
                  <input type="text" maxLength={9} className={`form-control ${errors.rut ? 'is-invalid' : ''}`} id="rut" value={form.rut} onChange={handleChange} required />
                  {errors.rut && <div className="invalid-feedback">{errors.rut}</div>}
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="nombre" className="form-label">Nombre</label>
                  <input type="text" className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} id="nombre" value={form.nombre} onChange={handleChange} required />
                  {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="apellido" className="form-label">Apellido</label>
                  <input type="text" className={`form-control ${errors.apellido ? 'is-invalid' : ''}`} id="apellido" value={form.apellido} onChange={handleChange} required />
                  {errors.apellido && <div className="invalid-feedback">{errors.apellido}</div>}
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} id="email" value={form.email} onChange={handleChange} required />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} id="password" value={form.password} onChange={handleChange} placeholder={isEditMode ? '(Dejar en blanco para no cambiar)' : ''} />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="rol" className="form-label">Rol</label>
                  <select className="form-select" id="rol" value={form.rol} onChange={handleChange}>
                    <option value={RolUsuario.Cliente}>{RolUsuario.Cliente}</option>
                    <option value={RolUsuario.Vendedor}>{RolUsuario.Vendedor}</option>
                    <option value={RolUsuario.Admin}>{RolUsuario.Admin}</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="estado" className="form-label">Estado</label>
                  <select className="form-select" id="estado" value={form.estado} onChange={handleChange}>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer mt-3">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn btn-success" disabled={!isValid}>Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalUsuario;