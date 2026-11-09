import React from 'react';

/**
 * Encabezado estandarizado para las secciones del Portal de Familias
 */
const PortalSectionHeader = ({
  icon,
  iconBgClass = 'bg-orange-50',
  iconColorClass = 'text-orange-600',
  title,
  subtitle,
  statusBadge,
}) => {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-lg ${iconBgClass} ${iconColorClass} flex items-center justify-center`}
        >
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
        <div className="text-left">
          <p className="text-base font-bold text-slate-800">{title}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {statusBadge && <div>{statusBadge}</div>}
    </div>
  );
};

export default PortalSectionHeader;
