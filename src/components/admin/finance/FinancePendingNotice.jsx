import React from 'react';

const FinancePendingNotice = ({ onBackToComprobantes }) => {
  return (
    <div
      data-testid="finance-aranceles-pending-view"
      className="p-8 rounded-md bg-white border border-slate-200/80 shadow-sm flex flex-col items-center justify-center text-center gap-4 py-16"
    >
      <div
        className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner"
        aria-hidden="true"
      >
        <span className="material-symbols-outlined text-[32px]">tune</span>
      </div>

      <div className="max-w-md">
        <h3
          data-testid="aranceles-pending-title"
          className="font-headline font-bold text-lg text-slate-900"
        >
          Parametrización de Aranceles &amp; Tarifas
        </h3>
        <p
          data-testid="aranceles-pending-description"
          className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed"
        >
          Esta sección se encuentra en proceso de actualización según la nueva estructura de diseño
          institucional. Muy pronto podrás gestionar aquí las cuotas por nivel, talleres y servicios.
        </p>
      </div>

      <div className="flex items-center gap-3 mt-2">
        <button
          type="button"
          data-testid="btn-back-to-comprobantes"
          onClick={onBackToComprobantes}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer border-none"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            receipt
          </span>
          <span>Volver a Comprobantes y Recibos</span>
        </button>
      </div>
    </div>
  );
};

export default FinancePendingNotice;
