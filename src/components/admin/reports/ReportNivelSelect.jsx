import React from 'react';

const NIVELES = ['Todos', 'Inicial', 'Primario', 'Secundario'];

const ReportNivelSelect = ({
  id = 'select-report-nivel',
  testId = 'select-report-nivel',
  value,
  onChange,
  label = 'Nivel Educativo',
}) => (
  <div className="flex flex-col gap-1">
    <label htmlFor={id} className="text-[11px] font-bold text-slate-500 uppercase">
      {label}
    </label>
    <select
      id={id}
      data-testid={testId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden cursor-pointer"
    >
      {NIVELES.map((n) => (
        <option key={n} value={n}>
          {n === 'Todos' ? 'Todos los Niveles' : `Nivel ${n}`}
        </option>
      ))}
    </select>
  </div>
);

export default React.memo(ReportNivelSelect);
