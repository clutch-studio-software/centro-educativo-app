import React from 'react';

/**
 * Resumen de métricas de presentismo y faltas
 */
const AttendanceMetricsSummary = ({
  faltasInjustificadas = 0,
  faltasJustificadas = 0,
  tardanzas = 0,
  totalFaltas = 0,
  hasInjustificadas = false,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Métrica 1: Faltas Injustificadas (Destacado) */}
      <div
        data-testid="metric-faltas-injustificadas"
        className={`p-3.5 rounded-md border text-left flex flex-col justify-between ${
          hasInjustificadas
            ? 'bg-rose-50/80 border-rose-200 ring-1 ring-rose-200/50'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
            Injustificadas
          </span>
          <span className="material-symbols-outlined text-rose-600 text-base">
            warning
          </span>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-black text-rose-700">
            {faltasInjustificadas}
          </p>
          <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
            Máx. 15 permitidas
          </p>
        </div>
      </div>

      {/* Métrica 2: Faltas Justificadas */}
      <div
        data-testid="metric-faltas-justificadas"
        className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-left flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Justificadas
          </span>
          <span className="material-symbols-outlined text-blue-500 text-base">
            verified
          </span>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-black text-slate-800">
            {faltasJustificadas}
          </p>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
            Con certificado
          </p>
        </div>
      </div>

      {/* Métrica 3: Tardanzas */}
      <div
        data-testid="metric-tardanzas"
        className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-left flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Tardanzas
          </span>
          <span className="material-symbols-outlined text-amber-500 text-base">
            schedule
          </span>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-black text-slate-800">
            {tardanzas}
          </p>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
            Ingresos demorados
          </p>
        </div>
      </div>

      {/* Métrica 4: Total Inasistencias */}
      <div
        data-testid="metric-total-faltas"
        className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-left flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Total Faltas
          </span>
          <span className="material-symbols-outlined text-slate-400 text-base">
            summarize
          </span>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-black text-slate-800">
            {totalFaltas}
          </p>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
            Acumuladas en ciclo
          </p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceMetricsSummary;
