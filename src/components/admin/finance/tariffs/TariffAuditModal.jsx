import React, { useState } from 'react';
import { formatCurrency } from '../../../../utils/financeUtils';

const PAGE_SIZE = 5;

const TariffAuditModal = ({ isOpen, onClose, auditLogs = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!isOpen) return null;

  const totalPages = Math.max(1, Math.ceil(auditLogs.length / PAGE_SIZE));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * PAGE_SIZE;
  const currentLogs = auditLogs.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div
      data-testid="tariff-audit-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-3xl bg-white rounded-md border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700 shrink-0">
              <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                history
              </span>
            </div>
            <div className="text-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Trazabilidad Financiera
              </span>
              <h3 className="font-headline text-lg font-extrabold text-slate-900">
                Auditoría de Modificaciones Arancelarias
              </h3>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-audit-modal"
            data-testid="btn-close-audit-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cerrar modal de auditoría"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        {/* Audit Logs List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {currentLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center">
              <span className="material-symbols-outlined text-4xl mb-2" aria-hidden="true">
                folder_open
              </span>
              <p className="text-sm font-semibold">No se registran modificaciones de tarifas aún.</p>
            </div>
          ) : (
            currentLogs.map((log) => (
              <div
                key={log.id}
                data-testid={`audit-log-item-${log.id}`}
                className="p-4 rounded-md bg-slate-50/70 border border-slate-200/80 space-y-3 hover:bg-slate-50 transition-colors"
              >
                {/* Meta header del registro */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {log.user?.initials || 'US'}
                    </div>
                    <div className="flex flex-col text-start">
                      <span className="text-xs font-bold text-slate-900">
                        {log.user?.name || 'Usuario'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {log.user?.role || 'Personal Autorizado'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200/70 shadow-2xs">
                      <span className="material-symbols-outlined text-[14px] text-blue-700" aria-hidden="true">
                        schedule
                      </span>
                      <span>{log.formattedDate}</span>
                    </span>

                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] uppercase">
                      {log.changes?.length || 0} cambios
                    </span>
                  </div>
                </div>

                {/* Lista de cambios en este guardado */}
                <div className="space-y-2">
                  {log.changes?.map((change, idx) => (
                    <div
                      key={`${log.id}-change-${idx}`}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-md bg-white border border-slate-200/70 text-xs"
                    >
                      <div className="flex flex-col text-start">
                        <span className="font-bold text-slate-800">
                          {change.concept}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                          {change.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <span className="line-through text-slate-400 font-medium">
                          {formatCurrency(change.previousAmount)}
                        </span>
                        <span className="material-symbols-outlined text-[14px] text-slate-400" aria-hidden="true">
                          arrow_forward
                        </span>
                        <span className="font-extrabold text-slate-900 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200/60">
                          {formatCurrency(change.newAmount)}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            change.diff >= 0 ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {change.diff >= 0 ? `+${formatCurrency(change.diff)}` : formatCurrency(change.diff)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Paginación (hasta 5 modificaciones) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50/70">
          <span className="text-xs text-slate-500 font-medium">
            Página <strong className="text-slate-800">{validPage}</strong> de{' '}
            <strong className="text-slate-800">{totalPages}</strong> ({auditLogs.length} registros totales)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-audit-prev-page"
              data-testid="btn-audit-prev-page"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={validPage <= 1}
              className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Anterior
            </button>
            <button
              type="button"
              id="btn-audit-next-page"
              data-testid="btn-audit-next-page"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={validPage >= totalPages}
              className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TariffAuditModal;
