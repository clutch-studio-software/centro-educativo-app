import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Guarda de ruta para el Portal de Familias (Estudiantes, Padres, Tutores y Staff).
 * Redirige al inicio de sesión si el usuario no cuenta con una sesión activa.
 */
const FamilyPortalProtectedRoute = () => {
  const { user, isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div
        data-testid="family-portal-loading"
        className="flex items-center justify-center min-h-screen bg-slate-50"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">
            Cargando Portal de Acceso Escolar...
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default FamilyPortalProtectedRoute;
