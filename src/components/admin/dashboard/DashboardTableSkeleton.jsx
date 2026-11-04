import React from 'react';

export const EnfermeriaTableRowSkeleton = () => (
  <tr data-testid="enfermeria-row-skeleton" className="animate-pulse border-b border-slate-100 text-xs">
    <td className="py-3 px-4">
      <div className="h-3.5 bg-slate-200 rounded-md w-24" />
    </td>
    <td className="py-3 px-4">
      <div className="space-y-1">
        <div className="h-3.5 bg-slate-200 rounded-md w-28" />
        <div className="h-2.5 bg-slate-100 rounded-md w-20" />
      </div>
    </td>
    <td className="py-3 px-4">
      <div className="h-5 bg-rose-100/70 rounded-md w-24" />
    </td>
    <td className="py-3 px-4">
      <div className="h-3.5 bg-slate-200/80 rounded-md w-48" />
    </td>
    <td className="py-3 px-4 text-center">
      <div className="h-5 w-12 bg-slate-100 rounded-full mx-auto" />
    </td>
    <td className="py-3 px-4 text-right">
      <div className="h-5 bg-slate-100 rounded w-20 ml-auto" />
    </td>
  </tr>
);

export const PreceptoriaTableRowSkeleton = () => (
  <tr data-testid="preceptoria-row-skeleton" className="animate-pulse border-b border-slate-100 text-xs">
    <td className="py-3 px-4">
      <div className="h-3.5 bg-slate-200 rounded-md w-24" />
    </td>
    <td className="py-3 px-4">
      <div className="space-y-1">
        <div className="h-3.5 bg-slate-200 rounded-md w-28" />
        <div className="h-2.5 bg-slate-100 rounded-md w-20" />
      </div>
    </td>
    <td className="py-3 px-4">
      <div className="h-5 bg-purple-100/70 rounded-md w-28" />
    </td>
    <td className="py-3 px-4">
      <div className="h-3.5 bg-slate-200/80 rounded-md w-52" />
    </td>
    <td className="py-3 px-4 text-right">
      <div className="h-5 bg-slate-100 rounded w-24 ml-auto" />
    </td>
  </tr>
);
