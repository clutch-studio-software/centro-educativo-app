import React from 'react';

const EMPTY_COURSES = [];
const EMPTY_SCHEDULE_MAP = {};

/**
 * Panel de filtros de nivel, curso y fecha para el Registro Diario de Asistencia
 */
const AttendanceFiltersPanel = ({
  isDocente = false,
  nivelFilter = 'todos',
  onNivelChange,
  filteredCourses = EMPTY_COURSES,
  activeCourse = null,
  onCourseChange,
  effectiveDate = '',
  onDateChange,
  dayInfo = { label: '' },
  scheduleByCourseId = EMPTY_SCHEDULE_MAP,
}) => {
  const activeScheduleSlots = activeCourse ? scheduleByCourseId[activeCourse.id] : null;

  return (
    <section className="bg-white rounded-md border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {!isDocente && (
          <div>
            <label
              htmlFor="attendance-nivel-select"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Filtrar por Nivel Educativo
            </label>
            <select
              id="attendance-nivel-select"
              data-testid="attendance-nivel-select"
              value={nivelFilter}
              onChange={(e) => onNivelChange(e.target.value)}
              className="w-full p-2.5 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600"
            >
              <option value="todos">Todos los Niveles (Inicial, Primario y Secundario)</option>
              <option value="inicial">Nivel Inicial</option>
              <option value="primario">Nivel Primario</option>
              <option value="secundario">Nivel Secundario</option>
            </select>
          </div>
        )}

        <div className={isDocente ? 'md:col-span-2' : ''}>
          <label
            htmlFor="attendance-course-select"
            className="block text-xs font-bold text-slate-700 mb-1"
          >
            {isDocente
              ? `Cursos con Clase Asignada Hoy (${dayInfo.label})`
              : 'Curso y División'}
          </label>
          <select
            id="attendance-course-select"
            data-testid="attendance-course-select"
            value={activeCourse?.id || ''}
            disabled={filteredCourses.length === 0}
            onChange={(e) => onCourseChange(e.target.value)}
            className="w-full p-2.5 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 disabled:bg-slate-100"
          >
            {filteredCourses.length === 0 ? (
              <option value="">
                {isDocente
                  ? `Sin cursos con dictado de clases en el día de hoy (${dayInfo.label})`
                  : 'No hay cursos disponibles'}
              </option>
            ) : (
              filteredCourses.map((c) => {
                const nivelCap = String(c.nivelId || c.nivel || 'Primario');
                const scheduleNote =
                  isDocente && scheduleByCourseId[c.id]
                    ? ` — ${scheduleByCourseId[c.id].join(' / ')}`
                    : '';
                return (
                  <option key={c.id} value={c.id}>
                    [{nivelCap.toUpperCase()}] {c.nombre} {c.division || ''} ({c.turno || 'Mañana'})
                    {scheduleNote}
                  </option>
                );
              })
            )}
          </select>
        </div>

        <div>
          <label
            htmlFor="attendance-date-input"
            className="block text-xs font-bold text-slate-700 mb-1"
          >
            Fecha de Asistencia {isDocente && '(Bloqueada al día de hoy)'}
          </label>
          <input
            id="attendance-date-input"
            type="date"
            data-testid="attendance-date-input"
            value={effectiveDate}
            disabled={isDocente}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full p-2.5 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 disabled:bg-slate-100 disabled:text-slate-500"
          />
        </div>
      </div>

      {isDocente && activeScheduleSlots && (
        <div
          data-testid="docente-today-schedule-badge"
          className="p-3 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-amber-600 text-base">schedule</span>
          <span>
            <strong>Cátedra habilitada hoy ({dayInfo.label}):</strong>{' '}
            {activeScheduleSlots.join(' · ')}
          </span>
        </div>
      )}
    </section>
  );
};

export default AttendanceFiltersPanel;
