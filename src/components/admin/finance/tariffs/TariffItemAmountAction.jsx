import React from 'react';
import { formatCurrency } from '../../../../utils/financeUtils';

const TariffItemAmountAction = ({
  amount,
  unit = 'ARS/mes',
  onEdit,
  testId,
  editTitle = 'Editar monto',
}) => {
  return (
    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
      <div className="flex items-baseline gap-1.5 px-3.5 py-1.5 rounded-md bg-white border border-slate-200 shadow-2xs">
        <span className="font-headline font-extrabold text-sm text-slate-900">
          {formatCurrency(amount)}
        </span>
        <span className="text-[10px] font-semibold text-slate-500">
          {unit}
        </span>
      </div>

      <button
        type="button"
        id={testId ? `btn-edit-${testId}` : undefined}
        data-testid={testId ? `btn-edit-${testId}` : undefined}
        title={editTitle}
        onClick={onEdit}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-600 font-semibold text-xs border border-slate-200/80 transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
          edit
        </span>
        <span>Editar</span>
      </button>
    </div>
  );
};

export default TariffItemAmountAction;
