import React from 'react';
import { LEVEL_OPTIONS } from '../../../data/mockSportsActivities';
import {
  DisciplineEmojiSelector,
  DisciplineDaysSelector,
} from './DisciplineCommonFields';

export const NewDisciplineFormFields = ({
  formData,
  onChange,
  onEmojiSelect,
  onToggleDay,
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
        <label htmlFor="new-disc-nombre" className="block font-semibold text-slate-700 mb-1.5">
          Nombre de la Disciplina / Taller *
        </label>
        <input
          id="new-disc-nombre"
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={onChange}
          placeholder="Ej: Tenis y Pádel Infantil"
          aria-label="Nombre de la Disciplina"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          required
        />
      </div>

      {/* Profesor a cargo y Nivel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="new-disc-profesor" className="block font-semibold text-slate-700 mb-1.5">
            Profesor a Cargo
          </label>
          {teachers.length > 0 ? (
            <select
              id="new-disc-profesor"
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
              id="new-disc-profesor"
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
          <label htmlFor="new-disc-niveles" className="block font-semibold text-slate-700 mb-1.5">
            Nivel Escolar Aplicable
          </label>
          <select
            id="new-disc-niveles"
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

      {/* Horario y Lugar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="new-disc-horario" className="block font-semibold text-slate-700 mb-1.5">
            Horario Detallado *
          </label>
          <input
            id="new-disc-horario"
            type="text"
            name="horario"
            value={formData.horario}
            onChange={onChange}
            placeholder="Ej: Martes y Jueves 17:00 - 18:30"
            aria-label="Horario Detallado"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="new-disc-lugar" className="block font-semibold text-slate-700 mb-1.5">
            Espacio Físico / Cancha
          </label>
          <input
            id="new-disc-lugar"
            type="text"
            name="lugar"
            value={formData.lugar}
            onChange={onChange}
            placeholder="Ej: Cancha 2 - Gimnasio Techado"
            aria-label="Espacio Físico / Cancha"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Cupo Máximo */}
      <div>
        <label htmlFor="new-disc-cupoMax" className="block font-semibold text-slate-700 mb-1.5">
          Cupo Máximo de Alumnos
        </label>
        <input
          id="new-disc-cupoMax"
          type="number"
          name="cupoMax"
          min="5"
          max="100"
          value={formData.cupoMax}
          onChange={onChange}
          aria-label="Cupo Máximo de Alumnos"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
        />
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="new-disc-descripcion" className="block font-semibold text-slate-700 mb-1.5">
          Descripción del Programa (Opcional)
        </label>
        <textarea
          id="new-disc-descripcion"
          name="descripcion"
          rows="2"
          value={formData.descripcion}
          onChange={onChange}
          placeholder="Objetivos formativos, requerimientos o materiales necesarios..."
          aria-label="Descripción del Programa"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
        />
      </div>
    </>
  );
};
