import React from 'react';
import FinanceReceiptRow from './FinanceReceiptRow';

const FinanceReceiptsTable = ({
  receipts,
  expandedRowId,
  onToggleAccordion,
  onOpenValidate,
  onOpenReject,
  onViewVoucher,
  onResetFilters,
}) => {
  return (
    <div
      data-testid="finance-table-container"
      className="overflow-hidden rounded-md bg-white shadow-xs border border-slate-200/80"
    >
      <div className="overflow-x-auto">
        <table
          data-testid="finance-receipts-table"
          className="w-full text-left text-xs border-collapse"
        >
          <thead>
            <tr className="bg-slate-100/80 text-slate-600 font-label text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
              <th className="py-3.5 px-5">Grupo Familiar / Tutor</th>
              <th className="py-3.5 px-4">Hijos Matriculados</th>
              <th className="py-3.5 px-4">Fecha de Carga</th>
              <th className="py-3.5 px-4">Monto Declarado</th>
              <th className="py-3.5 px-4">Estado</th>
              <th className="py-3.5 px-5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {receipts.length > 0 ? (
              receipts.map((receipt) => (
                <FinanceReceiptRow
                  key={receipt.id}
                  receipt={receipt}
                  isExpanded={expandedRowId === receipt.id}
                  onToggle={onToggleAccordion}
                  onOpenValidate={onOpenValidate}
                  onOpenReject={onOpenReject}
                  onViewVoucher={onViewVoucher}
                />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <div
                    data-testid="finance-empty-state"
                    className="flex flex-col items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[36px] text-slate-300">
                      search_off
                    </span>
                    <span className="text-sm font-semibold text-slate-700">
                      No se encontraron comprobantes
                    </span>
                    <p className="text-xs text-slate-400 max-w-sm">
                      No hay registros que coincidan con los criterios de búsqueda o filtros
                      seleccionados.
                    </p>
                    {onResetFilters && (
                      <button
                        type="button"
                        data-testid="btn-reset-empty-search"
                        onClick={onResetFilters}
                        className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer border-none bg-transparent"
                      >
                        Limpiar filtros y ver todos
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinanceReceiptsTable;
