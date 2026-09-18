import React from 'react';

const StudentPagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const seen = new Set();
      pages.push(1);
      seen.add(1);

      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!seen.has(i)) {
          seen.add(i);
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) pages.push('...');
      if (!seen.has(totalPages)) {
        seen.add(totalPages);
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      data-testid="student-pagination"
      className="px-6 py-3.5 bg-slate-50/80 border-t-2 border-slate-200 flex flex-wrap items-center justify-between gap-4"
    >
      {/* Resumen y Filas por página */}
      <div className="flex items-center gap-3 flex-wrap">
        <span
          data-testid="pagination-summary"
          className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 font-bold text-xs flex items-center gap-1.5 shadow-xs"
        >
          <span className="material-symbols-outlined text-[15px] text-emerald-600">
            filter_list
          </span>
          Mostrando {startItem} - {endItem} de {totalItems.toLocaleString()} alumnos
        </span>

        <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <span>Filas por página:</span>
          <select
            data-testid="pagination-rows-select"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="h-8 px-3.9 bg-white border border-slate-200 rounded-full font-bold text-xs text-slate-800 outline-none shadow-xs cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Controles de Navegación */}
      <div data-testid="pagination-controls" className="flex items-center gap-1.5">
        <span
          data-testid="pagination-page-indicator"
          className="text-xs font-semibold text-slate-400 mr-2 hidden sm:inline"
        >
          Página {currentPage} de {Math.max(1, totalPages)}
        </span>

        {/* Primera página */}
        <button
          data-testid="pagination-first-button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className={`p-1.5 rounded-full bg-white border border-slate-200 transition-colors shadow-xs ${
            currentPage <= 1
              ? 'text-slate-300 opacity-50 cursor-not-allowed'
              : 'text-slate-600 hover:text-blue-600 cursor-pointer'
          }`}
          type="button"
          title="Primera página"
        >
          <span className="material-symbols-outlined text-[18px]">first_page</span>
        </button>

        {/* Página anterior */}
        <button
          data-testid="pagination-prev-button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`p-1.5 rounded-full bg-white border border-slate-200 transition-colors shadow-xs ${
            currentPage <= 1
              ? 'text-slate-300 opacity-50 cursor-not-allowed'
              : 'text-slate-600 hover:text-blue-600 cursor-pointer'
          }`}
          type="button"
          title="Página anterior"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>

        {/* Números de página */}
        {getPageNumbers().map((page, idx) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="text-xs text-slate-400 px-1">
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={`page-${page}`}
              data-testid={`pagination-page-${page}-button`}
              data-active={isActive ? 'true' : 'false'}
              onClick={() => onPageChange(page)}
              type="button"
              className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-lime-500 text-white shadow-md shadow-lime-500/25 border-none'
                  : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Página siguiente */}
        <button
          data-testid="pagination-next-button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`p-1.5 rounded-full bg-white border border-slate-200 transition-colors shadow-xs ${
            currentPage >= totalPages
              ? 'text-slate-300 opacity-50 cursor-not-allowed'
              : 'text-slate-600 hover:text-blue-600 cursor-pointer'
          }`}
          type="button"
          title="Página siguiente"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>

        {/* Última página */}
        <button
          data-testid="pagination-last-button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className={`p-1.5 rounded-full bg-white border border-slate-200 transition-colors shadow-xs ${
            currentPage >= totalPages
              ? 'text-slate-300 opacity-50 cursor-not-allowed'
              : 'text-slate-600 hover:text-blue-600 cursor-pointer'
          }`}
          type="button"
          title="Última página"
        >
          <span className="material-symbols-outlined text-[18px]">last_page</span>
        </button>
      </div>
    </div>
  );
};

export default StudentPagination;
