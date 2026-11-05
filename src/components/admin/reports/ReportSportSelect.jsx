import React from 'react';

const ReportSportSelect = ({
  value,
  onChange,
  options = [],
  totalCount,
  testId = 'select-filter-sport',
}) => (
  <div className="flex items-center gap-2">
    <label htmlFor={testId} className="text-xs font-bold text-slate-600 whitespace-nowrap">
      Deporte:
    </label>
    <select
      id={testId}
      data-testid={testId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
    >
      <option value="Todos">
        Todos los Deportes{typeof totalCount === 'number' ? ` (${totalCount})` : ''}
      </option>
      {options.map((sp) => (
        <option key={sp} value={sp}>
          {sp}
        </option>
      ))}
    </select>
  </div>
);

export default ReportSportSelect;
