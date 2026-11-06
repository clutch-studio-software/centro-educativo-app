import React, { useState } from 'react';
import { checkScheduleConflict } from '../admin/sports/sportsScheduleUtils.js';
import PortalSectionHeader from './PortalSectionHeader.jsx';
import ConfirmCancelServiceModal from './ConfirmCancelServiceModal.jsx';
import {
  canCancelServiceToday,
  formatDateDisplay,
  getNextMonthFirstDay,
  calculateMonthlyProportional,
} from '../../utils/transportSubscriptionUtils.js';
import LoadingSpinner from '../admin/common/LoadingSpinner.jsx';

/**
 * Sección de autogestión de deportes extracurriculares para padres y tutores.
 * Reglas de negocio:
 * 1. Máximo 2 actividades extracurriculares simultáneas por alumno.
 * 2. Prevención estricta de conflictos horarios (días y horas superpuestos).
 * 3. Validación de cupo libre disponible.
 * 4. Política universal de baja (mismo día = inmediata | posterior = a partir del mes siguiente).
 * 5. Registro de inicio de suscripción para facturación proporcional.
 */
const ParentSportsSection = ({
  student,
  allSports = [],
  onEnrollSport,
  onWithdrawSport,
  isProcessing = false,
}) => {
  const [sportToCancel, setSportToCancel] = useState(null);

  const studentSportsNames = Array.isArray(student?.deportes) ? student.deportes : [];
  const subscriptions = student?.deportesSuscripciones || {};

  // Resolver objetos completos de los deportes en los que el alumno ya está inscripto
  const enrolledSports = allSports.filter((sp) => {
    const spId = String(sp.id).toLowerCase();
    const spName = String(sp.nombre).toLowerCase();
    return studentSportsNames.some((sn) => {
      const cleanSn = String(sn).toLowerCase();
      return cleanSn === spId || cleanSn === spName;
    });
  });

  const enrolledCount = enrolledSports.length;
  const isAtMaxSportsLimit = enrolledCount >= 2;
  const nextMonth = getNextMonthFirstDay();

  const handleWithdrawClick = (sport) => {
    setSportToCancel(sport);
  };

  const handleConfirmWithdraw = () => {
    if (!sportToCancel) return;
    const sId = sportToCancel.id;
    setSportToCancel(null);
    onWithdrawSport(sId);
  };

  const isCancelableToday = sportToCancel
    ? canCancelServiceToday(subscriptions[sportToCancel.id]?.fechaInicio || student?.deporteFechaInicio)
    : true;

  return (
    <div
      data-testid="parent-sports-section"
      className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-5 shadow-sm text-left"
    >
      <PortalSectionHeader
        icon="sports_soccer"
        iconBgClass="bg-emerald-50"
        iconColorClass="text-emerald-600"
        title="Autogestión de Deportes Extracurriculares"
        subtitle="Reglamento: Máximo 2 deportes por alumno • Sin superposición horaria • Plazas limitadas"
        statusBadge={
          <span
            data-testid="portal-sports-quota-badge"
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${isAtMaxSportsLimit
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
          >
            {enrolledCount} / 2 disciplinas ocupadas
          </span>
        }
      />

      {/* Alerta si alcanzó el límite */}
      {isAtMaxSportsLimit && (
        <div
          data-testid="max-sports-limit-alert"
          className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-amber-600 text-base">info</span>
          <span>
            El alumno ya alcanzó el cupo máximo de 2 actividades extracurriculares simultáneas.
          </span>
        </div>
      )}

      {/* Catálogo de disciplinas disponibles */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Disciplinas y Talleres Deportivos ({allSports.length} ofertadas):
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {allSports.map((sport) => {
            const isEnrolled = enrolledSports.some(
              (es) => String(es.id) === String(sport.id)
            );
            const inscriptosCount = Array.isArray(sport.inscriptos)
              ? sport.inscriptos.length
              : Number(sport.cupoOcupado) || 0;
            const maxCupo = Number(sport.cupoMax) || 30;
            const isFull = inscriptosCount >= maxCupo;

            // Suscripción específica del alumno en este deporte
            const sportSub = subscriptions[sport.id] || {};
            const startDate = sportSub.fechaInicio || (isEnrolled ? student?.deporteFechaInicio : null);
            const bajaSolicitada = Boolean(sportSub.bajaSolicitada);

            // Proporcional
            const proportional = isEnrolled && startDate
              ? calculateMonthlyProportional({ startDate, monthlyRate: 15000 })
              : null;

            // Validación de conflicto horario si aún no está inscripto
            const conflict = !isEnrolled
              ? checkScheduleConflict(enrolledSports, sport)
              : null;

            return (
              <div
                key={sport.id}
                data-testid={`sport-catalog-card-${sport.id}`}
                className={`p-4 rounded-md border transition-all flex flex-col justify-between gap-3 text-left ${isEnrolled
                    ? bajaSolicitada
                      ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-200'
                      : 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200'
                    : conflict
                      ? 'bg-rose-50/40 border-rose-200'
                      : isFull
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start text-left justify-between gap-2">
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      {sport.nombre}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isEnrolled
                          ? bajaSolicitada
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800'
                          : isFull
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      {isEnrolled
                        ? bajaSolicitada
                          ? 'Baja programada (Mes prox.)'
                          : 'Inscripto'
                        : isFull
                          ? 'Sin cupo'
                          : `${maxCupo-inscriptosCount}/${maxCupo} vacantes`}
                    </span>
                  </div>

                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-slate-400">
                      schedule
                    </span>
                    Horarios: <strong>{sport.horarios || sport.diasHorarios || 'A confirmar'}</strong>
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-slate-400">
                      person
                    </span>
                    Profesor: <strong>{sport.profesor?.nombre || 'Docente a cargo'}</strong>
                  </span>

                  {/* Detalle de inicio y proporcional */}
                  {isEnrolled && startDate && (
                    <div className="p-2 bg-white/70 rounded-md border border-emerald-200/60 text-[11px] text-slate-600 space-y-0.5">
                      <p>
                        Fecha de inicio: <strong>{formatDateDisplay(startDate)}</strong>
                      </p>
                      {proportional && (
                        <p className="text-emerald-800 font-semibold text-[10px]">
                          1º Mes Proporcional: {proportional.formatted} ({proportional.activeDays} días activos)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Advertencia de superposición horaria */}
                {conflict && (
                  <div
                    data-testid={`conflict-alert-${sport.id}`}
                    className="p-2 rounded-lg bg-rose-100/70 border border-rose-200 text-[11px] text-rose-900 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-rose-600 text-sm">error</span>
                    <span>Superposición horaria con otra actividad inscripta.</span>
                  </div>
                )}

                {/* Acciones */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {sport.categoria || 'Extracurricular'}
                  </span>

                  {isEnrolled ? (
                    <button
                      type="button"
                      data-testid={`btn-withdraw-sport-${sport.id}`}
                      disabled={isProcessing}
                      onClick={() => handleWithdrawClick(sport)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer transition-colors"
                    >
                      {isProcessing ? <span className='animate-pulse'>Procesando baja...</span> : 'Dar de baja'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      data-testid={`btn-enroll-sport-${sport.id}`}
                      disabled={isProcessing || isAtMaxSportsLimit || Boolean(conflict) || isFull}
                      onClick={() => onEnrollSport(sport.id)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white transition-colors cursor-pointer shadow-xs"
                    >
                      {isProcessing ? <span className="animate-pulse"> Procesando </span> : 'Inscribir'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {sportToCancel && (
        <ConfirmCancelServiceModal
          serviceName={`Deporte (${sportToCancel.nombre})`}
          isCancelableToday={isCancelableToday}
          nextMonthDisplay={nextMonth.display}
          onAbort={() => setSportToCancel(null)}
          onConfirm={handleConfirmWithdraw}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

export default ParentSportsSection;
