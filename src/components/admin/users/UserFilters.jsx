import React from 'react';
import { USER_ESTADOS } from './userRbacConstants';

const UserFilters = ({
  searchTerm,
  onSearchChange,
  selectedEstado,
  onEstadoChange,
  onResetFilters,
}) => {
  const hasActiveFilters = Boolean(searchTerm) || Boolean(selectedEstado);

  return (
    <section className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
          {/* Input Buscador */}
          <div className="relative flex-1 min-w-[260px]">
            <label htmlFor="filtro-usuario-input" className="sr-only">
              Buscar usuarios
            </label>
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              id="filtro-usuario-input"
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por Nombre, Apellido, Email, DNI, Legajo o Cargo..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 rounded-full text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white border border-transparent focus:border-blue-500/40 transition-all"
            />
          </div>

          {/* Filtros Dropdown Estado */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <label htmlFor="filtro-usuario-estado" className="sr-only">
                Filtrar por estado
              </label>
              <select
                id="filtro-usuario-estado"
                aria-label="Filtrar por estado"
                value={selectedEstado}
                onChange={(e) => onEstadoChange(e.target.value)}
                className="appearance-none bg-slate-100/80 text-slate-700 font-semibold text-xs pl-3.5 pr-8 py-2.5 rounded-full focus:outline-none focus:bg-white border border-transparent focus:border-blue-500/40 cursor-pointer"
              >
                <option value="">Estado: Todos</option>
                {USER_ESTADOS.map((est) => (
                  <option key={est} value={est}>
                    {est}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Botón Limpiar */}
            <button
              type="button"
              onClick={onResetFilters}
              disabled={!hasActiveFilters}
              className={`p-2 rounded-full transition-colors ${
                hasActiveFilters
                  ? 'text-slate-600 hover:text-amber-600 hover:bg-amber-50 cursor-pointer'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
              title="Limpiar filtros"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserFilters;
