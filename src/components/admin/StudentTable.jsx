import React, { useState, useEffect, useRef } from 'react';

const StudentTable = ({
  students = [],
  isLoading = false,
  onEditStudent,
  onGenerateCertificate,
  onDeleteStudent,
  onToggleStatusStudent,
  onResetFilters,
}) => {
  const [activeMenuStudentId, setActiveMenuStudentId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0, openUpwards: false });
  const activeStudent = students.find((s) => s.id === activeMenuStudentId) || null;
  const menuRef = useRef(null);

  // Cerrar menú al hacer clic fuera o al scrollear la ventana
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest('[data-testid^="student-options-container-"]') &&
        !e.target.closest('[data-testid^="student-options-menu-"]')
      ) {
        setActiveMenuStudentId(null);
      }
    };

    const handleScrollOrResize = () => {
      setActiveMenuStudentId(null);
    };

    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, []);
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
          {isLoading ? (
            <tr data-testid="student-loading-row">
              <td colSpan={5} className="py-12 text-center text-slate-400">
                <div data-testid="student-loading-state" className="flex flex-col items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-4xl text-lime-500 animate-spin">
                    sync
                  </span>
                  <p className="font-semibold text-slate-600 text-sm">
                    Cargando alumnos...
                  </p>
                  <p className="text-xs text-slate-400">
                    Sincronizando información académica y tutores
                  </p>
                </div>
              </td>
            </tr>
          ) : students.length === 0 ? (
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

                  {/* Nivel / Curso & División */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col items-start gap-1">
                      <span
                        data-testid={`student-level-${student.id}`}
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] whitespace-nowrap inline-block border ${getBadgeClass(
                          student.badgeVariant,
                          isInactive
                        )}`}
                      >
                        {student.nivel}
                      </span>
                      <span
                        data-testid={`student-course-${student.id}`}
                        className={`text-xs ${
                          student.curso === 'sin asignar' && (!student.division || student.division === 'sin asignar')
                            ? 'text-slate-400 italic'
                            : isInactive
                            ? 'text-slate-400'
                            : 'text-slate-700 font-semibold'
                        }`}
                      >
                        {student.curso === 'sin asignar' && (!student.division || student.division === 'sin asignar')
                          ? 'Sin asignar'
                          : `${student.curso !== 'sin asignar' ? student.curso : ''} ${
                              student.division && student.division !== 'sin asignar'
                                ? `"${student.division}"`
                                : ''
                            }`.trim()}
                      </span>
                    </div>
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

                      {/* Dropdown de Opciones Avanzadas */}
                      <div
                        data-testid={`student-options-container-${student.id}`}
                        className="relative inline-block text-left"
                      >
                        <button
                          data-testid={`student-action-options-${student.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeMenuStudentId === student.id) {
                              setActiveMenuStudentId(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const menuHeight = 175;
                              const spaceBelow = window.innerHeight - rect.bottom;
                              const openUpwards = spaceBelow < menuHeight && rect.top > menuHeight;
                              setMenuPosition({
                                top: openUpwards ? rect.top - menuHeight - 6 : rect.bottom + 6,
                                right: window.innerWidth - rect.right,
                                openUpwards,
                              });
                              setActiveMenuStudentId(student.id);
                            }
                          }}
                          className={`p-1.5 rounded-full transition-colors cursor-pointer border-none ${
                            activeMenuStudentId === student.id
                              ? 'bg-slate-200 text-slate-800 shadow-xs'
                              : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100 bg-transparent'
                          }`}
                          title="Opciones avanzadas"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            more_vert
                          </span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Menú Flotante con Posicionamiento Fijo (Sin quedar atrapado por overflow de la tabla) */}
      {activeStudent && (
        <div
          ref={menuRef}
          data-testid={`student-options-menu-${activeStudent.id}`}
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
            zIndex: 9999,
          }}
          className="w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1.5 animate-in fade-in zoom-in-95 duration-150 text-left divide-y divide-slate-100"
        >
          <div className="py-1">
            {/* Opción 1: Deshabilitar o Reactivar */}
            <button
              data-testid={`student-action-toggle-status-${activeStudent.id}`}
              onClick={(e) => {
                e.stopPropagation();
                const target = activeStudent;
                setActiveMenuStudentId(null);
                onToggleStatusStudent && onToggleStatusStudent(target);
              }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer border-none bg-transparent ${
                activeStudent.estado === 'Baja Administrativa'
                  ? 'text-emerald-700 hover:bg-emerald-50'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                {activeStudent.estado === 'Baja Administrativa' ? 'check_circle' : 'person_off'}
              </span>
              <div className="flex flex-col items-start leading-tight">
                <span>
                  {activeStudent.estado === 'Baja Administrativa'
                    ? 'Reactivar Alumno'
                    : 'Deshabilitar Alumno'}
                </span>
                <span className="text-[10px] font-normal text-slate-400">
                  {activeStudent.estado === 'Baja Administrativa'
                    ? 'Restaurar regularidad activa'
                    : 'Pasa a baja administrativa'}
                </span>
              </div>
            </button>

            {/* Opción 2: Editar Legajo */}
            <button
              data-testid={`student-menu-edit-${activeStudent.id}`}
              onClick={(e) => {
                e.stopPropagation();
                const target = activeStudent;
                setActiveMenuStudentId(null);
                onEditStudent && onEditStudent(target);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
              type="button"
            >
              <span className="material-symbols-outlined text-slate-400 text-[18px]">
                edit_note
              </span>
              <div className="flex flex-col items-start leading-tight">
                <span>Editar Legajo</span>
                <span className="text-[10px] font-normal text-slate-400">
                  Modificar datos del alumno
                </span>
              </div>
            </button>
          </div>

          {/* Opción 3: Borrar alumno / Eliminar legajo definitivamente */}
          <div className="py-1">
            <button
              data-testid={`student-action-delete-${activeStudent.id}`}
              onClick={(e) => {
                e.stopPropagation();
                const target = activeStudent;
                setActiveMenuStudentId(null);
                onDeleteStudent && onDeleteStudent(target);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-red-500">
                delete_forever
              </span>
              <div className="flex flex-col items-start leading-tight">
                <span>Borrar Alumno</span>
                <span className="text-[10px] font-normal text-red-400">
                  Eliminar legajo definitivamente
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
