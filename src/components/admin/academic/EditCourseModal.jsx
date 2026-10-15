import React, { useState } from 'react';
import { parseCourseDivision } from '../../../data/mockAcademicOffer';

const EMPTY_TEACHERS = [];

const buildUpdatedCourse = (course, formData) => {
  const cupoMax = Number(formData.cupoMax) || 30;
  const cupoOcupado = Number(formData.cupoOcupado) || 0;
  const isLleno = cupoOcupado >= cupoMax;
  const vacantes = Math.max(0, cupoMax - cupoOcupado);
  const nombreClean = formData.nombre.trim();
  const divisionClean = formData.division.trim() || 'A';

  return {
    ...course,
    nombre: nombreClean,
    division: divisionClean,
    nombreCompleto: `${nombreClean} "${divisionClean}"`,
    turno: formData.turno,
    aula: formData.aula.trim(),
    cupoMax,
    cupoOcupado,
    cupoTexto: isLleno ? '100% Lleno' : `${vacantes} Vacantes`,
    isLleno,
    docenteTitular: formData.docenteTitular,
    preceptor: formData.preceptor,
    activo: formData.activo,
    barColor: isLleno ? 'bg-rose-500' : 'bg-blue-600',
  };
};

const CourseBasicFields = ({ formData, onChange }) => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label htmlFor="edit-course-nombre" className="block font-semibold text-slate-700 mb-1.5">
            Nombre del Curso / Grado
          </label>
          <input
            id="edit-course-nombre"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={onChange}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="edit-course-division" className="block font-semibold text-slate-700 mb-1.5">
            División
          </label>
          <input
            id="edit-course-division"
            type="text"
            name="division"
            value={formData.division}
            onChange={onChange}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="edit-course-turno" className="block font-semibold text-slate-700 mb-1.5">
            Turno
          </label>
          <select
            id="edit-course-turno"
            name="turno"
            value={formData.turno}
            onChange={onChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="Turno Mañana">Mañana</option>
            <option value="Turno Tarde">Tarde</option>
          </select>
        </div>

        <div>
          <label htmlFor="edit-course-aula" className="block font-semibold text-slate-700 mb-1.5">
            Aula Asignada
          </label>
          <input
            id="edit-course-aula"
            type="text"
            name="aula"
            value={formData.aula}
            onChange={onChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>
    </>
  );
};

const CourseStaffSelect = ({ course, formData, teachers, onChange }) => {
  const isSecundario = course.nivelId === 'secundario';
  const labelText = isSecundario ? 'Preceptor Asignado' : 'Docente Titular';
  const fieldName = isSecundario ? 'preceptor' : 'docenteTitular';
  const fieldValue = isSecundario ? formData.preceptor : formData.docenteTitular;

  return (
    <div>
      <label htmlFor="edit-course-docente-preceptor" className="block font-semibold text-slate-700 mb-1.5">
        {labelText}
      </label>
      <select
        id="edit-course-docente-preceptor"
        name={fieldName}
        value={fieldValue}
        onChange={onChange}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
      >
        <option value="">Sin designar</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.nombreCompleto || `${t.nombre} ${t.apellido}`}>
            {t.nombreCompleto || `${t.nombre} ${t.apellido}`} ({t.legajo})
          </option>
        ))}
      </select>
    </div>
  );
};

const EditCourseForm = ({ course, teachers, onSave, onClose }) => {
  const parsed = parseCourseDivision(course);
  const isTarde = String(course.turno || '').toLowerCase().includes('tarde');

  const [formData, setFormData] = useState({
    nombre: course.nombre || parsed.nombre || '',
    division: course.division || parsed.division || 'A',
    turno: isTarde ? 'Turno Tarde' : 'Turno Mañana',
    aula: course.aula || '',
    cupoMax: course.cupoMax || 30,
    cupoOcupado: course.cupoOcupado || 0,
    docenteTitular: course.docenteTitular || '',
    preceptor: course.preceptor || '',
    activo: course.activo !== false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = buildUpdatedCourse(course, formData);
    onSave(course.id, updated);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
      <CourseBasicFields formData={formData} onChange={handleChange} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <span className="block font-semibold text-slate-700 mb-1.5">Alumnos Inscriptos</span>
          <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 flex items-center justify-between">
            <span className="font-bold text-slate-900">{course.cupoOcupado || 0} alumnos</span>
            <span className="text-[10px] text-slate-400 font-semibold bg-white px-2 py-0.5 rounded-md border border-slate-200">
              Cálculo automático
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Calculado según los legajos asignados a esta división.</p>
        </div>

        <div>
          <label htmlFor="edit-course-cupoMax" className="block font-semibold text-slate-700 mb-1.5">
            Cupo Máximo
          </label>
          <input
            id="edit-course-cupoMax"
            type="number"
            name="cupoMax"
            min="1"
            max="60"
            value={formData.cupoMax}
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      <CourseStaffSelect
        course={course}
        formData={formData}
        teachers={teachers}
        onChange={handleChange}
      />

      {/* Toggle Activo */}
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
        <div>
          <span className="font-bold text-slate-800">Estado de la División</span>
          <p className="text-[11px] text-slate-400">Permite inscripciones y asignación curricular activa.</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <span className="sr-only">Estado de la División</span>
          <input
            type="checkbox"
            name="activo"
            checked={formData.activo}
            onChange={handleChange}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>

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
          className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/25 transition-all cursor-pointer border-none"
        >
          Guardar Cambios
        </button>
      </div>
    </form>
  );
};

const EditCourseModal = ({ isOpen, onClose, onSave, course, teachers = EMPTY_TEACHERS }) => {
  if (!isOpen || !course) return null;

  return (
    <div
      data-testid="edit-course-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">edit</span>
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">Editar / Gestionar Curso</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <EditCourseForm
          key={course.id}
          course={course}
          teachers={teachers}
          onSave={onSave}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default EditCourseModal;
