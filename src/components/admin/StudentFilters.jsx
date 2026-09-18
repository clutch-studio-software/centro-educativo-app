import React, { useRef, useEffect, useMemo } from 'react';
import { DEFAULT_ACADEMIC_OFFER } from '../../services/adminService';

const StudentFilters = ({
  searchQuery,
  onSearchChange,
  levelFilter,
  onLevelChange,
  courseFilter,
  onCourseChange,
  divisionFilter = 'todos',
  onDivisionChange = () => {},
  statusFilter,
  onStatusChange,
  serviceFilter,
  onServiceChange,
  onResetFilters,
  academicOffer = DEFAULT_ACADEMIC_OFFER,
}) => {
  const searchInputRef = useRef(null);

  // Keyboard shortcut: Ctrl+K / Cmd+K to focus search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cursos disponibles según el nivel seleccionado
  const coursesByLevel = useMemo(() => {
    if (levelFilter === 'todos') {
      return academicOffer || {};
    }
    return {
      [levelFilter]: academicOffer?.[levelFilter] || {},
    };
  }, [academicOffer, levelFilter]);

  // Divisiones disponibles según el curso o nivel seleccionado
  const availableDivisions = useMemo(() => {
    if (courseFilter === 'todos' || courseFilter === 'sin asignar') {
      // Si hay un nivel seleccionado, recopilar todas las divisiones únicas de ese nivel
      if (levelFilter !== 'todos' && academicOffer?.[levelFilter]) {
        const divs = new Set();
        Object.values(academicOffer[levelFilter]).forEach((divList) => {
          if (Array.isArray(divList)) divList.forEach((d) => divs.add(d));
        });
        return Array.from(divs);
      }
      return [];
    }

    // Curso específico seleccionado
    let divs = [];
    if (levelFilter !== 'todos' && academicOffer?.[levelFilter]?.[courseFilter]) {
      divs = academicOffer[levelFilter][courseFilter];
    } else {
      for (const lvl of Object.keys(academicOffer || {})) {
        if (academicOffer[lvl]?.[courseFilter]) {
          divs = academicOffer[lvl][courseFilter];
          break;
        }
      }
    }
    return Array.isArray(divs) ? divs : [];
  }, [academicOffer, levelFilter, courseFilter]);

  return (
    <section
      data-testid="student-filters-section"
      className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 flex flex-col gap-3"
    >
      {/* Fila 1: Búsqueda Rápida y Nivel Educativo */}
      <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4 w-full">
        {/* Input de Búsqueda */}
        <div className="flex flex-col gap-1 flex-1 min-w-[260px]">
          <label htmlFor="student-search-input" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Búsqueda Rápida
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              id="student-search-input"
              ref={searchInputRef}
              data-testid="student-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por alumno, tutor, legajo o DNI..."
              className="w-full h-9 pl-10 pr-16 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white shadow-xs transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-wider shadow-xs select-none pointer-events-none text-xs">
              Ctrl+K
            </kbd>
          </div>
        </div>

        {/* Nivel Educativo */}
        <div className="flex flex-col gap-1 w-full md:w-64 shrink-0">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Nivel Educativo
          </label>
          <select
            data-testid="student-level-select"
            value={levelFilter}
            onChange={(e) => onLevelChange(e.target.value)}
            className="w-full h-9 px-3 bg-slate-50 hover:bg-slate-100/80 text-slate-800 font-semibold text-xs rounded-full border border-slate-200 outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white shadow-xs transition-all cursor-pointer"
          >
            <option value="todos">Todos los Niveles</option>
            <option value="Inicial">Nivel Inicial</option>
            <option value="Primario">Nivel Primario</option>
            <option value="Secundario">Nivel Secundario</option>
          </select>
        </div>
      </div>

      {/* Fila 2: Curso, División, Estado Alumno, Servicios Asignados y Botón Limpiar */}
      <div className="flex flex-wrap items-end justify-between gap-4 pt-1 border-t border-slate-100/80 w-full">
        <div className="flex flex-wrap items-end gap-3 flex-1 min-w-0">
          {/* Curso (Filtrado según nivel seleccionado) */}
          <div className="flex flex-col gap-1 min-w-[170px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Curso {levelFilter !== 'todos' ? `(${levelFilter})` : ''}
            </label>
            <select
              data-testid="student-course-select"
              value={courseFilter}
              onChange={(e) => onCourseChange(e.target.value)}
              className="h-9 px-3 bg-slate-50 hover:bg-slate-100/80 text-slate-800 font-semibold text-xs rounded-full border border-slate-200 outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white shadow-xs transition-all cursor-pointer"
            >
              <option value="todos">
                {levelFilter === 'todos' ? 'Todos los cursos' : `Todos los cursos (${levelFilter})`}
              </option>
              <option value="sin asignar">Sin asignar</option>
              {levelFilter === 'todos' ? (
                Object.entries(coursesByLevel).map(([nivelKey, cursosObj]) => (
                  <optgroup key={nivelKey} label={`Nivel ${nivelKey}`}>
                    {Object.keys(cursosObj).map((cursoName) => (
                      <option key={cursoName} value={cursoName}>
                        {cursoName}
                      </option>
                    ))}
                  </optgroup>
                ))
              ) : (
                Object.keys(coursesByLevel[levelFilter] || {}).map((cursoName) => (
                  <option key={cursoName} value={cursoName}>
                    {cursoName}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* División / Sala (Dependiente del curso) */}
          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              División / Sala
            </label>
            <select
              data-testid="student-division-select"
              value={divisionFilter}
              onChange={(e) => onDivisionChange(e.target.value)}
              disabled={courseFilter === 'todos' && levelFilter === 'todos'}
              className={`h-9 px-3 text-slate-800 font-semibold text-xs rounded-full border border-slate-200 outline-none focus:ring-2 focus:ring-lime-400 shadow-xs transition-all ${
                courseFilter === 'todos' && levelFilter === 'todos'
                  ? 'bg-slate-100/60 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-50 hover:bg-slate-100/80 cursor-pointer focus:bg-white'
              }`}
            >
              <option value="todos">
                {courseFilter === 'todos' && levelFilter === 'todos'
                  ? 'Elegir curso...'
                  : 'Todas las divisiones'}
              </option>
              {availableDivisions.map((divName) => (
                <option key={divName} value={divName}>
                  {divName.toLowerCase().startsWith('sala') ? divName : `División "${divName}"`}
                </option>
              ))}
            </select>
          </div>

          {/* Estado Administrativo */}
          <div className="flex flex-col gap-1 min-w-[170px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Estado Alumno
            </label>
            <select
              data-testid="student-status-select"
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="h-9 px-3 bg-slate-50 hover:bg-slate-100/80 text-slate-800 font-semibold text-xs rounded-full border border-slate-200 outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white shadow-xs transition-all cursor-pointer"
            >
              <option value="todos">Todos los Estados</option>
              <option value="Activo - Regular">Activo - Regular</option>
              <option value="Documentación Pendiente">Documentación Pendiente</option>
              <option value="Con Deuda Arancelaria">Con Deuda Arancelaria</option>
              <option value="Baja Administrativa">Baja Administrativa</option>
            </select>
          </div>

          {/* Servicios Asignados */}
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Servicios Asignados
            </label>
            <select
              data-testid="student-service-select"
              value={serviceFilter}
              onChange={(e) => onServiceChange(e.target.value)}
              className="h-9 px-3 bg-slate-50 hover:bg-slate-100/80 text-slate-800 font-semibold text-xs rounded-full border border-slate-200 outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white shadow-xs transition-all cursor-pointer"
            >
              <option value="todos">Todos los Servicios</option>
              <option value="Comedor Escolar">Comedor Escolar</option>
              <option value="Transporte">Transporte Escolar</option>
              <option value="Club Deportivo">Club Deportivo</option>
              <option value="Jornada Extendida">Jornada Extendida</option>
              <option value="Robótica & Programación">Robótica & Programación</option>
            </select>
          </div>
        </div>

        {/* Botón Limpiar Filtros */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            data-testid="student-reset-filters-button"
            onClick={onResetFilters}
            type="button"
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer border-none bg-transparent"
            title="Restablecer filtros"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            <span className="hidden md:inline">Limpiar</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default StudentFilters;
