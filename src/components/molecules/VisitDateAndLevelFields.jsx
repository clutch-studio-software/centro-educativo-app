import React from 'react';

const VisitDateAndLevelFields = ({
  date,
  level,
  onChange,
  errors = {},
  idPrefix = 'booking',
}) => {
  const dateId = `${idPrefix}-date`;
  const levelId = `${idPrefix}-level`;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Fecha */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={dateId}
          className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant"
        >
          Fecha
        </label>
        <input
          id={dateId}
          type="date"
          name="date"
          value={date}
          onChange={onChange}
          className={`w-full bg-surface-container focus:bg-surface-container-lowest border border-transparent ${
            errors.date ? 'border-red-500 focus:border-red-500' : 'focus:border-primary/30'
          } rounded-xl px-4 py-3 font-body text-on-surface text-sm transition-all outline-none`}
        />
        {errors.date && (
          <span className="text-xs text-red-500 font-semibold">{errors.date}</span>
        )}
      </div>

      {/* Nivel */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={levelId}
          className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant"
        >
          Nivel
        </label>
        <select
          id={levelId}
          name="level"
          value={level}
          onChange={onChange}
          className={`w-full bg-surface-container focus:bg-surface-container-lowest border border-transparent ${
            errors.level ? 'border-red-500 focus:border-red-500' : 'focus:border-primary/30'
          } rounded-xl px-4 py-3 font-body text-on-surface text-sm transition-all outline-none`}
        >
          <option value="">Nivel...</option>
          <option value="inicial">Inicial</option>
          <option value="primario">Primario</option>
          <option value="secundario">Secundario</option>
        </select>
        {errors.level && (
          <span className="text-xs text-red-500 font-semibold">{errors.level}</span>
        )}
      </div>
    </div>
  );
};

export default VisitDateAndLevelFields;
