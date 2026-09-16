import React, { useRef, useEffect } from 'react';

const StudentFilters = ({
  searchQuery,
  onSearchChange,
  levelFilter,
  onLevelChange,
  courseFilter,
  onCourseChange,
  statusFilter,
  onStatusChange,
  serviceFilter,
  onServiceChange,
  onResetFilters,
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

  return (
    <section
      data-testid="student-filters-section"
      className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 flex flex-col gap-3"
    >
      {/* Fila 1: Búsqueda Rápida y Nivel Educativo */}
      <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4 w-full">
        {/* Input de Búsqueda */}
        <div className="flex flex-col gap-1 flex-1 min-w-[260px]">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Búsqueda Rápida
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              ref={searchInputRef}
              data-testid="student-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por DNI, Legajo, Apellido..."
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

      {/* Fila 2: Curso / División, Estado Alumno, Servicios Asignados y Botón Limpiar */}
      <div className="flex flex-wrap items-end justify-between gap-4 pt-1 border-t border-slate-100/80 w-full">
        <div className="flex flex-wrap items-end gap-4 flex-1 min-w-0">
          {/* Curso y División */}
          <div className="flex flex-col gap-1 min-w-[180px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Curso / División
            </label>
            <select
              data-testid="student-course-select"
              value={courseFilter}
              onChange={(e) => onCourseChange(e.target.value)}
              className="h-9 px-3 bg-slate-50 hover:bg-slate-100/80 text-slate-800 font-semibold text-xs rounded-full border border-slate-200 outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white shadow-xs transition-all cursor-pointer"
            >
              <option value="todos">Todos los cursos</option>
              <option value="sin asignar">Sin asignar</option>
              <optgroup label="Nivel Inicial">
                <option value="Sala de 2 Años">Sala de 2 Años</option>
                <option value="Sala de 3 Años">Sala de 3 Años</option>
                <option value="Sala de 4 Años">Sala de 4 Años</option>
                <option value="Sala de 5 Años">Sala de 5 Años</option>
              </optgroup>
              <optgroup label="Nivel Primario">
                <option value="1er Grado">1er Grado</option>
                <option value="2do Grado">2do Grado</option>
                <option value="3er Grado">3er Grado</option>
                <option value="4to Grado">4to Grado</option>
                <option value="5to Grado">5to Grado</option>
                <option value="6to Grado">6to Grado</option>
                <option value="7mo Grado">7mo Grado</option>
              </optgroup>
              <optgroup label="Nivel Secundario">
                <option value="1er Año">1er Año</option>
                <option value="2do Año">2do Año</option>
                <option value="3er Año">3er Año</option>
                <option value="4to Año">4to Año</option>
                <option value="5to Año">5to Año</option>
                <option value="6to Año">6to Año</option>
              </optgroup>
            </select>
          </div>

          {/* Estado Administrativo */}
          <div className="flex flex-col gap-1 min-w-[180px]">
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
