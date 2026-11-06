import React from 'react';

const ReportSearchInput = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  testId = 'input-report-search',
}) => (
  <div className="relative flex-1 min-w-[200px]">
    <input
      type="text"
      data-testid={testId}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 pl-9 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
    />
    <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-2.5 top-2">
      search
    </span>
  </div>
);

export default ReportSearchInput;
