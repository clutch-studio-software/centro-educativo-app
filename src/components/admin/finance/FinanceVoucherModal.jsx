import React, { useEffect, useRef } from 'react';
import { formatCurrency } from '../../../utils/financeUtils';
import {
  downloadVoucherFile,
  downloadInstitutionalReceiptPdf,
} from '../../../utils/financePdfGenerator';

const VoucherMissingCard = ({ tutor, familyCode }) => (
  <div
    data-testid="voucher-missing-card"
    className="p-8 rounded-md bg-slate-50 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center gap-3"
  >
    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
      <span className="material-symbols-outlined text-[26px]">upload_file</span>
    </div>
    <h4 className="text-sm font-bold text-slate-800">No se cargó un comprobante aún</h4>
    <p className="text-xs text-slate-500 max-w-sm">
      El tutor todavía no ha enviado el comprobante de transferencia bancaria correspondiente a este período.
    </p>
    <div className="mt-2 text-[11px] text-slate-400">
      Tutor: <strong className="text-slate-700">{tutor}</strong> · {familyCode}
    </div>
  </div>
);

const VoucherModalHeader = ({ receipt, onClose }) => {
  const isApproved = receipt.status === 'aprobado';
  const title = isApproved
    ? `Recibo Oficial ${receipt.receiptNumber || ''}`
    : 'Detalle de Comprobante de Pago';

  return (
    <div className="px-6 py-4 bg-slate-50 flex items-center justify-between border-b border-slate-200">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">
            {isApproved ? 'verified' : 'receipt_long'}
          </span>
        </div>
        <div className="text-start">
          <h3 id="finance-voucher-modal-title" className="font-headline font-bold text-sm text-slate-900">
            {title}
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
  );
};

const VoucherMetaGrid = ({ voucher, receipt }) => (
  <div className="grid grid-cols-2 gap-2 p-3 bg-white rounded-md border border-slate-100 text-start">
    <div>
      <span className="text-[10px] uppercase font-bold text-slate-400 block">Nombre del Pagador</span>
      <span className="font-semibold text-slate-800 text-xs block mt-0.5">
        {voucher.payerName || receipt.tutor}
      </span>
      <span className="text-[10px] text-slate-500">Tutor: {receipt.tutor}</span>
    </div>
    <div>
      <span className="text-[10px] uppercase font-bold text-slate-400 block">CUIL / DNI</span>
      <span className="font-mono text-slate-800 text-xs font-semibold block mt-0.5">
        {voucher.payerCuil || receipt.tutorDni}
      </span>
      <span className="text-[10px] text-slate-500">Familia: {receipt.familyCode}</span>
    </div>
    <div>
      <span className="text-[10px] uppercase font-bold text-slate-400 block">Banco de Origen</span>
      <span className="font-semibold text-slate-800 text-xs block mt-0.5">
        {voucher.originBank || 'Banco'}
      </span>
      <span className="font-mono text-[10px] text-slate-500">
        Nº {voucher.operationCode || 'S/N'}
      </span>
    </div>
    <div>
      <span className="text-[10px] uppercase font-bold text-slate-400 block">Estado de Conciliación</span>
      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
        {voucher.voucherStatus || receipt.status}
      </span>
    </div>
  </div>
);

const VoucherAttachmentBox = ({ voucher }) => {
  const hasFile = Boolean(voucher.downloadUrl || voucher.fileUrl);

  return (
    <div className="p-3 bg-white rounded-md border border-slate-100 flex items-center justify-between text-start gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="material-symbols-outlined text-blue-600 text-[20px]">picture_as_pdf</span>
        <div className="min-w-0">
          <span className="font-semibold text-slate-800 text-xs block truncate" title={voucher.attachmentName}>
            {voucher.attachmentName || 'comprobante_bancario.pdf'}
          </span>
          <span className="text-[10px] text-slate-400">
            {voucher.attachmentSize || 'Desconocido'} · Archivo adjunto
          </span>
        </div>
      </div>
      {hasFile && (
        <button
          type="button"
          data-testid="btn-download-original-voucher"
          onClick={() => downloadVoucherFile(voucher)}
          title="Descargar el archivo original del comprobante"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold transition-colors cursor-pointer border border-blue-200 shrink-0"
        >
          <span className="material-symbols-outlined text-[14px]">download</span>
          <span>Descargar archivo</span>
        </button>
      )}
    </div>
  );
};

const VoucherConceptsSection = ({ voucher, children }) => {
  const hasLabels = Array.isArray(voucher.selectedItemLabels) && voucher.selectedItemLabels.length > 0;

  if (hasLabels) {
    return (
      <div className="space-y-1.5 text-start">
        <span className="text-[10px] uppercase font-bold text-slate-400">Conceptos Imputados</span>
        <div className="p-2.5 rounded-md bg-white border border-slate-100 flex flex-wrap gap-1">
          {voucher.selectedItemLabels.map((lbl) => (
            <span
              key={`modal-lbl-${voucher.id || 'v'}-${lbl}`}
              className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10.5px] font-medium"
            >
              {lbl}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 text-start">
      <span className="text-[10px] uppercase font-bold text-slate-400">Conceptos Imputados</span>
      {children.map((child) => (
        <div
          key={`child-row-${child.id || child.legajo || child.name}`}
          className="p-2.5 rounded-md bg-white border border-slate-100 space-y-1 text-start"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">{child.name}</span>
            <span className="font-mono text-[10px] text-slate-500">{child.legajo}</span>
          </div>
          <div className="text-[11px] text-slate-600">{child.academicInfo}</div>
          <div className="pt-1 border-t border-slate-50 flex items-center justify-between font-semibold text-[11px]">
            <span className="text-slate-500">Subtotal:</span>
            <span className="text-slate-900">{formatCurrency(child.totalAmount)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const VoucherReceiptCard = ({ voucher, receipt, formattedAmount, children }) => (
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
        <span className="text-[10px] text-slate-400">
          {voucher.operationDate || receipt.uploadDate}
        </span>
      </div>
    </div>

    <VoucherMetaGrid voucher={voucher} receipt={receipt} />
    <VoucherAttachmentBox voucher={voucher} />
    <VoucherConceptsSection voucher={voucher} children={children} />

    {/* Total */}
    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
      <span className="text-xs font-bold text-slate-700">Monto Acreditado:</span>
      <span className="font-headline font-extrabold text-base text-blue-700">
        {formattedAmount} ARS
      </span>
    </div>
  </div>
);

const VoucherModalFooter = ({ receipt, voucher, onClose }) => (
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
      onClick={() => downloadInstitutionalReceiptPdf(receipt, voucher)}
      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-all cursor-pointer border-none"
    >
      <span className="material-symbols-outlined text-[16px]">receipt_long</span>
      Descargar Recibo Oficial de la Institución
    </button>
  </div>
);

const FinanceVoucherModal = ({ receipt, onClose }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (receipt) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [receipt]);

  if (!receipt) return null;

  const voucher =
    receipt.activeVoucher ||
    receipt.bankingVoucher ||
    (Array.isArray(receipt.vouchers) && receipt.vouchers.length > 0 ? receipt.vouchers[0] : null);

  const voucherAmount = Number(
    voucher?.amount || voucher?.declaredAmount || voucher?.transferredAmount || receipt.declaredAmount || 0
  );
  const formattedAmount = formatCurrency(voucherAmount);
  const children = Array.isArray(receipt.children) ? receipt.children : [];

  return (
    <dialog
      ref={dialogRef}
      id="finance-voucher-modal"
      data-testid="voucher-preview-modal"
      aria-labelledby="finance-voucher-modal-title"
      onClose={onClose}
      className="m-auto rounded-md bg-transparent p-4 backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm max-w-lg w-full outline-hidden"
    >
      <div className="w-full rounded-md bg-white shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-slate-200 max-h-[90vh]">
        <VoucherModalHeader receipt={receipt} onClose={onClose} />

        <div className="p-6 overflow-y-auto space-y-4">
          {!voucher ? (
            <VoucherMissingCard tutor={receipt.tutor} familyCode={receipt.familyCode} />
          ) : (
            <VoucherReceiptCard
              voucher={voucher}
              receipt={receipt}
              formattedAmount={formattedAmount}
              children={children}
            />
          )}
        </div>

        <VoucherModalFooter receipt={receipt} voucher={voucher} onClose={onClose} />
      </div>
    </dialog>
  );
};

export default FinanceVoucherModal;
