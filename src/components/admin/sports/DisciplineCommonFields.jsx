import React from 'react';
import { EMOJI_OPTIONS, DAY_OPTIONS } from '../../../data/mockSportsActivities';
import { formatHorarioString, sortWeekDays } from './sportsScheduleUtils';

export const DisciplineEmojiSelector = ({ selectedEmoji, onSelectEmoji }) => {
  return (
    <div>
      <span className="block font-semibold text-slate-700 mb-1.5">
        Icono / Tipo de Disciplina
      </span>
      <div className="flex items-center gap-1.5 overflow-x-auto p-2 scrollbar-thin">
        {EMOJI_OPTIONS.map((opt) => (
          <button
            key={opt.emoji}
            type="button"
            onClick={() => onSelectEmoji(opt)}
            title={opt.label}
            aria-label={`Seleccionar icono ${opt.label}`}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 transition-all cursor-pointer border-none ${selectedEmoji === opt.emoji
              ? 'ring-2 ring-blue-600 shadow-md scale-105 ' + opt.bg
              : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
              }`}
          >
            {opt.emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export const DisciplineDaysSelector = ({ selectedDays = [], onToggleDay }) => {
  return (
    <div>
      <span className="block font-semibold text-slate-700 mb-1.5">
        Días de Entrenamiento / Clases
      </span>
      <div className="flex flex-wrap gap-1.5">
        {DAY_OPTIONS.map((day) => {
          const isSelected = selectedDays.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => onToggleDay(day)}
              aria-label={`Día ${day}`}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border-none ${isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const DisciplineScheduleByDay = ({
  selectedDays = [],
  horariosPorDia = {},
  onScheduleChange,
  onCopyScheduleToAll,
  idPrefix = 'disc',
}) => {
  if (selectedDays.length === 0) {
    return (
      <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-amber-800 text-[11px] flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] text-amber-600">info</span>
        <span>Selecciona al menos un día arriba para configurar los horarios de cursada.</span>
      </div>
    );
  }

  const sortedDays = sortWeekDays(selectedDays);
  const summary = formatHorarioString(sortedDays, horariosPorDia);

  return (
    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700 text-xs">
          <span className="material-symbols-outlined text-[16px] text-blue-600">schedule</span>
          <span>Horario por día de cursada *</span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Inicio - Fin</span>
      </div>

      <div className="space-y-2">
        {sortedDays.map((dia) => {
          const schedule = horariosPorDia[dia] || { inicio: '16:00', fin: '17:30' };
          return (
            <div
              key={dia}
              className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200/70 shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-[90px]">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="font-bold text-slate-800 text-xs">{dia}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  id={`${idPrefix}-inicio-${dia}`}
                  type="time"
                  value={schedule.inicio}
                  onChange={(e) => onScheduleChange(dia, 'inicio', e.target.value)}
                  aria-label={`Hora de inicio para ${dia}`}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  required
                />
                <span className="text-slate-400 font-semibold text-xs">a</span>
                <input
                  id={`${idPrefix}-fin-${dia}`}
                  type="time"
                  value={schedule.fin}
                  onChange={(e) => onScheduleChange(dia, 'fin', e.target.value)}
                  aria-label={`Hora de fin para ${dia}`}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  required
                />

                {selectedDays.length > 1 && onCopyScheduleToAll && (
                  <button
                    type="button"
                    onClick={() => onCopyScheduleToAll(dia)}
                    title={`Copiar horario de ${dia} a todos los demás días`}
                    aria-label={`Copiar horario de ${dia} a todos los demás días`}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {summary && (
        <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-slate-600">
          <span className="font-semibold text-slate-500">Resumen:</span>
          <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/80">
            {summary}
          </span>
        </div>
      )}
    </div>
  );
};

export const DisciplineSchedulePlaceFields = ({
  horario,
  lugar,
  cupoMax,
  prefix = 'disc',
  onChange,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${prefix}-horario`} className="block font-semibold text-slate-700 mb-1.5">
            Días y Horarios Resumen *
          </label>
          <input
            id={`${prefix}-horario`}
            type="text"
            name="horario"
            value={horario}
            onChange={onChange}
            placeholder="Ej: Lu y Mi 16:30 a 18:00 hs"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor={`${prefix}-lugar`} className="block font-semibold text-slate-700 mb-1.5">
            Lugar / Instalación
          </label>
          <input
            id={`${prefix}-lugar`}
            type="text"
            name="lugar"
            value={lugar}
            onChange={onChange}
            placeholder="Ej: Pista de Atletismo / Polideportivo"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${prefix}-cupoMax`} className="block font-semibold text-slate-700 mb-1.5">
            Cupo Máximo de Alumnos
          </label>
          <input
            id={`${prefix}-cupoMax`}
            type="number"
            name="cupoMax"
            min="1"
            max="100"
            value={cupoMax}
            onChange={onChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
        </div>
      </div>
    </>
  );
};
