import React from 'react';

const ReportEmptyState = ({
  testId = 'report-empty-state',
  icon = 'search_off',
  title = 'No se encontraron resultados',
  description = 'No hay registros que coincidan con los criterios de búsqueda o filtros seleccionados.',
}) => (
  <div
    data-testid={testId}
    className="rounded-md border border-dashed border-slate-300 p-12 text-center flex flex-col items-center justify-center gap-3 bg-white shadow-2xs"
  >
    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
      <span className="material-symbols-outlined text-2xl">{icon}</span>
    </div>
    <div className="max-w-md">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
  </div>
);

export default ReportEmptyState;
