import React, { useEffect, useRef } from 'react';

const FinanceEmitBillingModal = ({
  isOpen,
  targetMonth,
  onClose,
  onConfirm,
  isEmitting = false,
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal?.();
    } else if (!isOpen && dialog.open) {
      dialog.close?.();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="emit-billing-modal-title"
      data-testid="emit-billing-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs border-none outline-none m-0 max-w-none max-h-none w-full h-full backdrop:bg-transparent animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-7 relative border border-slate-200/80">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[28px]">post_add</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3
              id="emit-billing-modal-title"
              data-testid="emit-billing-modal-title"
              className="text-lg font-headline font-bold text-slate-900 leading-snug"
            >
              Emitir Facturación de {targetMonth}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ciclo lectivo institucional correspondiente al mes próximo.
            </p>
          </div>

          <button
            type="button"
            data-testid="btn-close-emit-modal"
            onClick={onClose}
            disabled={isEmitting}
            aria-label="Cerrar modal"
            className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 -mr-1 -mt-1 cursor-pointer bg-transparent border-none disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            ¿Confirmas la emisión oficial de las facturas y deudas familiares para el mes de{' '}
            <strong className="text-slate-900 font-semibold">{targetMonth}</strong>?
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
              <span>Cálculo automático de aranceles según nivel curricular</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
              <span>Imputación de talleres deportivos y extracurriculares activos</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">check</span>
              <span>Disponibilidad inmediata para que los tutores carguen transferencias</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            data-testid="btn-cancel-emit-billing"
            onClick={onClose}
            disabled={isEmitting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-full text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer border border-slate-200 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            data-testid="btn-confirm-emit-billing"
            onClick={() => onConfirm(targetMonth)}
            disabled={isEmitting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold shadow-sm transition-all hover:shadow cursor-pointer flex items-center justify-center gap-1.5 disabled:cursor-not-allowed"
          >
            <span
              className={`material-symbols-outlined text-[17px] ${
                isEmitting ? 'animate-spin' : ''
              }`}
            >
              {isEmitting ? 'progress_activity' : 'send'}
            </span>
            <span>{isEmitting ? 'Emitiendo facturación...' : 'Emitir Facturación'}</span>
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default FinanceEmitBillingModal;
