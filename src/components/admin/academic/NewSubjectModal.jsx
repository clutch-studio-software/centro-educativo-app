import React, { useState } from 'react';

const NewSubjectModal = ({ isOpen, onClose, onSave, courses = [], teachers = [], defaultCourseId }) => {
  const [formData, setFormData] = useState({
    cursoId: defaultCourseId || courses[0]?.id || '',
    nombre: '',
    cargaHoraria: '4 hs / semana',
    profesorId: teachers[0]?.id || '',
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
      setError('Por favor indica el nombre de la materia o unidad curricular.');
      return;
    }

    const selectedTeacher = teachers.find((t) => t.id === formData.profesorId);
    const teacherName = selectedTeacher
      ? selectedTeacher.nombreCompleto || `${selectedTeacher.nombre} ${selectedTeacher.apellido}`
      : 'Docente a cargo';
    const teacherLegajo = selectedTeacher?.legajo || '#DOC-1000';
    const initials = selectedTeacher
      ? `${selectedTeacher.nombre?.[0] || 'D'}${selectedTeacher.apellido?.[0] || 'C'}`.toUpperCase()
      : 'DC';

    const newSubject = {
      id: `sub-${Date.now()}`,
      cursoId: formData.cursoId || courses[0]?.id,
      nombre: formData.nombre.trim(),
      cargaHoraria: formData.cargaHoraria,
      profesor: {
        id: selectedTeacher?.id || 'doc-1',
        nombre: teacherName,
        legajo: teacherLegajo,
        initials,
        avatarBg: 'bg-indigo-100 text-indigo-700',
        online: true,
      },
      dictadoActivo: true,
    };

    onSave(newSubject);
    onClose();
  };

  return (
    <div
      data-testid="new-subject-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Agregar Materia Curricular</h3>
              <p className="text-xs text-slate-500">Asigna la materia y el docente responsable al plan de estudio.</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Curso Destino</label>
            <select
              name="cursoId"
              value={formData.cursoId}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} {c.orientacion ? `(${c.orientacion})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Nombre de la Materia / Espacio Curricular
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Química Aplicada o Robótica I"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Carga Horaria Semanal</label>
            <select
              name="cargaHoraria"
              value={formData.cargaHoraria}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="2 hs / semana">2 hs / semana</option>
              <option value="3 hs / semana">3 hs / semana</option>
              <option value="4 hs / semana">4 hs / semana</option>
              <option value="5 hs / semana">5 hs / semana</option>
              <option value="6 hs / semana">6 hs / semana</option>
              <option value="8 hs / semana">8 hs / semana</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Docente / Profesor Responsable
            </label>
            <select
              name="profesorId"
              value={formData.profesorId}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombreCompleto || `${t.nombre} ${t.apellido}`} - {t.especialidad || 'Docente'} ({t.legajo})
                </option>
              ))}
            </select>
          </div>

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
              Guardar Materia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewSubjectModal;
