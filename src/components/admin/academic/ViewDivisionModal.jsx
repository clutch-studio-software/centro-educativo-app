import React from 'react';
import { EnrolledStudentsList } from './EnrolledStudentsList';

const EMPTY_STUDENTS = [];

const levelBadges = {
  inicial: { label: 'Nivel Inicial', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  primario: { label: 'Nivel Primario', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  secundario: { label: 'Nivel Secundario', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
};

const getProgressBarColor = (isFull, percentage) => {
  if (isFull) return 'bg-rose-500';
  if (percentage >= 85) return 'bg-amber-500';
  return 'bg-emerald-500';
};

const getStaffSubtitle = (course) => {
  if (course.docenteTitular) return `Docente: ${course.docenteTitular}`;
  if (course.preceptor) return `Preceptor: ${course.preceptor}`;
  return 'Sin personal asignado';
};

const DivisionModalHeader = ({ course, onClose }) => {
  const displayName = course.nombre || course.nombreCompleto || 'Curso';
  const displayDivision = course.division || 'A';
  const badge = levelBadges[course.nivelId] || levelBadges.primario;
  const staff = getStaffSubtitle(course);

  return (
    <div className="px-6 py-4.5 mt-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
          <span className="material-symbols-outlined text-[22px]">visibility</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">{displayName}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
              División {displayDivision}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {course.aula || 'Aula Principal'} • {course.turno || 'Turno Mañana'} • {staff}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar modal de división"
        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer border-none bg-transparent"
      >
        <span className="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>
  );
};

const DivisionQuickMetrics = ({ course, cupoMax, vacantes }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col">
        <span className="text-[10px] uppercase font-bold text-slate-400">Estado</span>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`w-2 h-2 rounded-full ${course.activo ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
          <span className="font-bold text-slate-800 text-xs">{course.activo ? 'Activa' : 'Pausada'}</span>
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col">
        <span className="text-[10px] uppercase font-bold text-slate-400">Turno</span>
        <span className="font-bold text-slate-800 text-xs mt-1">{course.turno || 'Mañana'}</span>
      </div>

      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col">
        <span className="text-[10px] uppercase font-bold text-slate-400">Cupo Máximo</span>
        <span className="font-bold text-slate-800 text-xs mt-1">{cupoMax} bancas</span>
      </div>

      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col">
        <span className="text-[10px] uppercase font-bold text-slate-400">Vacantes Libres</span>
        <span className={`font-bold text-xs mt-1 ${vacantes === 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
          {vacantes === 0 ? 'Sin cupo' : `${vacantes} libres`}
        </span>
      </div>
    </div>
  );
};

const ViewDivisionModal = ({
  isOpen,
  onClose,
  course,
  enrolledStudents = EMPTY_STUDENTS,
  onEdit,
}) => {
  if (!isOpen || !course) return null;

  const cupoMax = course.cupoMax || 30;
  const totalEnrolled = enrolledStudents.length;
  const percentage = Math.min(100, Math.round((totalEnrolled / cupoMax) * 100));
  const vacantes = Math.max(0, cupoMax - totalEnrolled);
  const isFull = totalEnrolled >= cupoMax;
  const barColor = getProgressBarColor(isFull, percentage);

  return (
    <div
      data-testid="view-division-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <DivisionModalHeader course={course} onClose={onClose} />

        {/* Modal Body - Scrollable */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-600">
          <DivisionQuickMetrics
            course={course}
            cupoMax={cupoMax}
            vacantes={vacantes}
          />

          {/* Occupancy Indicator */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Ocupación de la División</span>
              <span className="font-bold text-slate-900">
                {totalEnrolled} / {cupoMax} ({percentage}%)
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          {course.orientacion && (
            <div className="px-3.5 py-2 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-indigo-500">school</span>
              <span className="text-slate-700 font-medium">
                Orientación: <strong className="text-indigo-900 font-bold">{course.orientacion}</strong>
              </span>
            </div>
          )}

          {/* Listado de Alumnos Inscriptos */}
          <EnrolledStudentsList enrolledStudents={enrolledStudents} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-medium text-slate-400">
            Total matriculado: <strong className="text-slate-700">{totalEnrolled}</strong> alumnos
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border-none bg-transparent"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onEdit) onEdit(course);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Editar División
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDivisionModal;
