import React from 'react';

const BaseDashboardRowSkeleton = ({
  testId,
  badgeColorClass,
  badgeWidthClass = 'w-24',
  descriptionWidthClass = 'w-48',
  showNotificationStatus = false,
}) => (
  <tr data-testid={testId} className="animate-pulse border-b border-slate-100 text-xs">
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
      <div className={`h-5 ${badgeColorClass} rounded-md ${badgeWidthClass}`} />
    </td>
    <td className="py-3 px-4">
      <div className={`h-3.5 bg-slate-200/80 rounded-md ${descriptionWidthClass}`} />
    </td>
    {showNotificationStatus && (
      <td className="py-3 px-4 text-center">
        <div className="h-5 w-12 bg-slate-100 rounded-full mx-auto" />
      </td>
    )}
    <td className="py-3 px-4 text-right">
      <div className="h-5 bg-slate-100 rounded w-24 ml-auto" />
    </td>
  </tr>
);

export const EnfermeriaTableRowSkeleton = () => (
  <BaseDashboardRowSkeleton
    testId="enfermeria-row-skeleton"
    badgeColorClass="bg-rose-100/70"
    badgeWidthClass="w-24"
    descriptionWidthClass="w-48"
    showNotificationStatus
  />
);

export const PreceptoriaTableRowSkeleton = () => (
  <BaseDashboardRowSkeleton
    testId="preceptoria-row-skeleton"
    badgeColorClass="bg-purple-100/70"
    badgeWidthClass="w-28"
    descriptionWidthClass="w-52"
    showNotificationStatus={false}
  />
);
