import React, { useState } from 'react';
import { ACADEMIC_LEVELS } from '../../../data/mockAcademicOffer';
import {
  COURSES_BY_ACADEMIC_LEVEL,
  normalizeAcademicText,
} from '../../../utils/academicUtils';

const SHIFT_OPTIONS = [
  { value: 'Turno Mañana', label: 'Mañana' },
  { value: 'Turno Tarde', label: 'Tarde' },
];

const EMPTY_TEACHERS = [];
const EMPTY_COURSES = [];

const NewCourseModalHeader = ({ onClose }) => (
  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
    <div className="flex items-center gap-3">
      <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
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
);

const NewCourseBasicFields = ({ formData, handleChange }) => {
  const currentCourses = COURSES_BY_ACADEMIC_LEVEL[formData.nivelId] || [];

  return (
    <>
      {/* Nivel Pedagógico */}
      <div>
        <label htmlFor="new-course-nivelId" className="block font-semibold text-slate-700 mb-1.5">
          Nivel Pedagógico
        </label>
        <select
          id="new-course-nivelId"
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

      {/* Nombre del Curso y División */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label htmlFor="new-course-nombre" className="block font-semibold text-slate-700 mb-1.5">
            Curso / Grado / Sala
          </label>
          <select
            id="new-course-nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            {currentCourses.map((cursoName) => (
              <option key={cursoName} value={cursoName}>
                {cursoName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="new-course-division" className="block font-semibold text-slate-700 mb-1.5">
            División (1 letra)
          </label>
          <input
            id="new-course-division"
            type="text"
            name="division"
            maxLength={1}
            value={formData.division}
            onChange={handleChange}
            placeholder="Ej: A"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-center text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase tracking-widest"
          />
        </div>
      </div>

      {/* Orientación si es secundario */}
      {formData.nivelId === 'secundario' && (
        <div>
          <label htmlFor="new-course-orientacion" className="block font-semibold text-slate-700 mb-1.5">
            Orientación o Modalidad (opcional)
          </label>
          <input
            id="new-course-orientacion"
            type="text"
            name="orientacion"
            value={formData.orientacion}
            onChange={handleChange}
            placeholder="Ej: Cs. Naturales, Robótica y Sistemas, Arte"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      )}
    </>
  );
};

const NewCourseLogisticsFields = ({ formData, handleChange, teachers }) => (
  <>
    {/* Turno y Aula en grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label htmlFor="new-course-turno" className="block font-semibold text-slate-700 mb-1.5">Turno</label>
        <select
          id="new-course-turno"
          name="turno"
          value={formData.turno}
          onChange={handleChange}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
        >
          {SHIFT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="new-course-aula" className="block font-semibold text-slate-700 mb-1.5">Aula / Espacio</label>
        <input
          id="new-course-aula"
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
        <label htmlFor="new-course-cupoMax" className="block font-semibold text-slate-700 mb-1.5">Cupo Máximo</label>
        <input
          id="new-course-cupoMax"
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
        <label htmlFor="new-course-docente-preceptor" className="block font-semibold text-slate-700 mb-1.5">
          {formData.nivelId === 'secundario' ? 'Preceptor Asignado' : 'Docente Titular'}
        </label>
        <select
          id="new-course-docente-preceptor"
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
  </>
);

const NewCourseForm = ({
  formData,
  handleChange,
  handleSubmit,
  onClose,
  error,
  teachers,
}) => (
  <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
    {error && (
      <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-medium">
        {error}
      </div>
    )}

    <NewCourseBasicFields formData={formData} handleChange={handleChange} />
    <NewCourseLogisticsFields formData={formData} handleChange={handleChange} teachers={teachers} />

    {/* Modal Actions */}
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
        Crear Curso
      </button>
    </div>
  </form>
);

const NewCourseModal = ({
  isOpen,
  onClose,
  onSave,
  teachers = EMPTY_TEACHERS,
  courses = EMPTY_COURSES,
  defaultNivelId = 'inicial',
}) => {
  const initialNivel = defaultNivelId in COURSES_BY_ACADEMIC_LEVEL ? defaultNivelId : 'inicial';
  const initialCursos = COURSES_BY_ACADEMIC_LEVEL[initialNivel] || [];

  const [formData, setFormData] = useState({
    nivelId: initialNivel,
    nombre: initialCursos[0] || 'Sala de 2 Años',
    division: 'A',
    orientacion: '',
    turno: 'Turno Mañana',
    aula: '',
    cupoMax: 30,
    docenteTitular: '',
    preceptor: '',
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'nivelId') {
      const levelCursos = COURSES_BY_ACADEMIC_LEVEL[value] || [];
      setFormData((prev) => ({
        ...prev,
        nivelId: value,
        nombre: levelCursos[0] || '',
      }));
      setError('');
      return;
    }

    if (name === 'division') {
      const singleLetter = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 1);
      setFormData((prev) => ({ ...prev, division: singleLetter }));
      setError('');
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setError('Por favor selecciona un curso válido.');
      return;
    }

    const divisionClean = formData.division.trim().toUpperCase();
    if (!divisionClean || !/^[A-Z]$/.test(divisionClean)) {
      setError('La división debe ser una única letra entre la A y la Z (Ej: A, B, C, D).');
      return;
    }

    const nombreClean = formData.nombre.trim();

    // Verificación de cursos duplicados en el mismo nivel
    const isDuplicate = courses.some((c) => {
      if (c.nivelId !== formData.nivelId) return false;
      const isSameCourse =
        normalizeAcademicText(c.nombre) === normalizeAcademicText(nombreClean);
      const existingDivision = (c.division || 'A').toUpperCase().trim();
      return isSameCourse && existingDivision === divisionClean;
    });

    if (isDuplicate) {
      setError(
        `Ya existe la división "${divisionClean}" para el curso "${nombreClean}". No puede haber cursos con divisiones duplicadas.`
      );
      return;
    }

    const newCourse = {
      id: `curso-${formData.nivelId.slice(0, 2)}-${Date.now()}`,
      nivelId: formData.nivelId,
      nombre: nombreClean,
      division: divisionClean,
      nombreCompleto: `${nombreClean} "${divisionClean}"`,
      orientacion: formData.orientacion.trim() || '',
      turno: formData.turno,
      aula: formData.aula.trim() || 'Aula a asignar',
      cupoMax: Number(formData.cupoMax) || 30,
      cupoOcupado: 0,
      cupoTexto: `${formData.cupoMax} vacantes`,
      isLleno: false,
      barColor: formData.nivelId === 'inicial' ? 'bg-amber-400' : 'bg-blue-600',
      dotColor: formData.nivelId === 'inicial' ? 'bg-amber-400' : '',
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
        <NewCourseModalHeader onClose={onClose} />
        <NewCourseForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          onClose={onClose}
          error={error}
          teachers={teachers}
        />
      </div>
    </div>
  );
};

export default NewCourseModal;
