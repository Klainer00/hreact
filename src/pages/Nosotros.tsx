import React from 'react'; // Necesario para usar el Fragmento <>

const Nosotros = () => {
  return (
    <> {/* Usamos un fragmento para no añadir un div extra */}

      {/* 1. Banner de Ancho Completo */}
      <header className="nosotros-banner">
        <div className="container">
          <h1>Sobre Nosotros</h1>
        </div>
      </header>

      {/* 2. Contenido en Contenedor */}
      <div className="container my-5"> {/* <--- Contenedor para el contenido */}
        <div className="row align-items-center g-4">

          {/* Columna de Texto */}
          <div className="col-lg-6">
            <h2 className="mb-3">Nuestra Misión</h2>
            <p className="lead">En Huerto Hogar, nuestra misión es conectar a las familias con la frescura y autenticidad de los productos del campo. Creemos en la importancia de una alimentación saludable y sostenible, apoyando a los agricultores locales y ofreciendo productos de la más alta calidad.</p>

            <h2 className="mt-5 mb-3">Nuestra Visión</h2>
            <p className="lead">Ser la plataforma líder en la distribución de productos agrícolas locales, reconocida por nuestra calidad, compromiso con la sostenibilidad y por fortalecer el vínculo entre el campo y la ciudad, mejorando la calidad de vida de nuestros clientes y productores.</p>
          </div>

          {/* Columna de Imagen (como en tu foto) */}
          <div className="col-lg-6">
            <h2>Huerto Hogar</h2>
            <p className="lead">es una tienda online dedicada a llevar la frescura y calidad de los productos del campo directamente a la puerta de nuestros clientes en Chile. Con más de 6 años de experiencia, operamos en más de 9 puntos a lo largo del país, incluyendo ciudades clave como Santiago, Puerto Montt, Villarica, Nacimiento, Viña del Mar, Valparaíso, y Concepción. Nuestra misión es conectar a las familias chilenas con el campo, promoviendo un estilo de vida saludable y sostenible.</p>
          </div>

        </div>
      </div>
    </>
  );
};

export default Nosotros;