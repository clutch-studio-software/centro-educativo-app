import React, { useMemo } from 'react';
import PortalSectionHeader from './PortalSectionHeader.jsx';
import { getStudentAttendanceData } from '../../utils/studentPortalRecordsUtils.js';

/**
 * Tarjeta de Asistencias y Faltas Injustificadas
 * Permite a estudiantes y padres supervisar inasistencias, faltas injustificadas y puntualidad.
 */
const StudentAttendanceCard = ({ student }) => {
  const attendance = useMemo(() => {
    return getStudentAttendanceData(student);
  }, [student]);

  const {
    porcentaje,
    faltasInjustificadas,
    faltasJustificadas,
    tardanzas,
    totalFaltas,
    historial,
  } = attendance;

  const hasInjustificadas = faltasInjustificadas > 0;

  return (
    <div
      data-testid="student-attendance-card"
      className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 space-y-5 shadow-sm text-left"
    >
      <PortalSectionHeader
        icon="event_available"
        iconBgClass="bg-blue-50"
        iconColorClass="text-blue-600"
        title="Control de Asistencias e Inasistencias"
        subtitle="Registro de presentismo, tardanzas y seguimiento de regularidad escolar"
        statusBadge={
          <span
            data-testid="attendance-percentage-badge"
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              porcentaje >= 85
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {porcentaje}% de Asistencia
          </span>
        }
      />

      {/* Métricas Principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Métrica 1: Faltas Injustificadas (Destacado) */}
        <div
          data-testid="metric-faltas-injustificadas"
          className={`p-3.5 rounded-md border text-left flex flex-col justify-between ${
            hasInjustificadas
              ? 'bg-rose-50/80 border-rose-200 ring-1 ring-rose-200/50'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
              Injustificadas
            </span>
            <span className="material-symbols-outlined text-rose-600 text-base">
              warning
            </span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-rose-700">
              {faltasInjustificadas}
            </p>
            <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
              Máx. 15 permitidas
            </p>
          </div>
        </div>

        {/* Métrica 2: Faltas Justificadas */}
        <div
          data-testid="metric-faltas-justificadas"
          className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-left flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Justificadas
            </span>
            <span className="material-symbols-outlined text-blue-500 text-base">
              verified
            </span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-slate-800">
              {faltasJustificadas}
            </p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
              Con certificado
            </p>
          </div>
        </div>

        {/* Métrica 3: Tardanzas */}
        <div
          data-testid="metric-tardanzas"
          className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-left flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Tardanzas
            </span>
            <span className="material-symbols-outlined text-amber-500 text-base">
              schedule
            </span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-slate-800">
              {tardanzas}
            </p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
              Ingresos demorados
            </p>
          </div>
        </div>

        {/* Métrica 4: Total Inasistencias */}
        <div
          data-testid="metric-total-faltas"
          className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-left flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Total Faltas
            </span>
            <span className="material-symbols-outlined text-slate-400 text-base">
              summarize
            </span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-slate-800">
              {totalFaltas}
            </p>
            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
              Acumuladas en ciclo
            </p>
          </div>
        </div>
      </div>

      {/* Alerta de Faltas Injustificadas si existen */}
      {hasInjustificadas && (
        <div
          data-testid="unjustified-absences-alert"
          className="p-3.5 items-center rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5"
        >
          <span className="material-symbols-outlined text-[24px] text-rose-600 text-base shrink-0 mt-0.5">
            error
          </span>
          <div className="space-y-0.5">
            <p className="font-bold">
              Atención: Se registran {faltasInjustificadas} faltas injustificadas en el legajo del alumno.
            </p>
            <p className="text-rose-800 text-[11px] leading-relaxed">
              Las inasistencias sin justificación médica o institucional computan directamente para el límite reglamentario de regularidad escolar (máximo 15 faltas). Ante cualquier inquietud, comunicarse con preceptoría.
            </p>
          </div>
        </div>
      )}

      {/* Detalle del Historial de Inasistencias */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Detalle cronológico de inasistencias y tardanzas:
        </h4>

        {Array.isArray(historial) && historial.length > 0 ? (
          <div className="space-y-2">
            {historial.map((item) => {
              const isInj = item.tipo?.toLowerCase().includes('injustificada') || item.estado === 'injustificada';
              const isJust = item.tipo?.toLowerCase().includes('justificada') || item.estado === 'justificada';

              return (
                <div
                  key={item.id || item.fecha}
                  data-testid={`attendance-row-${item.id || item.fecha}`}
                  className="p-3 rounded-md border border-slate-250 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 font-mono">
                        {item.fecha}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isInj
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : isJust
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {item.tipo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {item.motivo}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                    Ciclo Lectivo 2026
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
            Sin inasistencias registradas. ¡Asistencia perfecta!
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendanceCard;
