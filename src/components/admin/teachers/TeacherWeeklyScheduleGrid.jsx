import React, { useState } from 'react';
import {
  MORNING_SLOTS,
  AFTERNOON_SLOTS,
  SLOT_COLOR_CLASSES,
  findCourseScheduleConflict,
} from './teacherScheduleUtils';
import TeacherScheduleGridSkeleton from './TeacherScheduleGridSkeleton';

const TeacherWeeklyScheduleGrid = ({
  grilla,
  readOnly,
  allTeachers = [],
  currentTeacherId,
  selectedCatedra,
  catedrasList = [],
  selectedCatedraId,
  onSelectCatedraId,
  onToggleSlot,
  conflictAlert = null,
  onClearConflict = null,
  isLoading = false,
}) => {
  const [turnoFilter, setTurnoFilter] = useState('manana');

  if (isLoading) {
    return <TeacherScheduleGridSkeleton />;
  }

  const safeGrilla = Array.isArray(grilla) ? grilla : [];
  const visibleRows = safeGrilla.filter((row) => {
    if (turnoFilter === 'manana') return MORNING_SLOTS.includes(row.hora);
    if (turnoFilter === 'tarde') return AFTERNOON_SLOTS.includes(row.hora);
    return true;
  });

  return (
    <div data-testid="teacher-weekly-schedule-grid" className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="font-bold text-sm text-slate-800">
          Grilla Horaria Semanal (Auditoría de Solapamiento)
        </span>
        <div className="flex gap-1 p-1 bg-slate-200/70 rounded-xl">
          <button
            type="button"
            data-testid="turno-filter-manana"
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
            data-testid="turno-filter-tarde"
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
            data-testid="turno-filter-todos"
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

      {conflictAlert && (
        <div
          data-testid="schedule-conflict-alert"
          className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between gap-3 text-amber-900 text-xs animate-in fade-in"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-amber-600 shrink-0">
              block
            </span>
            <div>
              <p className="font-bold">Conflicto de Solapamiento Detectado</p>
              <p className="text-[11px] text-amber-800">
                El curso <strong>{conflictAlert.curso}</strong> ya tiene clases los{' '}
                <strong>{conflictAlert.diaLabel} {conflictAlert.hora}</strong> con el docente{' '}
                <strong>{conflictAlert.teacherName}</strong> ({conflictAlert.subjectName}).
              </p>
            </div>
          </div>
          {onClearConflict && (
            <button
              type="button"
              data-testid="btn-clear-conflict"
              onClick={onClearConflict}
              className="p-1 text-amber-700 hover:bg-amber-100 rounded-lg cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      )}

      {!readOnly && catedrasList.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200/70 rounded-xl">
          <span className="text-[11px] font-bold text-slate-500 mr-1">
            Asignar en celda a:
          </span>
          {catedrasList.map((cat) => {
            const isSelected = selectedCatedraId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                data-testid={`btn-select-catedra-${cat.id}`}
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

      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 overflow-x-auto">
        <div className="grid grid-cols-6 gap-1 text-center text-xs min-w-[440px]">
          <div className="py-1 text-slate-400 font-bold">Hora</div>
          <div className="py-1 text-slate-700 font-extrabold">Lun</div>
          <div className="py-1 text-slate-700 font-extrabold">Mar</div>
          <div className="py-1 text-slate-700 font-extrabold">Mié</div>
          <div className="py-1 text-slate-700 font-extrabold">Jue</div>
          <div className="py-1 text-slate-700 font-extrabold">Vie</div>

          {visibleRows.map((row) => (
            <React.Fragment key={row.hora}>
              <div className="py-2.5 bg-white flex flex-wrap rounded-md text-slate-500 font-mono text-[10px] font-bold flex items-center justify-center border border-slate-100">
                <span>{row.hora.split('-')[0]}</span>
                <span>-</span>
                <span>{row.hora.split('-')[1]}</span>
              </div>
              {['lun', 'mar', 'mie', 'jue', 'vie'].map((dia) => {
                const slot = row[dia];
                const cleanHoraKey = row.hora.replace(/\s+/g, '-');
                const slotTestId = `grid-slot-${dia}-${cleanHoraKey}`;

                if (!slot) {
                  const extConflict =
                    !readOnly && selectedCatedra?.curso
                      ? findCourseScheduleConflict(
                        allTeachers,
                        currentTeacherId,
                        selectedCatedra.curso,
                        row.hora,
                        dia
                      )
                      : null;

                  if (extConflict) {
                    return (
                      <button
                        key={dia}
                        type="button"
                        data-testid={slotTestId}
                        onClick={() => onToggleSlot?.(row.hora, dia)}
                        title={`Ocupado: ${extConflict.curso} con ${extConflict.teacherName} (${extConflict.subjectName})`}
                        className="py-2 px-1 bg-amber-50/70 border border-amber-200/90 rounded-md text-amber-600 text-[9px] font-bold flex flex-col items-center justify-center hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[13px] text-amber-500">
                          lock
                        </span>
                        <span className="truncate max-w-full">{extConflict.teacherName.split(' ')[0]}</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={dia}
                      type="button"
                      data-testid={slotTestId}
                      disabled={readOnly}
                      onClick={() => onToggleSlot?.(row.hora, dia)}
                      aria-label={`Alternar horario ${dia} ${row.hora}`}
                      className={`py-2.5 bg-white rounded-md text-slate-300 text-[10px] flex items-center justify-center border border-slate-100 ${readOnly
                          ? 'cursor-default'
                          : 'hover:border-blue-300 hover:text-blue-500 cursor-pointer'
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
                    data-testid={slotTestId}
                    disabled={readOnly}
                    onClick={() => onToggleSlot?.(row.hora, dia)}
                    className={`py-2 px-1 ${bgColors} rounded-md font-bold text-[10px] flex flex-col items-center justify-center border ${readOnly ? 'cursor-default' : 'hover:opacity-80 cursor-pointer'
                      }`}
                  >
                    <span className="truncate max-w-full font-extrabold">{slot.curso}</span>
                    <span className="text-[9px] opacity-85 truncate max-w-full">
                      {slot.materia}
                    </span>
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
