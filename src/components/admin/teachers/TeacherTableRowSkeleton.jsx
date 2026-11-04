import React from 'react';
import { SkeletonAvatarCell } from '../common/TableSkeletonCells';

export const TeacherTableRowSkeleton = () => {
  return (
    <tr data-testid="teacher-row-skeleton" className="animate-pulse border-b border-slate-100">
      {/* 1. Docente */}
      <td className="py-4 px-6">
        <SkeletonAvatarCell titleWidth="w-32" subtitleWidth="w-20" />
      </td>

      {/* 2. Cátedras */}
      <td className="py-4 px-6">
        <div className="flex flex-wrap gap-1.5">
          <div className="h-5 bg-slate-200/80 rounded-md w-24" />
          <div className="h-5 bg-slate-100 rounded-md w-20" />
        </div>
      </td>

      {/* 3. Carga Horaria */}
      <td className="py-4 px-6">
        <div className="space-y-1.5 w-28">
          <div className="h-3 bg-slate-200 rounded-md w-16" />
          <div className="h-1.5 bg-slate-100 rounded-full w-full" />
        </div>
      </td>

      {/* 4. Turno */}
      <td className="py-4 px-6">
        <div className="h-6 bg-slate-100 rounded-lg w-24" />
      </td>

      {/* 5. Estado */}
      <td className="py-4 px-6 text-center">
        <div className="h-5 w-16 bg-slate-200/70 rounded-full mx-auto" />
      </td>

      {/* 6. Acciones */}
      <td className="py-4 px-6 text-right">
        <div className="h-8 w-8 bg-slate-100 rounded-xl ml-auto" />
      </td>
    </tr>
  );
};

export default TeacherTableRowSkeleton;
