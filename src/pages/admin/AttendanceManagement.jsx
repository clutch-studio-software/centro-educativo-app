import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { usePermissions } from '../../hooks/usePermissions.js';
import AttendanceFiltersPanel from '../../components/admin/attendance/AttendanceFiltersPanel.jsx';
import AttendanceRosterTable from '../../components/admin/attendance/AttendanceRosterTable.jsx';
import { useAttendanceManagementState } from './useAttendanceManagementState.js';

const AttendanceFeedbackAlert = ({ feedback, onClose }) => {
  if (!feedback) return null;
  const isError = feedback.type === 'error';
  const alertClass = isError
    ? 'bg-rose-50 text-rose-800 border-rose-200'
    : 'bg-emerald-50 text-emerald-800 border-emerald-200';

  return (
    <div
      data-testid="attendance-feedback-alert"
      className={`p-4 rounded-md text-xs font-semibold flex items-center justify-between gap-3 border ${alertClass}`}
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-base">
          {isError ? 'error' : 'check_circle'}
        </span>
        <span>{feedback.message}</span>
      </div>
      <button
        type="button"
        aria-label="Cerrar alerta de asistencia"
        onClick={onClose}
        className="text-slate-500 hover:text-slate-800 font-bold cursor-pointer bg-transparent border-none"
      >
        ×
      </button>
    </div>
  );
};

const AttendanceContentArea = ({
  loading,
  saving,
  isDocente,
  filteredCourses,
  dayInfo,
  activeCourse,
  metrics,
  courseStudents,
  currentAttendanceMap,
  onMarkAllPresent,
  onSaveAttendance,
  onStatusChange,
  onMotivoChange,
  onApproveJustification,
  onRejectJustification,
}) => {
  if (loading) {
    return (
      <div className="p-12 bg-white rounded-md border border-slate-200 text-center space-y-2">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500">
          Cargando nómina de alumnos desde Firebase...
        </p>
      </div>
    );
  }

  if (isDocente && filteredCourses.length === 0) {
    return (
      <div
        data-testid="docente-no-classes-today"
        className="p-8 bg-white rounded-md border border-slate-200 text-center space-y-2"
      >
        <span className="material-symbols-outlined text-4xl text-amber-500">event_busy</span>
        <h3 className="text-base font-bold text-slate-800">
          No tenés cursos con clases asignadas en el día de la fecha ({dayInfo.label})
        </h3>
        <p className="text-xs text-slate-500 max-w-lg mx-auto">
          Por normativa institucional, el perfil Docente solo puede registrar asistencia en los cursos donde dicta clases durante la jornada actual. Los preceptores y administrativos pueden registrar asistencia en cualquier curso.
        </p>
      </div>
    );
  }

  const courseTitle = activeCourse
    ? `${activeCourse.nombre} ${activeCourse.division || ''}`.trim()
    : 'Sin curso seleccionado';
  const actionsDisabled = courseStudents.length === 0 || saving;

  return (
    <section className="bg-white rounded-md border border-slate-200 p-5 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Nómina del Curso: {courseTitle}</h2>
          <p className="text-xs text-slate-500">
            Total en lista: <strong>{metrics.total}</strong> · Presentes:{' '}
            <strong className="text-emerald-700">{metrics.presentes}</strong> · Tardanzas:{' '}
            <strong className="text-amber-600">{metrics.tardanzas}</strong> · Ausentes:{' '}
            <strong className="text-rose-600">
              {metrics.injustificadas + metrics.justificadas}
            </strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="btn-mark-all-present"
            disabled={actionsDisabled}
            onClick={onMarkAllPresent}
            className="px-3 py-2 rounded-md text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">done_all</span>
            <span>Todos Presentes</span>
          </button>

          <button
            type="button"
            data-testid="btn-save-course-attendance"
            disabled={actionsDisabled}
            onClick={onSaveAttendance}
            className="px-4 py-2 rounded-md text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[15px]">save</span>
            <span>{saving ? 'Guardando en Firebase...' : 'Guardar Asistencia del Curso'}</span>
          </button>
        </div>
      </div>

      <AttendanceRosterTable
        students={courseStudents}
        attendanceMap={currentAttendanceMap}
        onStatusChange={onStatusChange}
        onMotivoChange={onMotivoChange}
        onApproveJustification={onApproveJustification}
        onRejectJustification={onRejectJustification}
        isSaving={saving}
      />
    </section>
  );
};

/**
 * Pantalla Institucional de Registro de Asistencia Diaria por Curso
 */
const AttendanceManagement = () => {
  const { user } = useAuth();
  const { isDocente, role: userRoleNorm } = usePermissions();

  const state = useAttendanceManagementState({ user, isDocente });
  const teacherName = state.currentTeacher?.nombreCompleto || user?.displayName || 'Profesor';
  const subtitle = isDocente
    ? `Modo Docente (${teacherName}): habilitado exclusivamente para los cursos donde dictás clases hoy (${state.dayInfo.label} ${state.effectiveDate}).`
    : 'Modo Preceptoría / Administración: habilitado para tomar asistencia y auditar justificativos en cualquier curso del establecimiento.';

  return (
    <AdminLayout
      activeItem="asistencia"
      breadcrumbs={['Consola Administrativa', 'Registro Diario de Asistencia']}
    >
      <div data-testid="attendance-management-page" className="space-y-6 text-left">
        <section className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 rounded-md p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-200">
              <span className="material-symbols-outlined text-base">fact_check</span>
              <span>Control de Presentismo y Regularidad · {userRoleNorm || 'Personal'}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Registro Diario de Asistencia por Curso
            </h1>
            <p className="text-xs text-emerald-100 max-w-2xl">{subtitle}</p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs px-4 py-3 rounded-md border border-white/20 shrink-0">
            <span className="material-symbols-outlined text-2xl text-emerald-300">today</span>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">
                Fecha de Parte Diario
              </span>
              <span className="text-sm font-black text-white">
                {state.dayInfo.label} · {state.effectiveDate}
              </span>
            </div>
          </div>
        </section>

        <AttendanceFeedbackAlert
          feedback={state.dataState.feedback}
          onClose={() => state.setDataState((prev) => ({ ...prev, feedback: null }))}
        />

        <AttendanceFiltersPanel
          isDocente={isDocente}
          nivelFilter={state.filterState.nivelFilter}
          onNivelChange={(val) =>
            state.setFilterState((prev) => ({ ...prev, nivelFilter: val, selectedCourseId: '' }))
          }
          filteredCourses={state.filteredCourses}
          activeCourse={state.activeCourse}
          onCourseChange={(val) =>
            state.setFilterState((prev) => ({ ...prev, selectedCourseId: val }))
          }
          effectiveDate={state.effectiveDate}
          onDateChange={(val) =>
            state.setFilterState((prev) => ({ ...prev, selectedDate: val || state.todayStr }))
          }
          dayInfo={state.dayInfo}
          scheduleByCourseId={state.scheduleByCourseId}
        />

        <AttendanceContentArea
          loading={state.dataState.loading}
          saving={state.dataState.saving}
          isDocente={isDocente}
          filteredCourses={state.filteredCourses}
          dayInfo={state.dayInfo}
          activeCourse={state.activeCourse}
          metrics={state.metrics}
          courseStudents={state.courseStudents}
          currentAttendanceMap={state.currentAttendanceMap}
          onMarkAllPresent={state.handleMarkAllPresent}
          onSaveAttendance={state.handleSaveAttendance}
          onStatusChange={(studentId, newStatus) =>
            state.updateStudentEdit(studentId, { estado: newStatus })
          }
          onMotivoChange={(studentId, newMotivo) =>
            state.updateStudentEdit(studentId, { motivo: newMotivo })
          }
          onApproveJustification={state.handleApproveJustification}
          onRejectJustification={state.handleRejectJustification}
        />
      </div>
    </AdminLayout>
  );
};

export default AttendanceManagement;
