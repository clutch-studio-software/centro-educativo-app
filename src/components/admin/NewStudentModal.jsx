import React, { useState } from 'react';

const NewStudentModal = ({ isOpen, onClose, onAddStudent }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    nivel: 'Primario',
    curso: '5to Grado A',
    tutorNombre: '',
    tutorTelefono: '',
    estado: 'Activo - Regular',
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.dni.trim() || !formData.tutorNombre.trim()) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }

    // Generate random legajo and initials
    const randomLegajoNum = Math.floor(1000 + Math.random() * 9000);
    const legajo = `#LEG-2027-${randomLegajoNum}`;
    const parts = formData.nombre.trim().split(' ');
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : formData.nombre.slice(0, 2).toUpperCase();

    const newStudent = {
      id: `s-${Date.now()}`,
      legajo,
      dni: formData.dni,
      nombre: formData.nombre,
      tutorNombre: formData.tutorNombre,
      tutorTelefono: formData.tutorTelefono || '11-0000-0000',
      nivel: formData.nivel,
      curso: formData.curso,
      cursoDisplay: `${formData.nivel} - ${formData.curso}`,
      estado: formData.estado,
      servicios: ['Comedor Escolar'],
      initials,
      avatarGradient: 'from-blue-500 to-indigo-500',
      badgeVariant:
        formData.nivel === 'Inicial'
          ? 'lime'
          : formData.nivel === 'Primario'
          ? 'sky'
          : 'indigo',
    };

    onAddStudent(newStudent);
    onClose();
  };

  return (
    <div
      data-testid="new-student-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        data-testid="new-student-modal"
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="material-symbols-outlined text-[22px]">person_add</span>
            </span>
            <div>
              <h3 data-testid="new-student-modal-title" className="font-extrabold text-slate-900 text-lg">
                Nuevo Alumno
              </h3>
              <p className="text-xs text-slate-400 font-medium">Registrar legajo académico Ciclo 2027</p>
            </div>
          </div>
          <button
            data-testid="new-student-modal-close-button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Form */}
        <form data-testid="new-student-form" onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div data-testid="new-student-error-alert" className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Nombre Completo del Alumno *
              </label>
              <input
                data-testid="new-student-name-input"
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="ej. Agustín Morales"
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                DNI del Alumno *
              </label>
              <input
                data-testid="new-student-dni-input"
                type="text"
                name="dni"
                required
                value={formData.dni}
                onChange={handleChange}
                placeholder="ej. 49.123.456"
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Nivel Educativo
              </label>
              <select
                data-testid="new-student-level-select"
                name="nivel"
                value={formData.nivel}
                onChange={handleChange}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Inicial">Nivel Inicial</option>
                <option value="Primario">Nivel Primario</option>
                <option value="Secundario">Nivel Secundario</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Curso / División
              </label>
              <input
                data-testid="new-student-course-input"
                type="text"
                name="curso"
                value={formData.curso}
                onChange={handleChange}
                placeholder="ej. 5to Grado A"
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Estado Inicial
              </label>
              <select
                data-testid="new-student-status-select"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all cursor-pointer"
              >
                <option value="Activo - Regular">Activo - Regular</option>
                <option value="Documentación Pendiente">Documentación Pendiente</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Nombre y Vínculo del Tutor *
              </label>
              <input
                data-testid="new-student-tutor-name-input"
                type="text"
                name="tutorNombre"
                required
                value={formData.tutorNombre}
                onChange={handleChange}
                placeholder="ej. Laura Morales (Madre)"
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Teléfono de Contacto
              </label>
              <input
                data-testid="new-student-tutor-phone-input"
                type="text"
                name="tutorTelefono"
                value={formData.tutorTelefono}
                onChange={handleChange}
                placeholder="ej. 11-4920-1928"
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white transition-all font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
            <button
              data-testid="new-student-cancel-button"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 font-bold text-xs rounded-full transition-colors cursor-pointer border-none bg-transparent"
            >
              Cancelar
            </button>
            <button
              data-testid="new-student-submit-button"
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-md shadow-blue-500/25 text-xs font-bold transition-all cursor-pointer border-none"
            >
              Registrar Alumno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewStudentModal;
