import React from 'react';

/**
 * Listado de recibos oficiales y facturas históricas abonadas
 */
const BillingHistoricalReceiptsView = ({
  invoices = [],
  arsFormatter,
}) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
        Recibos oficiales y facturas abonadas anteriormente:
      </h4>

      <div className="space-y-3">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            data-testid={`invoice-past-row-${inv.id}`}
            className="p-4 rounded-md border border-slate-200 bg-white hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">{inv.period}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold border border-slate-200">
                  {inv.receiptNumber}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ✓ Pagado y Aprobado
                </span>
              </div>
              <p className="text-slate-500">
                Abonado el {inv.date} mediante {inv.paymentMethod}
              </p>
              <p className="text-[11px] text-slate-600">
                Conceptos incluidos: {inv.items.join(' · ')}
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
              <span className="font-black text-slate-800 text-sm">
                {arsFormatter.format(inv.amount)}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                Recibo Oficial emitido
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillingHistoricalReceiptsView;
