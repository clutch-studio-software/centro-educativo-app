import React from 'react';
import { FINANCE_STATUSES, FINANCE_MONTHS } from '../../../data/mockFinanceData';

const FinanceFilterBar = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedMonth,
  onMonthChange,
  onResetFilters,
  pendingCount = 14,
  approvedCount = 142,
  rejectedCount = 3,
}) => {
  return (
    <div
      data-testid="finance-filter-bar"
      className="p-4 rounded-md bg-white shadow-xs border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
    >
      {/* Search Input */}
      <div className="relative flex-1 min-w-[280px]">
        <span
          className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]"
          aria-hidden="true"
        >
          search
        </span>
        <input
          id="finance-search-input"
          data-testid="finance-search-input"
          aria-label="Buscar por DNI tutor, apellido o legajo familiar"
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por DNI tutor, apellido o legajo familiar..."
          className="w-full pl-11 pr-4 py-2.5 rounded-full bg-slate-100 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/40 transition-all font-medium border border-transparent focus:border-blue-400"
        />
        {searchTerm && (
          <button
            type="button"
            data-testid="finance-search-clear"
            aria-label="Borrar búsqueda"
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Status Dropdown */}
        <div className="relative">
          <select
            id="finance-status-select"
            data-testid="finance-status-select"
            aria-label="Filtrar por estado del comprobante"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none pl-3.5 pr-8 py-2.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/40 cursor-pointer hover:bg-slate-200/70 transition-colors border border-transparent"
          >
            <option value={FINANCE_STATUSES.TODOS}>{FINANCE_STATUSES.TODOS}</option>
            <option value={FINANCE_STATUSES.PENDIENTE}>
              {FINANCE_STATUSES.PENDIENTE} ({pendingCount})
            </option>
            <option value={FINANCE_STATUSES.APROBADO}>
              {FINANCE_STATUSES.APROBADO} ({approvedCount})
            </option>
            <option value={FINANCE_STATUSES.RECHAZADO}>
              {FINANCE_STATUSES.RECHAZADO} ({rejectedCount})
            </option>
          </select>
          <span
            className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-[16px]"
            aria-hidden="true"
          >
            expand_more
          </span>
        </div>

        {/* Month Dropdown */}
        <div className="relative">
          <select
            id="finance-month-select"
            data-testid="finance-month-select"
            aria-label="Seleccionar período mensual"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="appearance-none pl-8 pr-8 py-2.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/40 cursor-pointer hover:bg-slate-200/70 transition-colors border border-transparent"
          >
            {FINANCE_MONTHS.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <span
            className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none text-[16px]"
            aria-hidden="true"
          >
            calendar_today
          </span>
          <span
            className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-[16px]"
            aria-hidden="true"
          >
            expand_more
          </span>
        </div>

        {/* Filter List Button */}
        <button
          type="button"
          data-testid="finance-filter-options-btn"
          aria-label="Filtros avanzados"
          className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 transition-colors cursor-pointer border-none"
        >
          <span className="material-symbols-outlined text-[18px]">filter_list</span>
        </button>

        {/* Limpiar Button */}
        <button
          type="button"
          id="btn-clean-filters"
          data-testid="btn-clean-filters"
          onClick={onResetFilters}
          className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors px-2.5 py-1 cursor-pointer border-none bg-transparent"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default FinanceFilterBar;
