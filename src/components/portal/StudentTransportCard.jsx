import React from 'react';
import {
  formatDateDisplay,
  calculateMonthlyProportional,
} from '../../utils/transportSubscriptionUtils.js';

const TransportStatusBadge = ({ isEnrolled, bajaSolicitada }) => {
  if (!isEnrolled) {
    return (
      <span
        data-testid="student-transport-status-badge"
        className="text-xs font-bold px-2.5 py-1 rounded-full border bg-slate-100 text-slate-600 border-slate-200"
      >
        No Inscripto
      </span>
    );
  }
  if (bajaSolicitada) {
    return (
      <span
        data-testid="student-transport-status-badge"
        className="text-xs font-bold px-2.5 py-1 rounded-full border bg-amber-50 text-amber-800 border-amber-200"
      >
        Baja Programada (Efectiva mes prox.)
      </span>
    );
  }
  return (
    <span
      data-testid="student-transport-status-badge"
      className="text-xs font-bold px-2.5 py-1 rounded-full border bg-purple-50 text-purple-700 border-purple-200"
    >
      Servicio Activo
    </span>
  );
};

const ActiveRouteDetails = ({
  routeName,
  zona,
  horarioIda,
  horarioRegreso,
  fechaInicio,
  bajaSolicitada,
  bajaProgramada,
}) => {
  const proportionalInfo = fechaInicio
    ? calculateMonthlyProportional({ startDate: fechaInicio })
    : null;

  return (
    <div className="space-y-3.5">
      <div className="p-3.5 rounded-lg bg-purple-50/50 border border-purple-100 space-y-2">
        <div className="flex items-center justify-between">
          <h3
            data-testid="transport-route-title"
            className="text-sm font-bold text-purple-950 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-purple-600 text-base">
              alt_route
            </span>
            {routeName}
          </h3>
          <span className="text-[11px] font-semibold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded">
            Capacidad: 15 plazas Sprinter
          </span>
        </div>
        <p className="text-xs text-slate-600">
          <strong className="text-slate-700">Zona de cobertura:</strong> {zona}
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-700 font-medium">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-purple-500">
              login
            </span>
            <span>Ida al colegio: <strong>{horarioIda}</strong></span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-purple-500">
              logout
            </span>
            <span>Regreso al hogar: <strong>{horarioRegreso}</strong></span>
          </div>
        </div>
      </div>

      <div
        data-testid="transport-billing-details"
        className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5"
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 font-semibold text-slate-700">
            <span className="material-symbols-outlined text-sm text-slate-400">
              event_available
            </span>
            Inicio de suscripción:
          </span>
          <strong data-testid="transport-start-date" className="text-slate-900">
            {fechaInicio ? formatDateDisplay(fechaInicio) : 'Inicio de ciclo'}
          </strong>
        </div>

        {proportionalInfo && (
          <div className="pt-1.5 border-t border-slate-200/70 flex items-center justify-between text-slate-600">
            <span>Facturación del 1er mes (Proporcional {proportionalInfo.activeDays} días):</span>
            <span data-testid="transport-proportional-fee" className="font-bold text-slate-800">
              {proportionalInfo.formattedProportional}
            </span>
          </div>
        )}
      </div>

      {bajaSolicitada && (
        <div
          data-testid="transport-scheduled-withdrawal-alert"
          className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2"
        >
          <span className="material-symbols-outlined text-amber-600 text-base shrink-0">
            info
          </span>
          <div>
            <p className="font-bold">Solicitud de baja en trámite</p>
            <p className="mt-0.5 text-amber-800">
              La baja tendrá efecto a partir del <strong>{formatDateDisplay(bajaProgramada)}</strong>. Para cancelaciones inmediatas extraordinarias dentro del mes, consultar a la Administración Escolar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Tarjeta de visualización del servicio de transporte escolar del estudiante
 */
const StudentTransportCard = ({ student, transportDetails }) => {
  const isEnrolled = Boolean(transportDetails?.activo);
  const routeName = transportDetails?.recorrido || 'Sin recorrido asignado';
  const zona = transportDetails?.zona || 'Zona a coordinar';
  const horarioIda = transportDetails?.horarioIda || '07:00 hs';
  const horarioRegreso = transportDetails?.horarioRegreso || '16:30 hs';

  const fechaInicio = student?.transporteFechaInicio;
  const bajaSolicitada = Boolean(student?.transporteBajaSolicitada);
  const bajaProgramada = student?.transporteBajaProgramada;

  return (
    <div
      data-testid="student-transport-card"
      className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">directions_bus</span>
          </div>
          <div className="text-left">
            <h2 className="text-base font-bold text-slate-800">Transporte Escolar</h2>
            <p className="text-xs text-slate-500">
              Vehículo oficial: Mercedes-Benz Sprinter
            </p>
          </div>
        </div>
        <TransportStatusBadge
          isEnrolled={isEnrolled}
          bajaSolicitada={bajaSolicitada}
        />
      </div>

      {!isEnrolled ? (
        <div
          data-testid="no-transport-message"
          className="p-4 rounded-lg bg-slate-50 border border-dashed border-slate-250 text-center text-xs text-slate-500"
        >
          El estudiante no cuenta con suscripción activa al transporte escolar.
        </div>
      ) : (
        <ActiveRouteDetails
          routeName={routeName}
          zona={zona}
          horarioIda={horarioIda}
          horarioRegreso={horarioRegreso}
          fechaInicio={fechaInicio}
          bajaSolicitada={bajaSolicitada}
          bajaProgramada={bajaProgramada}
        />
      )}
    </div>
  );
};

export default StudentTransportCard;
