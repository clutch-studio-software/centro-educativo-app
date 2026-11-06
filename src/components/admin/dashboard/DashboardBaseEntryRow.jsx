import React from 'react';
import { formatDashboardDate } from './dashboardUtils';

const DashboardBaseEntryRow = ({
  testId,
  title,
  hoverBgClass = 'hover:bg-slate-50/50 focus:bg-slate-50/60',
  nameHoverClass = 'group-hover:text-slate-900',
  entry,
  onSelectEntry,
  children,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectEntry?.(entry);
    }
  };

  return (
    <tr
      data-testid={testId}
      onClick={() => onSelectEntry?.(entry)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      title={title}
      className={`${hoverBgClass} transition-colors border-b border-slate-100 text-xs cursor-pointer group focus:outline-hidden`}
    >
      <td className="py-3 px-4 font-mono font-bold text-slate-500 whitespace-nowrap">
        {formatDashboardDate(entry.fecha)}
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-col">
          <span className={`font-bold text-slate-900 ${nameHoverClass} transition-colors`}>
            {entry.studentName}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {entry.studentLegajo} · {entry.studentCurso}
          </span>
        </div>
      </td>
      {children}
    </tr>
  );
};

export default DashboardBaseEntryRow;
