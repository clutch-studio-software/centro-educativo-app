import React from 'react';
import { EMOJI_OPTIONS, DAY_OPTIONS, LEVEL_OPTIONS } from '../../../data/mockSportsActivities';

export const DisciplineEmojiSelector = ({ selectedEmoji, onSelectEmoji }) => {
  return (
    <div>
      <span className="block font-semibold text-slate-700 mb-1.5">
        Icono / Tipo de Disciplina
      </span>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {EMOJI_OPTIONS.map((opt) => (
          <button
            key={opt.emoji}
            type="button"
            onClick={() => onSelectEmoji(opt)}
            title={opt.label}
            aria-label={`Seleccionar icono ${opt.label}`}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 transition-all cursor-pointer border-none ${
              selectedEmoji === opt.emoji
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
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border-none ${
                isSelected
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
