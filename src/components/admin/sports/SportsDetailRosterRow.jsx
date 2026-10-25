import React from 'react';

export const SportsDetailRosterRow = ({
  student,
  onViewLegajo,
  onTransferStudent,
}) => {
  const isPendingMedical = student.condicionTipo === 'pendiente';
  const isScholarship = student.condicionTipo === 'becado';

  return (
    <tr
      key={student.id}
      data-testid={`roster-row-${student.id}`}
      className="hover:bg-slate-50 transition-colors"
    >
      {/* Legajo */}
      <td className="px-6 py-4 font-mono font-bold text-primary">
        {student.legajo}
      </td>

      {/* Alumno */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-tr ${
              student.avatarGrad || 'from-blue-600 to-indigo-500'
            } text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm`}
          >
            {student.iniciales || 'AL'}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 truncate">{student.nombre}</p>
            <span className="text-[10px] text-slate-400 font-medium">
              DNI {student.dni}
            </span>
          </div>
        </div>
      </td>

      {/* Nivel & Curso */}
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
          {student.cursoCompleto}
        </span>
      </td>

      {/* Tutor Responsable */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 truncate">{student.tutor}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {student.tutorTelefono}
          </span>
        </div>
      </td>

      {/* Inscripción */}
      <td className="px-6 py-4 font-mono text-slate-500 font-medium">
        {student.fechaInscripcion}
      </td>

      {/* Condición Deportiva */}
      <td className="px-6 py-4">
        {isPendingMedical ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/30 text-tertiary font-bold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            Apto Médico Pendiente
          </span>
        ) : isScholarship ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/50 text-secondary-dim text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            Regular • Becado 100%
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/50 text-secondary-dim text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            Regular • Al día
          </span>
        )}
      </td>

      {/* Acciones */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onViewLegajo(student)}
            data-testid={`btn-view-legajo-${student.id}`}
            title="Ver Legajo"
            aria-label={`Ver legajo de ${student.nombre}`}
            className="p-1.5 rounded-lg text-primary hover:bg-primary-container/20 transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-lg">visibility</span>
          </button>

          <button
            type="button"
            onClick={() => onTransferStudent(student)}
            data-testid={`btn-withdraw-${student.id}`}
            title="Dar de baja / Transferir"
            aria-label={`Dar de baja o transferir a ${student.nombre}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-error hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-lg">swap_horiz</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default SportsDetailRosterRow;
