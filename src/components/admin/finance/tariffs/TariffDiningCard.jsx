import React from 'react';
import TariffCardHeader from './TariffCardHeader';
import TariffItemAmountAction from './TariffItemAmountAction';

const TariffDiningCard = ({ diningPlans, onEditItem }) => {
  return (
    <div
      data-testid="tariff-dining-card"
      className="rounded-md bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md"
    >
      <div>
        {/* Header Reutilizable */}
        <TariffCardHeader
          icon="restaurant"
          category="Nutrición & Bienestar"
          title="Servicio de Comedor Escolar"
          iconBgColor="bg-amber-50 border-amber-200/60 text-amber-700"
          categoryColor="text-amber-700"
        />

        <p className="text-xs text-slate-500 py-4 leading-relaxed">
          Planes diseñados por licenciados en nutrición con ingredientes agroecológicos de proveedores regionales certificados.
        </p>

        {/* Planes de Comedor */}
        <div className="space-y-3">
          {diningPlans.map((plan) => (
            <div
              key={plan.id}
              data-testid={`tariff-dining-row-${plan.id}`}
              className="p-3.5 rounded-md bg-slate-50 border border-slate-200/70 hover:bg-slate-100/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="text-start space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-headline font-bold text-sm text-slate-900">
                    {plan.name}
                  </span>
                </div>
                <span className="text-[11px] text-start text-slate-500">{plan.description}</span>
              </div>

              <TariffItemAmountAction
                amount={plan.amount}
                unit={plan.unit}
                testId={`tariff-dining-${plan.id}`}
                editTitle={`Editar tarifa de ${plan.name}`}
                onEdit={() =>
                  onEditItem({
                    id: plan.id,
                    name: plan.name,
                    category: 'Comedor Escolar',
                    currentAmount: plan.amount,
                    unit: plan.unit,
                    type: 'dining',
                  })
                }
              />
            </div>
          ))}

          {/* Menú Celíaco / Dietario Especial */}
          <div
            data-testid="tariff-dining-celiac-card"
            className="p-4 rounded-md bg-linear-to-r from-emerald-50/80 to-transparent border border-emerald-200/70 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                  health_and_safety
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-headline font-bold text-sm text-slate-900">
                    Menú Celíaco / Dietas Médicas
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Subvencionado 100% por política de inclusión escolar. Cocina aislada certificada.
                </span>
              </div>
            </div>
            <div className='flex items-center'>
              <span
                className="material-symbols-outlined text-emerald-600 text-[24px] shrink-0"
                aria-hidden="true"
              >
                eco
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white uppercase tracking-wider">
                Sin Costo Adicional
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TariffDiningCard;
