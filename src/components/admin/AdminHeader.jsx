import React from 'react';
import { Link } from 'react-router-dom';

const AdminHeader = ({ onToggleMobile, breadcrumbs = [] }) => {
  return (
    <header
      data-testid="admin-header"
      className="fixed top-0 left-0 lg:left-72 right-0 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] z-40 flex items-center justify-between px-4 sm:px-8 transition-all"
    >
      <div className="flex items-center gap-4 flex-1 max-w-2xl">
        {/* Mobile menu trigger */}
        <button
          data-testid="admin-header-mobile-toggle"
          type="button"
          onClick={onToggleMobile}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Abrir menú de navegación"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Breadcrumb navigation */}
        <nav
          data-testid="admin-header-breadcrumbs"
          className="flex items-center gap-2 text-xs text-slate-400 font-medium"
          aria-label="Ruta actual"
        >
          <Link to="/" data-testid="breadcrumb-home" className="hover:text-blue-600 transition-colors">
            Inicio
          </Link>
          <span className="text-slate-300">/</span>
          <span data-testid="breadcrumb-root" className="text-slate-800 font-semibold">
            Consola Administrativa
          </span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className="text-slate-300">/</span>
              <span data-testid={`breadcrumb-item-${idx}`} className="text-slate-800 font-semibold">
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right Header Status / Tag */}
      <div className="flex items-center gap-3">
        <span
          data-testid="admin-header-cycle-badge"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-lime-50 text-emerald-700 border border-lime-200/60 shadow-xs"
        >
          <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></span>
          Ciclo 2027
        </span>
      </div>
    </header>
  );
};

export default AdminHeader;
