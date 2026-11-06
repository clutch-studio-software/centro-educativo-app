import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import ChangePasswordModal from './components/organisms/ChangePasswordModal';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import FamilyPortalProtectedRoute from './components/portal/FamilyPortalProtectedRoute';

// Public Pages (Lazy loaded for optimal initial bundle size)
const Home = lazy(() => import('./pages/Home'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
const Registration = lazy(() => import('./pages/Registration'));
const EmploymentRequest = lazy(() => import('./pages/EmploymentRequest'));
const News = lazy(() => import('./pages/News'));
const Wellness = lazy(() => import('./pages/Wellness'));
const Levels = lazy(() => import('./pages/Levels'));
const Login = lazy(() => import('./pages/Login'));
const Privacy = lazy(() => import('./pages/Privacy'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Portal de Estudiantes y Familias (Autogestión e Inscripciones)
const StudentParentPortal = lazy(() => import('./pages/portal/StudentParentPortal'));

// Admin Pages (Lazy loaded for on-demand downloading)
const AdminPanel = lazy(() => import('./pages/StudentsManagement'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AttendanceManagement = lazy(() => import('./pages/admin/AttendanceManagement'));
const TeachersManagement = lazy(() => import('./pages/admin/TeachersManagement'));
const AcademicOfferManagement = lazy(() => import('./pages/admin/AcademicOfferManagement'));
const SportsManagement = lazy(() => import('./pages/admin/SportsManagement'));
const SportsDetailManagement = lazy(() => import('./pages/admin/SportsDetailManagement'));
const UsersRbacManagement = lazy(() => import('./pages/admin/UsersRbacManagement'));
const FinanceManagement = lazy(() => import('./pages/admin/FinanceManagement'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminPlaceholder = lazy(() => import('./pages/admin/AdminPlaceholder'));

function RouteLoadingFallback() {
  return (
    <div
      data-testid="route-loading-spinner"
      className="flex items-center justify-center min-h-[60vh] w-full"
    >
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <ChangePasswordModal />
      <Suspense fallback={<RouteLoadingFallback />}>
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

          {/* Portal de Acceso Escolar para Estudiantes y Padres/Tutores */}
          <Route element={<FamilyPortalProtectedRoute />}>
            <Route path="/mi-portal" element={<StudentParentPortal />} />
          </Route>

          {/* Rutas administrativas protegidas: sólo personal institucional autenticado */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/alumnos" element={<AdminPanel />} />
            <Route path="/admin/asistencias" element={<AttendanceManagement />} />
            <Route path="/admin/legacy" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/docentes" element={<TeachersManagement />} />
            <Route path="/admin/oferta-academica" element={<AcademicOfferManagement />} />
            <Route path="/admin/servicios" element={<SportsManagement />} />
            <Route path="/admin/servicios/detalle" element={<SportsDetailManagement />} />
            <Route path="/admin/servicios/detalle/:id" element={<SportsDetailManagement />} />
            <Route path="/admin/deportes" element={<SportsManagement />} />
            <Route path="/admin/deportes/detalle" element={<SportsDetailManagement />} />
            <Route path="/admin/deportes/detalle/:id" element={<SportsDetailManagement />} />
            <Route path="/admin/finanzas" element={<FinanceManagement />} />
            <Route path="/admin/usuarios" element={<UsersRbacManagement />} />
            <Route path="/admin/reportes" element={<AdminReports />} />
            <Route path="/admin/*" element={<AdminPlaceholder />} />
          </Route>

          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
