import React from 'react';

const TariffCardHeader = ({
  icon,
  category,
  title,
  iconBgColor = 'bg-blue-50 border-blue-200/60 text-blue-700',
  categoryColor = 'text-blue-700',
  actions = null,
}) => {
  return (
    <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
      <div className="flex items-center gap-3.5">
        <div
          className={`w-11 h-11 rounded-md border flex items-center justify-center shrink-0 ${iconBgColor}`}
        >
          <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
            {icon}
          </span>
        </div>
        <div>
          <h2
            className={`text-[11px] text-start font-bold uppercase tracking-wider ${categoryColor}`}
          >
            {category}
          </h2>
          <h2 className="font-headline text-lg lg:text-xl font-extrabold text-slate-900">
            {title}
          </h2>
        </div>
      </div>
      {actions}
    </div>
  );
};

export default TariffCardHeader;
