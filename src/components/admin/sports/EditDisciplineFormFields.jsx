import React from 'react';
import { LEVEL_OPTIONS } from '../../../data/mockSportsActivities';
import {
  DisciplineEmojiSelector,
  DisciplineDaysSelector,
  DisciplineScheduleByDay,
} from './DisciplineCommonFields';

export const EditDisciplineFormFields = ({
  formData,
  onChange,
  onEmojiSelect,
  onToggleDay,
  onScheduleChange,
  onCopyScheduleToAll,
  teachers,
  error,
}) => {
  return (
    <>
      {error && (
        <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Emoji / Icon Selector */}
      <DisciplineEmojiSelector
        selectedEmoji={formData.emoji}
        onSelectEmoji={onEmojiSelect}
      />

      {/* Nombre de la Disciplina */}
      <div>
        <label htmlFor="edit-disc-nombre" className="block font-semibold text-slate-700 mb-1.5">
          Nombre de la Disciplina *
        </label>
        <input
          id="edit-disc-nombre"
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={onChange}
          placeholder="Ej: Atletismo y Velocidad"
          aria-label="Nombre de la Disciplina"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          required
        />
      </div>

      {/* Profesor a cargo y Nivel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="edit-disc-profesor" className="block font-semibold text-slate-700 mb-1.5">
            Profesor a Cargo
          </label>
          {teachers.length > 0 ? (
            <select
              id="edit-disc-profesor"
              name="profesorNombre"
              value={formData.profesorNombre}
              onChange={onChange}
              aria-label="Profesor a Cargo"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="">Seleccionar profesor...</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.nombreCompleto || `${t.nombre} ${t.apellido}`}>
                  {t.nombreCompleto || `${t.nombre} ${t.apellido}`}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="edit-disc-profesor"
              type="text"
              name="profesorNombre"
              value={formData.profesorNombre}
              onChange={onChange}
              placeholder="Ej: Prof. Diego Arzamendia"
              aria-label="Profesor a Cargo"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            />
          )}
        </div>

        <div>
          <label htmlFor="edit-disc-niveles" className="block font-semibold text-slate-700 mb-1.5">
            Nivel Escolar Aplicable
          </label>
          <select
            id="edit-disc-niveles"
            name="niveles"
            value={formData.niveles}
            onChange={onChange}
            aria-label="Nivel Escolar Aplicable"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            {LEVEL_OPTIONS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Días de cursada */}
      <DisciplineDaysSelector
        selectedDays={formData.dias}
        onToggleDay={onToggleDay}
      />

      {/* Horarios por día seleccionado */}
      <DisciplineScheduleByDay
        selectedDays={formData.dias}
        horariosPorDia={formData.horariosPorDia}
        onScheduleChange={onScheduleChange}
        onCopyScheduleToAll={onCopyScheduleToAll}
        idPrefix="edit-disc"
      />

      {/* Espacio Físico / Cancha y Cupo Máximo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="edit-disc-lugar" className="block font-semibold text-slate-700 mb-1.5">
            Espacio Físico / Cancha
          </label>
          <input
            id="edit-disc-lugar"
            type="text"
            name="lugar"
            value={formData.lugar}
            onChange={onChange}
            placeholder="Ej: Pista de Atletismo / Polideportivo"
            aria-label="Espacio Físico / Cancha"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label htmlFor="edit-disc-cupoMax" className="block font-semibold text-slate-700 mb-1.5">
            Cupo Máximo
          </label>
          <input
            id="edit-disc-cupoMax"
            type="number"
            name="cupoMax"
            min="5"
            max="100"
            value={formData.cupoMax}
            onChange={onChange}
            aria-label="Cupo Máximo"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Estado */}
      <div className="pt-1">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            name="activo"
            checked={formData.activo}
            onChange={onChange}
            aria-label="Oferta Activa para Inscripciones"
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
          />
          <span className="font-semibold text-slate-800 text-xs">
            Oferta Activa para Inscripciones
          </span>
        </label>
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="edit-disc-descripcion" className="block font-semibold text-slate-700 mb-1.5">
          Descripción del Programa (Opcional)
        </label>
        <textarea
          id="edit-disc-descripcion"
          name="descripcion"
          rows="2"
          value={formData.descripcion}
          onChange={onChange}
          aria-label="Descripción del Programa"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
        />
      </div>
    </>
  );
};
