import React from 'react';
import { getStudentAttendanceData } from '../../../utils/studentPortalRecordsUtils.js';

const EMPTY_STUDENTS = [];
const EMPTY_MAP = {};

const ATTENDANCE_OPTIONS = [
  {
    value: 'presente',
    label: 'Presente',
    icon: 'check_circle',
    activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-xs',
    inactiveClass: 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700',
  },
  {
    value: 'tardanza',
    label: 'Tardanza',
    icon: 'schedule',
    activeClass: 'bg-amber-500 text-white border-amber-500 shadow-xs',
    inactiveClass: 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700',
  },
  {
    value: 'injustificada',
    label: 'Ausente (Injust.)',
    icon: 'cancel',
    activeClass: 'bg-rose-600 text-white border-rose-600 shadow-xs',
    inactiveClass: 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700',
  },
  {
    value: 'justificada',
    label: 'Justificada',
    icon: 'verified',
    activeClass: 'bg-blue-600 text-white border-blue-600 shadow-xs',
    inactiveClass: 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700',
  },
];

const PendingJustificationCard = ({
  student,
  pj,
  currentMotivo,
  onApproveJustification,
  onRejectJustification,
}) => {
  const canResolve =
    pj.estado === 'justificacion_pendiente' ||
    pj.justificacion?.estado === 'Pendiente de revisión';

  return (
    <div className="p-2 rounded-md bg-blue-50/80 border border-blue-200 text-[11px] text-blue-900 flex flex-wrap items-center justify-between gap-2">
      <div className="space-y-0.5">
        <span className="font-bold block">
          Falta {pj.fecha}: {pj.justificacion?.motivo || 'Justificativo'}
        </span>
        {pj.justificacion?.detalle && (
          <span className="text-blue-700 block">{pj.justificacion.detalle}</span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {pj.justificacion?.comprobanteUrl && (
          <a
            href={pj.justificacion.comprobanteUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`admin-view-justification-file-${student.id}`}
            className="px-2 py-1 rounded bg-white text-blue-700 hover:text-blue-900 border border-blue-200 font-bold text-[10px] flex items-center gap-1 no-underline"
          >
            <span className="material-symbols-outlined text-[12px]">open_in_new</span>
            <span>Ver Comprobante</span>
          </a>
        )}

        {canResolve && onApproveJustification && (
          <button
            type="button"
            onClick={() => onApproveJustification(student, pj.id || pj.fecha)}
            data-testid={`btn-approve-justification-${student.id}`}
            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer border-none"
          >
            Aprobar
          </button>
        )}

        {canResolve && onRejectJustification && (
          <button
            type="button"
            onClick={() =>
              onRejectJustification(
                student,
                pj.id || pj.fecha,
                currentMotivo || 'Verifique la documentación adjunta'
              )
            }
            data-testid={`btn-reject-justification-${student.id}`}
            className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] cursor-pointer border-none"
          >
            Rechazar
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Tabla interactiva de toma de asistencia diaria por curso y revisión de justificativos adjuntos
 */
const AttendanceRosterTable = ({
  students = EMPTY_STUDENTS,
  attendanceMap = EMPTY_MAP,
  onStatusChange,
  onMotivoChange,
  onApproveJustification,
  onRejectJustification,
  isSaving = false,
}) => {
  if (students.length === 0) {
    return (
      <div
        data-testid="attendance-empty-roster"
        className="p-8 rounded-md bg-slate-50 border border-dashed border-slate-200 text-center space-y-2"
      >
        <span className="material-symbols-outlined text-3xl text-slate-400">groups</span>
        <p className="text-sm font-bold text-slate-700">
          No hay alumnos matriculados en este curso/división.
        </p>
        <p className="text-xs text-slate-500">
          Verifique la asignación de alumnos en la sección de Alumnos &amp; Legajos u Oferta Académica.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table data-testid="attendance-roster-table" className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/70">
            <th className="py-3 px-4">Alumno / Legajo</th>
            <th className="py-3 px-4 text-center">Regularidad</th>
            <th className="py-3 px-4">Estado del Día</th>
            <th className="py-3 px-4">Observación / Justificativo del Tutor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs">
          {students.map((student) => {
            const currentEntry = attendanceMap[student.id] || {
              estado: 'presente',
              motivo: '',
            };
            const summary = getStudentAttendanceData(student);
            const fullName =
              student.nombreCompleto ||
              `${student.apellido || ''} ${student.nombre || ''}`.trim() ||
              student.nombre ||
              'Estudiante';
            const legajo = student.studentID_login || student.legajo || `#${student.id}`;
            const inputId = `input-motivo-${student.id}`;

            // Buscar si tiene alguna justificación pendiente con o sin archivo en su historial
            const pendingJustifications = (summary.fullHistorial || summary.historial || []).filter(
              (h) => h.justificacion && (h.estado === 'justificacion_pendiente' || h.justificacion.comprobanteUrl)
            );

            return (
              <tr
                key={student.id}
                data-testid={`attendance-student-row-${student.id}`}
                className="hover:bg-slate-50/70 transition-colors"
              >
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-800 text-xs">{fullName}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-semibold text-slate-600">{legajo}</span>
                    <span>·</span>
                    <span>DNI {student.dni || 'S/D'}</span>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-center">
                  <div className="inline-flex flex-col items-center gap-0.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        summary.porcentaje >= 85
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {summary.porcentaje}% Asist.
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {summary.faltasInjustificadas} injust. · {summary.faltasJustificadas} just.
                    </span>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {ATTENDANCE_OPTIONS.map((opt) => {
                      const isSelected = currentEntry.estado === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          disabled={isSaving}
                          data-testid={`btn-status-${opt.value}-${student.id}`}
                          onClick={() => onStatusChange(student.id, opt.value)}
                          className={`px-2.5 py-1.5 rounded-md text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                            isSelected ? opt.activeClass : opt.inactiveClass
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">{opt.icon}</span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </td>

                <td className="py-3.5 px-4 min-w-[260px]">
                  <div className="space-y-1.5">
                    <label htmlFor={inputId} className="sr-only">
                      Observación de asistencia para {fullName}
                    </label>
                    <input
                      id={inputId}
                      type="text"
                      aria-label={`Observación de asistencia para ${fullName}`}
                      disabled={isSaving}
                      data-testid={`input-motivo-${student.id}`}
                      value={currentEntry.motivo || ''}
                      onChange={(e) => onMotivoChange(student.id, e.target.value)}
                      placeholder="Observación opcional (ej: retiro anticipado, certificado...)"
                      className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    />

                    {pendingJustifications.length > 0 && (
                      <div className="space-y-1 pt-0.5">
                        {pendingJustifications.slice(0, 2).map((pj) => (
                          <PendingJustificationCard
                            key={pj.id || pj.fecha}
                            student={student}
                            pj={pj}
                            currentMotivo={currentEntry.motivo}
                            onApproveJustification={onApproveJustification}
                            onRejectJustification={onRejectJustification}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceRosterTable;
