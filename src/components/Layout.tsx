import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

// Importar Modales Globales
import LoginModal from './modals/LoginModal';
import RegistroModal from './modals/RegistroModal';
import CarritoModal from './modals/CarritoModal';

const Layout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet /> 
      </main>
      <Footer />
      
      {/* Modales (originalmente inyectados por login-auth.js) */}
      <LoginModal />
      <RegistroModal />
      <CarritoModal />
    </>
  );
};

export default Layout;