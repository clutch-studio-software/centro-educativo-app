import React, { useState } from 'react';
import {
  MORNING_SLOTS,
  AFTERNOON_SLOTS,
  SLOT_COLOR_CLASSES,
} from './teacherScheduleUtils';

const TeacherWeeklyScheduleGrid = ({
  grilla,
  readOnly,
  catedrasList = [],
  selectedCatedraId,
  onSelectCatedraId,
  onToggleSlot,
}) => {
  const [turnoFilter, setTurnoFilter] = useState('manana');

  const visibleRows = grilla.filter((row) => {
    if (turnoFilter === 'manana') return MORNING_SLOTS.includes(row.hora);
    if (turnoFilter === 'tarde') return AFTERNOON_SLOTS.includes(row.hora);
    return true;
  });

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="font-bold text-center text-sm">
          Grilla Horaria Semanal (Auditoría de Solapamiento)
        </span>
        <div className="flex gap-1 p-1 bg-slate-200/70 rounded-xl">
          <button
            type="button"
            onClick={() => setTurnoFilter('manana')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${turnoFilter === 'manana'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            ☀️ Mañana
          </button>
          <button
            type="button"
            onClick={() => setTurnoFilter('tarde')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${turnoFilter === 'tarde'
              ? 'bg-white text-amber-800 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            🌤️ Tarde
          </button>
          <button
            type="button"
            onClick={() => setTurnoFilter('todos')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${turnoFilter === 'todos'
              ? 'bg-white text-indigo-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            🔄 Ambos
          </button>
        </div>
      </div>

      {!readOnly && catedrasList.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200/70 rounded-md">
          <span className="text-[11px] font-bold text-slate-500 mr-1">
            Asignar en celda a:
          </span>
          {catedrasList.map((cat) => {
            const isSelected = selectedCatedraId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCatedraId(cat.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
              >
                {cat.nombre} — {cat.curso}
              </button>
            );
          })}
        </div>
      )}

      <div className="bg-slate-50 rounded-md p-3 border border-slate-200/80 overflow-x-auto">
        <div className="grid grid-cols-6 gap-1 text-center text-xs min-w-[440px]">
          <div className="py-1 text-slate-400 font-bold">Hora</div>
          <div className="py-1 text-slate-700 font-extrabold">Lun</div>
          <div className="py-1 text-slate-700 font-extrabold">Mar</div>
          <div className="py-1 text-slate-700 font-extrabold">Mié</div>
          <div className="py-1 text-slate-700 font-extrabold">Jue</div>
          <div className="py-1 text-slate-700 font-extrabold">Vie</div>

          {visibleRows.map((row) => (
            <React.Fragment key={row.hora}>
              <div className="py-2.5 bg-white rounded-md text-slate-500 font-mono text-[10px] font-bold flex items-center justify-center border border-slate-100">
                {row.hora}
              </div>
              {['lun', 'mar', 'mie', 'jue', 'vie'].map((dia) => {
                const slot = row[dia];
                if (!slot) {
                  return (
                    <button
                      key={dia}
                      type="button"
                      disabled={readOnly}
                      onClick={() => onToggleSlot?.(row.hora, dia)}
                      aria-label={`Alternar horario ${dia} ${row.hora}`}
                      className={`py-2.5 bg-white rounded-md text-slate-300 text-[10px] flex items-center justify-center border border-slate-100 ${readOnly ? 'cursor-default' : 'hover:border-blue-300 hover:text-blue-500 cursor-pointer'
                        }`}
                    >
                      -
                    </button>
                  );
                }
                const bgColors = SLOT_COLOR_CLASSES[slot.color] || SLOT_COLOR_CLASSES.blue;
                return (
                  <button
                    key={dia}
                    type="button"
                    disabled={readOnly}
                    onClick={() => onToggleSlot?.(row.hora, dia)}
                    className={`py-2 px-1 ${bgColors} rounded-md font-bold text-[10px] flex flex-col items-center justify-center border ${readOnly ? 'cursor-default' : 'hover:opacity-80 cursor-pointer'
                      }`}
                  >
                    <span className="truncate max-w-full font-extrabold">{slot.curso}</span>
                    <span className="text-[9px] opacity-85 truncate max-w-full">{slot.materia}</span>
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherWeeklyScheduleGrid;
