import React, { useState } from 'react';
import { validateUploadedFile } from '../../services/storageService.js';

const getFallbackOpCode = () => `TRF-${Date.now().toString().slice(-6)}`;

/**
 * Formulario para informar pago y adjuntar comprobante de transferencia bancaria
 */
const BillingVoucherUploadForm = ({
  grandTotal = 0,
  user,
  onUploadVoucher,
  isProcessing = false,
  uploadedReceiptSuccess = false,
  onSetSuccess,
}) => {
  const [voucherFile, setVoucherFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const defaultDate = new Date().toISOString().slice(0, 10);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setVoucherFile(null);
      setFileError('');
      return;
    }

    const validation = validateUploadedFile(file);
    if (!validation.valid) {
      setFileError(validation.error);
      setVoucherFile(null);
      e.target.value = '';
      return;
    }

    setFileError('');
    setVoucherFile(file);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (fileError) return;

    const formData = new FormData(e.currentTarget);
    const amountVal = formData.get('amount');
    const opCodeVal = formData.get('operationCode');
    const bankVal = formData.get('bank');
    const dateVal = formData.get('transferDate');
    const invoicePeriod = formData.get('invoicePeriod');

    const payload = {
      declaredAmount: Number(amountVal) || grandTotal,
      operationCode: (opCodeVal ? String(opCodeVal).trim() : '') || getFallbackOpCode(),
      originBank: String(bankVal || 'Banco Santander'),
      transferDate: String(dateVal || defaultDate),
      invoicePeriod: String(invoicePeriod || 'Noviembre 2026'),
      fileName: voucherFile ? voucherFile.name : 'comprobante-transferencia.pdf',
      fileSize: voucherFile ? `${Math.round(voucherFile.size / 1024)} KB` : '1.2 MB',
      file: voucherFile,
      tutorName: user?.nombreCompleto || user?.nombre || 'Tutor Titular',
      tutorDni: user?.dni || 'Sin DNI',
    };

    if (onUploadVoucher) {
      onUploadVoucher(payload);
    }
    if (onSetSuccess) {
      onSetSuccess(true);
    }
  };

  return (
    <form
      data-testid="form-upload-voucher"
      onSubmit={handleUploadSubmit}
      className="space-y-4 max-w-2xl text-xs"
    >
      {fileError && (
        <div
          data-testid="voucher-error-alert"
          className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-rose-600 text-base">error</span>
          <span>{fileError}</span>
        </div>
      )}

      {uploadedReceiptSuccess ? (
        <div
          data-testid="voucher-success-alert"
          className="p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1"
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            <span className="material-symbols-outlined text-base">verified</span>
            <span>¡Comprobante de transferencia enviado exitosamente!</span>
          </div>
          <p className="text-xs">
            El comprobante fue recibido correctamente y se encuentra en proceso de conciliación administrativa. Se notificará la emisión del recibo oficial una vez verificado.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="voucher-period-select"
            className="block font-bold text-slate-700 mb-1"
          >
            Factura / Período a Imputar <span className="text-rose-500">*</span>
          </label>
          <select
            id="voucher-period-select"
            name="invoicePeriod"
            data-testid="voucher-period-select"
            defaultValue="Noviembre 2026"
            className="w-full p-2.5 rounded-md border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-xs"
          >
            <option value="Noviembre 2026">Noviembre 2026 (Mes en curso)</option>
            <option value="Octubre 2026">Octubre 2026 (Liquidación pendiente)</option>
            <option value="Septiembre 2026">Septiembre 2026</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="voucher-amount-input"
            className="block font-bold text-slate-700 mb-1"
          >
            Monto Transferido ($ ARS) <span className="text-rose-500">*</span>
          </label>
          <input
            id="voucher-amount-input"
            name="amount"
            data-testid="voucher-amount-input"
            type="number"
            required
            defaultValue={grandTotal}
            placeholder="Ej. 148500"
            className="w-full p-2.5 rounded-md border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-xs"
          />
        </div>

        <div>
          <label
            htmlFor="voucher-operation-code"
            className="block font-bold text-slate-700 mb-1"
          >
            Nº de Operación / Transferencia <span className="text-rose-500">*</span>
          </label>
          <input
            id="voucher-operation-code"
            name="operationCode"
            data-testid="voucher-operation-code"
            type="text"
            required
            placeholder="Ej. 0049281203"
            className="w-full p-2.5 rounded-md border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-xs"
          />
        </div>

        <div>
          <label
            htmlFor="voucher-bank-select"
            className="block font-bold text-slate-700 mb-1"
          >
            Banco de Origen
          </label>
          <select
            id="voucher-bank-select"
            name="bank"
            data-testid="voucher-bank-select"
            defaultValue="Banco Santander"
            className="w-full p-2.5 rounded-md border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-xs"
          >
            <option value="Banco Santander">Banco Santander</option>
            <option value="Banco Galicia">Banco Galicia</option>
            <option value="Banco Macro">Banco Macro</option>
            <option value="Banco BBVA">Banco BBVA</option>
            <option value="Mercado Pago">Mercado Pago</option>
            <option value="Otro Banco / Billetera Virtual">Otro Banco / Billetera Virtual</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="voucher-date-input"
            className="block font-bold text-slate-700 mb-1"
          >
            Fecha de la Transferencia
          </label>
          <input
            id="voucher-date-input"
            name="transferDate"
            data-testid="voucher-date-input"
            type="date"
            defaultValue={defaultDate}
            className="w-full p-2.5 rounded-md border border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-xs"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="voucher-file-input"
          className="block font-bold text-slate-700 mb-1"
        >
          Adjuntar Comprobante Bancario (Máx. 2 MB - PDF, PNG, JPG o JPEG)
        </label>
        <input
          id="voucher-file-input"
          data-testid="voucher-file-input"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
        />
        {voucherFile && (
          <p className="mt-1 text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">attach_file</span>
            Archivo seleccionado: {voucherFile.name}
          </p>
        )}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          data-testid="btn-upload-voucher"
          disabled={isProcessing}
          className="px-5 py-2.5 rounded-md text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
        >
          {isProcessing ? 'Enviando comprobante...' : 'Enviar Comprobante de Transferencia'}
        </button>
      </div>
    </form>
  );
};

export default BillingVoucherUploadForm;
