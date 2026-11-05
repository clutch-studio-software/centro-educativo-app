import React from 'react';
import {
  getTransportRouteOccupancy,
  SPRINTER_STANDARD_CAPACITY,
} from '../../utils/transportSubscriptionUtils.js';

/**
 * Catálogo dinámico de recorridos e inscripción con verificación de 15 plazas Sprinter
 */
const ParentTransportCatalogForm = ({
  routes = [],
  allStudents = [],
  selectedRouteId,
  setSelectedRouteId,
  isProcessing,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="route-selector"
          className="block text-xs font-bold uppercase tracking-wider text-slate-600"
        >
          Seleccionar recorrido de transporte escolar ({routes.length} disponibles):
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {routes.map((route) => {
            const occupancy = getTransportRouteOccupancy(
              route.id,
              allStudents,
              routes,
              SPRINTER_STANDARD_CAPACITY
            );
            const isSelected = selectedRouteId === route.id;
            const isFull = occupancy.estaLleno;

            return (
              <button
                key={route.id}
                type="button"
                data-testid={`transport-route-option-${route.id}`}
                disabled={isFull}
                onClick={() => setSelectedRouteId(route.id)}
                className={`p-3.5 rounded-lg border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                  isFull
                    ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                    : isSelected
                      ? 'bg-purple-50 border-purple-500 shadow-sm ring-2 ring-purple-300/30'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">
                      {route.nombre || route.id}
                    </span>
                    {isFull ? (
                      <span
                        data-testid={`route-full-badge-${route.id}`}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700"
                      >
                        Sin cupo (15/15)
                      </span>
                    ) : (
                      <span
                        data-testid={`route-vacancies-${route.id}`}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800"
                      >
                        {occupancy.disponibles} libres / 15 plazas
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 mt-1">{route.zona}</span>
                </div>

                <div className="pt-1 mt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span>Ida: {route.horarioIda} | Regreso: {route.horarioRegreso}</span>
                  <span className="font-semibold text-purple-700">Sprinter</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-slate-400 text-sm">info</span>
          Al inscribirse hoy, se registrará la fecha y se facturará solo el proporcional de los días restantes del mes.
        </span>
        <button
          type="submit"
          data-testid="btn-enroll-transport"
          disabled={isProcessing || !selectedRouteId}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer shadow-sm shrink-0"
        >
          {isProcessing ? 'Procesando...' : 'Inscribirme al Transporte'}
        </button>
      </div>
    </form>
  );
};

export default ParentTransportCatalogForm;
