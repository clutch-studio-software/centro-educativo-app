import React from 'react';
import FinanceReceiptAccordionPanel from './FinanceReceiptAccordionPanel';
import FinanceReceiptActionsMenu from './FinanceReceiptActionsMenu';
import { formatCurrency } from '../../../utils/financeUtils';

const FinanceReceiptStatusBadge = ({ status }) => {
  if (status === 'pendiente') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[10px]">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
        Pendiente
      </span>
    );
  }
  if (status === 'aprobado') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
        <span className="material-symbols-outlined text-[12px]">done</span>
        Aprobado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 font-semibold text-[10px]">
      <span className="material-symbols-outlined text-[12px]">error</span>
      Observado
    </span>
  );
};

const FinanceReceiptRow = ({
  receipt,
  isExpanded,
  onToggle,
  onOpenValidate,
  onOpenReject,
  onViewVoucher,
}) => {
  const formattedDeclaredAmount = formatCurrency(receipt.declaredAmount);

  return (
    <>
      {/* Fila Principal */}
      <tr
        id={`parent-row-${receipt.id}`}
        data-testid={`receipt-row-${receipt.id}`}
        onClick={() => onToggle(receipt.id)}
        className={`hover:bg-slate-50/80 transition-colors cursor-pointer select-none border-b border-slate-100 ${
          isExpanded ? 'bg-blue-50/20' : ''
        }`}
      >
        {/* Tutor / Grupo Familiar */}
        <td className="py-3.5 px-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              id={`chevron-${receipt.id}`}
              data-testid={`chevron-${receipt.id}`}
              aria-label={isExpanded ? 'Colapsar detalles' : 'Expandir detalles'}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 transition-transform duration-200 shrink-0 bg-transparent border-none cursor-pointer ${
                isExpanded ? 'rotate-180' : ''
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            <div
              data-testid={`avatar-${receipt.id}`}
              className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${receipt.avatarBg}`}
            >
              {receipt.initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span
                data-testid={`tutor-name-${receipt.id}`}
                className="font-semibold text-xs text-slate-900 truncate"
              >
                {receipt.tutor}
              </span>
              <span className="text-[11px] text-slate-500">
                DNI {receipt.tutorDni} ·{' '}
                <span className="font-mono text-blue-700 font-bold">{receipt.familyCode}</span>
              </span>
            </div>
          </div>
        </td>

        {/* Hijos Matriculados */}
        <td className="py-3.5 px-4">
          <span
            data-testid={`children-count-${receipt.id}`}
            className="text-xs font-medium text-slate-700 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-blue-600">
              family_restroom
            </span>
            {receipt.enrolledChildrenCount}{' '}
            {receipt.enrolledChildrenCount === 1 ? 'hijo matriculado' : 'hijos matriculados'}
          </span>
        </td>

        {/* Fecha de Carga */}
        <td className="py-3.5 px-4 text-slate-700 text-xs whitespace-nowrap">
          {receipt.bankingVoucher ? (
            <>
              <span data-testid={`upload-date-${receipt.id}`}>{receipt.uploadDate}</span>
              <span className="block text-[10px] text-slate-400">{receipt.uploadTime}</span>
            </>
          ) : (
            <span
              data-testid={`upload-date-pending-${receipt.id}`}
              className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium"
            >
              <span className="material-symbols-outlined text-[13px]">hourglass_empty</span>
              Sin comprobante
            </span>
          )}
        </td>

        {/* Monto Declarado */}
        <td className="py-3.5 px-4">
          <span
            data-testid={`amount-${receipt.id}`}
            className="font-headline font-bold text-xs text-slate-900"
          >
            {formattedDeclaredAmount}
          </span>
          <span className="block text-[10px] text-slate-500 truncate max-w-[140px]">
            {receipt.receiptNumber ? (
              <span className="text-emerald-700 font-semibold">{receipt.receiptNumber}</span>
            ) : (
              receipt.conceptSummary
            )}
          </span>
        </td>

        {/* Estado */}
        <td className="py-3.5 px-4">
          <FinanceReceiptStatusBadge status={receipt.status} />
        </td>

        {/* Acciones */}
        <td
          className="py-3.5 px-5 text-right whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          <FinanceReceiptActionsMenu
            receipt={receipt}
            onOpenValidate={onOpenValidate}
            onOpenReject={onOpenReject}
            onViewVoucher={onViewVoucher}
          />
        </td>
      </tr>

      {/* Accordion Dropdown Panel */}
      {isExpanded && (
        <FinanceReceiptAccordionPanel
          receipt={receipt}
          onViewVoucher={onViewVoucher}
        />
      )}
    </>
  );
};

export default FinanceReceiptRow;
