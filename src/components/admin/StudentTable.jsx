import React from 'react';

const StudentTable = ({
  students = [],
  onEditStudent,
  onGenerateCertificate,
  onDeleteStudent,
  onResetFilters,
}) => {
  const getBadgeClass = (variant, isInactive) => {
    if (isInactive) {
      return 'bg-slate-100 text-slate-500 border-slate-200/70';
    }
    switch (variant) {
      case 'sky':
        return 'bg-sky-50 text-sky-800 border-sky-200/60';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200/60';
      case 'lime':
        return 'bg-lime-100/70 text-lime-900 border-lime-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div data-testid="student-table-wrapper" className="overflow-x-auto">
      <table data-testid="student-table" className="w-full text-left border-collapse">
        <thead data-testid="student-table-head">
          <tr className="bg-slate-50/80 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-100">
            <th className="py-4 px-6 font-bold text-slate-500 whitespace-nowrap min-w-[130px]">
              Legajo
            </th>
            <th className="py-4 px-6 font-bold text-slate-500 w-36">DNI</th>
            <th className="py-4 px-6 font-bold text-slate-500">Alumno &amp; Tutor</th>
            <th className="py-4 px-6 font-bold text-slate-500 w-64">Nivel / Curso</th>
            <th className="py-4 px-6 font-bold text-slate-500 text-right w-48">
              Acciones Directas
            </th>
          </tr>
        </thead>
        <tbody data-testid="student-table-body" className="divide-y divide-slate-100 text-xs text-slate-700">
          {students.length === 0 ? (
            <tr data-testid="student-empty-row">
              <td colSpan={5} className="py-12 text-center text-slate-400">
                <div data-testid="student-empty-state" className="flex flex-col items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-4xl text-slate-300">
                    person_search
                  </span>
                  <p className="font-semibold text-slate-600 text-sm">
                    No se encontraron legajos con los filtros seleccionados
                  </p>
                  <p className="text-xs text-slate-400">
                    Prueba cambiando el término de búsqueda o restableciendo los filtros.
                  </p>
                  {onResetFilters && (
                    <button
                      data-testid="empty-reset-filters-button"
                      onClick={onResetFilters}
                      className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-xs transition-colors cursor-pointer border-none"
                    >
                      Restablecer filtros
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            students.map((student, index) => {
              const isInactive =
                student.isInactive || student.estado === 'Baja Administrativa';

              return (
                <tr
                  key={student.id || student.legajo}
                  data-testid={`student-row-${student.id}`}
                  className={`hover:bg-lime-50/20 transition-colors group ${
                    index % 2 === 1 ? 'bg-slate-50/40' : ''
                  } ${isInactive ? 'opacity-75' : ''}`}
                >
                  {/* Legajo */}
                  <td className="py-4 px-6 whitespace-nowrap min-w-[130px]">
                    <span
                      data-testid={`student-legajo-${student.id}`}
                      className={`whitespace-nowrap font-mono text-xs font-bold rounded-lg px-2.5 py-1 inline-block border ${
                        isInactive
                          ? 'text-slate-500 bg-slate-100 border-slate-200/70'
                          : 'text-blue-700 bg-blue-50/70 border-blue-100'
                      }`}
                    >
                      {student.legajo}
                    </span>
                  </td>

                  {/* DNI */}
                  <td
                    data-testid={`student-dni-${student.id}`}
                    className={`py-4 px-6 font-mono font-medium ${
                      isInactive ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {student.dni}
                  </td>

                  {/* Alumno & Tutor */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {isInactive ? (
                        <div
                          data-testid={`student-avatar-${student.id}`}
                          className="w-9 h-9 rounded-full bg-slate-200 text-slate-500 text-xs flex items-center justify-center font-bold shrink-0"
                        >
                          {student.initials}
                        </div>
                      ) : (
                        <div
                          data-testid={`student-avatar-${student.id}`}
                          className={`w-9 h-9 rounded-full bg-gradient-to-tr ${student.avatarGradient} text-white text-xs flex items-center justify-center font-bold shadow-sm shrink-0`}
                        >
                          {student.initials}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span
                          data-testid={`student-name-${student.id}`}
                          className={`font-bold truncate transition-colors ${
                            isInactive
                              ? 'text-slate-400 line-through'
                              : 'text-slate-800 group-hover:text-blue-600'
                          }`}
                        >
                          {student.nombre}
                        </span>
                        <span
                          data-testid={`student-tutor-${student.id}`}
                          className="text-[11px] text-slate-400 font-medium truncate"
                        >
                          {student.tutorTelefono
                            ? `Tutor: ${student.tutorNombre} · ${student.tutorTelefono}`
                            : student.tutorNombre}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Nivel / Curso */}
                  <td className="py-4 px-6">
                    <span
                      data-testid={`student-course-${student.id}`}
                      className={`px-3 py-1 rounded-full font-bold text-[11px] whitespace-nowrap inline-block border ${getBadgeClass(
                        student.badgeVariant,
                        isInactive
                      )}`}
                    >
                      {student.cursoDisplay || `${student.nivel} - ${student.curso}`}
                    </span>
                  </td>

                  {/* Acciones Directas */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        data-testid={`student-action-edit-${student.id}`}
                        onClick={() => onEditStudent && onEditStudent(student)}
                        className="p-1.5 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer border-none bg-transparent"
                        title="Editar Legajo"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          edit
                        </span>
                      </button>

                      <button
                        data-testid={`student-action-certificate-${student.id}`}
                        onClick={() =>
                          onGenerateCertificate && onGenerateCertificate(student)
                        }
                        className="p-1.5 rounded-full text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-colors cursor-pointer border-none bg-transparent"
                        title="Constancia Regular (PDF)"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          description
                        </span>
                      </button>

                      {isInactive ? (
                        <button
                          data-testid={`student-action-delete-${student.id}`}
                          onClick={() => onDeleteStudent && onDeleteStudent(student)}
                          className="p-1.5 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent"
                          title="Dar de baja definitiva"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete_forever
                          </span>
                        </button>
                      ) : (
                        <button
                          data-testid={`student-action-options-${student.id}`}
                          className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
                          title="Opciones avanzadas"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            more_vert
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
