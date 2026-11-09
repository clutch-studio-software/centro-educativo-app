import React from 'react';
import AdminSectionTitle from '../AdminSectionTitle';

function resolveBillingAction(
  activeBillingAction,
  billingCycleInfo,
  isNextMonthEmitted
) {
  if (activeBillingAction) {
    return activeBillingAction;
  }
  if (!billingCycleInfo) {
    return null;
  }
  const nextMonth = billingCycleInfo.nextMonth;
  const currentMonthName = billingCycleInfo.currentMonthName || 'este mes';

  if (isNextMonthEmitted) {
    return {
      targetMonth: nextMonth,
      label: `${nextMonth} emitido`,
      canEmit: false,
      isEmitted: true,
      tooltip: `La facturación de ${nextMonth} ya fue emitida.`,
      badgeText: `${nextMonth} emitido`,
    };
  }

  return {
    targetMonth: nextMonth,
    label: `Emitir ${nextMonth}`,
    canEmit: Boolean(billingCycleInfo.canEmitNextMonth),
    isEmitted: false,
    tooltip: `Habilitado a partir del día 20 de ${currentMonthName} para emitir las facturas de ${nextMonth}.`,
    badgeText: null,
  };
}

const EmittedBadge = ({ badgeText, tooltip }) => (
  <button
    type="button"
    id="btn-emit-next-month-emitted"
    data-testid="btn-emit-next-month-emitted"
    disabled
    title={tooltip}
    className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full text-xs font-bold cursor-default opacity-90"
  >
    <span className="material-symbols-outlined text-[18px] text-emerald-600">
      check_circle
    </span>
    <span>{badgeText}</span>
  </button>
);

const EmitButton = ({ canEmit, isEmitting, label, tooltip, onOpenEmitModal }) => (
  <button
    type="button"
    id="btn-emit-next-month"
    data-testid="btn-emit-next-month"
    onClick={onOpenEmitModal}
    disabled={!canEmit || isEmitting}
    title={tooltip}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-sm text-xs font-bold transition-all ${
      canEmit
        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow'
        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
    }`}
  >
    <span className="material-symbols-outlined text-[19px]">
      {canEmit ? 'post_add' : 'event_available'}
    </span>
    <span>{isEmitting ? 'Emitiendo...' : label}</span>
  </button>
);

const BillingActionButton = ({
  activeBillingAction,
  billingCycleInfo,
  isNextMonthEmitted,
  onOpenEmitModal,
  isEmitting,
}) => {
  const action = resolveBillingAction(
    activeBillingAction,
    billingCycleInfo,
    isNextMonthEmitted
  );

  if (!action) return null;

  if (action.isEmitted && action.badgeText) {
    return <EmittedBadge badgeText={action.badgeText} tooltip={action.tooltip} />;
  }

  return (
    <EmitButton
      canEmit={action.canEmit}
      isEmitting={isEmitting}
      label={action.label}
      tooltip={action.tooltip}
      onOpenEmitModal={onOpenEmitModal}
    />
  );
};

const FinanceHeader = ({
  onExportBalance,
  onRecalculateBalances,
  isRecalculating = false,
  billingCycleInfo,
  activeBillingAction,
  isNextMonthEmitted = false,
  onOpenEmitModal,
  isEmitting = false,
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
        <div className="flex flex-wrap items-center gap-3">
          {/* Botón para emitir facturación según ciclo activo */}
          <BillingActionButton
            activeBillingAction={activeBillingAction}
            billingCycleInfo={billingCycleInfo}
            isNextMonthEmitted={isNextMonthEmitted}
            onOpenEmitModal={onOpenEmitModal}
            isEmitting={isEmitting}
          />

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
