import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthProvider';
import { RolUsuario } from '../../interfaces/rolUsuario';

/**
 * ⚠️ NOTA: Este archivo NO se está usando
 * Se está usando el AdminLayout de /components/admin/AdminLayout.tsx en su lugar
 * Este se mantiene aquí por referencia/compatibilidad pero no es importado en App.tsx
 */
const AdminLayout = () => {
  const { usuario } = useAuth();

  // Validar si es admin o vendedor
  const esAdmin = usuario && (
    usuario.rol === RolUsuario.Admin || 
    usuario.rol === 'ADMIN' || 
    usuario.rol === 'Administrador' ||
    usuario.rol === RolUsuario.Vendedor || 
    usuario.rol === 'VENDEDOR' || 
    usuario.rol === 'Vendedor'
  );

  // Protección de Rutas: Si no hay usuario, o no es Admin/Vendedor, redirige
  if (!esAdmin) {
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