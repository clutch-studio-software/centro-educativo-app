import { formatCurrency } from './financeUtils';

/**
 * Descarga el archivo adjunto original cargado por el tutor en Firebase Storage.
 */
export const downloadVoucherFile = async (voucher) => {
  if (!voucher) return;
  const fileUrl = voucher.downloadUrl || voucher.fileUrl;
  const fileName = voucher.attachmentName || 'comprobante_transferencia.pdf';

  if (!fileUrl) {
    if (typeof window !== 'undefined') {
      window.alert('El comprobante no tiene una URL de archivo adjunto asociada.');
    }
    return;
  }

  try {
    const response = await fetch(fileUrl, { mode: 'cors' });
    if (!response.ok) throw new Error('Respuesta no satisfactoria');
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch {
    // Si la descarga directa es bloqueada por CORS en el navegador, abrir la URL en una nueva pestaña
    if (typeof window !== 'undefined') {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  }
};

/**
 * Genera y descarga / imprime el Comprobante Oficial de Pago de la Institución
 * para el tutor y grupo familiar correspondiente.
 */
export const downloadInstitutionalReceiptPdf = (receipt, specificVoucher = null) => {
  if (!receipt) return;

  const receiptNumber =
    receipt.receiptNumber ||
    `#REC-2026-${String(receipt.id || '0000').slice(-4).toUpperCase()}`;

  const issueDate =
    receipt.uploadDate && receipt.uploadDate !== 'Sin comprobante'
      ? receipt.uploadDate
      : new Date().toLocaleDateString('es-AR');

  const children = Array.isArray(receipt.children) ? receipt.children : [];
  const vouchers = specificVoucher
    ? [specificVoucher]
    : Array.isArray(receipt.vouchers) && receipt.vouchers.length > 0
      ? receipt.vouchers
      : Array.isArray(receipt.vouchersHistory) && receipt.vouchersHistory.length > 0
        ? receipt.vouchersHistory
        : receipt.bankingVoucher
          ? [receipt.bankingVoucher]
          : [];

  const rawTotal = specificVoucher
    ? Number(
        specificVoucher.declaredAmount ??
        specificVoucher.transferredAmount ??
        specificVoucher.amount
      ) || receipt.declaredAmount
    : receipt.declaredAmount;

  const totalAmount = formatCurrency(rawTotal);

  const childrenRows = children
    .map(
      (c) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; font-weight: 600; color: #1e293b;">
          ${c.name || 'Alumno'}
          <div style="font-size: 11px; color: #64748b; font-weight: 400;">
            ${c.academicInfo || ''} ${c.legajo ? '· Legajo: ' + c.legajo : ''}
          </div>
        </td>
        <td style="padding: 10px 12px; color: #475569; font-size: 12px;">
          ${
            Array.isArray(c.feeBreakdown)
              ? c.feeBreakdown.map((f) => f.label || 'Concepto arancelario').join('<br/>')
              : 'Cuota Curricular'
          }
        </td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #0f172a; white-space: nowrap;">
          ${formatCurrency(c.totalAmount || 0)}
        </td>
      </tr>
    `
    )
    .join('');

  const vouchersRows = vouchers
    .map(
      (v, idx) => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11.5px;">
        <td style="padding: 8px 12px; color: #334155;">#${idx + 1} · ${v.originBank || 'Transferencia Bancaria'}</td>
        <td style="padding: 8px 12px; font-family: monospace; color: #0284c7;">${v.operationCode || 'S/N'}</td>
        <td style="padding: 8px 12px; color: #64748b;">${v.operationDate || issueDate}</td>
        <td style="padding: 8px 12px; color: #475569;">
          ${
            Array.isArray(v.selectedItemLabels) && v.selectedItemLabels.length > 0
              ? v.selectedItemLabels.join(', ')
              : v.paymentType || 'Pago de aranceles escolares'
          }
        </td>
        <td style="padding: 8px 12px; text-align: right; font-weight: 600; color: #0f172a; white-space: nowrap;">
          ${formatCurrency(v.declaredAmount || v.transferredAmount || 0)}
        </td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="utf-8" />
      <title>Recibo Oficial ${receiptNumber} - Instituto Educar para Transformar</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background: #f8fafc;
          color: #0f172a;
          padding: 30px 20px;
        }
        .container {
          max-width: 780px;
          margin: 0 auto;
          background: #ffffff;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          border: 1px solid #e2e8f0;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0284c7;
          padding-bottom: 20px;
          margin-bottom: 25px;
        }
        .school-info h1 {
          font-size: 20px;
          font-weight: 800;
          color: #0369a1;
          letter-spacing: -0.5px;
          margin-bottom: 4px;
        }
        .school-info p {
          font-size: 11px;
          color: #64748b;
          line-height: 1.4;
        }
        .receipt-badge {
          text-align: right;
        }
        .receipt-badge .title {
          font-size: 14px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #0f172a;
        }
        .receipt-badge .number {
          font-size: 16px;
          font-weight: 800;
          font-family: monospace;
          color: #0284c7;
          margin: 4px 0;
        }
        .receipt-badge .date {
          font-size: 11px;
          color: #64748b;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          background: #f8fafc;
          padding: 16px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          margin-bottom: 25px;
          font-size: 12px;
        }
        .meta-grid strong {
          color: #475569;
          font-size: 10px;
          text-transform: uppercase;
          display: block;
          margin-bottom: 2px;
        }
        .section-title {
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #334155;
          margin-bottom: 10px;
          border-left: 3px solid #0284c7;
          padding-left: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
          font-size: 12px;
        }
        th {
          background: #f1f5f9;
          text-align: left;
          padding: 8px 12px;
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          border-bottom: 1px solid #cbd5e1;
        }
        .total-box {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 6px;
          margin-bottom: 30px;
        }
        .total-box .label {
          font-size: 13px;
          font-weight: 700;
          color: #166534;
        }
        .total-box .amount {
          font-size: 22px;
          font-weight: 900;
          color: #15803d;
        }
        .footer-signatures {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }
        .seal-box {
          font-size: 10.5px;
          color: #64748b;
          line-height: 1.4;
          max-width: 420px;
        }
        .signature-box {
          text-align: center;
          min-width: 200px;
        }
        .signature-line {
          border-top: 1px dashed #94a3b8;
          margin-bottom: 6px;
        }
        .signature-title {
          font-size: 11px;
          font-weight: 700;
          color: #334155;
        }
        .signature-sub {
          font-size: 10px;
          color: #64748b;
        }
        .no-print {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 25px;
        }
        .btn-print {
          background: #0284c7;
          color: white;
          border: none;
          padding: 10px 22px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(2,132,199,0.3);
        }
        .btn-print:hover { background: #0369a1; }
        @media print {
          body { background: white; padding: 0; }
          .container { box-shadow: none; border: none; padding: 0; max-width: 100%; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Encabezado Institucional -->
        <div class="header">
          <div class="school-info">
            <h1>Instituto Educar para Transformar</h1>
            <p>Asociación Civil sin Fines de Lucro · CUIT 30-71239841-9</p>
            <p>Dirección General de Educación Pública y Gestión Privada</p>
            <p>Av. San Martín 1234, Ciudad Autónoma de Buenos Aires</p>
          </div>
          <div class="receipt-badge">
            <div class="title">Recibo Oficial de Pago</div>
            <div class="number">${receiptNumber}</div>
            <div class="date">Fecha de Emisión: <strong>${issueDate}</strong></div>
            <div class="date">Período: <strong>${receipt.month || 'Ciclo 2026'}</strong></div>
          </div>
        </div>

        <!-- Metadatos de la Familia / Tutor -->
        <div class="meta-grid">
          <div>
            <strong>Tutor Titular / Responsable Financiero</strong>
            <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${receipt.tutor || 'Tutor Familiar'}</span>
            <div style="color: #64748b; margin-top: 2px;">DNI: ${receipt.tutorDni || 'S/D'} · Código: ${receipt.familyCode || 'FAM-0000'}</div>
          </div>
          <div>
            <strong>Estado de Imputación Administrativa</strong>
            <span style="display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 800; background: #dcfce7; color: #166534; text-transform: uppercase;">
              ${receipt.status === 'aprobado' ? 'Acreditado y Conciliado' : 'Acreditado en Cuenta'}
            </span>
            <div style="color: #64748b; margin-top: 4px;">Validez Oficial para comprobación familiar</div>
          </div>
        </div>

        <!-- Conceptos y Hijos Imputados -->
        <div class="section-title">Desglose de Alumnos y Aranceles Imputados</div>
        <table>
          <thead>
            <tr>
              <th style="width: 40%;">Alumno Matriculado</th>
              <th style="width: 40%;">Conceptos Detallados</th>
              <th style="width: 20%; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${childrenRows || '<tr><td colspan="3" style="padding: 12px; text-align: center; color: #64748b;">Sin desglose de alumnos</td></tr>'}
          </tbody>
        </table>

        <!-- Comprobantes Bancarios -->
        ${
          vouchers.length > 0
            ? `
          <div class="section-title">Comprobantes de Transferencia Bancaria Registrados</div>
          <table>
            <thead>
              <tr>
                <th style="width: 25%;">Entidad / Canal</th>
                <th style="width: 20%;">Código Operación</th>
                <th style="width: 15%;">Fecha</th>
                <th style="width: 25%;">Conceptos Declarados</th>
                <th style="width: 15%; text-align: right;">Importe</th>
              </tr>
            </thead>
            <tbody>
              ${vouchersRows}
            </tbody>
          </table>
        `
            : ''
        }

        <!-- Total de la Operación -->
        <div class="total-box">
          <div class="label">Monto Total Oficial Acreditado:</div>
          <div class="amount">${totalAmount} ARS</div>
        </div>

        <!-- Pie Institucional con Sello y Firma -->
        <div class="footer-signatures">
          <div class="seal-box">
            <strong style="color: #0f172a; display: block; margin-bottom: 3px;">Constancia Oficial de Pago</strong>
            El presente comprobante certifica la cancelación efectiva de las obligaciones arancelarias escolares detalladas para el ciclo lectivo y período consignado. Documento emitido electrónicamente por el Sistema Integrado de Tesorería Escolar.
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-title">Tesorería &amp; Administración</div>
            <div class="signature-sub">Instituto Educar para Transformar</div>
          </div>
        </div>

        <!-- Botones de Acción (ocultos al imprimir) -->
        <div class="no-print">
          <button class="btn-print" onclick="window.print()">
            🖨️ Imprimir / Guardar como PDF
          </button>
        </div>
      </div>

      <script>
        window.addEventListener('load', () => {
          setTimeout(() => {
            window.print();
          }, 350);
        });
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=840,height=900,scrollbars=yes');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};
