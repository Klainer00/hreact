// src/components/BlogCard.tsx

import { Link } from 'react-router-dom';

// 1. Define la "forma" de los datos que espera la tarjeta
export interface BlogData {
  id: string; // Para usar en el 'key' prop
  titulo: string;
  descripcion: string;
  imagenSrc: string;
  imagenAlt: string;
  linkTo: string;
}

// 2. Define las 'props' que recibirá el componente
interface Props {
  blog: BlogData;
}

// 3. Crea el componente
const BlogCard = ({ blog }: Props) => {
  return (
    // Replicamos la estructura exacta de tu Blog.tsx
    // Incluyendo la columna para que sea más fácil de usar en la página
    <div className="col-md-4">
      <div className="card h-100">
        <img src={blog.imagenSrc} className="card-img-top" alt={blog.imagenAlt} />
        <div className="card-body">
          <h5 className="card-title">{blog.titulo}</h5>
          <p className="card-text">{blog.descripcion}</p>
          <Link to={blog.linkTo} className="btn btn-outline-success">Leer Más</Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;