import React from 'react';
import {
  SUBJECTS_SUGGESTIONS,
  MORNING_SCHEDULE_SUGGESTIONS,
  AFTERNOON_SCHEDULE_SUGGESTIONS,
} from './teacherScheduleUtils';

const TeacherAddCatedraForm = ({
  formState,
  onFormChange,
  availableCourses,
  onAddCatedra,
  totalHoras,
  maxHoras = 30,
}) => {
  const currentHours = Number(formState.hours) || 0;
  const projectedTotal = totalHoras + currentHours;
  const isOverLimit = projectedTotal > maxHoras;
  const isAfternoon = formState.turno === 'Turno Tarde';
  const scheduleSuggestions = isAfternoon
    ? AFTERNOON_SCHEDULE_SUGGESTIONS
    : MORNING_SCHEDULE_SUGGESTIONS;

  return (
    <fieldset className="flex flex-col gap-3 border border-slate-200/80 bg-slate-50/60 rounded-2xl p-4 m-0">
      <legend className="font-bold text-sm text-slate-800 px-1 flex items-center gap-2">
        <span>Añadir Nueva Cátedra / Módulo Horario</span>
        {formState.turno && (
          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
              isAfternoon
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {isAfternoon ? '🌤️ Turno Tarde' : '☀️ Turno Mañana'}
          </span>
        )}
      </legend>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="drawer-nivel-select" className="text-xs font-semibold text-slate-500 mb-1 block">
            Nivel Educativo
          </label>
          <select
            id="drawer-nivel-select"
            value={formState.nivel}
            onChange={(e) => onFormChange('nivel', e.target.value)}
            className="w-full bg-white text-slate-800 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500/40 focus:outline-none"
          >
            <option value="Inicial">Nivel Inicial</option>
            <option value="Primario">Nivel Primario</option>
            <option value="Secundario">Nivel Secundario</option>
          </select>
        </div>

        <div>
          <label htmlFor="drawer-curso-select" className="text-xs font-semibold text-slate-500 mb-1 block">
            Curso y División
          </label>
          <select
            id="drawer-curso-select"
            value={formState.curso}
            onChange={(e) => onFormChange('curso', e.target.value)}
            className="w-full bg-white text-slate-800 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500/40 focus:outline-none"
          >
            {availableCourses.map((c) => (
              <option key={c.id || c.cursoValue} value={c.cursoValue}>
                {c.display || c.cursoValue}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="drawer-subject-input" className="text-xs font-semibold text-slate-500 mb-1 block">
            Asignatura / Materia
          </label>
          <input
            id="drawer-subject-input"
            type="text"
            list="drawer-subjects-datalist"
            value={formState.subjectName}
            onChange={(e) => onFormChange('subjectName', e.target.value)}
            placeholder="Ej. Matemática Aplicada"
            className="w-full bg-white text-slate-800 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500/40 focus:outline-none"
          >
          </input>
          <datalist id="drawer-subjects-datalist">
            {SUBJECTS_SUGGESTIONS.map((subj) => (
              <option key={subj} value={subj} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <div className="col-span-1">
            <label htmlFor="drawer-hours-input" className="text-xs font-semibold text-slate-500 mb-1 block">
              Hs/Sem
            </label>
            <input
              id="drawer-hours-input"
              type="number"
              min="1"
              max="20"
              value={formState.hours}
              onChange={(e) => onFormChange('hours', e.target.value)}
              className="w-full bg-white text-slate-800 text-xs font-medium px-2.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500/40 focus:outline-none text-center"
            />
          </div>
        </div>
      </div>

      {isOverLimit && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold animate-in fade-in">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          <span>
            No se puede vincular: la carga semanal superaría el tope institucional de {maxHoras} hs permitidas (alcanzaría {projectedTotal} hs).
          </span>
        </div>
      )}

      <div className="flex justify-end mt-1">
        <button
          type="button"
          disabled={isOverLimit}
          onClick={onAddCatedra}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs shadow-sm transition-all ${
            isOverLimit
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer active:scale-95'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Vincular Cátedra al Horario</span>
        </button>
      </div>
    </fieldset>
  );
};

export default TeacherAddCatedraForm;
