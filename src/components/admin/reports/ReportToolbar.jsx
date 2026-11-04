import React from 'react';
import { REPORT_TYPES } from './reportsUtils';

const ReportToolbar = ({ activeReportId, onSelectReport }) => {
  const currentReport = REPORT_TYPES.find((r) => r.id === activeReportId) || REPORT_TYPES[0];

  return (
    <div data-testid="reports-toolbar-container" className="flex flex-col gap-4 print:hidden">
      {/* Encabezado Principal */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <span className="material-symbols-outlined text-[24px]">insights</span>
          </div>
          <div className="text-left">
            <div className="flex items-center text-left gap-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Central de Reportes Directivos
              </span>
              <span className="hidden sm:inline-flex px-2 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse uppercase">
                BETA
              </span>
            </div>
            <span className="text-xs text-left text-slate-500 mt-0.5">
              {currentReport.description}
            </span>
          </div>
        </div>
      </div>

      {/* Pestañas de Selección de Reportes */}
      <nav
        data-testid="reports-tab-navigation"
        aria-label="Pestañas de reportes directivos"
        className="flex items-center gap-2 overflow-x-auto pb-1"
      >
        {REPORT_TYPES.map((rep) => {
          const isActive = rep.id === activeReportId;
          return (
            <button
              key={rep.id}
              type="button"
              data-testid={`tab-${rep.id}`}
              onClick={() => onSelectReport(rep.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-lime-300' : 'text-slate-400'}`}>
                {rep.icon}
              </span>
              <span>{rep.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ReportToolbar;
