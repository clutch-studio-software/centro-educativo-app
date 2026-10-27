import React from 'react';
import TariffCardHeader from './TariffCardHeader';
import TariffItemAmountAction from './TariffItemAmountAction';

const TariffEducationalLevelsCard = ({
  levels,
  onEditItem,
}) => {
  return (
    <div
      data-testid="tariff-educational-levels-card"
      className="rounded-md bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md"
    >
      <div>
        {/* Header Reutilizable */}
        <TariffCardHeader
          icon="school"
          category="Aranceles Curriculares"
          title="Cuotas por Nivel Educativo"
          iconBgColor="bg-blue-50 border-blue-200/60 text-blue-700"
          categoryColor="text-blue-700"
        />

        <p className="text-xs text-slate-500 py-4 leading-relaxed">
          Base mensual regulada por 10 cuotas consecutivas (Marzo a Diciembre). Incluye seguro médico escolar, plataforma digital institucional y talleres integrados.
        </p>

        {/* Cuotas Form Fields */}
        <div className="space-y-3">
          {levels.map((level) => (
            <div
              key={level.id}
              data-testid={`tariff-level-row-${level.id}`}
              className="p-3.5 rounded-md bg-slate-50 border border-slate-200/70 hover:bg-slate-100/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-0.5 text-start">
                <div className="flex items-center gap-2">
                  <span className="font-headline font-bold text-sm text-slate-900">
                    {level.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${level.badgeColor}`}
                  >
                    {level.badge}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">{level.description}</span>
              </div>

              <TariffItemAmountAction
                amount={level.amount}
                unit={level.unit}
                testId={`tariff-level-${level.id}`}
                editTitle={`Editar monto de ${level.name}`}
                onEdit={() =>
                  onEditItem({
                    id: level.id,
                    name: level.name,
                    category: 'Aranceles Curriculares',
                    currentAmount: level.amount,
                    unit: level.unit,
                    type: 'academicLevels',
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer Card */}
      <div className="mt-6 flex items-center justify-between text-[11px] text-slate-500 font-medium pt-3 border-t border-slate-100">
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[15px] text-blue-700" aria-hidden="true">
            calendar_today
          </span>
          Fecha de vigencia parametrizada: <strong className="text-slate-800">01/03/2026</strong>
        </span>
        <span className="text-blue-700 font-bold">10 Cuotas Anuales</span>
      </div>
    </div>
  );
};

export default TariffEducationalLevelsCard;
