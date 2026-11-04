import React from 'react';

export const DivisionTableRowSkeleton = () => {
  return (
    <tr data-testid="division-row-skeleton" className="animate-pulse border-b border-slate-100">
      {/* 1. Nombre */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0" />
          <div className="space-y-1.5 min-w-0">
            <div className="h-3.5 bg-slate-200 rounded-md w-28" />
            <div className="h-2.5 bg-slate-100 rounded-md w-16" />
          </div>
        </div>
      </td>

      {/* 2. División */}
      <td className="py-4 px-6">
        <div className="h-6 bg-slate-200/80 rounded-lg w-20" />
      </td>

      {/* 3. Turno */}
      <td className="py-4 px-6">
        <div className="h-6 bg-slate-100 rounded-lg w-20" />
      </td>

      {/* 4. Ocupación */}
      <td className="py-4 px-6">
        <div className="flex flex-col gap-1.5 min-w-[140px] max-w-[200px]">
          <div className="flex items-center justify-between">
            <div className="h-3 bg-slate-200 rounded-md w-14" />
            <div className="h-3 bg-slate-100 rounded-md w-10" />
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-200 rounded-full w-2/3" />
          </div>
        </div>
      </td>

      {/* 5. Switch Estado */}
      <td className="py-4 px-6 text-center">
        <div className="h-5 w-9 bg-slate-200 rounded-full mx-auto" />
      </td>

      {/* 6. Más acciones */}
      <td className="py-4 px-6 text-right">
        <div className="h-8 w-8 bg-slate-100 rounded-xl ml-auto" />
      </td>
    </tr>
  );
};

export default DivisionTableRowSkeleton;
