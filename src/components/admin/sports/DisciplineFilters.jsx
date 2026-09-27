import React from 'react';

const LEVEL_FILTER_OPTIONS = [
  { value: '', label: 'Nivel: Todos' },
  { value: 'Inicial', label: 'Nivel Inicial' },
  { value: 'Primario', label: 'Nivel Primario' },
  { value: 'Secundario', label: 'Nivel Secundario' },
];

const DAY_FILTER_OPTIONS = [
  { value: '', label: 'Día: Todos' },
  { value: 'Lunes', label: 'Lunes' },
  { value: 'Martes', label: 'Martes' },
  { value: 'Miércoles', label: 'Miércoles' },
  { value: 'Jueves', label: 'Jueves' },
  { value: 'Viernes', label: 'Viernes' },
  { value: 'Sábados', label: 'Sábados' },
];

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Estado: Todos' },
  { value: 'Activos', label: 'Estado: Activos' },
  { value: 'Completos', label: 'Estado: Completos' },
  { value: 'En Pausa', label: 'Estado: En Pausa' },
];

const DisciplineFilters = ({
  searchTerm,
  onSearchChange,
  selectedLevel,
  onLevelChange,
  selectedDay,
  onDayChange,
  selectedStatus,
  onStatusChange,
  onResetFilters,
}) => {
  const hasActiveFilters = Boolean(searchTerm || selectedLevel || selectedDay || selectedStatus);

  return (
    <section
      className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-[0_4px_18px_rgba(15,23,42,0.03)] flex flex-wrap items-center justify-between gap-3"
      data-purpose="filter-bar"
    >
      {/* Search box */}
      <div className="relative flex-1 min-w-[280px]">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <input
          data-testid="filter-sports-search"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar disciplina o profesor..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border-0 rounded-xl text-xs placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 text-slate-700 transition-all outline-none"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="Limpiar búsqueda"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Dropdowns */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Nivel */}
        <div className="relative">
          <select
            data-testid="filter-sports-level"
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value)}
            className="appearance-none bg-slate-50 text-slate-700 text-xs font-medium pl-3 pr-8 py-2 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {LEVEL_FILTER_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Día */}
        <div className="relative">
          <select
            data-testid="filter-sports-day"
            value={selectedDay}
            onChange={(e) => onDayChange(e.target.value)}
            className="appearance-none bg-slate-50 text-slate-700 text-xs font-medium pl-3 pr-8 py-2 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {DAY_FILTER_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Estado */}
        <div className="relative">
          <select
            data-testid="filter-sports-status"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none bg-slate-50 text-slate-700 text-xs font-medium pl-3 pr-8 py-2 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Filter Reset / Action Button */}
        <button
          type="button"
          onClick={onResetFilters}
          title={hasActiveFilters ? 'Restablecer filtros' : 'Filtros aplicados'}
          aria-label="Filtros avanzados"
          className={`p-2 rounded-xl transition-colors cursor-pointer border-none flex items-center justify-center ${
            hasActiveFilters
              ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              : 'text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path
              d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default DisciplineFilters;
