import React, { useState } from 'react';
import PortalSectionHeader from './PortalSectionHeader.jsx';
import BillingCurrentPeriodView from './BillingCurrentPeriodView.jsx';
import BillingVoucherUploadForm from './BillingVoucherUploadForm.jsx';
import BillingHistoricalReceiptsView from './BillingHistoricalReceiptsView.jsx';

const ARS_FORMATTER = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

const DEFAULT_LEVEL_FEES = {
  jardin: 95000,
  primaria: 125000,
  secundaria: 145000,
};

const TRANSPORT_MONTHLY_FEE = 38000;
const DINING_MONTHLY_FEE = 42000;
const SPORT_MONTHLY_FEE = 18000;

const calculateStudentMonthlyFees = (student) => {
  if (!student) return { items: [], total: 0 };

  const curso = String(student.curso || '').toLowerCase();
  let baseFee = DEFAULT_LEVEL_FEES.primaria;
  let levelTag = 'Nivel Primario';

  if (curso.includes('sala') || curso.includes('jardin') || curso.includes('inicial')) {
    baseFee = DEFAULT_LEVEL_FEES.jardin;
    levelTag = 'Nivel Inicial';
  } else if (curso.includes('año') || curso.includes('secundaria') || curso.includes('polimodal')) {
    baseFee = DEFAULT_LEVEL_FEES.secundaria;
    levelTag = 'Nivel Secundario';
  }

  const items = [
    {
      id: 'tuition',
      label: `Cuota Escolar Ordinaria (${levelTag})`,
      amount: baseFee,
      tag: 'Enseñanza Oficial',
    },
  ];

  const servicios = Array.isArray(student.servicios) ? student.servicios : [];
  const hasTransport =
    Boolean(student.recorridoTransporte) ||
    servicios.some((s) => String(s).toLowerCase().includes('transporte'));

  if (hasTransport) {
    items.push({
      id: 'transport',
      label: `Transporte Escolar (${student.recorridoTransporte || 'Recorrido Asignado'})`,
      amount: TRANSPORT_MONTHLY_FEE,
      tag: 'Transporte',
    });
  }

  const hasDining =
    Boolean(student.comedor) ||
    servicios.some((s) => String(s).toLowerCase().includes('comedor'));

  if (hasDining) {
    items.push({
      id: 'dining',
      label: 'Servicio de Comedor Escolar y Almuerzo Nutricional',
      amount: DINING_MONTHLY_FEE,
      tag: 'Comedor',
    });
  }

  const deportes = Array.isArray(student.deportes) ? student.deportes : [];
  if (deportes.length > 0) {
    deportes.forEach((dep, idx) => {
      const depName = typeof dep === 'string' ? dep : dep.nombre || `Taller ${idx + 1}`;
      items.push({
        id: `sport-${idx}`,
        label: `Taller Deportivo: ${depName}`,
        amount: SPORT_MONTHLY_FEE,
        tag: 'Deportes',
      });
    });
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return { items, total };
};

const PAST_INVOICES = [
  {
    id: 'inv-oct-2026',
    period: 'Octubre 2026',
    receiptNumber: 'REC-2026-10-0941',
    amount: 148500,
    date: '08/10/2026',
    status: 'pagado',
    paymentMethod: 'Transferencia Bancaria (Santander)',
    items: ['Cuota Octubre', 'Comedor Escolar', 'Taller Deportivo'],
  },
  {
    id: 'inv-sep-2026',
    period: 'Septiembre 2026',
    receiptNumber: 'REC-2026-09-0812',
    amount: 148500,
    date: '05/09/2026',
    status: 'pagado',
    paymentMethod: 'Transferencia Bancaria (Santander)',
    items: ['Cuota Septiembre', 'Comedor Escolar', 'Taller Deportivo'],
  },
  {
    id: 'inv-ago-2026',
    period: 'Agosto 2026',
    receiptNumber: 'REC-2026-08-0744',
    amount: 125000,
    date: '06/08/2026',
    status: 'pagado',
    paymentMethod: 'Transferencia Bancaria (Santander)',
    items: ['Cuota Agosto', 'Comedor Escolar'],
  },
];

const EMPTY_LINKED_STUDENTS = [];

/**
 * Panel de Facturación y Comprobantes de Pago del Tutor
 */
const ParentBillingPanel = ({
  linkedStudents = EMPTY_LINKED_STUDENTS,
  user,
  onUploadVoucher,
  isProcessing = false,
}) => {
  const [activeTab, setActiveTab] = useState('current'); // 'current' | 'history' | 'upload'
  const [uploadedReceiptSuccess, setUploadedReceiptSuccess] = useState(false);

  // Calcular totales consolidados familiares para el mes en curso
  const familyBreakdown = linkedStudents.map((child) => ({
    child,
    ...calculateStudentMonthlyFees(child),
  }));

  const grandTotal = familyBreakdown.reduce((acc, curr) => acc + curr.total, 0);

  // Combinar comprobantes reales asociados a los alumnos con los recibos históricos
  const studentVouchers = linkedStudents.flatMap((ch) =>
    Array.isArray(ch.comprobantesPago) ? ch.comprobantesPago : []
  );
  const uniqueVoucherPeriods = new Map();
  studentVouchers.forEach((v) => {
    const key = v.invoicePeriod || v.id;
    if (key && !uniqueVoucherPeriods.has(key)) {
      uniqueVoucherPeriods.set(key, {
        id: v.id || `v-${key}`,
        period: v.invoicePeriod || 'Noviembre 2026',
        receiptNumber: v.operationCode ? `OP-${v.operationCode}` : 'EN REVISIÓN',
        amount: Number(v.declaredAmount) || grandTotal,
        date: v.uploadDate || 'Reciente',
        status: v.status || 'pendiente',
        paymentMethod: `Transferencia Bancaria (${v.originBank || 'Banco'})`,
        items: ['Cuota Escolar', 'Servicios Contratados'],
        fileUrl: v.fileUrl || '',
        fileName: v.fileName || '',
      });
    }
  });
  const combinedInvoices = [
    ...Array.from(uniqueVoucherPeriods.values()),
    ...PAST_INVOICES.filter((p) => !uniqueVoucherPeriods.has(p.period)),
  ];

  return (
    <div
      data-testid="parent-billing-panel"
      className="bg-white rounded-md border border-slate-200 p-5 md:p-6 space-y-6 shadow-sm text-left"
    >
      <PortalSectionHeader
        icon="receipt_long"
        iconBgClass="bg-emerald-50"
        iconColorClass="text-emerald-600"
        title="Panel de Facturación y Aranceles Escolares"
        subtitle="Supervisión de aranceles mensuales, historial de recibos oficiales y carga de comprobantes"
        statusBadge={
          <span
            data-testid="billing-grand-total-badge"
            className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200"
          >
            Total del Mes: {ARS_FORMATTER.format(grandTotal)}
          </span>
        }
      />

      {/* Navegación Interna */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          type="button"
          data-testid="billing-tab-current"
          onClick={() => setActiveTab('current')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'current'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-base">calendar_month</span>
          <span>Mes en Curso (Noviembre 2026)</span>
        </button>

        <button
          type="button"
          data-testid="billing-tab-upload"
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'upload'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-base">upload_file</span>
          <span>Informar Pago / Transferencia</span>
        </button>

        <button
          type="button"
          data-testid="billing-tab-history"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-colors border-b-2 cursor-pointer ${
            activeTab === 'history'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="material-symbols-outlined text-base">history</span>
          <span>Historial de Recibos Anteriores</span>
        </button>
      </div>

      {/* PESTAÑA 1: MES EN CURSO */}
      {activeTab === 'current' && (
        <BillingCurrentPeriodView
          grandTotal={grandTotal}
          linkedStudents={linkedStudents}
          familyBreakdown={familyBreakdown}
          uploadedReceiptSuccess={uploadedReceiptSuccess}
          arsFormatter={ARS_FORMATTER}
        />
      )}

      {/* PESTAÑA 2: CARGAR COMPROBANTE DE TRANSFERENCIA */}
      {activeTab === 'upload' && (
        <BillingVoucherUploadForm
          grandTotal={grandTotal}
          user={user}
          onUploadVoucher={onUploadVoucher}
          isProcessing={isProcessing}
          uploadedReceiptSuccess={uploadedReceiptSuccess}
          onSetSuccess={setUploadedReceiptSuccess}
        />
      )}

      {/* PESTAÑA 3: HISTORIAL DE RECIBOS ANTERIORES */}
      {activeTab === 'history' && (
        <BillingHistoricalReceiptsView
          invoices={combinedInvoices}
          arsFormatter={ARS_FORMATTER}
        />
      )}
    </div>
  );
};

export default ParentBillingPanel;
