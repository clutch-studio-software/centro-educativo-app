import React from 'react';

export const ReportSkeleton = () => {
  return (
    <div data-testid="report-skeleton-loader" className="flex flex-col gap-5 animate-pulse">
      {/* Banner / Card Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-200 rounded-xl" />
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 rounded-md w-48" />
            <div className="h-3 bg-slate-100 rounded-md w-32" />
          </div>
        </div>
        <div className="h-8 bg-slate-200/80 rounded-xl w-36" />
      </div>

      {/* Grid de Métricas Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="bg-white border border-slate-200/80 rounded-md p-4 flex flex-col justify-between gap-3">
            <div className="h-3 bg-slate-200 rounded-md w-24" />
            <div className="h-6 bg-slate-300 rounded-md w-16" />
            <div className="h-2.5 bg-slate-100 rounded-md w-28" />
          </div>
        ))}
      </div>

      {/* Tabla Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3">
        <div className="h-4 bg-slate-200 rounded-md w-56 mb-2" />
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((rowIdx) => (
            <div
              key={rowIdx}
              className="h-10 bg-slate-50 border border-slate-100 rounded-md flex items-center justify-between px-4"
            >
              <div className="h-3.5 bg-slate-200 rounded-md w-36" />
              <div className="h-3.5 bg-slate-200/70 rounded-md w-24" />
              <div className="h-3.5 bg-slate-200/50 rounded-md w-28" />
              <div className="h-3.5 bg-slate-200/70 rounded-md w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportSkeleton;
