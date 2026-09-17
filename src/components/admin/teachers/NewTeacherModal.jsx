import React, { useState } from 'react';

const ESPECIALIDADES = [
  { key: 'exactas', label: 'Ciencias Exactas' },
  { key: 'lengua', label: 'Lengua & Literatura' },
  { key: 'robotica', label: 'Tecnología & Robótica' },
  { key: 'deportes', label: 'Educación Física' },
  { key: 'artes', label: 'Artes Plásticas y Música' },
  { key: 'idiomas', label: 'Idiomas Extranjeros' },
];

const NIVELES = [
  { key: 'secundario', label: 'Nivel Secundario' },
  { key: 'primario', label: 'Nivel Primario' },
  { key: 'inicial', label: 'Nivel Inicial' },
  { key: 'transversal', label: 'Transversal a todos los niveles' },
];

const ESTADOS_CONTRATACION = [
  'Titular - En Actividad',
  'Interino',
  'Suplente',
];

const NewTeacherModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    titulacion: '',
    especialidadKey: 'exactas',
    email: '',
    telefono: '',
    nivel: 'secundario',
    estadoContratacion: 'Titular - En Actividad',
    activarCredenciales: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedEsp = ESPECIALIDADES.find((esp) => esp.key === formData.especialidadKey);
      await onSubmit({
        ...formData,
        especialidad: selectedEsp ? selectedEsp.label : 'Ciencias Exactas',
      });
      // Reset form
      setFormData({
        nombre: '',
        dni: '',
        titulacion: '',
        especialidadKey: 'exactas',
        email: '',
        telefono: '',
        nivel: 'secundario',
        estadoContratacion: 'Titular - En Actividad',
        activarCredenciales: true,
      });
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombre Completo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Nombre Completo *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="ej. Dra. Patricia Benítez"
                  required
                  className="bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500/40"
                />
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
                  required
                  className="bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500/40"
                />
              </div>

              {/* Título */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Título Universitario / Pedagógico *</label>
                <input
                  type="text"
                  name="titulacion"
                  value={formData.titulacion}
                  onChange={handleChange}
                  placeholder="ej. Licenciada en Ciencias Biológicas"
                  required
                  className="bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500/40"
                />
              </div>

              {/* Especialidad */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Especialidad Académica Principal</label>
                <select
                  name="especialidadKey"
                  value={formData.especialidadKey}
                  onChange={handleChange}
                  className="bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500/40"
                >
                  {ESPECIALIDADES.map((esp) => (
                    <option key={esp.key} value={esp.key}>
                      {esp.label}
                    </option>
                  ))}
                </select>
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
                  required
                  className="bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500/40"
                />
              </div>

              {/* Teléfono */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Teléfono de Contacto *</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+54 9 362 400-0000"
                  required
                  className="bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500/40"
                />
              </div>

              {/* Nivel */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Nivel de Desempeño</label>
                <select
                  name="nivel"
                  value={formData.nivel}
                  onChange={handleChange}
                  className="bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500/40"
                >
                  {NIVELES.map((niv) => (
                    <option key={niv.key} value={niv.key}>
                      {niv.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contratación */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700">Estado de Contratación</label>
                <select
                  name="estadoContratacion"
                  value={formData.estadoContratacion}
                  onChange={handleChange}
                  className="bg-slate-50 px-4 py-2.5 rounded-full text-xs font-medium text-slate-800 focus:outline-none focus:bg-white border border-slate-200 focus:border-blue-500/40"
                >
                  {ESTADOS_CONTRATACION.map((est) => (
                    <option key={est} value={est}>
                      {est}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Switch de Credenciales */}
            <div className="mt-2 p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">
                  Activar Credenciales en Plataforma
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Se enviará un link seguro para configuración de contraseña institucional.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="activarCredenciales"
                  checked={formData.activarCredenciales}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
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
