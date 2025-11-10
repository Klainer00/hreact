import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthProvider';
import { RolUsuario } from '../../interfaces/rolUsuario';

const AdminLayout = () => {
  const { usuario } = useAuth();

  if (!usuario || (usuario.rol !== RolUsuario.Admin && usuario.rol !== RolUsuario.Vendedor)) {
    return <Navigate to="/admin/index.html" replace />;
  }

  // 1. Usamos la nueva clase CSS 'admin-layout'
  return (
    <div className="admin-layout"> 
      <AdminSidebar />
      
      {/* 2. Usamos la nueva clase CSS para el contenido */}
      <main className="admin-main-content">
        <Outlet /> {/* Aquí se renderizan Dashboard, Usuarios, Productos, Pedidos */}
      </main>
    </div>
  );
};

export default AdminLayout;