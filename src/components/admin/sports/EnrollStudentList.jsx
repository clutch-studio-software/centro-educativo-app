import React from 'react';
import { isAlreadyEnrolled } from './useStudentEnrollmentSearch';
import { getStudentEnrolledActivitiesCount } from './sportsScheduleUtils';

const EMPTY_DISCIPLINES = [];

const getCardButtonClasses = (alreadyEnrolled, isMaxReached, isSelected) => {
  if (alreadyEnrolled) {
    return 'bg-slate-50/70 border-slate-200 opacity-60 cursor-not-allowed';
  }
  if (isMaxReached) {
    return 'bg-rose-50/40 border-rose-200 opacity-70 cursor-not-allowed';
  }
  if (isSelected) {
    return 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 cursor-pointer shadow-xs';
  }
  return 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 cursor-pointer';
};

const getRadioIconClasses = (isSelected, isDisabled) => {
  if (isSelected) return 'border-blue-600 bg-blue-600 text-white';
  if (isDisabled) return 'border-slate-300 bg-slate-200';
  return 'border-slate-300 bg-white';
};

const EnrollStudentActivityStatusBadge = ({ alreadyEnrolled, isMaxReached, enrolledCount }) => {
  if (alreadyEnrolled) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
        <span className="material-symbols-outlined text-[12px]">check_circle</span>
        Ya inscripto
      </span>
    );
  }
  if (isMaxReached) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
        <span className="material-symbols-outlined text-[12px]">block</span>
        Límite alcanzado (2/2)
      </span>
    );
  }
  const isOne = enrolledCount === 1;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
        isOne
          ? 'bg-amber-50 text-amber-800 border-amber-200'
          : 'bg-slate-100 text-slate-600 border-slate-200/80'
      }`}
    >
      {isOne ? '1/2 actividad' : '0/2 actividades'}
    </span>
  );
};

export const EnrollStudentCard = ({
  student,
  isSelected,
  alreadyEnrolled,
  allDisciplines = EMPTY_DISCIPLINES,
  isFull,
  onSelect,
}) => {
  const enrolledCount = getStudentEnrolledActivitiesCount(student, allDisciplines);
  const isMaxReached = enrolledCount >= 2;
  const isDisabled = alreadyEnrolled || isMaxReached || isFull;

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => onSelect(student)}
      aria-pressed={isSelected}
      aria-label={`Seleccionar alumno ${student.nombre}`}
      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 text-left w-full ${getCardButtonClasses(
        alreadyEnrolled,
        isMaxReached,
        isSelected
      )}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${getRadioIconClasses(
            isSelected,
            alreadyEnrolled || isMaxReached
          )}`}
        >
          {isSelected && (
            <span className="material-symbols-outlined text-[14px]">check</span>
          )}
        </div>

        <div
          className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${
            student.avatarGradient || 'from-blue-600 to-indigo-500'
          } text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs`}
        >
          {student.initials || 'AL'}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-900 text-xs truncate">
              {student.nombre}
            </span>
            <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold">
              {student.legajo}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              DNI {student.dni}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              {student.cursoDisplay || `${student.nivel} - ${student.curso}`}
            </span>
            {student.tutorNombre && (
              <span className="truncate">
                Tutor: {student.tutorNombre.split('(')[0].trim()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 flex flex-col items-end gap-1">
        <EnrollStudentActivityStatusBadge
          alreadyEnrolled={alreadyEnrolled}
          isMaxReached={isMaxReached}
          enrolledCount={enrolledCount}
        />
      </div>
    </button>
  );
};

export const EnrollStudentList = ({
  students,
  enrolledStudents,
  allDisciplines = EMPTY_DISCIPLINES,
  selectedStudent,
  isFull,
  configuredLevels,
  onSelectStudent,
}) => {
  if (students.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 space-y-2">
        <span className="material-symbols-outlined text-3xl text-slate-400">person_off</span>
        <p className="font-bold text-slate-700">No se encontraron alumnos disponibles</p>
        <p className="text-[11px] max-w-sm mx-auto">
          No hay estudiantes que coincidan con la búsqueda dentro de los niveles autorizados ({configuredLevels}).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
      {students.map((student) => {
        const alreadyEnrolled = isAlreadyEnrolled(student, enrolledStudents);
        const isSelected = selectedStudent?.id === student.id;

        return (
          <EnrollStudentCard
            key={student.id}
            student={student}
            isSelected={isSelected}
            alreadyEnrolled={alreadyEnrolled}
            allDisciplines={allDisciplines}
            isFull={isFull}
            onSelect={onSelectStudent}
          />
        );
      })}
    </div>
  );
};

export default EnrollStudentList;

