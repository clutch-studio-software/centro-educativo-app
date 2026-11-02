import React, { useState, useEffect } from 'react';
import TariffCardHeader from './TariffCardHeader';
import TariffItemAmountAction from './TariffItemAmountAction';
import { subscribeToSportsActivities } from '../../../../services/sportsService';



const TariffSportsCard = ({ sportsPrices = {}, onEditItem }) => {
  const [firebaseSports, setFirebaseSports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribeToSportsActivities((list) => {
      if (isMounted) {
        setFirebaseSports(list || []);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return (
    <div
      data-testid="tariff-sports-card"
      className="rounded-md bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md"
    >
      <div>
        {/* Header Reutilizable */}
        <TariffCardHeader
          icon="sports_soccer"
          category="Talleres & Deportes"
          title="Actividades extracurriculares"
          iconBgColor="bg-emerald-50 border-emerald-200/60 text-emerald-700"
          categoryColor="text-emerald-700"
        />

        <p className="text-xs text-slate-500 py-4 leading-relaxed">
          Aranceles complementarios mensuales por práctica deportiva extracurriculares sincronizados directamente con el catálogo de deportes institucionales.
        </p>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-8 text-slate-400 gap-2 text-xs">
            <span className="material-symbols-outlined animate-spin text-[20px]" aria-hidden="true">
              progress_activity
            </span>
            <span>Cargando actividades desde Firebase...</span>
          </div>
        )}

        {/* Firebase Disciplines List */}
        {!isLoading && (
          <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
            {firebaseSports.map((sport) => {
              const currentAmount =
                sportsPrices[sport.id] ??
                sport.arancel ??
                sport.monto ??
                0;

              return (
                <div
                  key={sport.id}
                  data-testid={`tariff-sport-row-${sport.id}`}
                  className="p-3 rounded-md bg-slate-50 border border-slate-200/70 hover:bg-slate-100/60 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700 text-lg shrink-0">
                      {sport.emoji ? (
                        <span>{sport.emoji}</span>
                      ) : (
                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                          sports_soccer
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col min-w-0 text-start">
                      <span className="font-headline font-bold text-sm text-slate-900 truncate">
                        {sport.nombre}
                      </span>
                      <span
                        className={`text-[11px] font-medium flex items-center gap-1 ${
                          sport.activo !== false ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            sport.activo !== false ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        {sport.activo !== false ? 'Habilitado' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  <TariffItemAmountAction
                    amount={currentAmount}
                    unit="ARS/mes"
                    testId={`tariff-sport-${sport.id}`}
                    editTitle={`Editar arancel de ${sport.nombre}`}
                    onEdit={() =>
                      onEditItem({
                        id: sport.id,
                        name: sport.nombre,
                        category: 'Actividades Extracurriculares',
                        currentAmount,
                        unit: 'ARS/mes',
                        type: 'sports',
                      })
                    }
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TariffSportsCard;
