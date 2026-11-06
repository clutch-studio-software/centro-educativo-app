import React from 'react';
import { SkeletonAvatarCell, SkeletonTextLines } from '../common/TableSkeletonCells';

export const UserTableRowSkeleton = () => (
  <tr data-testid="user-row-skeleton" className="animate-pulse border-b border-slate-100">
    <td className="py-3.5 px-6">
      <SkeletonAvatarCell titleWidth="w-30" subtitleWidth="w-16" />
    </td>
    <td className="py-3.5 px-6">
      <SkeletonTextLines titleWidth="w-24" subtitleWidth="w-28" />
    </td>
    <td className="py-3.5 px-6">
      <div className="h-6 bg-slate-200/80 rounded-md w-24" />
    </td>
    <td className="py-3.5 px-6">
      <div className="h-5 bg-slate-100 rounded-full w-20" />
    </td>
    <td className="py-3.5 px-6">
      <div className="h-5 bg-slate-200/70 rounded-full w-16" />
    </td>
    <td className="py-3.5 px-6 text-right">
      <div className="h-8 w-8 bg-slate-100 rounded-xl ml-auto" />
    </td>
  </tr>
);

export default UserTableRowSkeleton;
