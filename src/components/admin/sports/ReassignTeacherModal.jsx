import React, { useState } from 'react';
import { MOCK_TEACHERS } from '../../../data/mockTeachers';

const ReassignTeacherModal = ({ isOpen, currentTeacher, onClose, onReassign }) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [customTeacher, setCustomTeacher] = useState({
    nombre: '',
    legajo: '',
    email: '',
  });

  if (!isOpen) return null;

  const handleSelectPredefined = (teacher) => {
    setSelectedTeacherId(teacher.id);
    setIsCustom(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCustom) {
      if (!customTeacher.nombre.trim()) return;
      const initials = customTeacher.nombre
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('');

      onReassign({
        nombre: customTeacher.nombre.trim(),
        legajo: customTeacher.legajo.trim() || '#DOC-1099',
        email: customTeacher.email.trim() || 'docente@educar.edu.ar',
        iniciales: initials || 'DC',
      });
    } else {
      const found = MOCK_TEACHERS.find((t) => t.id === selectedTeacherId);
      if (!found) return;
      const initials = `${found.nombre?.[0] || 'D'}${found.apellido?.[0] || 'C'}`.toUpperCase();
      onReassign({
        nombre: found.nombreCompleto || `Prof. ${found.nombre} ${found.apellido}`,
        legajo: found.legajo || '#DOC-1088',
        email: found.email || 'docente@educar.edu.ar',
        iniciales: initials,
      });
    }
    onClose();
  };

  return (
    <div
      data-testid="reassign-teacher-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">badge</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Reasignar Profesor Titular</h3>
              <p className="text-xs text-slate-500">
                Actual: <span className="font-semibold text-slate-700">{currentTeacher?.nombre}</span>
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setIsCustom(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !isCustom ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Cuerpo Docente Existente
            </button>
            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isCustom ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Nuevo Docente / Externo
            </button>
          </div>

          {!isCustom ? (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {MOCK_TEACHERS.map((teacher) => {
                const isSelected = selectedTeacherId === teacher.id;
                const initials = `${teacher.nombre?.[0] || 'D'}${teacher.apellido?.[0] || 'C'}`.toUpperCase();
                return (
                  <div
                    key={teacher.id}
                    onClick={() => handleSelectPredefined(teacher)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {initials}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{teacher.nombreCompleto}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{teacher.legajo} • {teacher.email}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="material-symbols-outlined text-primary text-base">check_circle</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  value={customTeacher.nombre}
                  onChange={(e) => setCustomTeacher({ ...customTeacher, nombre: e.target.value })}
                  placeholder="Ej: Prof. Alejandro Gómez"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Legajo Docente</label>
                  <input
                    type="text"
                    value={customTeacher.legajo}
                    onChange={(e) => setCustomTeacher({ ...customTeacher, legajo: e.target.value })}
                    placeholder="#DOC-1088"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email Institucional</label>
                  <input
                    type="email"
                    value={customTeacher.email}
                    onChange={(e) => setCustomTeacher({ ...customTeacher, email: e.target.value })}
                    placeholder="a.gomez@educar.edu.ar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border-none bg-transparent"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isCustom && !selectedTeacherId}
              className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-dim rounded-xl transition-all shadow-sm cursor-pointer border-none disabled:opacity-50"
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
