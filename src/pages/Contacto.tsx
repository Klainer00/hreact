// Este formulario es solo visual, no tiene la lógica de envío
// (requeriría un estado como en RegistroModal)
const Contacto = () => {
  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Contacto</h2>
      <div className="row">
        <div className="col-md-8 mx-auto">
          <p className="text-center">¿Tienes preguntas o comentarios? Escríbenos y te responderemos a la brevedad.</p>
          <form>
            <div className="mb-3">
              <label htmlFor="contact-name" className="form-label">Nombre</label>
              <input type="text" className="form-control" id="contact-name" required />
            </div>
            <div className="mb-3">
              <label htmlFor="contact-email" className="form-label">Correo Electrónico</label>
              <input type="email" className="form-control" id="contact-email" required />
            </div>
            <div className="mb-3">
              <label htmlFor="contact-subject" className="form-label">Asunto</label>
              <input type="text" className="form-control" id="contact-subject" />
            </div>
            <div className="mb-3">
              <label htmlFor="contact-message" className="form-label">Mensaje</label>
              <textarea className="form-control" id="contact-message" rows={5} required></textarea>
            </div>
            <div className="text-center">
              <button type="submit" className="btn btn-success btn-lg">Enviar Mensaje</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contacto;