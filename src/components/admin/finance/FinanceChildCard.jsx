import React from 'react';
import { formatCurrency } from '../../../utils/financeUtils';

const FinanceChildCard = ({ child }) => {
  const formattedChildTotal = formatCurrency(child?.totalAmount);
  const feeBreakdown = Array.isArray(child?.feeBreakdown) ? child.feeBreakdown : [];

  return (
    <div
      data-testid={`child-card-${child?.id || 'unknown'}`}
      className="rounded-md bg-white p-4 shadow-xs border border-slate-200/80 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs ${child?.avatarBg || 'bg-blue-100 text-blue-700'}`}
          >
            {child?.initials || 'AL'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900">{child?.name || 'Estudiante'}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono font-semibold">
                {child?.legajo || 'S/L'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">{child?.academicInfo || 'Sin información académica'}</span>
          </div>
        </div>
        <span className="font-headline font-extrabold text-xs text-slate-900">
          {formattedChildTotal} ARS
        </span>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <span className="text-[11px] font-semibold text-slate-500">
          Detalle de aranceles incluidos:
        </span>
        <div className="grid gap-2 text-xs">
          {feeBreakdown.length > 0 ? (
            feeBreakdown.map((fee) => {
              const formattedFee = formatCurrency(fee?.amount);
              const feeKey = fee?.id || `${child?.id || child?.legajo || 'fee'}-${fee?.label || 'concept'}`;

              return (
                <div
                  key={feeKey}
                  className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-100"
                >
                  <span className="text-slate-700 text-[11px] flex items-center gap-1.5 truncate">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${fee?.dotClass || 'bg-blue-600'} shrink-0`}
                    />
                    {fee?.label || 'Arancel'}
                  </span>
                  <span className="font-bold text-[11px] text-slate-900 shrink-0">
                    {formattedFee}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-[11px] text-slate-400 italic">Sin aranceles desglosados</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceChildCard;
