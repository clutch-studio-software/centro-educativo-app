import React from 'react';

const FinancePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  pageSize,
  totalItems,
}) => {
  if (totalItems === 0) return null;

  const currentEnd = Math.min(startIndex + pageSize, totalItems);

  return (
    <div
      data-testid="finance-pagination-strip"
      className="px-5 py-4 bg-slate-100/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200 rounded-b-md"
    >
      <span className="font-medium" data-testid="pagination-count-label">
        Mostrando <strong className="text-slate-900">{startIndex + 1} - {currentEnd}</strong> de{' '}
        <strong className="text-slate-900">{totalItems}</strong> comprobantes del período
      </span>

      <div className="flex items-center gap-1.5" data-testid="pagination-controls">
        <button
          type="button"
          id="btn-prev-page"
          data-testid="btn-prev-page"
          aria-label="Página anterior"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-8 h-8 rounded-full bg-white text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-40 border border-slate-200 cursor-pointer disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            data-testid={`btn-page-${pageNum}`}
            onClick={() => onPageChange(pageNum)}
            className={`w-8 h-8 rounded-full font-bold flex items-center justify-center transition-colors cursor-pointer border ${
              currentPage === pageNum
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {pageNum}
          </button>
        ))}

        <button
          type="button"
          id="btn-next-page"
          data-testid="btn-next-page"
          aria-label="Página siguiente"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="w-8 h-8 rounded-full bg-white text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-40 border border-slate-200 cursor-pointer disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </div>
  );
};

export default FinancePagination;
