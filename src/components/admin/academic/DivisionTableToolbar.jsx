import React from 'react';

export const DivisionStatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
          <span className="material-symbols-outlined text-[20px]">class</span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-400 block">Total Divisiones</span>
          <span className="text-base font-extrabold text-slate-900">{stats.totalDivisions}</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-400 block">Alumnos Inscriptos</span>
          <span className="text-base font-extrabold text-slate-900">
            {stats.totalEnrolled}{' '}
            <span className="text-xs font-normal text-slate-400">/ {stats.totalCapacity}</span>
          </span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
          <span className="material-symbols-outlined text-[20px]">pie_chart</span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-400 block">Tasa de Ocupación</span>
          <span className="text-base font-extrabold text-slate-900">{stats.occupancyRate}%</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-400 block">Divisiones Activas</span>
          <span className="text-base font-extrabold text-slate-900">
            {stats.activeDivisions}{' '}
            <span className="text-xs font-normal text-slate-400">/ {stats.totalDivisions}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export const DivisionTableToolbar = ({
  searchTerm,
  onSearchChange,
  shiftFilter,
  onShiftChange,
  statusFilter,
  onStatusChange,
  onAddNewDivision,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <label htmlFor="academic-division-search" className="sr-only">
          Buscar por curso, división o aula
        </label>
        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
          search
        </span>
        <input
          id="academic-division-search"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por curso, división, aula..."
          aria-label="Buscar por curso, división o aula"
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Limpiar búsqueda"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Shift Filter */}
        <label htmlFor="shift-filter-select" className="sr-only">
          Filtrar por turno
        </label>
        <select
          id="shift-filter-select"
          value={shiftFilter}
          onChange={(e) => onShiftChange(e.target.value)}
          aria-label="Filtrar por turno"
          className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
        >
          <option value="all">Todos los turnos</option>
          <option value="manana">Mañana</option>
          <option value="tarde">Tarde</option>
        </select>

        {/* Status Filter */}
        <label htmlFor="status-filter-select" className="sr-only">
          Filtrar por estado
        </label>
        <select
          id="status-filter-select"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filtrar por estado"
          className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="inactive">Pausadas</option>
        </select>

        {onAddNewDivision && (
          <button
            type="button"
            onClick={onAddNewDivision}
            data-testid="btn-add-division-toolbar"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer ml-auto border-none"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Nueva División</span>
          </button>
        )}
      </div>
    </div>
  );
};
