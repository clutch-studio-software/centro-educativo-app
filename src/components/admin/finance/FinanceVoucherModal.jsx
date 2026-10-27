import React from 'react';
import { formatCurrency } from '../../../utils/financeUtils';

const FinanceVoucherModal = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const formattedAmount = formatCurrency(receipt.declaredAmount);

  return (
    <div
      data-testid="voucher-preview-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-lg rounded-md bg-white shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-slate-200 max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">
                {receipt.status === 'aprobado' ? 'verified' : 'receipt_long'}
              </span>
            </div>
            <div className="text-start">
              <h3 className="font-headline font-bold text-sm text-slate-900">
                {receipt.status === 'aprobado'
                  ? `Recibo Oficial de Pago ${receipt.receiptNumber || ''}`
                  : 'Detalle de Comprobante Adjunto'}
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {receipt.familyCode} · {receipt.tutor}
              </span>
            </div>
          </div>
          <button
            type="button"
            data-testid="btn-close-voucher-modal"
            aria-label="Cerrar modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Voucher Paper Card */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!receipt.bankingVoucher ? (
            <div
              data-testid="voucher-missing-card"
              className="p-8 rounded-md bg-slate-50 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">
                  upload_file
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                No se cargó un comprobante aún
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                El tutor todavía no ha enviado el comprobante de transferencia bancaria correspondiente a este período.
              </p>
              <div className="mt-2 text-[11px] text-slate-400">
                Tutor: <strong className="text-slate-700">{receipt.tutor}</strong> · {receipt.familyCode}
              </div>
            </div>
          ) : (
            <div
              data-testid="voucher-receipt-card"
              className="p-5 rounded-md bg-slate-50 border border-slate-200/90 shadow-xs flex flex-col gap-4 text-xs font-sans relative"
            >
            {/* Header Voucher */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs">
                  ET
                </div>
                <div className="text-start">
                  <span className="font-bold text-slate-900 block leading-tight">
                    Instituto Educar para Transformar
                  </span>
                  <span className="text-[10px] text-slate-500">CUIT: 30-71239841-9</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[11px] font-bold text-blue-700 block">
                  {receipt.receiptNumber || receipt.familyCode}
                </span>
                <span className="text-[10px] text-slate-400">{receipt.bankingVoucher.operationDate}</span>
              </div>
            </div>

            {/* Datos cargados del Pagador y Operación */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-white rounded-md border border-slate-100 text-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Nombre y Apellido del Pagador
                </span>
                <span className="font-semibold text-slate-800 text-xs block mt-0.5">
                  {receipt.bankingVoucher.payerName}
                </span>
                <span className="text-[10px] text-slate-500">Tutor: {receipt.tutor}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  CUIL del Pagador
                </span>
                <span className="font-mono text-slate-800 text-xs font-semibold block mt-0.5">
                  {receipt.bankingVoucher.payerCuil}
                </span>
                <span className="text-[10px] text-slate-500">DNI: {receipt.tutorDni}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Fecha de Operación
                </span>
                <span className="font-semibold text-slate-800 text-xs block mt-0.5">
                  {receipt.bankingVoucher.operationDate}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Tipo de Pago
                </span>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                  {receipt.bankingVoucher.paymentType}
                </span>
              </div>
            </div>

            {/* Archivo adjunto */}
            <div className="p-3 bg-white rounded-md border border-slate-100 flex items-center justify-between text-start">
              <div className="flex items-center gap-2 min-w-0">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">
                  picture_as_pdf
                </span>
                <div className="min-w-0">
                  <span className="font-semibold text-slate-800 text-xs block truncate">
                    {receipt.bankingVoucher.attachmentName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {receipt.bankingVoucher.attachmentSize} · Comprobante original cargado
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                Verificado
              </span>
            </div>

            {/* Conceptos imputados */}
            <div className="space-y-1.5 text-start">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Conceptos Imputados
              </span>
              {receipt.children.map((child) => (
                <div
                  key={child.id}
                  className="p-2.5 rounded-md bg-white border border-slate-100 space-y-1 text-start"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{child.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">{child.legajo}</span>
                  </div>
                  <div className="text-[11px] text-slate-600">{child.academicInfo}</div>
                  <div className="pt-1 border-t border-slate-50 flex items-center justify-between font-semibold text-[11px]">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="text-slate-900">
                      {formatCurrency(child.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Monto Total Acreditado:</span>
              <span className="font-headline font-extrabold text-base text-blue-700">
                {formattedAmount} ARS
              </span>
            </div>
          </div>
        )}
      </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-2.5 border-t border-slate-200">
          <button
            type="button"
            data-testid="btn-close-voucher-bottom"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer border-none bg-transparent"
          >
            Cerrar
          </button>
          <button
            type="button"
            data-testid="btn-download-pdf-mock"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-all cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Descargar Comprobante / Recibo
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceVoucherModal;
