import React, { useState } from 'react';
import { isValidEmail, isValidPhone, isValidDni, formatDni, sanitizePhoneNumber } from '../../../utils/validators';

import { TRATAMIENTOS_DOCENTE, ESTADOS_DOCENTE } from './teacherConstants';

const NewTeacherModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    tratamiento: 'Prof.',
    nombre: '',
    apellido: '',
    dni: '',
    titulacion: '',
    especialidad: '',
    email: '',
    telefono: '',
    estado: 'Titular',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es obligatorio.';

    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio.';
    } else if (!isValidDni(formData.dni)) {
      newErrors.dni = 'El DNI debe tener entre 7 y 9 dígitos.';
    }

    if (!formData.titulacion.trim()) {
      newErrors.titulacion = 'El título universitario / pedagógico es obligatorio.';
    }

    if (!formData.especialidad.trim()) {
      newErrors.especialidad = 'La especialidad es obligatoria.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido.';
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio.';
    } else if (!isValidPhone(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe contener entre 10 y 11 dígitos numéricos.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        tratamiento: 'Prof.',
        nombre: '',
        apellido: '',
        dni: '',
        titulacion: '',
        especialidad: '',
        email: '',
        telefono: '',
        estado: 'Titular',
      });
      setErrors({});
      onClose();
    } catch (err) {
      console.error('Error al registrar docente:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer animate-in fade-in duration-200"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 flex flex-col border border-slate-100 animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                Alta de Personal Académico
              </span>
              <h2 className="text-xl font-extrabold text-slate-900">
                Registrar Nuevo Docente
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
            {/* Aviso Legajo Automático & Contraseña por DNI */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/70 rounded-2xl flex items-start gap-3">
              <span className="material-symbols-outlined text-blue-600 text-[20px] shrink-0 mt-0.5">
                badge
              </span>
              <div className="flex flex-col text-xs text-slate-700">
                <span className="font-bold text-blue-900">
                  Legajo y Credenciales Automáticas
                </span>
                <span className="text-[11px] text-slate-600 mt-0.5">
                  El número de legajo (#DOC-{new Date().getFullYear()}-XXXX) se asignará automáticamente al guardar. La contraseña por defecto para el primer ingreso será el número de DNI.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tratamiento / Prefijo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Tratamiento / Título
                </label>
                <select
                  name="tratamiento"
                  value={formData.tratamiento}
                  onChange={handleChange}
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
                <label className="text-xs font-bold text-slate-700">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="ej. Patricia"
                  className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
                    errors.nombre ? 'border-red-500' : 'border-slate-200 focus:border-blue-500/40'
                  }`}
                />
                {errors.nombre && <span className="text-[11px] text-red-500 font-medium px-2">{errors.nombre}</span>}
              </div>

              {/* Apellido */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Apellido *</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  placeholder="ej. Benítez"
                  className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
                    errors.apellido ? 'border-red-500' : 'border-slate-200 focus:border-blue-500/40'
                  }`}
                />
                {errors.apellido && <span className="text-[11px] text-red-500 font-medium px-2">{errors.apellido}</span>}
              </div>

              {/* DNI */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Documento Nacional (DNI) *</label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  placeholder="ej. 34.200.119"
                  className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
                    errors.dni ? 'border-red-500' : 'border-slate-200 focus:border-blue-500/40'
                  }`}
                />
                {errors.dni && <span className="text-[11px] text-red-500 font-medium px-2">{errors.dni}</span>}
              </div>

              {/* Estado */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Estado de Contratación *</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500/40"
                >
                  {ESTADOS_DOCENTE.map((est) => (
                    <option key={est} value={est}>
                      {est}
                    </option>
                  ))}
                </select>
              </div>

              {/* Especialidad (texto libre) */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Especialidad Académica (Texto libre) *</label>
                <input
                  type="text"
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleChange}
                  placeholder="ej. Ciencias Biológicas, Robótica Educativa, Matemática Superior"
                  className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
                    errors.especialidad ? 'border-red-500' : 'border-slate-200 focus:border-blue-500/40'
                  }`}
                />
                {errors.especialidad && <span className="text-[11px] text-red-500 font-medium px-2">{errors.especialidad}</span>}
              </div>

              {/* Título Universitario / Pedagógico */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Título Universitario / Pedagógico *</label>
                <input
                  type="text"
                  name="titulacion"
                  value={formData.titulacion}
                  onChange={handleChange}
                  placeholder="ej. Licenciada en Ciencias Biológicas & Máster en Docencia"
                  className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
                    errors.titulacion ? 'border-red-500' : 'border-slate-200 focus:border-blue-500/40'
                  }`}
                />
                {errors.titulacion && <span className="text-[11px] text-red-500 font-medium px-2">{errors.titulacion}</span>}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Correo Electrónico Institucional *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="p.benitez@educar.edu.ar"
                  className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
                    errors.email ? 'border-red-500' : 'border-slate-200 focus:border-blue-500/40'
                  }`}
                />
                {errors.email && <span className="text-[11px] text-red-500 font-medium px-2">{errors.email}</span>}
              </div>

              {/* Teléfono */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Teléfono de Contacto *</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="3624000000 (10 u 11 dígitos)"
                  className={`bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border ${
                    errors.telefono ? 'border-red-500' : 'border-slate-200 focus:border-blue-500/40'
                  }`}
                />
                {errors.telefono && <span className="text-[11px] text-red-500 font-medium px-2">{errors.telefono}</span>}
              </div>
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
                {isSubmitting ? 'Guardando...' : 'Guardar y Crear Legajo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewTeacherModal;
