import React, { useState } from 'react';

const ReassignTeacherModal = ({ isOpen, onClose, onSave, subject, teachers = [] }) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState(subject?.profesor?.id || teachers[0]?.id || '');

  if (!isOpen || !subject) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTeacher = teachers.find((t) => t.id === selectedTeacherId);
    if (!newTeacher) return;

    const teacherName = newTeacher.nombreCompleto || `${newTeacher.nombre} ${newTeacher.apellido}`;
    const initials = `${newTeacher.nombre?.[0] || 'D'}${newTeacher.apellido?.[0] || 'C'}`.toUpperCase();

    const updatedProfesor = {
      id: newTeacher.id,
      nombre: teacherName,
      legajo: newTeacher.legajo,
      initials,
      avatarBg: 'bg-indigo-100 text-indigo-700',
      online: newTeacher.estado !== 'Suspendido',
    };

    onSave(subject.id, updatedProfesor);
    onClose();
  };

  return (
    <div
      data-testid="reassign-teacher-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Reasignar Docente a Cargo</h3>
              <p className="text-xs text-slate-500">Designación de nuevo titular de cátedra.</p>
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
          {/* Info de la materia */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Materia / Unidad Curricular
            </span>
            <p className="font-bold text-slate-900 text-sm">{subject.nombre}</p>
            <p className="text-slate-500">
              Docente actual: <strong className="text-slate-700">{subject.profesor?.nombre}</strong> ({subject.profesor?.legajo})
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Nuevo Docente / Profesor Responsable
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
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
              Confirmar Reasignación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReassignTeacherModal;
