import { Link } from 'react-router-dom';

const DetalleBlog1 = () => {
  return (
    <main className="container my-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h1 className="mb-3">Cómo Empezar tu Propio Huerto en Casa</h1>
          <Link to="/blogs.html" className="btn btn-outline-secondary btn-sm mb-3">
            &larr; Volver al Blog
          </Link>
          
          <img src="/img/blog-huerto-en-casa.png" className="img-fluid rounded mb-4" alt="Huerto en casa" />

          <p>Crear un huerto en casa es una de las actividades más gratificantes que existen. No solo te proporciona alimentos frescos y saludables, sino que también te conecta con la naturaleza y te ayuda a reducir el estrés. Contrario a lo que muchos piensan, no necesitas un gran jardín; una terraza, un balcón o incluso una ventana soleada pueden ser suficientes.</p>
          <h3 className="mt-4">1. Elige el Lugar Adecuado</h3>
          <p>La mayoría de las hortalizas necesitan al menos 6 horas de sol directo al día. Observa tu balcón o ventanas para identificar el lugar más soleado. Si tienes poco sol, no te desanimes; puedes optar por cultivos de sombra como lechugas, espinacas o hierbas aromáticas como la menta.</p>
          
          {/* ...Pega el resto del contenido del blog aquí... */}
          
          <Link to="/blogs.html" className="btn btn-outline-secondary btn-sm mt-4">
            &larr; Volver al Blog
          </Link>
        </div>
      </div>
    </main>
  );
};

export default DetalleBlog1;