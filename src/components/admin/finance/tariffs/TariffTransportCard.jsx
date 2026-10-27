import React from 'react';
import TariffCardHeader from './TariffCardHeader';
import { formatCurrency } from '../../../../utils/financeUtils';

const TariffTransportCard = ({
  routes,
  onToggleRoute,
  onCreateRoute,
  onEditRoute,
  onDeleteRoute,
}) => {
  return (
    <div
      data-testid="tariff-transport-card"
      className="rounded-md bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-md"
    >
      <div>
        {/* Header Reutilizable con Botón Nueva Ruta */}
        <TariffCardHeader
          icon="directions_bus"
          category="Logística & Movilidad"
          title="Transporte Escolar (Rutas)"
          iconBgColor="bg-blue-50 border-blue-200/60 text-blue-700"
          categoryColor="text-blue-700"
          actions={
            <button
              type="button"
              id="btn-create-transport-route"
              data-testid="btn-create-transport-route"
              onClick={onCreateRoute}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                add
              </span>
              <span>Nueva Ruta</span>
            </button>
          }
        />

        <p className="text-xs text-slate-500 py-4 leading-relaxed">
          Recorridos puerta a puerta habilitados con choferes calificados y celadores auxiliares permanentes en cada unidad.
        </p>

        {/* Rutas List */}
        <div className="space-y-3">
          {routes.map((route) => (
            <div
              key={route.id}
              data-testid={`tariff-route-row-${route.id}`}
              className="p-3.5 rounded-md bg-slate-50 border border-slate-200/70 hover:bg-slate-100/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-md bg-white border border-slate-200 font-headline font-bold text-xs text-blue-700 flex items-center justify-center shadow-2xs shrink-0">
                  {route.code}
                </div>
                <div className="flex flex-col min-w-0 text-start">
                  <span className="font-headline font-bold text-sm text-slate-900 truncate">
                    {route.name}
                  </span>
                  <span className="text-[11px] text-slate-500 truncate">
                    {route.subtitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                {/* Switch Toggle Activo */}
                <div className="flex items-center gap-1.5">
                  <label
                    htmlFor={`toggle-route-${route.id}`}
                    className="relative inline-flex items-center cursor-pointer"
                    title="Habilitar / Deshabilitar Ruta"
                  >
                    <input
                      id={`toggle-route-${route.id}`}
                      data-testid={`toggle-route-${route.id}`}
                      type="checkbox"
                      aria-label={`Habilitar ${route.name}`}
                      checked={route.active}
                      onChange={() => onToggleRoute(route.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
                  </label>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      route.active ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {route.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Monto formateado */}
                <div className="flex items-baseline gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 shadow-2xs">
                  <span className="font-headline font-extrabold text-sm text-slate-900">
                    {formatCurrency(route.amount)}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    {route.unit || 'ARS/mes'}
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-slate-200">
                  <button
                    type="button"
                    id={`btn-edit-route-${route.id}`}
                    data-testid={`btn-edit-route-${route.id}`}
                    title="Modificar información de la ruta"
                    onClick={() => onEditRoute(route)}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-700 hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      edit_note
                    </span>
                  </button>
                  <button
                    type="button"
                    id={`btn-delete-route-${route.id}`}
                    data-testid={`btn-delete-route-${route.id}`}
                    title="Eliminar ruta"
                    onClick={() => onDeleteRoute(route.id)}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100">
        <span className="font-medium">
          {routes.length} Recorridos Habilitados para Traslados Escolares
        </span>
      </div>
    </div>
  );
};

export default TariffTransportCard;
