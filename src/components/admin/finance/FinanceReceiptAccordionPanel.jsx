import React from 'react';
import FinanceChildCard from './FinanceChildCard';
import { formatCurrency } from '../../../utils/financeUtils';

const FinanceReceiptAccordionPanel = ({ receipt, onViewVoucher }) => {
  const formattedDeclaredAmount = formatCurrency(receipt.declaredAmount);

  const hasVoucher = Boolean(receipt.bankingVoucher && receipt.bankingVoucher.attachmentName);

  const voucherStatusColor =
    receipt.bankingVoucher?.voucherStatus === 'Conciliado OK'
      ? 'text-emerald-700'
      : receipt.bankingVoucher?.voucherStatus === 'Observado'
        ? 'text-red-700'
        : 'text-amber-700';

  const isFullPayment =
    receipt.bankingVoucher?.paymentType?.toLowerCase().includes('completo') ?? true;

  return (
    <tr
      id={`panel-${receipt.id}`}
      data-testid={`receipt-panel-${receipt.id}`}
      className="accordion-panel transition-all duration-300"
    >
      <td className="p-0 border-0" colSpan={6}>
        <div className="px-6 py-5 bg-slate-50/80 border-t border-b border-slate-200/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Desglose de Hijos Matriculados (Columna Izquierda: 7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-headline font-bold text-xs text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[17px] text-blue-600">
                    school
                  </span>
                  Hijos Matriculados &amp; Conceptos Imputados
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  Ciclo Lectivo 2026
                </span>
              </div>

              <div className="space-y-3">
                {receipt.children.map((child) => (
                  <FinanceChildCard key={child.id} child={child} />
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-500 text-[11px]">
                  Total declarado para el grupo familiar:
                </span>
                <span
                  data-testid={`panel-total-${receipt.id}`}
                  className="font-headline font-bold text-blue-700"
                >
                  {formattedDeclaredAmount} ARS
                </span>
              </div>
            </div>

            {/* Comprobante Bancario Adjunto (Columna Derecha: 5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-headline font-bold text-xs text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <span className={`material-symbols-outlined text-[17px] ${hasVoucher ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {hasVoucher ? 'receipt_long' : 'pending_actions'}
                  </span>
                  Comprobante Bancario Adjunto
                </span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${hasVoucher ? voucherStatusColor : 'text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full'}`}>
                  {hasVoucher && receipt.bankingVoucher.voucherStatus !== 'Conciliado OK' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  )}
                  {hasVoucher ? receipt.bankingVoucher.voucherStatus : 'Sin comprobante'}
                </span>
              </div>

              {hasVoucher ? (
                <div className="rounded-md bg-white p-4 shadow-xs border border-slate-200/80 flex flex-col justify-between h-full gap-4">
                <div className="space-y-3">
                  {/* Tarjeta de Archivo Adjunto */}
                  <div className="p-3 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[20px]">
                          attach_file
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span
                          data-testid={`voucher-filename-${receipt.id}`}
                          className="font-semibold text-xs text-slate-900 block truncate"
                          title={receipt.bankingVoucher.attachmentName}
                        >
                          {receipt.bankingVoucher.attachmentName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {receipt.bankingVoucher.attachmentSize} · Comprobante adjuntado
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                      Cargado
                    </span>
                  </div>

                  {/* Detalle de datos cargados por el tutor */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100 flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Pagador
                      </span>
                      <span
                        data-testid={`voucher-payer-${receipt.id}`}
                        className="font-semibold text-slate-800 text-[11px] truncate mt-0.5"
                      >
                        {receipt.bankingVoucher.payerName}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100 flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        CUIL del Pagador
                      </span>
                      <span
                        data-testid={`voucher-cuil-${receipt.id}`}
                        className="font-mono text-slate-800 text-[11px] font-semibold mt-0.5"
                      >
                        {receipt.bankingVoucher.payerCuil}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100 flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Fecha de Operación
                      </span>
                      <span
                        data-testid={`voucher-date-${receipt.id}`}
                        className="font-semibold text-slate-800 text-[11px] mt-0.5"
                      >
                        {receipt.bankingVoucher.operationDate}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100 flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Tipo de Pago
                      </span>
                      <span className="mt-0.5">
                        <span
                          data-testid={`voucher-payment-type-${receipt.id}`}
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isFullPayment
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {receipt.bankingVoucher.paymentType}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Monto transferido */}
                  <div className="p-2.5 rounded-md bg-slate-50 flex items-center justify-between border border-slate-100">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Monto abonado / declarado:
                    </span>
                    <span
                      data-testid={`voucher-amount-${receipt.id}`}
                      className="font-headline font-extrabold text-sm text-slate-900"
                    >
                      {formattedDeclaredAmount} ARS
                    </span>
                  </div>

                  {receipt.rejectionReason && (
                    <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-[11px] text-red-700">
                      <strong className="block font-semibold">Motivo de observación:</strong>
                      {receipt.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Botones de Acción sobre el Comprobante */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    data-testid={`btn-view-voucher-${receipt.id}`}
                    onClick={() => onViewVoucher(receipt)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] transition-colors cursor-pointer border-none"
                  >
                    <span className="material-symbols-outlined text-[15px] text-blue-600">
                      visibility
                    </span>
                    Ver Comprobante Completo
                  </button>
                  <button
                    type="button"
                    data-testid={`btn-download-voucher-${receipt.id}`}
                    onClick={() => onViewVoucher(receipt)}
                    className="inline-flex items-center justify-center gap-1 py-1.5 px-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition-colors cursor-pointer border-none"
                    title="Descargar archivo adjunto"
                  >
                    <span className="material-symbols-outlined text-[15px]">download</span>
                    Descargar
                  </button>
                </div>
              </div>
              ) : (
                <div
                  data-testid={`voucher-empty-state-${receipt.id}`}
                  className="rounded-md bg-white p-6 shadow-xs border border-dashed border-slate-200 flex flex-col items-center justify-center text-center h-full min-h-[220px] gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[26px]">
                      upload_file
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800">
                      No se cargó un comprobante aún
                    </h4>
                    <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                      El tutor todavía no ha enviado el comprobante de transferencia bancaria correspondiente a este período.
                    </p>
                  </div>
                  <div className="mt-1 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-100 text-[10px] text-slate-400 font-medium">
                    A la espera de carga desde el perfil del tutor
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default FinanceReceiptAccordionPanel;
