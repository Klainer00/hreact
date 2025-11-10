import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';

// Páginas Públicas
import Home from './pages/Home';
import Productos from './pages/Productos';
import Nosotros from './pages/Nosotros';
import Blog from './pages/Blog';
import Contacto from './pages/Contacto';
import DetalleBlog1 from './pages/DetalleBlog1';
import DetalleBlog2 from './pages/DetalleBlog2';
import DetalleBlog3 from './pages/DetalleBlog3';
import Perfil from './pages/Perfil';


// Páginas de Admin
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminProductos from './pages/admin/AdminProductos';
import AdminPedidos from './pages/admin/AdminPedidos';

function App() {
  return (
    <Routes>
      {/* --- Rutas Públicas --- */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="index.html" element={<Home />} />
        <Route path="productos.html" element={<Productos />} />
        <Route path="nosotros.html" element={<Nosotros />} />
        <Route path="blogs.html" element={<Blog />} />
        <Route path="contacto.html" element={<Contacto />} />
        <Route path="perfil.html" element={<Perfil />} />

        <Route path="detalle-blog-1.html" element={<DetalleBlog1 />} />
        <Route path="detalle-blog-2.html" element={<DetalleBlog2 />} />
        <Route path="detalle-blog-3.html" element={<DetalleBlog3 />} />
      </Route>

      {/* --- Rutas de Admin --- */}
      
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin/index.html" element={<AdminLogin />} /> 

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} /> 
        <Route path="dashboard" element={<AdminDashboard />} /> 
        <Route path="usuarios.html" element={<AdminUsuarios />} />
        <Route path="producto.html" element={<AdminProductos />} />
        <Route path="pedidos.html" element={<AdminPedidos />} />
      </Route>
    </Routes>
  );
}

export default App;