import React from 'react';
import { SkeletonAvatarCell, SkeletonTextLines } from './common/TableSkeletonCells';

export const StudentTableRowSkeleton = () => (
  <tr data-testid="student-row-skeleton" className="animate-pulse border-b border-slate-100">
    <td className="py-4 px-6">
      <div className="h-6 bg-slate-200/80 rounded-md w-24" />
    </td>
    <td className="py-4 px-6">
      <div className="h-4 bg-slate-200 rounded-md w-20" />
    </td>
    <td className="py-4 px-6">
      <SkeletonAvatarCell titleWidth="w-36" subtitleWidth="w-24" />
    </td>
    <td className="py-4 px-6">
      <SkeletonTextLines titleWidth="w-28" subtitleWidth="w-20" />
    </td>
    <td className="py-4 px-6 text-right">
      <div className="h-8 bg-slate-100 rounded-xl w-24 ml-auto" />
    </td>
  </tr>
);

export default StudentTableRowSkeleton;
