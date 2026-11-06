import React, { useState, useMemo } from 'react';
import PortalSectionHeader from './PortalSectionHeader.jsx';
import JustifyAbsenceModal from './JustifyAbsenceModal.jsx';
import AttendanceMetricsSummary from './AttendanceMetricsSummary.jsx';
import AttendanceHistoryList from './AttendanceHistoryList.jsx';
import { getStudentAttendanceData } from '../../utils/studentPortalRecordsUtils.js';

/**
 * Tarjeta de Asistencias y Faltas Injustificadas
 * Permite a estudiantes y padres supervisar inasistencias, dar el visto y justificar faltas.
 */
const StudentAttendanceCard = ({
  student,
  onAcknowledgeAttendance,
  onJustifyAbsence,
  isProcessing = false,
}) => {
  const [absenceToJustify, setAbsenceToJustify] = useState(null);

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
  const studentName =
    student?.nombreCompleto || `${student?.nombre || ''} ${student?.apellido || ''}`.trim() || 'el alumno';

  const handleConfirmJustification = (justificationData) => {
    if (onJustifyAbsence) {
      onJustifyAbsence({
        student,
        ...justificationData,
      });
    }
    setAbsenceToJustify(null);
  };

  return (
    <div
      data-testid="student-attendance-card"
      className="bg-white rounded-md border border-slate-200 p-5 md:p-6 space-y-5 shadow-sm text-left"
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
      <AttendanceMetricsSummary
        faltasInjustificadas={faltasInjustificadas}
        faltasJustificadas={faltasJustificadas}
        tardanzas={tardanzas}
        totalFaltas={totalFaltas}
        hasInjustificadas={hasInjustificadas}
      />

      {/* Alerta de Faltas Injustificadas si existen */}
      {hasInjustificadas && (
        <div
          data-testid="unjustified-absences-alert"
          className="p-3.5 rounded-md bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5"
        >
          <span className="material-symbols-outlined text-rose-600 text-base shrink-0 mt-0.5">
            error
          </span>
          <div className="space-y-0.5">
            <p className="font-bold">
              Atención: Se registran {faltasInjustificadas} faltas injustificadas en el legajo del alumno.
            </p>
            <p className="text-slate-600 text-[11px]">
              Recuerde que por reglamento escolar no se pueden superar 15 faltas injustificadas en el ciclo lectivo. Puede remitir el certificado médico o justificación haciendo click en el botón correspondiente.
            </p>
          </div>
        </div>
      )}

      {/* Detalle cronológico de inasistencias */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Detalle de Inasistencias del Ciclo Lectivo
          </span>
          <span className="text-[11px] text-slate-400 font-semibold">
            {historial.length} eventos registrados
          </span>
        </div>

        <AttendanceHistoryList
          historial={historial}
          isProcessing={isProcessing}
          onOpenJustify={(item) => setAbsenceToJustify(item)}
          onAcknowledgeAttendance={onAcknowledgeAttendance}
        />
      </div>

      {absenceToJustify && (
        <JustifyAbsenceModal
          absence={absenceToJustify}
          studentName={studentName}
          onClose={() => setAbsenceToJustify(null)}
          onSubmit={handleConfirmJustification}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

export default StudentAttendanceCard;
