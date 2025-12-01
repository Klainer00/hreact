import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthProvider';
import { RolUsuario } from '../../interfaces/rolUsuario';

const AdminLayout = () => {
  const { usuario } = useAuth();

  // Validar si el usuario es admin o vendedor
  const esAdmin = usuario && (
    usuario.rol === RolUsuario.Admin || 
    usuario.rol === 'ADMIN' || 
    usuario.rol === 'Administrador' ||
    usuario.rol === RolUsuario.Vendedor || 
    usuario.rol === 'VENDEDOR' || 
    usuario.rol === 'Vendedor'
  );

  if (!esAdmin) {
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