import React from 'react';

const AdminTablePagination = ({
  isLoading,
  totalItems,
  startIndex,
  pageSize,
  currentPage,
  totalPages,
  onPageChange,
  itemLabel = 'registros',
}) => {
  if (isLoading || totalItems === 0) return null;

  return (
    <div className="px-6 py-4 bg-white/70 border-t border-slate-100 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
      <div className="text-xs font-semibold text-slate-500">
        Mostrando{' '}
        <span className="font-bold text-slate-900">
          {startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)}
        </span>{' '}
        de <span className="font-bold text-slate-900">{totalItems}</span> {itemLabel}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold transition-colors ${
            currentPage === 1
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
          }`}
        >
          Anterior
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors cursor-pointer ${
              currentPage === pageNum
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-600'
            }`}
          >
            {pageNum}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold transition-colors ${
            currentPage === totalPages
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
          }`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default AdminTablePagination;
