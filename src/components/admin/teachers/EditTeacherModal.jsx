import React, { useState, useRef, useEffect } from 'react';
import { formatDni, sanitizePhoneNumber } from '../../../utils/validators';

import { TRATAMIENTOS_DOCENTE, ESTADOS_DOCENTE, validateTeacherForm } from './teacherConstants';

const getInitialTeacherFormData = (teacher) => {
  const cleanNombre = teacher?.nombre || '';
  const cleanApellido = teacher?.apellido || '';
  const matchTratamiento = teacher?.nombreCompleto?.match(/^(Prof\.|Ing\.|Lic\.|Dra\.|Dr\.|Mg\.|Tec\.)/)?.[0];
  const tratamiento = teacher?.tratamiento || matchTratamiento || 'Prof.';

  return {
    tratamiento,
    nombre: cleanNombre,
    apellido: cleanApellido,
    dni: formatDni(teacher?.dni || ''),
    titulacion: teacher?.titulacion || '',
    especialidad: teacher?.especialidad || '',
    email: teacher?.email || '',
    telefono: teacher?.telefono || '',
    estado: teacher?.estado || 'Titular',
  };
};

const EditTeacherIdentityFields = ({ formData, errors, onChange }) => (
  <>
    {/* Tratamiento / Prefijo */}
    <div className="flex flex-col gap-1.5">
      <label htmlFor="edit-teacher-tratamiento" className="text-xs font-bold text-slate-700">
        Tratamiento / Título
      </label>
      <select
        id="edit-teacher-tratamiento"
        name="tratamiento"
        value={formData.tratamiento}
        onChange={onChange}
        className="bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500/40 cursor-pointer"
      >
        {TRATAMIENTOS_DOCENTE.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
    </div>

    {/* Nombre */}
    <div className="flex flex-col gap-1.5">
      <label htmlFor="edit-teacher-nombre" className="text-xs font-bold text-slate-700">Nombre *</label>
      <input
        id="edit-teacher-nombre"
        type="text"
        name="nombre"
        value={formData.nombre}
        onChange={onChange}
        placeholder="ej. Mariana"
        className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
          errors.nombre ? 'border-red-500' : 'border-slate-200 focus:border-blue-500/40'
        }`}
      />
      {errors.nombre && <span className="text-[11px] text-red-500 font-medium px-2">{errors.nombre}</span>}
    </div>

    {/* Apellido */}
    <div className="flex flex-col gap-1.5">
      <label htmlFor="edit-teacher-apellido" className="text-xs font-bold text-slate-700">Apellido *</label>
      <input
        id="edit-teacher-apellido"
        type="text"
        name="apellido"
        value={formData.apellido}
        onChange={onChange}
        placeholder="ej. Valenzuela"
        className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
          errors.apellido ? 'border-red-500' : 'border-slate-200 focus:border-blue-500/40'
        }`}
      />
      {errors.apellido && <span className="text-[11px] text-red-500 font-medium px-2">{errors.apellido}</span>}
    </div>

    {/* DNI */}
    <div className="flex flex-col gap-1.5">
      <label htmlFor="edit-teacher-dni" className="text-xs font-bold text-slate-700">Documento Nacional (DNI) *</label>
      <input
        id="edit-teacher-dni"
        type="text"
        name="dni"
        value={formData.dni}
        onChange={onChange}
        placeholder="ej. 32.189.440"
        className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
          errors.dni ? 'border-red-500' : 'border-slate-200 focus:border-blue-500/40'
        }`}
      />
      {errors.dni && <span className="text-[11px] text-red-500 font-medium px-2">{errors.dni}</span>}
    </div>

    {/* Estado */}
    <div className="flex flex-col gap-1.5">
      <label htmlFor="edit-teacher-estado" className="text-xs font-bold text-slate-700">Estado de Contratación / Situación *</label>
      <select
        id="edit-teacher-estado"
        name="estado"
        value={formData.estado}
        onChange={onChange}
        className="bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500/40"
      >
        {ESTADOS_DOCENTE.map((est) => (
          <option key={est} value={est}>
            {est}
          </option>
        ))}
      </select>
    </div>
  </>
);

const EditTeacherProfessionalFields = ({ formData, errors, onChange }) => (
  <>
    {/* Especialidad (texto libre) */}
    <div className="flex flex-col gap-1.5 sm:col-span-2">
      <label htmlFor="edit-teacher-especialidad" className="text-xs font-bold text-slate-700">Especialidad Académica (Texto libre) *</label>
      <input
        id="edit-teacher-especialidad"
        type="text"
        name="especialidad"
        value={formData.especialidad}
        onChange={onChange}
        placeholder="ej. Ciencias Exactas, Matemática Aplicada & Robótica"
        className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
          errors.especialidad ? 'border-red-500' : 'border-slate-200 focus:border-blue-500/40'
        }`}
      />
      {errors.especialidad && <span className="text-[11px] text-red-500 font-medium px-2">{errors.especialidad}</span>}
    </div>

    {/* Título Universitario / Pedagógico */}
    <div className="flex flex-col gap-1.5 sm:col-span-2">
      <label htmlFor="edit-teacher-titulacion" className="text-xs font-bold text-slate-700">Título Universitario / Pedagógico *</label>
      <input
        id="edit-teacher-titulacion"
        type="text"
        name="titulacion"
        value={formData.titulacion}
        onChange={onChange}
        placeholder="ej. Profesora Superior en Matemática y Estadística"
        className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
          errors.titulacion ? 'border-red-500' : 'border-slate-200 focus:border-blue-500/40'
        }`}
      />
      {errors.titulacion && <span className="text-[11px] text-red-500 font-medium px-2">{errors.titulacion}</span>}
    </div>
  </>
);

const EditTeacherContactFields = ({ formData, errors, onChange }) => (
  <>
    {/* Email */}
    <div className="flex flex-col gap-1.5">
      <label htmlFor="edit-teacher-email" className="text-xs font-bold text-slate-700">Correo Electrónico Institucional *</label>
      <input
        id="edit-teacher-email"
        type="email"
        name="email"
        value={formData.email}
        onChange={onChange}
        placeholder="m.valenzuela@educar.edu.ar"
        className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
          errors.email ? 'border-red-500' : 'border-slate-200 focus:border-blue-500/40'
        }`}
      />
      {errors.email && <span className="text-[11px] text-red-500 font-medium px-2">{errors.email}</span>}
    </div>

    {/* Teléfono */}
    <div className="flex flex-col gap-1.5">
      <label htmlFor="edit-teacher-telefono" className="text-xs font-bold text-slate-700">Teléfono de Contacto *</label>
      <input
        id="edit-teacher-telefono"
        type="tel"
        name="telefono"
        value={formData.telefono}
        onChange={onChange}
        placeholder="3624891120 (10 u 11 dígitos)"
        className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
          errors.telefono ? 'border-red-500' : 'border-slate-200 focus:border-blue-500/40'
        }`}
      />
      {errors.telefono && <span className="text-[11px] text-red-500 font-medium px-2">{errors.telefono}</span>}
    </div>
  </>
);

const EditTeacherModalContent = ({ teacher, onClose, onSave }) => {
  const [formData, setFormData] = useState(() => getInitialTeacherFormData(teacher));

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dni') {
      setFormData((prev) => ({ ...prev, dni: formatDni(value) }));
    } else if (name === 'telefono') {
      setFormData((prev) => ({ ...prev, telefono: sanitizePhoneNumber(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = validateTeacherForm(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave(teacher.id, formData);
      onClose();
    } catch (err) {
      console.error('Error al modificar docente:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogRef = useRef(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (!el.open) el.showModal();
    const handleCancel = (e) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener('cancel', handleCancel);
    return () => el.removeEventListener('cancel', handleCancel);
  }, [onClose]);
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="edit-teacher-dialog-title"
      className="fixed inset-0 z-50 overflow-hidden bg-transparent p-0 max-w-none w-full h-full"
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in duration-200"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                  Modificación de Legajo Docente
                </span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-mono text-[10px] font-bold rounded-full">
                  {teacher.legajo}
                </span>
              </div>
              <h2 id="edit-teacher-dialog-title" className="text-xl font-extrabold text-slate-900 text-left">
                Editar Datos del Docente
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
              title="Cerrar modal"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[76vh]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EditTeacherIdentityFields formData={formData} errors={errors} onChange={handleChange} />
              <EditTeacherProfessionalFields formData={formData} errors={errors} onChange={handleChange} />
              <EditTeacherContactFields formData={formData} errors={errors} onChange={handleChange} />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-full shadow-[0_4px_14px_rgba(11,80,213,0.3)] transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
};

const EditTeacherModal = ({ isOpen, teacher, onClose, onSave }) => {
  if (!isOpen || !teacher) return null;

  return (
    <EditTeacherModalContent
      key={teacher.id}
      teacher={teacher}
      onClose={onClose}
      onSave={onSave}
    />
  );
};

export default EditTeacherModal;
