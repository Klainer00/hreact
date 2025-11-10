import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthProvider';
import { RolUsuario } from '../../interfaces/rolUsuario';

const AdminLayout = () => {
  const { usuario } = useAuth();

  if (!usuario || (usuario.rol !== RolUsuario.Admin && usuario.rol !== RolUsuario.Vendedor)) {
    return <Navigate to="/admin/index.html" replace />;
  }


  return (
    <div className="admin-layout"> 
      <AdminSidebar />
      
      <main className="admin-main-content">
        <Outlet /> 
      </main>
    </div>
  );
};

export default AdminLayout;