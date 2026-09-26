import React from 'react';

const AdminStatCard = ({
  title,
  value,
  subtitle,
  badge,
  icon,
  borderColor = 'border-slate-100',
  iconGradient = 'from-lime-100 to-emerald-100',
  iconColor = 'text-emerald-700',
  valueColor = 'text-slate-900',
  subtitleColor = 'text-slate-500',
  hasDot = false,
  testId,
  isLoading = false,
  loading = false,
  loadingText = 'Cargando...',
}) => {
  const cardTestId =
    testId || `stat-card-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const isCardLoading = isLoading || loading;

  return (
    <div
      data-testid={cardTestId}
      className={`p-4 bg-white border ${borderColor} rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group`}
    >
      <div className="flex flex-col min-w-0">
        <span
          data-testid={`${cardTestId}-title`}
          className="text-[10px] text-left font-bold text-slate-400 uppercase tracking-wider truncate"
        >
          {title}
        </span>

        {isCardLoading ? (
          <div
            data-testid={`${cardTestId}-loading`}
            className="flex items-center gap-1.5 mt-1.5 py-1"
          >
            <span
              data-testid={`${cardTestId}-loading-spinner`}
              className="material-symbols-outlined text-xl text-lime-500 animate-spin"
            >
              sync
            </span>
            <span
              data-testid={`${cardTestId}-loading-text`}
              className="text-xs font-semibold text-slate-400"
            >
              {loadingText}
            </span>
          </div>
        ) : (
          <>
            <span
              data-testid={`${cardTestId}-value`}
              className={`text-2xl text-left font-extrabold ${valueColor} mt-0.5`}
            >
              {value}
            </span>

            {badge && (
              <span
                data-testid={`${cardTestId}-badge`}
                className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-200/60 px-2 py-0.5 rounded-full inline-block w-fit mt-0.5"
              >
                {badge}
              </span>
            )}

            {subtitle && (
              <span
                data-testid={`${cardTestId}-subtitle`}
                className={`text-[11px] font-semibold ${subtitleColor} flex items-center gap-1 mt-0.5 truncate`}
              >
                {hasDot && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                )}
                {subtitle}
              </span>
            )}
          </>
        )}
      </div>

      <div
        data-testid={`${cardTestId}-icon`}
        className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${iconGradient} ${iconColor} flex items-center justify-center shadow-inner shrink-0 group-hover:scale-105 transition-transform`}
      >
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>
    </div>
  );
};

export default AdminStatCard;
