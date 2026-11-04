import React from 'react';

const ReportProfileCard = ({
  testId,
  initials,
  fullName,
  legajo,
  avatarBg = 'bg-blue-50 text-blue-700 border-blue-100',
  metaInfo,
  actions,
}) => (
  <section
    data-testid={testId}
    className="bg-white rounded-md border border-slate-200/80 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
  >
    <div className="flex items-center gap-3.5">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm border ${avatarBg}`}
      >
        {initials}
      </div>
      <div className="text-left">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-black text-slate-900">{fullName}</h2>
          <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {legajo}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{metaInfo}</p>
      </div>
    </div>
    {actions && <div className="flex items-center gap-2 self-start md:self-auto">{actions}</div>}
  </section>
);

export default React.memo(ReportProfileCard);
