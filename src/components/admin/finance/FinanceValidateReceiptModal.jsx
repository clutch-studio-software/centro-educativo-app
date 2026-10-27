import React from 'react';
import { formatCurrency } from '../../../utils/financeUtils';

const FinanceValidateReceiptModal = ({ receipt, onClose, onConfirm }) => {
  if (!receipt) return null;

  const formattedAmount = formatCurrency(receipt.declaredAmount);

  return (
    <div
      id="receipt-modal"
      data-testid="validate-receipt-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-lg rounded-md bg-white shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-slate-50 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <div className="text-start">
              <h3
                data-testid="modal-title"
                className="font-headline font-bold text-sm text-slate-900"
              >
                Validar Pago &amp; Emitir Recibo
              </h3>
              <span
                data-testid="modal-voucher-code"
                className="text-[11px] text-slate-500 font-mono"
              >
                Comprobante {receipt.familyCode}
              </span>
            </div>
          </div>
          <button
            type="button"
            data-testid="modal-close-btn"
            aria-label="Cerrar modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex flex-col gap-4 text-start">
          <div className="p-3.5 rounded-md bg-slate-50 flex items-center justify-between border border-slate-100">
            <div>
              <span className="text-[11px] text-slate-500 block font-medium">Tutor / Titular</span>
              <span data-testid="modal-tutor-name" className="text-xs font-bold text-slate-900">
                {receipt.tutor}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">
                DNI {receipt.tutorDni}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block font-medium">Monto a Imputar</span>
              <span
                data-testid="modal-amount-impute"
                className="font-headline font-extrabold text-sm text-blue-700"
              >
                {formattedAmount} ARS
              </span>
            </div>
          </div>

          {/* Datos del Comprobante Adjunto */}
          <div className="space-y-2 text-xs">
            <span className="font-bold text-slate-800 block">
              Comprobante Bancario Adjunto
            </span>
            <div className="p-3 rounded-md bg-white border border-slate-200 flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">
                    attach_file
                  </span>
                  <span className="font-semibold text-slate-800 truncate">
                    {receipt.bankingVoucher.attachmentName}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold shrink-0">
                  {receipt.bankingVoucher.paymentType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Pagador:</span>
                  <span className="font-medium text-slate-800">
                    {receipt.bankingVoucher.payerName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">CUIL:</span>
                  <span className="font-mono text-slate-800">
                    {receipt.bankingVoucher.payerCuil}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Fecha Operación:</span>
                  <span className="text-slate-800">
                    {receipt.bankingVoucher.operationDate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Monto Declarado:</span>
                  <span className="font-bold text-slate-900">
                    {formattedAmount} ARS
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-md bg-blue-50/80 border border-blue-200/70 text-xs text-slate-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0">
              info
            </span>
            <p className="leading-relaxed">
              Al aprobar, se enviará automáticamente una copia PDF del recibo fiscal oficial al e-mail
              registrado del tutor y se actualizará su estado académico.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-2.5 border-t border-slate-200">
          <button
            type="button"
            data-testid="btn-modal-cancel"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer border-none bg-transparent"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-confirm-payment"
            data-testid="btn-confirm-payment"
            onClick={() => onConfirm(receipt.id)}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-all cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Aprobar y Emitir Recibo
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceValidateReceiptModal;
