import React from 'react';
import { triggerPrintReport } from './reportsUtils';

const ReportHeaderActions = ({
  title,
  icon,
  badgeText,
  onExportCsv,
  isExportDisabled = false,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
    <div className="flex items-center gap-2">
      {icon && <span className="material-symbols-outlined text-[20px] text-blue-600">{icon}</span>}
      <h2 className="font-extrabold text-slate-900 text-sm">{title}</h2>
      {badgeText && (
        <span className="text-xs text-slate-400 font-semibold">({badgeText})</span>
      )}
    </div>
    <div className="flex items-center gap-2 print:hidden">
      <button
        type="button"
        data-testid="btn-export-csv"
        onClick={onExportCsv}
        disabled={isExportDisabled}
        className="px-3 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
        title="Descargar este reporte en formato CSV compatible con Excel"
      >
        <span className="material-symbols-outlined text-[16px] text-emerald-600">download</span>
        <span>Exportar CSV</span>
      </button>
      <button
        type="button"
        data-testid="btn-print-report"
        onClick={triggerPrintReport}
        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
        title="Imprimir reporte o exportar a PDF"
      >
        <span className="material-symbols-outlined text-[16px]">print</span>
        <span>Imprimir / PDF</span>
      </button>
    </div>
  </div>
);

export default ReportHeaderActions;
