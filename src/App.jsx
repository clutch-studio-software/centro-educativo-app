import { Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import ChangePasswordModal from './components/organisms/ChangePasswordModal';
import AdminPanel from './pages/AdminPanel';
import AdminPanelLegacy from './pages/AdminPanelLegacy';
import Contact from './pages/Contact';
import EmploymentRequest from './pages/EmploymentRequest';
import Gallery from './pages/Gallery';
import Home from './pages/Home';
import Levels from './pages/Levels';
import Login from './pages/Login';
import News from './pages/News';
import NotFound from './pages/NotFound';
import Registration from './pages/Registration';
import Wellness from './pages/Wellness';
import Privacy from './pages/Privacy';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <ChangePasswordModal />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/employment-request" element={<EmploymentRequest />} />
        <Route path="/news" element={<News />} />
        <Route path="/wellness" element={<Wellness />} />
        <Route path="/levels" element={<Levels />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/alumnos" element={<AdminPanel />} />
        <Route path="/admin/legacy" element={<AdminPanelLegacy />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
