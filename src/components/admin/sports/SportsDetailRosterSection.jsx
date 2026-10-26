import React from 'react';
import { SportsDetailRosterRow } from './SportsDetailRosterRow';

const PAGE_SIZE = 6;

export const SportsDetailRosterSection = ({
  filteredStudents,
  currentStudents,
  searchTerm,
  onSearchChange,
  selectedNivel,
  onSelectNivel,
  selectedCurso,
  onSelectCurso,
  onResetFilters,
  onExportCsv,
  onViewLegajo,
  onTransferStudent,
  currentPage,
  onPageChange,
}) => {
  const totalItems = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
      {/* Table Header Toolbar */}
      <div className="p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base text-[17px] text-start font-bold text-slate-900 font-headline">
              Padrón de Alumnos Inscriptos
            </h3>
            <h3 className="text-xs text-slate-500 font-medium">
              Alumnos matriculados en la disciplina con control de apto médico y arancel.
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onExportCsv}
              data-testid="btn-export-csv"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors text-xs font-bold shadow-xs cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Descargar CSV
            </button>
          </div>
        </div>

        {/* Filters & Search Form */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="relative flex-1 min-w-[260px]">
            <label htmlFor="sports-roster-search" className="sr-only">
              Buscar alumno por nombre, DNI o legajo
            </label>
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
              search
            </span>
            <input
              id="sports-roster-search"
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar alumno por nombre, DNI o legajo..."
              aria-label="Buscar alumno por nombre, DNI o legajo"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/70 text-xs font-medium focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none transition-all border-none"
            />
          </div>

          {/* Filter by Nivel */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl">
            {['Todos', 'Primario', 'Secundario'].map((nivel) => (
              <button
                key={nivel}
                type="button"
                onClick={() => onSelectNivel(nivel)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border-none ${selectedNivel === nivel
                  ? 'bg-primary text-white font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface bg-transparent'
                  }`}
              >
                {nivel}
              </button>
            ))}
          </div>

          {/* Filter by Curso */}
          <div className="relative">
            <label htmlFor="sports-roster-curso" className="sr-only">
              Filtrar por curso
            </label>
            <select
              id="sports-roster-curso"
              value={selectedCurso}
              onChange={(e) => onSelectCurso(e.target.value)}
              aria-label="Filtrar por curso"
              className="appearance-none bg-surface-container-low text-on-surface text-xs font-medium py-2 pl-3 pr-8 rounded-xl focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer border-none"
            >
              <option value="Todos los Cursos">Todos los Cursos</option>
              <option value="4° Grado">4° Grado</option>
              <option value="5° Grado">5° Grado</option>
              <option value="6° Grado">6° Grado</option>
              <option value="7° Grado">7° Grado</option>
              <option value="1° Año">1° Año</option>
              <option value="2° Año">2° Año</option>
              <option value="3° Año">3° Año</option>
              <option value="4° Año">4° Año</option>
              <option value="5° Año">5° Año</option>
              <option value="6° Año">6° Año</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto w-full">
        {currentStudents.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">search_off</span>
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              No se encontraron alumnos inscriptos
            </h4>
            <p className="text-xs text-slate-500 max-w-sm">
              No hay registros que coincidan con los filtros o término de búsqueda ingresado.
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer border-none"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Restablecer filtros
            </button>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3.5" scope="col">Legajo</th>
                <th className="px-6 py-3.5" scope="col">Alumno</th>
                <th className="px-6 py-3.5" scope="col">Nivel &amp; Curso</th>
                <th className="px-6 py-3.5" scope="col">Tutor Responsable</th>
                <th className="px-6 py-3.5" scope="col">Inscripción</th>
                <th className="px-6 py-3.5 text-right" scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {currentStudents.map((student) => (
                <SportsDetailRosterRow
                  key={student.id}
                  student={student}
                  onViewLegajo={onViewLegajo}
                  onTransferStudent={onTransferStudent}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Table Footer / Minimal Pagination */}
      <div className="p-5 flex flex-wrap items-center justify-between gap-4 bg-surface-container-lowest border-t border-slate-100">
        <span className="text-xs text-on-surface-variant">
          Mostrando{' '}
          <span className="font-bold text-on-surface">
            {totalItems === 0 ? 0 : startIndex + 1} -{' '}
            {Math.min(startIndex + PAGE_SIZE, totalItems)}
          </span>{' '}
          de <span className="font-bold text-on-surface">{totalItems}</span> alumnos
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, validCurrentPage - 1))}
            disabled={validCurrentPage <= 1}
            data-testid="pagination-prev"
            aria-label="Página anterior"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-base">chevron_left</span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              data-testid={`pagination-page-${pageNum}`}
              aria-label={`Página ${pageNum}`}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${validCurrentPage === pageNum
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
                }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, validCurrentPage + 1))}
            disabled={validCurrentPage >= totalPages}
            data-testid="pagination-next"
            aria-label="Página siguiente"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-colors text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SportsDetailRosterSection;
