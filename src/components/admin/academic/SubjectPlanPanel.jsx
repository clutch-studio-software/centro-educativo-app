import React, { useState, useMemo } from 'react';

const PAGE_SIZE = 5;

const SubjectPlanPanel = ({
  courses,
  subjects,
  selectedCourseId,
  onCourseChange,
  onToggleDictado,
  onReassignTeacher,
  onAddNewSubject,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Filter subjects for the selected course
  const currentCourseSubjects = useMemo(() => {
    return subjects.filter((s) => s.cursoId === selectedCourseId);
  }, [subjects, selectedCourseId]);

  // Pagination
  const totalItems = currentCourseSubjects.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedSubjects = currentCourseSubjects.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div
      data-testid="integrated-subjects-panel"
      data-purpose="integrated-subjects-panel"
      id="viewPlanes"
      className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.025)] overflow-hidden"
    >
      {/* Panel Header Filter Toolbar */}
      <div className="px-6 py-4.5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Planes Curriculares &amp; Designación Docente
            </h3>
            <p className="text-xs text-slate-400">
              Asignaciones directas del curso: <span className="font-semibold text-slate-600">{selectedCourse?.nombre || 'Seleccionado'}</span>
            </p>
          </div>
        </div>

        {/* Selector de Cursos */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-slate-500 whitespace-nowrap" htmlFor="cursoSelector">
            Seleccionar Curso:
          </label>
          <select
            id="cursoSelector"
            data-testid="academic-course-selector"
            value={selectedCourseId}
            onChange={(e) => {
              onCourseChange(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} {c.orientacion ? `- ${c.orientacion}` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de Asignaciones y Materias */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 border-b border-slate-100">
              <th className="py-3.5 pl-6 pr-4" scope="col">
                Materia / Unidad Curricular
              </th>
              <th className="py-3.5 px-4" scope="col">
                Carga Horaria
              </th>
              <th className="py-3.5 px-4" scope="col">
                Profesor / Docente Responsable
              </th>
              <th className="py-3.5 px-4 text-center" scope="col">
                Dictado
              </th>
              <th className="py-3.5 pr-6 pl-4 text-right" scope="col">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {paginatedSubjects.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[32px] text-slate-300">
                      menu_book
                    </span>
                    <p className="font-medium text-slate-600 text-sm">
                      No hay materias asignadas en este curso todavía.
                    </p>
                    <button
                      type="button"
                      onClick={onAddNewSubject}
                      className="mt-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      + Asignar primera materia
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedSubjects.map((subject) => {
                const { id, nombre, cargaHoraria, profesor, dictadoActivo } = subject;
                return (
                  <tr key={id} data-testid={`subject-row-${id}`} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-6 pr-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                        <span>{nombre}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 whitespace-nowrap">
                        {cargaHoraria}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`relative w-7 h-7 rounded-full ${
                            profesor?.avatarBg || 'bg-indigo-100 text-indigo-700'
                          } flex items-center justify-center text-[10px] font-bold shrink-0`}
                        >
                          {profesor?.initials || 'DC'}
                          <span
                            className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-white ${
                              profesor?.online !== false ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          ></span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 leading-tight truncate">
                            {profesor?.nombre || 'Sin Docente'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Legajo: {profesor?.legajo || '#S/D'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <label
                        className="relative inline-flex items-center cursor-pointer"
                        title={dictadoActivo ? 'Pausar dictado' : 'Activar dictado'}
                      >
                        <input
                          type="checkbox"
                          checked={dictadoActivo}
                          onChange={() => onToggleDictado(subject)}
                          className="sr-only peer"
                        />
                        <div className="w-7 h-3.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </td>
                    <td className="py-3.5 pr-6 pl-4 text-right">
                      <button
                        type="button"
                        onClick={() => onReassignTeacher(subject)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50/50 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        title="Reasignar docente a cargo"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                          ></path>
                        </svg>
                        Reasignar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer / Pagination */}
      {totalItems > 0 && (
        <div className="px-6 py-3.5 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Mostrando {paginatedSubjects.length} de {totalItems} asignaturas curriculares
          </span>
          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 bg-white font-medium hover:bg-slate-50 text-slate-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg border border-slate-200 bg-white font-medium hover:bg-slate-50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectPlanPanel;
