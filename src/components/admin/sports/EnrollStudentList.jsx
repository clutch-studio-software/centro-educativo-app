import React from 'react';
import { isAlreadyEnrolled } from './useStudentEnrollmentSearch';

export const EnrollStudentCard = ({
  student,
  isSelected,
  alreadyEnrolled,
  isFull,
  onSelect,
}) => {
  return (
    <button
      type="button"
      disabled={alreadyEnrolled || isFull}
      onClick={() => onSelect(student)}
      aria-pressed={isSelected}
      aria-label={`Seleccionar alumno ${student.nombre}`}
      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 text-left w-full ${
        alreadyEnrolled
          ? 'bg-slate-50/70 border-slate-200 opacity-60 cursor-not-allowed'
          : isSelected
          ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 cursor-pointer shadow-xs'
          : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
            isSelected
              ? 'border-blue-600 bg-blue-600 text-white'
              : alreadyEnrolled
              ? 'border-slate-300 bg-slate-200'
              : 'border-slate-300 bg-white'
          }`}
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

      <div className="shrink-0 text-right">
        {alreadyEnrolled ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
            <span className="material-symbols-outlined text-[12px]">check_circle</span>
            Ya inscripto
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
            {student.estado || 'Regular'}
          </span>
        )}
      </div>
    </button>
  );
};

export const EnrollStudentList = ({
  students,
  enrolledStudents,
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
            isFull={isFull}
            onSelect={onSelectStudent}
          />
        );
      })}
    </div>
  );
};

export default EnrollStudentList;
