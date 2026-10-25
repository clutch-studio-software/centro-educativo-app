import React from 'react';
import { parseCourseDivision } from '../../../data/mockAcademicOffer';
import { getEnrolledStudentsForCourse } from '../../../utils/academicUtils';

const getLevelIcon = (levelId) => {
  if (levelId === 'inicial') return 'toys';
  if (levelId === 'primario') return 'school';
  return 'history_edu';
};

const getBadgeStyle = (isFull, percentage) => {
  if (isFull) return 'bg-rose-50 text-rose-600';
  if (percentage >= 85) return 'bg-amber-50 text-amber-700';
  return 'bg-emerald-50 text-emerald-700';
};

const getProgressBg = (isFull, percentage) => {
  if (isFull) return 'bg-rose-500';
  if (percentage >= 85) return 'bg-amber-500';
  return 'bg-emerald-500';
};

export const DivisionTableRow = ({
  course,
  level,
  students,
  activeMenuCourseId,
  onToggleStatus,
  onOpenMenu,
}) => {
  const { nombre, division } = parseCourseDivision(course);
  const enrolledStudents = getEnrolledStudentsForCourse(students, course);
  const cupoOcupado = enrolledStudents.length;
  const cupoMax = course.cupoMax || 30;
  const percentage = Math.min(100, Math.round((cupoOcupado / cupoMax) * 100));
  const isFull = cupoOcupado >= cupoMax;
  const vacantes = Math.max(0, cupoMax - cupoOcupado);
  const isTurnoTarde = course.turno?.toLowerCase().includes('tarde');

  const levelIcon = getLevelIcon(level?.id);
  const badgeStyle = getBadgeStyle(isFull, percentage);
  const progressBg = getProgressBg(isFull, percentage);
  const badgeText = isFull ? 'Lleno' : `${vacantes} vac.`;
  const shiftText = isTurnoTarde ? 'Tarde' : 'Mañana';
  const shiftIcon = isTurnoTarde ? 'wb_twilight' : 'wb_sunny';
  const shiftColor = isTurnoTarde ? 'text-amber-500' : 'text-blue-500';

  return (
    <tr
      key={course.id}
      data-testid={`division-row-${course.id}`}
      className="hover:bg-slate-50/70 transition-colors group"
    >
      {/* 1. Nombre */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
            <span className="material-symbols-outlined text-[18px]">{levelIcon}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-900 text-sm tracking-tight truncate">
              {nombre}
            </span>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              {course.aula && <span>{course.aula}</span>}
              {course.orientacion && (
                <>
                  <span>•</span>
                  <span className="text-indigo-600 font-medium truncate">
                    {course.orientacion}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* 2. División */}
      <td className="py-4 px-6">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
          División {division}
        </span>
      </td>

      {/* 3. Turno */}
      <td className="py-4 px-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100/80 text-slate-700">
          <span className={`material-symbols-outlined text-[15px] ${shiftColor}`}>
            {shiftIcon}
          </span>
          <span>{shiftText}</span>
        </div>
      </td>

      {/* 4. Ocupación */}
      <td className="py-4 px-6">
        <div className="flex flex-col gap-1.5 min-w-[140px] max-w-[200px]">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-800">
              <span className="font-bold">{cupoOcupado}</span>
              <span className="text-slate-400 font-normal"> / {cupoMax}</span>
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${badgeStyle}`}>
              {badgeText}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${progressBg}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </td>

      {/* 5. Switch para activar/desactivar división */}
      <td className="py-4 px-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <label
            className="relative inline-flex items-center cursor-pointer select-none"
            title={course.activo ? 'Desactivar división' : 'Activar división'}
          >
            <input
              type="checkbox"
              checked={course.activo}
              onChange={() => onToggleStatus(course)}
              className="sr-only peer"
              aria-label={`Estado de ${nombre} división ${division}`}
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 transition-colors"></div>
          </label>
          <span
            className={`text-[11px] font-semibold hidden lg:inline-block ${
              course.activo ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            {course.activo ? 'Activa' : 'Pausada'}
          </span>
        </div>
      </td>

      {/* 6. Botón de más acciones */}
      <td className="py-4 px-6 text-right">
        <button
          type="button"
          onClick={(e) => onOpenMenu(e, course)}
          data-testid={`btn-more-actions-${course.id}`}
          title="Más acciones"
          aria-label={`Más acciones para ${nombre} división ${division}`}
          className={`p-2 rounded-xl transition-all cursor-pointer border-none ${
            activeMenuCourseId === course.id
              ? 'bg-blue-50 text-blue-600'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 bg-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">more_vert</span>
        </button>
      </td>
    </tr>
  );
};

export default DivisionTableRow;
