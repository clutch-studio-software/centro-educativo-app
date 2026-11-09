import React from 'react';
import FinanceChildCard from './FinanceChildCard';
import { formatCurrency } from '../../../utils/financeUtils';
import {
  downloadVoucherFile,
  downloadInstitutionalReceiptPdf,
} from '../../../utils/financePdfGenerator';

const VoucherStatusBadge = ({ status }) => {
  if (status === 'Conciliado OK') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
        <span className="material-symbols-outlined text-[13px]">check_circle</span>
        Conciliado OK
      </span>
    );
  }
  if (status === 'Observado') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
        <span className="material-symbols-outlined text-[13px]">error</span>
        Observado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      Pendiente
    </span>
  );
};

const VoucherActionsBar = ({ voucher, receipt, onViewVoucher, onOpenValidate, onOpenReject }) => {
  const isConciliated = voucher.voucherStatus === 'Conciliado OK';

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
      {/* Botón Aceptar */}
      <button
        type="button"
        data-testid={`btn-accept-voucher-${voucher.id}`}
        disabled={isConciliated}
        title={isConciliated ? 'Comprobante ya conciliado' : 'Aceptar / Conciliar este comprobante'}
        onClick={() => onOpenValidate && onOpenValidate({ ...receipt, activeVoucher: voucher })}
        className={`inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer border-none ${
          isConciliated
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
        }`}
      >
        <span className="material-symbols-outlined text-[14px]">check_circle</span>
        <span>{isConciliated ? 'Aceptado' : 'Aceptar'}</span>
      </button>

      {/* Botón Visualizar */}
      <button
        type="button"
        data-testid={`btn-view-voucher-${voucher.id}`}
        title="Visualizar comprobante"
        onClick={() => onViewVoucher && onViewVoucher({ ...receipt, activeVoucher: voucher })}
        className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] transition-colors cursor-pointer border-none"
      >
        <span className="material-symbols-outlined text-[14px] text-blue-600">visibility</span>
        <span>Visualizar</span>
      </button>

      {/* Botón Descargar Original */}
      <button
        type="button"
        data-testid={`btn-download-voucher-${voucher.id}`}
        title="Descargar archivo original cargado por el tutor"
        onClick={() => downloadVoucherFile(voucher)}
        className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition-colors cursor-pointer border border-blue-200"
      >
        <span className="material-symbols-outlined text-[14px]">download</span>
        <span>Descargar</span>
      </button>

      {/* Botón Rechazar */}
      <button
        type="button"
        data-testid={`btn-reject-voucher-${voucher.id}`}
        title="Rechazar / Observar este comprobante"
        onClick={() => onOpenReject && onOpenReject({ ...receipt, activeVoucher: voucher })}
        className="inline-flex items-center gap-1 py-1 px-2.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-[11px] transition-colors cursor-pointer border border-red-200"
      >
        <span className="material-symbols-outlined text-[14px]">cancel</span>
        <span>Rechazar</span>
      </button>
    </div>
  );
};

const VoucherItemCard = ({ voucher, receipt, onViewVoucher, onOpenValidate, onOpenReject }) => {
  const amount = Number(voucher.amount || voucher.declaredAmount || voucher.transferredAmount || 0);

  return (
    <div
      data-testid={`voucher-card-${voucher.id}`}
      className="p-3.5 rounded-md bg-white border border-slate-200 shadow-xs space-y-2.5 text-xs text-start"
    >
      {/* File Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[17px]">attach_file</span>
          </div>
          <div className="min-w-0">
            <span
              className="font-bold text-slate-900 block truncate text-[11.5px]"
              title={voucher.attachmentName}
            >
              {voucher.attachmentName || 'Comprobante de pago'}
            </span>
            <span className="text-[10px] text-slate-500">
              {voucher.attachmentSize || 'Desconocido'} · {voucher.uploadDate || receipt.uploadDate}{' '}
              {voucher.uploadTime || ''}
            </span>
          </div>
        </div>
        <VoucherStatusBadge status={voucher.voucherStatus} />
      </div>

      {/* Meta Grid */}
      <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-50 rounded-md border border-slate-100 text-[11px]">
        <div>
          <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Banco / Origen</span>
          <span className="font-semibold text-slate-800 truncate block">
            {voucher.originBank || 'Banco'}
          </span>
        </div>
        <div>
          <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Nº Operación</span>
          <span className="font-mono text-slate-800 truncate block">
            {voucher.operationCode || 'S/N'}
          </span>
        </div>
        <div>
          <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Pagador</span>
          <span className="font-semibold text-slate-800 truncate block">
            {voucher.payerName || receipt.tutor}
          </span>
        </div>
        <div>
          <span className="text-[9.5px] uppercase font-bold text-slate-400 block">CUIL / DNI</span>
          <span className="font-mono text-slate-800 truncate block">
            {voucher.payerCuil || receipt.tutorDni}
          </span>
        </div>
      </div>

      {/* Conceptos Imputados en este comprobante */}
      {Array.isArray(voucher.selectedItemLabels) && voucher.selectedItemLabels.length > 0 && (
        <div className="space-y-1">
          <span className="text-[9.5px] uppercase font-bold text-slate-400 block">
            Conceptos imputados:
          </span>
          <div className="flex flex-wrap gap-1">
            {voucher.selectedItemLabels.map((label, lIdx) => (
              <span
                key={`${voucher.id}-label-${lIdx}`}
                className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-100"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Motivo de rechazo/observación si existe */}
      {voucher.rejectionReason && (
        <div className="p-2 rounded-md bg-red-50 border border-red-200 text-[10.5px] text-red-700">
          <strong>Observación:</strong> {voucher.rejectionReason}
        </div>
      )}

      {/* Importe del Comprobante */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] font-medium text-slate-500">Monto comprobante:</span>
        <span className="font-headline font-bold text-slate-900 text-xs">
          {formatCurrency(amount)} ARS
        </span>
      </div>

      {/* Barra de Acciones */}
      <VoucherActionsBar
        voucher={voucher}
        receipt={receipt}
        onViewVoucher={onViewVoucher}
        onOpenValidate={onOpenValidate}
        onOpenReject={onOpenReject}
      />
    </div>
  );
};

const FinanceVoucherEmptyNotice = ({ receiptId }) => (
  <div
    data-testid={`voucher-empty-state-${receiptId}`}
    className="rounded-md bg-white p-6 shadow-xs border border-dashed border-slate-200 flex flex-col items-center justify-center text-center h-full min-h-[220px] gap-3"
  >
    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
      <span className="material-symbols-outlined text-[26px]">upload_file</span>
    </div>
    <div className="space-y-1">
      <h4 className="text-xs font-bold text-slate-800">No se cargó un comprobante aún</h4>
      <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
        El tutor todavía no ha enviado el comprobante de transferencia bancaria correspondiente a este período.
      </p>
    </div>
    <div className="mt-1 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-100 text-[10px] text-slate-400 font-medium">
      A la espera de carga desde el perfil del tutor
    </div>
  </div>
);

const FinanceReceiptAccordionPanel = ({
  receipt,
  onViewVoucher,
  onOpenValidate,
  onOpenReject,
}) => {
  const vouchers = Array.isArray(receipt?.vouchers) && receipt.vouchers.length > 0
    ? receipt.vouchers
    : Array.isArray(receipt?.vouchersHistory) && receipt.vouchersHistory.length > 0
      ? receipt.vouchersHistory
      : receipt?.bankingVoucher
        ? [receipt.bankingVoucher]
        : [];

  const hasVouchers = vouchers.length > 0;
  const formattedDeclaredAmount = formatCurrency(receipt?.declaredAmount);
  const children = Array.isArray(receipt?.children) ? receipt.children : [];

  return (
    <tr
      id={`panel-${receipt.id}`}
      data-testid={`receipt-panel-${receipt.id}`}
      className="accordion-panel transition-all duration-300"
    >
      <td className="p-0 border-0" colSpan={6}>
        <div className="px-6 py-5 bg-slate-50/80 border-t border-b border-slate-200/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Desglose de Hijos Matriculados (Columna Izquierda: 6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-3">
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
                {children.length > 0 ? (
                  children.map((child) => {
                    const childKey =
                      child?.id || child?.legajo || `${receipt.id}-${child?.name || 'child'}`;
                    return <FinanceChildCard key={childKey} child={child} />;
                  })
                ) : (
                  <div className="p-4 rounded-md bg-white border border-slate-200/80 text-center text-slate-500 text-xs">
                    No hay desglose de alumnos asociado a este comprobante.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-500 text-[11px]">
                  Total sumatoria de comprobantes:
                </span>
                <span
                  data-testid={`panel-total-${receipt.id}`}
                  className="font-headline font-bold text-blue-700"
                >
                  {formattedDeclaredAmount} ARS
                </span>
              </div>
            </div>

            {/* Comprobantes Bancarios Adjuntos (Columna Derecha: 6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-headline font-bold text-xs text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <span
                    className={`material-symbols-outlined text-[17px] ${
                      hasVouchers ? 'text-emerald-600' : 'text-amber-500'
                    }`}
                  >
                    {hasVouchers ? 'receipt_long' : 'pending_actions'}
                  </span>
                  Comprobantes Bancarios ({vouchers.length})
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {vouchers.length === 1 ? '1 archivo adjuntado' : `${vouchers.length} archivos adjuntados`}
                </span>
              </div>

              {hasVouchers ? (
                <div className="space-y-3">
                  {vouchers.map((voucher) => (
                    <VoucherItemCard
                      key={voucher.id || voucher.operationCode || `${receipt.id}-${voucher.amount}`}
                      voucher={voucher}
                      receipt={receipt}
                      onViewVoucher={onViewVoucher}
                      onOpenValidate={onOpenValidate}
                      onOpenReject={onOpenReject}
                    />
                  ))}

                  {/* Botón para Descargar Recibo Oficial de la Institución */}
                  <div className="pt-2">
                    <button
                      type="button"
                      data-testid={`btn-download-institutional-receipt-${receipt.id}`}
                      onClick={() => downloadInstitutionalReceiptPdf(receipt)}
                      className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer border-none"
                    >
                      <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                      <span>Descargar Recibo Oficial de la Institución</span>
                    </button>
                  </div>
                </div>
              ) : (
                <FinanceVoucherEmptyNotice receiptId={receipt.id} />
              )}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export default FinanceReceiptAccordionPanel;
