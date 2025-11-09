import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import LoginModal from './modals/LoginModal';
import RegistroModal from './modals/RegistroModal';
import CarritoModal from './modals/CarritoModal';

const Layout = () => {
  return (

    <div className="layout-container">
      <Navbar />
      
      <main>
        <Outlet /> 
      </main>
      
      <Footer />
      
      {/* Modales globales */}
      <LoginModal />
      <RegistroModal />
      <CarritoModal />
    </div>
  );
};

export default Layout;