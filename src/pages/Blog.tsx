import { Link } from 'react-router-dom';

const Blog = () => {
  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Blog</h2>
      <div className="row g-4">
        {/* Blog 1 */}
        <div className="col-md-4">
          <div className="card h-100">
            <img src="/img/blog-huerto-en-casa.png" className="card-img-top" alt="Huerto en casa" />
            <div className="card-body">
              <h5 className="card-title">Cómo Empezar tu Propio Huerto en Casa</h5>
              <p className="card-text">Descubre los pasos básicos para cultivar tus propias verduras y hortalizas, incluso si tienes poco espacio.</p>
              <Link to="/detalle-blog-1.html" className="btn btn-outline-success">Leer Más</Link>
            </div>
          </div>
        </div>
        {/* Blog 2 */}
        <div className="col-md-4">
          <div className="card h-100">
            <img src="/img/blog-recetas-saludables.png" className="card-img-top" alt="Recetas saludables" />
            <div className="card-body">
              <h5 className="card-title">5 Recetas Fáciles y Saludables con Productos de Temporada</h5>
              <p className="card-text">Aprovecha al máximo la frescura de nuestros productos con estas ideas de recetas rápidas y nutritivas.</p>
              <Link to="/detalle-blog-2.html" className="btn btn-outline-success">Leer Más</Link>
            </div>
          </div>
        </div>
        {/* Blog 3 */}
        <div className="col-md-4">
          <div className="card h-100">
            <img src="/img/blog-beneficios-organico.png" className="card-img-top" alt="Productos orgánicos" />
            <div className="card-body">
              <h5 className="card-title">Los Beneficios de Consumir Productos Orgánicos</h5>
              <p className="card-text">Entiende por qué elegir productos orgánicos puede ser beneficioso para tu salud y para el medio ambiente.</p>
              <Link to="/detalle-blog-3.html" className="btn btn-outline-success">Leer Más</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;