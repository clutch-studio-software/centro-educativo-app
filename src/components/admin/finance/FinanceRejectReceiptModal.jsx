import React, { useState } from 'react';

const FinanceRejectReceiptModal = ({ receipt, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');

  if (!receipt) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(receipt.id, reason.trim() || 'Comprobante observado por inconsistencias en el importe o datos.');
  };

  return (
    <div
      data-testid="reject-receipt-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md rounded-md bg-white shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
        <div className="px-6 py-5 bg-red-50/60 flex items-center justify-between border-b border-red-100">
          <div className="flex items-center text-start gap-2.5">
            <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div>
              <span className="font-headline font-bold text-sm text-slate-900">
                Observar / Rechazar Comprobante
              </span>
            </div>
          </div>
          <button
            type="button"
            data-testid="btn-close-reject-modal"
            aria-label="Cerrar modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-2.5">
          <div className="text-xs text-slate-600">
            Al registrar una observación, el estado pasará a
          </div>
          <strong>Observado / Rechazado</strong>
          <div className="text-xs text-slate-600">
            y el tutor será notificado de dicho rechazo.
          </div>


          <div className="flex flex-col gap-1.5 pt-5">
            <label
              htmlFor="rejection-reason"
              className="text-xs text-start font-semibold text-slate-700"
            >
              Motivo o Detalle de la Observación:
            </label>
            <textarea
              id="rejection-reason"
              data-testid="input-rejection-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej.: El monto transferido no concuerda con la cuota informada, o el comprobante es ilegible..."
              className="w-full p-3 rounded-md border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              data-testid="btn-cancel-reject"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="btn-confirm-reject"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-red-600 text-white text-xs font-bold shadow-xs hover:bg-red-700 transition-all cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              Confirmar Rechazo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinanceRejectReceiptModal;
