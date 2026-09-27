import React, { useState } from 'react';
import { EMOJI_OPTIONS, LEVEL_OPTIONS, DAY_OPTIONS } from '../../../data/mockSportsActivities';

const EditDisciplineModalContent = ({ discipline, onClose, onSave, teachers = [] }) => {
  const [formData, setFormData] = useState({
    nombre: discipline.nombre || '',
    emoji: discipline.emoji || '🏃',
    bgColor: discipline.bgColor || 'bg-blue-50',
    textColor: discipline.textColor || 'text-blue-600',
    profesorNombre: discipline.profesor?.nombre || '',
    profesorEmail: discipline.profesor?.email || '',
    niveles: discipline.niveles || 'Primario y Secundario',
    dias: discipline.dias || ['Lunes', 'Miércoles'],
    horario: discipline.horario || '',
    lugar: discipline.lugar || '',
    cupoMax: discipline.cupoMax || 25,
    activo: discipline.activo ?? true,
    descripcion: discipline.descripcion || '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEmojiSelect = (opt) => {
    setFormData((prev) => ({
      ...prev,
      emoji: opt.emoji,
      bgColor: opt.bg,
      textColor: opt.text,
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
      setError('Por favor ingresa el nombre de la disciplina.');
      return;
    }
    if (!formData.horario.trim()) {
      setError('Por favor indica los días y horarios.');
      return;
    }

    const teacherName = formData.profesorNombre.trim() || discipline.profesor?.nombre || 'Docente a asignar';
    const initials =
      discipline.profesor?.nombre === teacherName && discipline.profesor?.iniciales
        ? discipline.profesor.iniciales
        : teacherName
            .split(' ')
            .filter((w) => !w.toLowerCase().startsWith('prof') && !w.toLowerCase().startsWith('sensei'))
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'DOC';

    const updatedDiscipline = {
      ...discipline,
      nombre: formData.nombre.trim(),
      emoji: formData.emoji,
      bgColor: formData.bgColor,
      textColor: formData.textColor,
      profesor: {
        ...discipline.profesor,
        nombre: teacherName,
        iniciales: initials,
        email: formData.profesorEmail.trim() || discipline.profesor?.email || '',
      },
      niveles: formData.niveles,
      nivelId: formData.niveles,
      dias: formData.dias.length > 0 ? formData.dias : discipline.dias,
      horario: formData.horario.trim(),
      lugar: formData.lugar.trim() || discipline.lugar,
      cupoMax: Number(formData.cupoMax) || discipline.cupoMax,
      activo: formData.activo,
      descripcion: formData.descripcion.trim(),
    };

    onSave(discipline.id, updatedDiscipline);
    onClose();
  };

  return (
    <div
      data-testid="edit-discipline-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className={`w-10 h-10 rounded-2xl ${formData.bgColor} ${formData.textColor} flex items-center justify-center font-bold text-xl shadow-xs`}
            >
              {formData.emoji}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Editar Disciplina: {discipline.nombre}
              </h3>
              <p className="text-xs text-slate-500">Actualiza las condiciones de dictado y cupos.</p>
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
            <label htmlFor="edit-disc-nombre" className="block font-semibold text-slate-700 mb-1.5">
              Nombre de la Disciplina *
            </label>
            <input
              id="edit-disc-nombre"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
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
                  id="edit-disc-profesor"
                  type="text"
                  name="profesorNombre"
                  value={formData.profesorNombre}
                  onChange={handleChange}
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
              <label htmlFor="edit-disc-horario" className="block font-semibold text-slate-700 mb-1.5">
                Horario Detallado *
              </label>
              <input
                id="edit-disc-horario"
                type="text"
                name="horario"
                value={formData.horario}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="edit-disc-lugar" className="block font-semibold text-slate-700 mb-1.5">
                Espacio Físico / Cancha
              </label>
              <input
                id="edit-disc-lugar"
                type="text"
                name="lugar"
                value={formData.lugar}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Cupo Máximo y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
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
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-slate-800 text-xs">
                  Oferta Activa para Inscripciones
                </span>
              </label>
            </div>
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
              onChange={handleChange}
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
              data-testid="submit-edit-discipline"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/25 transition-all cursor-pointer border-none"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EditDisciplineModal = ({ isOpen, discipline, onClose, onSave, teachers = [] }) => {
  if (!isOpen || !discipline) return null;

  return (
    <EditDisciplineModalContent
      key={discipline.id}
      discipline={discipline}
      onClose={onClose}
      onSave={onSave}
      teachers={teachers}
    />
  );
};

export default EditDisciplineModal;
