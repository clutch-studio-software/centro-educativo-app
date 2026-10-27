import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ALLOWED_STAFF_ROLES = new Set([
  'user_admin',
  'directivo',
  'administrador',
  'admin',
  'director',
  'administrativo',
  'staff',
  'secretaria',
  'secretaría',
  'docente',
  'teacher',
  'profesor',
  'profesora',
  'maestro',
  'enfermeria',
  'enfermería',
  'salud',
  'medico',
  'médico',
  'preceptoria',
  'preceptoría',
  'preceptor',
  'preceptora',
  'celador',
]);

const checkIsStaff = (user) => {
  if (!user) return false;
  if (user.role === 'user_admin') return true;
  return ALLOWED_STAFF_ROLES.has(String(user.role || '').trim().toLowerCase());
};

/**
 * Route guard that ensures only authenticated institutional staff members
 * can access the /admin dashboard and submodules.
 */
const AdminProtectedRoute = () => {
  const { user, loading, isLoggedIn } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        data-testid="admin-auth-loading"
        className="min-h-screen bg-[#f7faf6] flex flex-col items-center justify-center p-4"
      >
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-600 text-sm font-semibold tracking-wide">
          Verificando credenciales institucionales...
        </p>
      </div>
    );
  }

  const isAuthorized = isLoggedIn && checkIsStaff(user);

  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
