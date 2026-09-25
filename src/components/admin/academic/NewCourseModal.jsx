import React, { useState } from 'react';
import { ACADEMIC_LEVELS } from '../../../data/mockAcademicOffer';

const SHIFT_OPTIONS = [
  'Turno Mañana (08:00 - 12:00)',
  'Turno Tarde (13:00 - 17:00)',
  'Jornada Simple (Mañana)',
  'Jornada Simple (Tarde)',
  'Jornada Completa',
  'Turno Mañana (07:30 - 13:30)',
  'Turno Tarde (13:30 - 19:30)',
];

const NewCourseModal = ({ isOpen, onClose, onSave, teachers = [] }) => {
  const [formData, setFormData] = useState({
    nivelId: 'secundario',
    nombre: '',
    orientacion: '',
    turno: 'Turno Mañana (07:30 - 13:30)',
    aula: '',
    cupoMax: 30,
    docenteTitular: '',
    preceptor: '',
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setError('Por favor ingresa el nombre de la sala, grado o curso.');
      return;
    }

    const newCourse = {
      id: `curso-${Date.now()}`,
      nivelId: formData.nivelId,
      nombre: formData.nombre.trim(),
      orientacion: formData.orientacion.trim() || undefined,
      turno: formData.turno,
      aula: formData.aula.trim() || 'Aula a asignar',
      cupoMax: Number(formData.cupoMax) || 30,
      cupoOcupado: 0,
      cupoTexto: `${formData.cupoMax} vacantes`,
      isLleno: false,
      barColor: formData.nivelId === 'inicial' ? 'bg-amber-400' : 'bg-blue-600',
      dotColor: formData.nivelId === 'inicial' ? 'bg-amber-400' : undefined,
      docenteTitular: formData.docenteTitular || (teachers[0]?.nombreCompleto || 'Docente a asignar'),
      preceptor: formData.preceptor || 'Preceptor a designar',
      materiasCount: 0,
      activo: true,
    };

    onSave(newCourse);
    onClose();
  };

  return (
    <div
      data-testid="new-course-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Crear Nueva División o Curso</h3>
              <p className="text-xs text-slate-500">Configura la oferta pedagógica y asignación inicial.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Nivel Pedagógico */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Nivel Pedagógico</label>
            <select
              name="nivelId"
              value={formData.nivelId}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              {ACADEMIC_LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.name} ({lvl.shortCode})
                </option>
              ))}
            </select>
          </div>

          {/* Nombre del Curso */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Nombre de la Sala / Grado / Curso
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder='Ej: 2° Grado "A" o Sala 4 Años "Verde"'
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Orientación si es secundario */}
          {formData.nivelId === 'secundario' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Orientación o Modalidad (opcional)
              </label>
              <input
                type="text"
                name="orientacion"
                value={formData.orientacion}
                onChange={handleChange}
                placeholder="Ej: Cs. Naturales, Robótica y Sistemas, Arte"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          )}

          {/* Turno y Aula en grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Turno / Jornada</label>
              <select
                name="turno"
                value={formData.turno}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                {SHIFT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Aula / Espacio</label>
              <input
                type="text"
                name="aula"
                value={formData.aula}
                onChange={handleChange}
                placeholder="Ej: Aula 14 - P.B."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Cupo Máximo y Docente/Preceptor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Cupo Máximo</label>
              <input
                type="number"
                name="cupoMax"
                min="5"
                max="50"
                value={formData.cupoMax}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                {formData.nivelId === 'secundario' ? 'Preceptor Asignado' : 'Docente Titular'}
              </label>
              <select
                name={formData.nivelId === 'secundario' ? 'preceptor' : 'docenteTitular'}
                value={formData.nivelId === 'secundario' ? formData.preceptor : formData.docenteTitular}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="">Seleccionar personal...</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.nombreCompleto || `${t.nombre} ${t.apellido}`}>
                    {t.nombreCompleto || `${t.nombre} ${t.apellido}`} ({t.legajo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/25 transition-all cursor-pointer"
            >
              Crear Curso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCourseModal;
