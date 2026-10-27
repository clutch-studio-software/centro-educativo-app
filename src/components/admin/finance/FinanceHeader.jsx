import React from 'react';
import AdminSectionTitle from '../AdminSectionTitle';

const FinanceHeader = ({
  onExportBalance,
  onRecalculateBalances,
  isRecalculating = false,
}) => {
  return (
    <section data-testid="finance-header-section" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Title & Badge */}
        <AdminSectionTitle
          icon="payments"
          title="Finanzas y Gestión de Pagos"
          subtitle="Control transaccional de transferencias bancarias familiares y emisión oficial de recibos escolares."
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-recalculate-balances"
            data-testid="btn-recalculate-balances"
            onClick={onRecalculateBalances}
            disabled={isRecalculating}
            title="Recalcula el total a abonar considerando inscripciones a actividades extracurriculares y tarifas vigentes"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white hover:bg-primary/90 disabled:opacity-60 rounded-full shadow-sm text-xs font-bold transition-all hover:shadow cursor-pointer disabled:cursor-not-allowed"
          >
            <span
              className={`material-symbols-outlined text-[19px] ${
                isRecalculating ? 'animate-spin' : ''
              }`}
              aria-hidden="true"
            >
              sync
            </span>
            <span>{isRecalculating ? 'Actualizando saldos...' : 'Actualizar saldos'}</span>
          </button>

          <button
            type="button"
            id="btn-export-balance"
            data-testid="btn-export-balance"
            onClick={onExportBalance}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 rounded-full shadow-sm text-xs font-bold transition-all hover:shadow cursor-pointer"
          >
            <span
              className="material-symbols-outlined text-[19px] text-slate-500 group-hover:text-blue-600 transition-colors"
              aria-hidden="true"
            >
              download
            </span>
            <span>Exportar Balance (Excel/PDF)</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinanceHeader;
