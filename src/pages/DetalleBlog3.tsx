import { Link } from 'react-router-dom';

const DetalleBlog3 = () => {
  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h1 className="mb-3">Los Beneficios de Consumir Productos Orgánicos</h1>
          <Link to="/blogs.html" className="btn btn-outline-secondary btn-sm mb-3">
            &larr; Volver al Blog
          </Link>
          <img src="/img/blog-beneficios-organico.png" className="img-fluid rounded mb-4" alt="Orgánicos" />
          <p>La palabra "orgánico" se ha vuelto muy popular...</p>

          <Link to="/blogs.html" className="btn btn-outline-secondary btn-sm mt-4">
            &larr; Volver al Blog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DetalleBlog3;