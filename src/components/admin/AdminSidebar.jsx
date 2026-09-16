import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { images } from '../../services/imagesConfig';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  {
    name: 'Dashboard General',
    icon: 'grid_view',
    path: '/admin/dashboard',
    badge: null,
  },
  {
    name: 'Alumnos & Legajos',
    icon: 'school',
    path: '/admin',
    exact: true,
  },
  {
    name: 'Cuerpo Docente',
    icon: 'badge',
    path: '/admin/docentes',
  },
  {
    name: 'Oferta Académica',
    icon: 'menu_book',
    path: '/admin/oferta-academica',
  },
  {
    name: 'Deportes & Servicios',
    icon: 'sports_soccer',
    path: '/admin/servicios',
  },
  {
    name: 'Finanzas & Pagos',
    icon: 'payments',
    path: '/admin/finanzas',
  },
  {
    name: 'Usuarios & Roles (RBAC)',
    icon: 'admin_panel_settings',
    path: '/admin/usuarios',
  },
  {
    name: 'Reportes Directivos',
    icon: 'insights',
    path: '/admin/reportes',
  },
];

const AdminSidebar = ({ isMobileOpen, onCloseMobile, activeItem = 'alumnos' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Helper to extract initials
  const getInitials = (name) => {
    if (!name) return 'MV';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const userName = user?.nombre || user?.email?.split('@')[0] || 'Lic. Martín Valdez';
  const userRoleDisplay = user?.role === 'user_admin' ? 'Superadmin Dirección' : 'Personal Directivo';
  const initials = getInitials(userName);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          data-testid="admin-sidebar-backdrop"
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        data-testid="admin-sidebar"
        className={`fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-100 shadow-[2px_0_20px_rgba(0,0,0,0.03)] z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Header */}
          <div
            data-testid="admin-sidebar-brand"
            className="px-6 py-5 flex items-center justify-between border-b border-slate-50"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-lime-100 via-amber-50 to-blue-50 p-1 flex items-center justify-center shadow-sm shrink-0 ring-2 ring-lime-400/20">
                <img
                  data-testid="admin-sidebar-logo"
                  alt="Logo Educar para Transformar"
                  className="h-8 w-auto object-contain shrink-0"
                  src={images.logo}
                  onError={(e) => {
                    e.target.src =
                      'https://lh3.googleusercontent.com/aida/AEtjO1WVCjH9RKWhV5IdoM4AeJ1AK6BLtlST3Xtz8TJi7qxVkE9SEdRbR4FLue_xW5vRKejhIwOJyfVqvFA98Cu6gBF7a-CxIVrsZCweo-Sp3fQvg48n1Lhh7MS0tohp7j7FMDR43e8kbefpBfdNj_CTAvypjHHNcQQwC52MOYajM-0fPZXxMLsrwzQLJ5vslrW0mOp0Vm_xkkeGUmWDrEMnXnMcyPvVeQzDigU-LOQzdM9Oht4kUS8ryRwjDGI';
                  }}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span
                  data-testid="admin-sidebar-title"
                  className="font-bold text-slate-900 text-sm tracking-tight truncate"
                >
                  Educar para Transformar
                </span>
                <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-500 inline-block"></span>
                  Gestión Académica
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              data-testid="admin-sidebar-close-button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl"
              aria-label="Cerrar menú"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Section Label */}
          <div className="px-6 pb-2 pt-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Navegación Principal
            </span>
          </div>

          {/* Navigation Links */}
          <nav data-testid="admin-sidebar-nav" className="px-3 flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isItemActive =
                (item.path === '/admin' && activeItem === 'alumnos') ||
                item.name.toLowerCase().includes(activeItem.toLowerCase());
              const itemSlug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  data-testid={`admin-nav-${itemSlug}`}
                  data-active={isItemActive ? 'true' : 'false'}
                  onClick={() => {
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm transition-all group ${
                    isItemActive
                      ? 'bg-gradient-to-r from-emerald-500 to-lime-500 text-white font-semibold shadow-md shadow-lime-500/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`material-symbols-outlined text-[20px] transition-colors ${
                        isItemActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {isItemActive && (
                    <span className="w-2 h-2 rounded-full bg-white shadow-sm shrink-0"></span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card in Sidebar */}
        <div
          data-testid="admin-user-profile-card"
          className="p-3 m-3 bg-gradient-to-br from-slate-50 via-lime-50/30 to-amber-50/20 border border-slate-100 rounded-3xl flex flex-col gap-2 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div
                  data-testid="admin-user-avatar"
                  className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-inner"
                >
                  {initials}
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-lime-500 rounded-full ring-2 ring-white"></span>
              </div>
              <div className="flex flex-col min-w-0">
                <span
                  data-testid="admin-user-name"
                  className="text-xs font-bold text-slate-800 truncate"
                  title={userName}
                >
                  {userName}
                </span>
                <span
                  data-testid="admin-user-role"
                  className="text-[10px] text-slate-400 font-medium truncate"
                >
                  {userRoleDisplay}
                </span>
              </div>
            </div>
            <button
              data-testid="admin-logout-button"
              onClick={handleLogout}
              type="button"
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-full transition-colors cursor-pointer border-none bg-transparent"
              title="Cerrar Sesión"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
