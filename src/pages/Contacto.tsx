import { useState } from 'react';
import { enviarMensajeContacto } from '../utils/api';
import Swal from 'sweetalert2';

const Contacto = () => {
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    
    const res = await enviarMensajeContacto(form);
    
    setEnviando(false);

    if (res.success) {
      Swal.fire({
        title: '¡Mensaje Enviado!',
        text: 'Hemos recibido tu mensaje correctamente.',
        icon: 'success'
      });
      setForm({ nombre: '', email: '', asunto: '', mensaje: '' }); // Limpiar formulario
    } else {
      Swal.fire('Error', 'No se pudo enviar el mensaje. Intenta nuevamente.', 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Extraemos el nombre del campo del ID (ej: "contact-nombre" -> "nombre")
    const fieldName = e.target.id.replace('contact-', '');
    setForm({ ...form, [fieldName]: e.target.value });
  };

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Contacto</h2>
      <div className="row">
        <div className="col-md-8 mx-auto">
          <p className="text-center">¿Tienes preguntas o comentarios? Escríbenos y te responderemos a la brevedad.</p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="contact-nombre" className="form-label">Nombre</label>
              <input 
                type="text" 
                className="form-control" 
                id="contact-nombre" 
                value={form.nombre} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="mb-3">
              <label htmlFor="contact-email" className="form-label">Correo Electrónico</label>
              <input 
                type="email" 
                className="form-control" 
                id="contact-email" 
                value={form.email} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="mb-3">
              <label htmlFor="contact-asunto" className="form-label">Asunto</label>
              <input 
                type="text" 
                className="form-control" 
                id="contact-asunto" 
                value={form.asunto} 
                onChange={handleChange} 
              />
            </div>
            <div className="mb-3">
              <label htmlFor="contact-mensaje" className="form-label">Mensaje</label>
              <textarea 
                className="form-control" 
                id="contact-mensaje" 
                rows={5} 
                value={form.mensaje} 
                onChange={handleChange} 
                required
              ></textarea>
            </div>
            <div className="text-center">
              <button type="submit" className="btn btn-success btn-lg" disabled={enviando}>
                {enviando ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contacto;