import React from 'react';

const ReportTableHeader = ({ columns = [] }) => (
  <thead>
    <tr className="border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
      {columns.map((col) => (
        <th
          key={col.label}
          className={`py-2.5 px-4 ${col.alignClass || (col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left')}`}
        >
          {col.label}
        </th>
      ))}
    </tr>
  </thead>
);

export default ReportTableHeader;
