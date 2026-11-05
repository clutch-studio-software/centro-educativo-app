import React from 'react';
import { checkScheduleConflict } from '../admin/sports/sportsScheduleUtils.js';

/**
 * Sección de autogestión de deportes extracurriculares para padres y tutores.
 * Reglas de negocio:
 * 1. Máximo 2 actividades extracurriculares simultáneas por alumno.
 * 2. Prevención estricta de conflictos horarios (días y horas superpuestos).
 * 3. Validación de cupo libre disponible.
 */
const ParentSportsSection = ({
  student,
  allSports = [],
  onEnrollSport,
  onWithdrawSport,
  isProcessing = false,
}) => {
  const studentSportsNames = Array.isArray(student?.deportes) ? student.deportes : [];

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

  return (
    <div
      data-testid="parent-sports-section"
      className="bg-white rounded-md border border-slate-200 p-5 md:p-6 space-y-5 shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">sports_soccer</span>
          </div>
          <div className='text-left'>
            <p className="text-base font-bold text-slate-800">
              Autogestión de Deportes Extracurriculares
            </p>
            <p className="text-xs text-slate-500">
              Reglamento: Máximo 2 deportes por alumno • Sin superposición horaria
            </p>
          </div>
        </div>
        <span
          data-testid="portal-sports-quota-badge"
          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            isAtMaxSportsLimit
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {enrolledCount} / 2 disciplinas ocupadas
        </span>
      </div>

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
          Disciplinas y Talleres Deportivos:
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

            // Validación de conflicto horario si aún no está inscripto
            const conflict = !isEnrolled
              ? checkScheduleConflict(enrolledSports, sport)
              : null;

            return (
              <div
                key={sport.id}
                data-testid={`sport-catalog-card-${sport.id}`}
                className={`p-4 rounded-md border transition-all flex flex-col justify-between gap-3 ${
                  isEnrolled
                    ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200'
                    : conflict
                      ? 'bg-rose-50/40 border-rose-200'
                      : isFull
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start text-left justify-between gap-2">
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      {sport.nombre}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isEnrolled
                          ? 'bg-emerald-100 text-emerald-800'
                          : isFull
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isEnrolled
                        ? 'Inscripto'
                        : isFull
                          ? 'Sin cupo'
                          : `${inscriptosCount}/${maxCupo} vacantes`}
                    </span>
                  </div>

                  <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-slate-400">
                      schedule
                    </span>
                    Horarios: <strong>{sport.horarios || sport.diasHorarios || 'A confirmar'}</strong>
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-slate-400">
                      person
                    </span>
                    Profesor: <strong>{sport.profesor?.nombre || 'Docente a cargo'}</strong>
                  </span>
                </div>

                {/* Advertencia de superposición horaria */}
                {conflict && (
                  <div
                    data-testid={`conflict-alert-${sport.id}`}
                    className="p-2 rounded bg-rose-100/70 border border-rose-200 text-[11px] text-rose-900 flex items-center gap-1.5"
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
                      onClick={() => onWithdrawSport(sport.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                    >
                      Dar de baja
                    </button>
                  ) : (
                    <button
                      type="button"
                      data-testid={`btn-enroll-sport-${sport.id}`}
                      disabled={isProcessing || isAtMaxSportsLimit || Boolean(conflict) || isFull}
                      onClick={() => onEnrollSport(sport.id)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white transition-colors cursor-pointer shadow-sm"
                    >
                      Inscribir
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ParentSportsSection;
