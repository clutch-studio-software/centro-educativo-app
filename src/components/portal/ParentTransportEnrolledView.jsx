import React from 'react';
import {
  formatDateDisplay,
  calculateMonthlyProportional,
} from '../../utils/transportSubscriptionUtils.js';

/**
 * Vista de un alumno ya matriculado en el transporte (muestra recorrido, inicio, proporcional y botón baja)
 */
const ParentTransportEnrolledView = ({
  assignedRoute,
  startDate,
  bajaSolicitada,
  isCancelableToday,
  nextMonthDisplay,
  isProcessing,
  onCancelClick,
}) => {
  const proportional = startDate
    ? calculateMonthlyProportional({ startDate })
    : null;

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-purple-50/60 border border-purple-200/80 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-purple-950 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-purple-600 text-lg">
                verified
              </span>
              Recorrido Asignado: {assignedRoute || 'Ruta Escolar'}
            </h4>
            <p className="text-xs text-purple-800 mt-0.5">
              Unidad: Mercedes-Benz Sprinter (15 plazas de pasajeros)
            </p>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-md">
            15 plazas máx.
          </span>
        </div>

        <div className="pt-2 border-t border-purple-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
          <span data-testid="portal-transport-start-date">
            Inicio de suscripción: <strong>{formatDateDisplay(startDate)}</strong>
          </span>
          {proportional && (
            <span
              data-testid="portal-transport-proportional-info"
              className="text-purple-900 font-semibold"
            >
              Facturación proporcional ({proportional.activeDays} días):{' '}
              {proportional.formattedProportional}
            </span>
          )}
        </div>
      </div>

      {bajaSolicitada && (
        <div
          data-testid="baja-programada-banner"
          className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1"
        >
          <div className="flex items-center gap-1.5 font-bold">
            <span className="material-symbols-outlined text-amber-600 text-base">
              calendar_clock
            </span>
            <span>Baja programada en efecto a partir del {nextMonthDisplay}</span>
          </div>
          <p className="text-amber-800">
            El mes en curso continúa con el servicio activo. Si requiere una baja inmediata dentro de este mes, consulte a la Administración.
          </p>
        </div>
      )}

      {!bajaSolicitada && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-slate-500 max-w-md">
            {isCancelableToday
              ? 'Como la inscripción fue realizada hoy, puede dar de baja el servicio inmediatamente.'
              : `La inscripción rige este mes. La baja solicitada quedará en efecto a partir del ${nextMonthDisplay}.`}
          </p>
          <button
            type="button"
            data-testid="btn-cancel-transport"
            disabled={isProcessing}
            onClick={onCancelClick}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shrink-0"
          >
            {isProcessing ? <span className='animate-pulse'>Procesando baja...</span> : isCancelableToday ? 'Dar de baja inmediata' : 'Solicitar baja de servicio'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ParentTransportEnrolledView;
