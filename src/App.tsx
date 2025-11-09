import { Routes, Route } from 'react-router-dom';

// Importar Componentes de Plantilla
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';

// Importar Páginas Públicas
import Home from './pages/Home';
import Productos from './pages/Productos';
import Nosotros from './pages/Nosotros';
import Blog from './pages/Blog';
import Contacto from './pages/Contacto';
import DetalleBlog1 from './pages/DetalleBlog1';

// Importar Páginas de Admin
import AdminLogin from './pages/admin/AdminLogin';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminProductos from './pages/admin/AdminProductos';
import Perfil from './pages/Perfil';

function App() {
  return (
    <Routes>
      {/* Rutas Públicas (usan la plantilla con Navbar/Footer) */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="index.html" element={<Home />} />
        <Route path="productos.html" element={<Productos />} />
        <Route path="nosotros.html" element={<Nosotros />} />
        <Route path="blogs.html" element={<Blog />} />
        <Route path="contacto.html" element={<Contacto />} />
        <Route path="detalle-blog-1.html" element={<DetalleBlog1 />} />
        <Route path="perfil.html" element={<Perfil />} />
      </Route>

      {/* Rutas de Admin (usan la plantilla con Sidebar) */}
      {/* Nota: El login de admin es una página especial
        que NO usa el AdminLayout.
      */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/index.html" element={<AdminLogin />} />
      
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="usuarios.html" element={<AdminUsuarios />} />
        <Route path="producto.html" element={<AdminProductos />} />
      </Route>
    </Routes>
  );
}

export default App;