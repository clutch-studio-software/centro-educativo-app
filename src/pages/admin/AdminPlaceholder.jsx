import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';

const MODULE_DETAILS = {
  '/admin/dashboard': {
    title: 'Dashboard General',
    subtitle: 'Métricas integrales de la institución',
    icon: 'grid_view',
    activeItem: 'dashboard',
    color: 'from-blue-500 to-indigo-600',
    description:
      'Próximamente podrás visualizar métricas clave de asistencia, rendimiento académico institucional y alertas tempranas de los tres niveles educativos.',
  },
  '/admin/docentes': {
    title: 'Cuerpo Docente',
    subtitle: 'Gestión de profesores, materias y asistencias',
    icon: 'badge',
    activeItem: 'docentes',
    color: 'from-emerald-500 to-teal-600',
    description:
      'Módulo para la administración de legajos docentes, asignación de cursos y divisiones, licencias y registro de firmas digitales.',
  },
  '/admin/oferta-academica': {
    title: 'Oferta Académica',
    subtitle: 'Planes de estudio, niveles, cursos y salas/divisiones',
    icon: 'menu_book',
    activeItem: 'oferta-academica',
    color: 'from-amber-500 to-orange-600',
    description:
      'Configuración personalizada de salas por color (Verde, Roja, Azul), divisiones por letra (A, B, C), cupos por aula y materias curriculares.',
  },
  '/admin/servicios': {
    title: 'Deportes & Servicios',
    subtitle: 'Comedor, transporte, clubes y talleres extracurriculares',
    icon: 'sports_soccer',
    activeItem: 'servicios',
    color: 'from-purple-500 to-violet-600',
    description:
      'Inscripción y gestión de viandas de comedor escolar, transporte escolar, talleres de robótica, arte y torneos deportivos.',
  },
  '/admin/finanzas': {
    title: 'Finanzas & Pagos',
    subtitle: 'Facturación, aranceles, cuotas y convenios familiares',
    icon: 'payments',
    activeItem: 'finanzas',
    color: 'from-lime-500 to-emerald-600',
    description:
      'Emisión de comprobantes de pago, control de aranceles mensuales, planes para grupos familiares y conciliación bancaria.',
  },
  '/admin/usuarios': {
    title: 'Usuarios & Roles (RBAC)',
    subtitle: 'Administración de accesos y perfiles de seguridad',
    icon: 'admin_panel_settings',
    activeItem: 'usuarios',
    color: 'from-rose-500 to-pink-600',
    description:
      'Control de accesos y permisos por roles institucionales (Administrador, Personal Directivo, Docente, Tutor/Padre, Estudiante).',
  },
  '/admin/reportes': {
    title: 'Reportes Directivos',
    subtitle: 'Informes ejecutivos y exportación de datos oficiales',
    icon: 'insights',
    activeItem: 'reportes',
    color: 'from-cyan-500 to-blue-600',
    description:
      'Generación de actas oficiales, libretas de calificaciones, certificados de alumno regular y estadísticas para supervisión ministerial.',
  },
};

const AdminPlaceholder = ({ title: propTitle, icon: propIcon, activeItem: propActiveItem }) => {
  const location = useLocation();

  const moduleInfo = MODULE_DETAILS[location.pathname] || {
    title: propTitle || 'Módulo en Construcción',
    subtitle: 'Gestión Institucional',
    icon: propIcon || 'engineering',
    activeItem: propActiveItem || 'alumnos',
    color: 'from-lime-500 to-emerald-600',
    description:
      'Esta página está siendo implementada actualmente como parte de las mejoras continuas del sistema de gestión escolar.',
  };

  return (
    <AdminLayout activeItem={moduleInfo.activeItem} breadcrumbs={[moduleInfo.title]}>
      <div className="flex flex-col items-center justify-center min-h-[62vh] max-w-2xl mx-auto text-center py-10 px-4">
        {/* Badge Estado */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200/80 rounded-full text-amber-800 text-xs font-bold mb-6 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Módulo en Construcción · Ciclo 2027</span>
        </div>

        {/* Ícono Ilustrado */}
        <div
          className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${moduleInfo.color} text-white flex items-center justify-center shadow-lg shadow-slate-200/80 mb-6 transition-transform hover:scale-105`}
        >
          <span className="material-symbols-outlined text-[40px]">{moduleInfo.icon}</span>
        </div>

        {/* Título & Mensaje */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          {moduleInfo.title}
        </h1>
        <p className="text-sm sm:text-base font-bold text-slate-700 mb-3">
          Esta página está siendo implementada...
        </p>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-lg mb-8">
          {moduleInfo.description}
        </p>

        {/* Acciones */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/admin"
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-bold text-xs rounded-xl shadow-md shadow-lime-500/20 hover:shadow-lg hover:from-emerald-600 hover:to-lime-600 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Volver a Alumnos & Legajos</span>
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Página anterior
          </button>
        </div>

        {/* Pie de Ayuda */}
        <p className="text-[11px] text-slate-400 font-medium mt-10">
          Centro Educativo · Sistema de Gestión Escolar v0.1.9
        </p>
      </div>
    </AdminLayout>
  );
};

export default AdminPlaceholder;
