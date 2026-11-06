import React from 'react';

/**
 * Vista del período liquidado actual y desglose por hijo
 */
const BillingCurrentPeriodView = ({
  grandTotal = 0,
  linkedStudents = [],
  familyBreakdown = [],
  uploadedReceiptSuccess = false,
  arsFormatter,
}) => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Período Liquidado
          </span>
          <p className="text-base font-bold text-slate-800">Noviembre 2026</p>
          <p className="text-[11px] text-slate-500">Vencimiento ordinario: 10/11/2026</p>
        </div>

        <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Total a Transferir
          </span>
          <p className="text-xl font-black text-emerald-700">
            {arsFormatter.format(grandTotal)}
          </p>
          <p className="text-[11px] text-emerald-600">
            {linkedStudents.length} {linkedStudents.length === 1 ? 'hijo matriculado' : 'hijos matriculados'}
          </p>
        </div>

        <div className="p-4 rounded-md bg-amber-50 border border-amber-200 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
            Estado del Período
          </span>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-amber-600 text-base">
              {uploadedReceiptSuccess ? 'pending_actions' : 'schedule'}
            </span>
            <span
              data-testid="billing-current-month-status"
              className="font-bold text-amber-900 text-xs"
            >
              {uploadedReceiptSuccess
                ? 'Comprobante Enviado (En Revisión)'
                : 'Pendiente de Transferencia'}
            </span>
          </div>
          <p className="text-[11px] text-amber-700">
            {uploadedReceiptSuccess
              ? 'La administración verificará la acreditación bancaria.'
              : 'Cargue el comprobante para conciliar su pago.'}
          </p>
        </div>
      </div>

      {/* Desglose por Hijo */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Desglose detallado de aranceles por alumno:
        </h4>

        <div className="space-y-3">
          {familyBreakdown.map(({ child, items, total }) => {
            const childName =
              child.nombreCompleto || `${child.nombre || ''} ${child.apellido || ''}`.trim() || 'Estudiante';

            return (
              <div
                key={child.id}
                data-testid={`billing-child-breakdown-${child.id}`}
                className="p-4 rounded-md border border-slate-200 bg-white space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-md bg-orange-50 text-orange-700 font-bold text-xs flex items-center justify-center">
                      {child.initials || childName.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{childName}</p>
                      <p className="text-[11px] text-slate-500">
                        {child.curso || 'Primaria'} · Legajo {child.legajo || child.id}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    Subtotal: {arsFormatter.format(total)}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 text-xs text-slate-600">
                  {items.map((fee) => (
                    <div
                      key={fee.id}
                      className="py-1.5 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <span>{fee.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {fee.tag}
                        </span>
                      </span>
                      <span className="font-semibold text-slate-800">
                        {arsFormatter.format(fee.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Datos Bancarios Oficiales */}
      <div className="p-4 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <span className="material-symbols-outlined text-emerald-600 text-base">
            account_balance
          </span>
          <span>Datos Bancarios Oficiales para Transferencias Institucionales:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
          <div>
            <span className="text-slate-400 block">Banco:</span>
            <strong className="text-slate-800">Banco Santander Río</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Titular:</span>
            <strong className="text-slate-800">Centro Educativo Integral SRL</strong>
          </div>
          <div>
            <span className="text-slate-400 block">CBU:</span>
            <strong className="font-mono text-slate-800">0720026720000001289412</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Alias:</span>
            <strong className="text-emerald-700 font-bold">COLEGIO.CENTRO.PAGOS</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingCurrentPeriodView;
