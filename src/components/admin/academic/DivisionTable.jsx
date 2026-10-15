import React, { useState, useRef, useEffect, useMemo } from 'react';
import { parseCourseDivision } from '../../../data/mockAcademicOffer';
import { getEnrolledStudentsForCourse } from '../../../utils/academicUtils';

const DivisionRowMenu = ({
  course,
  enrolledStudents = [],
  menuRef,
  menuPosition,
  onClose,
  onView,
  onEdit,
  onDelete,
}) => {
  if (!course) return null;

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${menuPosition.top}px`,
        right: `${menuPosition.right}px`,
        zIndex: 9999,
      }}
      className="w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1.5 animate-in fade-in zoom-in-95 duration-150 text-left divide-y divide-slate-100"
    >
      <div className="py-1">
        {/* Opción 1: Visualizar división */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            onView(course, enrolledStudents);
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-[18px] text-blue-600">visibility</span>
          <div className="flex flex-col items-start leading-tight">
            <span>Visualizar división</span>
            <span className="text-[10px] font-normal text-slate-400">
              Ver nómina ({enrolledStudents.length} alumnos)
            </span>
          </div>
        </button>

        {/* Opción 2: Editar división */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            onEdit(course);
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-[18px] text-indigo-600">edit</span>
          <div className="flex flex-col items-start leading-tight">
            <span>Editar división</span>
            <span className="text-[10px] font-normal text-slate-400">Modificar cupos y turno</span>
          </div>
        </button>
      </div>

      {/* Opción 3: Borrar división */}
      <div className="py-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            onDelete(course);
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-[18px] text-rose-500">delete</span>
          <div className="flex flex-col items-start leading-tight">
            <span>Borrar división</span>
            <span className="text-[10px] font-normal text-rose-400">
              {enrolledStudents.length > 0 ? `${enrolledStudents.length} pasarán a sin asignar` : 'Eliminar de la oferta'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

const DivisionTable = ({
  level,
  courses = [],
  students = [],
  onToggleStatus,
  onEditCourse,
  onViewCourse,
  onDeleteCourse,
  onAddNewDivision,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Floating Actions Menu state
  const [activeMenuCourseId, setActiveMenuCourseId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const menuRef = useRef(null);

  // Close menu on outside click or scroll
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuCourseId(null);
      }
    };
    const handleScroll = () => {
      if (activeMenuCourseId) setActiveMenuCourseId(null);
    };

    if (activeMenuCourseId) {
      document.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [activeMenuCourseId]);

  const handleOpenMenu = (e, course) => {
    e.stopPropagation();
    if (activeMenuCourseId === course.id) {
      setActiveMenuCourseId(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
    });
    setActiveMenuCourseId(course.id);
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const { nombre, division } = parseCourseDivision(c);
      const query = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !query ||
        nombre.toLowerCase().includes(query) ||
        division.toLowerCase().includes(query) ||
        (c.turno && c.turno.toLowerCase().includes(query)) ||
        (c.aula && c.aula.toLowerCase().includes(query)) ||
        (c.docenteTitular && c.docenteTitular.toLowerCase().includes(query));

      const matchesShift =
        shiftFilter === 'all' ||
        (shiftFilter === 'manana' && !c.turno?.toLowerCase().includes('tarde')) ||
        (shiftFilter === 'tarde' && c.turno?.toLowerCase().includes('tarde'));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && c.activo) ||
        (statusFilter === 'inactive' && !c.activo);

      return matchesSearch && matchesShift && matchesStatus;
    });
  }, [courses, searchTerm, shiftFilter, statusFilter]);

  // Level statistics dynamically computed from actual student enrollments
  const stats = useMemo(() => {
    const totalDivisions = courses.length;
    const totalCapacity = courses.reduce((acc, c) => acc + (c.cupoMax || 0), 0);
    const totalEnrolled = courses.reduce(
      (acc, c) => acc + getEnrolledStudentsForCourse(students, c).length,
      0
    );
    const activeDivisions = courses.filter((c) => c.activo).length;
    const occupancyRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

    return {
      totalDivisions,
      totalCapacity,
      totalEnrolled,
      activeDivisions,
      occupancyRate,
    };
  }, [courses, students]);

  const activeMenuCourse = courses.find((c) => c.id === activeMenuCourseId);
  const activeMenuEnrolledStudents = activeMenuCourse
    ? getEnrolledStudentsForCourse(students, activeMenuCourse)
    : [];

  return (
    <div className="space-y-5 animate-in fade-in duration-200" data-testid={`division-table-${level?.id}`}>
      {/* Level Summary Banner & Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[20px]">class</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Total Divisiones</span>
            <span className="text-base font-extrabold text-slate-900">{stats.totalDivisions}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Alumnos Inscriptos</span>
            <span className="text-base font-extrabold text-slate-900">
              {stats.totalEnrolled}{' '}
              <span className="text-xs font-normal text-slate-400">/ {stats.totalCapacity}</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[20px]">pie_chart</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Tasa de Ocupación</span>
            <span className="text-base font-extrabold text-slate-900">{stats.occupancyRate}%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Divisiones Activas</span>
            <span className="text-base font-extrabold text-slate-900">
              {stats.activeDivisions}{' '}
              <span className="text-xs font-normal text-slate-400">/ {stats.totalDivisions}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Action Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por curso, división, aula..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Shift Filter */}
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Todos los turnos</option>
            <option value="manana">Mañana</option>
            <option value="tarde">Tarde</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="inactive">Pausadas</option>
          </select>

          {/* New Division CTA */}
          <button
            type="button"
            onClick={onAddNewDivision}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer ml-auto"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Nueva División</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_18px_rgba(15,23,42,0.03)] overflow-hidden">
        {filteredCourses.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">search_off</span>
            </div>
            <h4 className="text-sm font-bold text-slate-700">No se encontraron divisiones</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              No hay registros que coincidan con los filtros aplicados en este nivel educativo.
            </p>
            {(searchTerm || shiftFilter !== 'all' || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setShiftFilter('all');
                  setStatusFilter('all');
                }}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-6 font-semibold" scope="col">
                    Nombre / Curso
                  </th>
                  <th className="py-3.5 px-6 font-semibold" scope="col">
                    División
                  </th>
                  <th className="py-3.5 px-6 font-semibold" scope="col">
                    Turno
                  </th>
                  <th className="py-3.5 px-6 font-semibold" scope="col">
                    Ocupación
                  </th>
                  <th className="py-3.5 px-6 font-semibold text-center" scope="col">
                    Estado
                  </th>
                  <th className="py-3.5 px-6 font-semibold text-right" scope="col">
                    Más Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredCourses.map((course) => {
                  const { nombre, division } = parseCourseDivision(course);
                  const enrolledStudents = getEnrolledStudentsForCourse(students, course);
                  const cupoOcupado = enrolledStudents.length;
                  const cupoMax = course.cupoMax || 30;
                  const percentage = Math.min(100, Math.round((cupoOcupado / cupoMax) * 100));
                  const isFull = cupoOcupado >= cupoMax;
                  const vacantes = Math.max(0, cupoMax - cupoOcupado);
                  const isTurnoTarde = course.turno?.toLowerCase().includes('tarde');

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
                            <span className="material-symbols-outlined text-[18px]">
                              {level?.id === 'inicial'
                                ? 'toys'
                                : level?.id === 'primario'
                                ? 'school'
                                : 'history_edu'}
                            </span>
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
                          <span
                            className={`material-symbols-outlined text-[15px] ${
                              isTurnoTarde ? 'text-amber-500' : 'text-blue-500'
                            }`}
                          >
                            {isTurnoTarde ? 'wb_twilight' : 'wb_sunny'}
                          </span>
                          <span>{isTurnoTarde ? 'Tarde' : 'Mañana'}</span>
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
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                                isFull
                                  ? 'bg-rose-50 text-rose-600'
                                  : percentage >= 85
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {isFull ? 'Lleno' : `${vacantes} vac.`}
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFull
                                  ? 'bg-rose-500'
                                  : percentage >= 85
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
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
                          onClick={(e) => handleOpenMenu(e, course)}
                          data-testid={`btn-more-actions-${course.id}`}
                          title="Más acciones"
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            activeMenuCourseId === course.id
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Floating Actions Menu for Course */}
      <DivisionRowMenu
        course={activeMenuCourse}
        enrolledStudents={activeMenuEnrolledStudents}
        menuRef={menuRef}
        menuPosition={menuPosition}
        onClose={() => setActiveMenuCourseId(null)}
        onView={onViewCourse}
        onEdit={onEditCourse}
        onDelete={onDeleteCourse}
      />
    </div>
  );
};

export default DivisionTable;
