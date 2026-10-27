import React from 'react';
import { formatCurrency } from '../../../utils/financeUtils';

const FinanceKpiCards = ({
  pendingCount = 14,
  pendingAmount = 1890000,
  onReviewPending,
}) => {
  const formattedPendingAmount = formatCurrency(pendingAmount);

  return (
    <div
      data-testid="finance-kpis-strip"
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {/* KPI 1: Recaudación del Mes */}
      <div
        data-testid="kpi-monthly-collection"
        className="relative overflow-hidden rounded-md bg-white p-5 shadow-sm border border-slate-200/80 transition-all hover:shadow-md"
      >
        <div className="flex items-start text-start justify-between">
          <div className="flex flex-col">
            <span
              data-testid="kpi-monthly-collection-title"
              className="text-xs uppercase tracking-wider font-semibold text-slate-500"
            >
              Recaudación del Mes
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span
                data-testid="kpi-monthly-collection-value"
                className="font-headline font-extrabold text-2xl lg:text-3xl text-slate-900 tracking-tight"
              >
                $18.420.500
              </span>
              <span className="text-xs font-bold text-slate-400">ARS</span>
            </div>
          </div>
          <div
            className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-xs"
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-[22px]">trending_up</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span
            data-testid="kpi-monthly-collection-trend"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"
          >
            <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
            +8.4%
          </span>
          <span className="text-xs text-slate-500 font-medium">
            vs. período Septiembre 2026
          </span>
        </div>
      </div>

      {/* KPI 2: Comprobantes Pendientes */}
      <div
        data-testid="kpi-pending-receipts"
        className="relative overflow-hidden rounded-md bg-white p-5 shadow-sm border border-slate-200/80 transition-all hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span
              data-testid="kpi-pending-receipts-title"
              className="text-xs uppercase tracking-wider font-semibold text-slate-500"
            >
              Comprobantes Pendientes
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span
                data-testid="kpi-pending-receipts-value"
                className="font-headline font-extrabold text-2xl lg:text-3xl text-amber-600 tracking-tight"
              >
                {pendingCount}
              </span>
              <span className="text-xs font-semibold text-amber-700/80">
                transferencias
              </span>
            </div>
          </div>
          <div
            className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shadow-xs"
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-[22px]">receipt_long</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              data-testid="kpi-pending-receipts-amount"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900"
            >
              {formattedPendingAmount}
            </span>
            <span className="text-xs text-slate-500">por verificar</span>
          </div>
          {onReviewPending && (
            <button
              type="button"
              data-testid="btn-review-pending-now"
              onClick={onReviewPending}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5 cursor-pointer border-none bg-transparent"
            >
              Revisar ahora
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          )}
        </div>
        <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(15, pendingCount * 7))}%` }}
          />
        </div>
      </div>

      {/* KPI 3: Tasa de Cobrabilidad */}
      <div
        data-testid="kpi-collection-rate"
        className="relative overflow-hidden rounded-md bg-white p-5 shadow-sm border border-slate-200/80 transition-all hover:shadow-md"
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span
              data-testid="kpi-collection-rate-title"
              className="text-xs uppercase tracking-wider font-semibold text-slate-500"
            >
              Tasa de Cobrabilidad
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span
                data-testid="kpi-collection-rate-value"
                className="font-headline font-extrabold text-2xl lg:text-3xl text-slate-900 tracking-tight"
              >
                92.4%
              </span>
              <span className="text-xs font-semibold text-slate-500">del padrón</span>
            </div>
          </div>
          <div
            className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 shadow-xs"
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Meta proyectada: 90%</span>
          <span className="font-bold text-emerald-700 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            +2.4% sobre objetivo
          </span>
        </div>
        <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-500"
            style={{ width: '92.4%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default FinanceKpiCards;
