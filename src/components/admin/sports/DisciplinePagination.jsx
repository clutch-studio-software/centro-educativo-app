import React from 'react';

const DisciplinePagination = ({
  totalItems,
  startIndex,
  pageSize,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalItems === 0) return null;

  const startDisplay = startIndex + 1;
  const endDisplay = Math.min(startIndex + pageSize, totalItems);

  return (
    <footer
      className="pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/60 text-xs text-slate-500"
      data-purpose="pagination"
      data-testid="sports-pagination"
    >
      <p>
        Mostrando <span className="font-bold text-slate-700">{startDisplay} – {endDisplay}</span> de{' '}
        <span className="font-bold text-slate-700">{totalItems}</span> disciplinas activas
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            currentPage === 1
              ? 'border-slate-200 text-slate-400 bg-white cursor-not-allowed'
              : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer'
          }`}
        >
          Anterior
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            className={`w-8 h-8 rounded-lg font-semibold flex items-center justify-center text-xs transition-colors cursor-pointer border-none ${
              currentPage === pageNum
                ? 'bg-[#1d68f0] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {pageNum}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            currentPage === totalPages
              ? 'border-slate-200 text-slate-400 bg-white cursor-not-allowed'
              : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer'
          }`}
        >
          Siguiente
        </button>
      </div>
    </footer>
  );
};

export default DisciplinePagination;
