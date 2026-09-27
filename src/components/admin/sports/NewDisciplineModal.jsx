import React, { useState } from 'react';
import { EMOJI_OPTIONS, LEVEL_OPTIONS, DAY_OPTIONS } from '../../../data/mockSportsActivities';

const NewDisciplineModal = ({ isOpen, onClose, onSave, teachers = [] }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    emoji: '🏃',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    profesorNombre: '',
    profesorEmail: '',
    niveles: 'Primario y Secundario',
    dias: ['Lunes', 'Miércoles'],
    horario: '',
    lugar: '',
    cupoMax: 25,
    descripcion: '',
  });

  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmojiSelect = (opt) => {
    setFormData((prev) => ({
      ...prev,
      emoji: opt.emoji,
      bgColor: opt.bg,
      textColor: opt.text,
      nombre: prev.nombre ? prev.nombre : opt.label,
    }));
  };

  const handleToggleDay = (day) => {
    setFormData((prev) => {
      const current = prev.dias || [];
      const updated = current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day];
      return { ...prev, dias: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setError('Por favor ingresa el nombre de la disciplina deportiva o extracurricular.');
      return;
    }
    if (!formData.horario.trim()) {
      setError('Por favor indica los días y horarios previstos.');
      return;
    }

    const teacherName = formData.profesorNombre.trim() || 'Profesor a designar';
    const initials = teacherName
      .split(' ')
      .filter((w) => !w.toLowerCase().startsWith('prof') && !w.toLowerCase().startsWith('sensei'))
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'DOC';

    const newDiscipline = {
      id: `disc-${Date.now()}`,
      nombre: formData.nombre.trim(),
      emoji: formData.emoji,
      bgColor: formData.bgColor,
      textColor: formData.textColor,
      profesor: {
        nombre: teacherName,
        iniciales: initials,
        email: formData.profesorEmail.trim() || `${teacherName.toLowerCase().replace(/[^a-z]/g, '')}@colegio.edu.ar`,
        telefono: '+54 11 4455-0000',
      },
      niveles: formData.niveles,
      nivelId: formData.niveles,
      dias: formData.dias.length > 0 ? formData.dias : ['Lunes'],
      horario: formData.horario.trim(),
      lugar: formData.lugar.trim() || 'Campus Deportivo y Recreativo',
      cupoMax: Number(formData.cupoMax) || 25,
      cupoOcupado: 0,
      activo: true,
      descripcion: formData.descripcion.trim() || 'Actividad deportiva y extracurricular de formación integral.',
      inscriptos: [],
    };

    onSave(newDiscipline);
    onClose();
  };

  return (
    <div
      data-testid="new-discipline-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
              {formData.emoji}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">+ Nueva Disciplina / Actividad</h3>
              <p className="text-xs text-slate-500">
                Configuración de oferta extracurricular, cupos y responsable.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Emoji / Icon Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Icono / Tipo de Disciplina
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
              {EMOJI_OPTIONS.map((opt) => (
                <button
                  key={opt.emoji}
                  type="button"
                  onClick={() => handleEmojiSelect(opt)}
                  title={opt.label}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 transition-all cursor-pointer border-none ${
                    formData.emoji === opt.emoji
                      ? 'ring-2 ring-blue-600 shadow-md scale-105 ' + opt.bg
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                  }`}
                >
                  {opt.emoji}
                </button>
              ))}
            </div>
          </div>

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
              onChange={handleChange}
              placeholder="Ej: Tenis y Pádel Infantil"
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  placeholder="Ej: Prof. Diego Arzamendia"
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
                onChange={handleChange}
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
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Días de Entrenamiento / Clases
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DAY_OPTIONS.map((day) => {
                const isSelected = formData.dias.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
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
                onChange={handleChange}
                placeholder="Ej: Martes y Jueves 17:00 - 18:30"
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
                onChange={handleChange}
                placeholder="Ej: Cancha 2 - Gimnasio Techado"
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
              onChange={handleChange}
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
              onChange={handleChange}
              placeholder="Objetivos formativos, requerimientos o materiales necesarios..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border-none bg-transparent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="submit-new-discipline"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/25 transition-all cursor-pointer border-none"
            >
              Guardar Disciplina
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDisciplineModal;
