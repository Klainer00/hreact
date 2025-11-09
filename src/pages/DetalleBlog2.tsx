import { Link } from 'react-router-dom';

const DetalleBlog2 = () => {
  return (
    <main className="container my-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h1 className="mb-3">5 Recetas Fáciles y Saludables</h1>
          <Link to="/blogs.html" className="btn btn-outline-secondary btn-sm mb-3">
            &larr; Volver al Blog
          </Link>
          <img src="/img/blog-recetas-saludables.png" className="img-fluid rounded mb-4" alt="Recetas" />
          <p>Cocinar con productos de temporada no solo es más económico...</p>
          {/* ...Pega el resto del contenido del blog 2 aquí... */}
          <Link to="/blogs.html" className="btn btn-outline-secondary btn-sm mt-4">
            &larr; Volver al Blog
          </Link>
        </div>
      </div>
    </main>
  );
};

export default DetalleBlog2;