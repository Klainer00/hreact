import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthProvider';
import { RolUsuario } from '../../interfaces/rolUsuario';

const AdminLayout = () => {
  const { usuario } = useAuth();

  // Protección de Rutas: Si no hay usuario, o no es Admin/Vendedor, redirige
  if (!usuario || (usuario.rol !== RolUsuario.Admin && usuario.rol !== RolUsuario.Vendedor)) {
    // Redirige al login de admin, guardando la página que intentó visitar
    return <Navigate to="/admin/index.html" replace />;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <AdminSidebar />
        
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <Outlet /> {/* Aquí se renderizan AdminUsuarios, AdminProductos, etc. */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;