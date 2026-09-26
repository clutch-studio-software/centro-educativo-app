import React, { useState } from 'react';

const EnrollStudentModal = ({ isOpen, onClose, onEnroll, currentCount = 38, maxCapacity = 40 }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    nivel: 'Primario',
    curso: '5° Grado',
    division: 'A',
    tutor: '',
    tutorTelefono: '',
    condicion: 'Regular • Al día',
    condicionTipo: 'regular',
    estadoCuota: 'Al Día',
    aptoMedico: true,
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre completo es obligatorio';
    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (!/^\d{7,8}$/.test(formData.dni.replace(/\D/g, ''))) {
      newErrors.dni = 'DNI inválido (debe tener 7 u 8 dígitos)';
    }
    if (!formData.tutor.trim()) newErrors.tutor = 'El nombre del tutor es obligatorio';
    if (!formData.tutorTelefono.trim()) newErrors.tutorTelefono = 'El teléfono de contacto es obligatorio';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const cleanDni = formData.dni.replace(/\D/g, '');
    const formattedDni = cleanDni.length === 8
      ? `${cleanDni.slice(0, 2)}.${cleanDni.slice(2, 5)}.${cleanDni.slice(5)}`
      : cleanDni;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newLegajo = `#ALU-${randomSuffix}`;

    const initials = formData.nombre
      .trim()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');

    const newStudent = {
      id: `ALU-${randomSuffix}`,
      legajo: newLegajo,
      nombre: formData.nombre.trim(),
      dni: formattedDni,
      iniciales: initials || 'AL',
      avatarGrad: 'from-blue-600 to-indigo-600',
      nivel: formData.nivel,
      curso: formData.curso,
      division: `${formData.curso} ${formData.division}`,
      cursoCompleto: `${formData.nivel} - ${formData.curso} ${formData.division}`,
      tutor: formData.tutor.trim(),
      tutorTelefono: formData.tutorTelefono.trim(),
      fechaInscripcion: new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      condicion: formData.condicion,
      condicionTipo: formData.condicionTipo,
      estadoCuota: formData.estadoCuota,
      aptoMedico: formData.aptoMedico,
    };

    onEnroll(newStudent);
    onClose();
  };

  const isFull = currentCount >= maxCapacity;

  return (
    <div
      data-testid="enroll-student-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">person_add</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Inscribir Alumno en Atletismo</h3>
              <p className="text-xs text-slate-500">
                Ocupación: {currentCount} / {maxCapacity} plazas
                {isFull && <span className="text-red-500 font-bold ml-1">(Cupo completo)</span>}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Nombre Completo del Alumno *</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Sofía Morales Benítez"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
            />
            {errors.nombre && <p className="text-red-500 text-[11px] mt-1">{errors.nombre}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">DNI del Alumno *</label>
              <input
                type="text"
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                placeholder="Ej: 48912004"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              />
              {errors.dni && <p className="text-red-500 text-[11px] mt-1">{errors.dni}</p>}
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Nivel Educativo</label>
              <select
                value={formData.nivel}
                onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              >
                <option value="Primario">Primario</option>
                <option value="Secundario">Secundario</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Curso</label>
              <select
                value={formData.curso}
                onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              >
                {formData.nivel === 'Primario' ? (
                  <>
                    <option value="4° Grado">4° Grado</option>
                    <option value="5° Grado">5° Grado</option>
                    <option value="6° Grado">6° Grado</option>
                    <option value="7° Grado">7° Grado</option>
                  </>
                ) : (
                  <>
                    <option value="1° Año">1° Año</option>
                    <option value="2° Año">2° Año</option>
                    <option value="3° Año">3° Año</option>
                    <option value="4° Año">4° Año</option>
                    <option value="5° Año">5° Año</option>
                    <option value="6° Año">6° Año</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">División</label>
              <select
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              >
                <option value="A">División A</option>
                <option value="B">División B</option>
                <option value="C">División C</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Tutor Responsable *</label>
              <input
                type="text"
                value={formData.tutor}
                onChange={(e) => setFormData({ ...formData, tutor: e.target.value })}
                placeholder="Ej: Marcelo Gómez"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              />
              {errors.tutor && <p className="text-red-500 text-[11px] mt-1">{errors.tutor}</p>}
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Teléfono Contacto *</label>
              <input
                type="text"
                value={formData.tutorTelefono}
                onChange={(e) => setFormData({ ...formData, tutorTelefono: e.target.value })}
                placeholder="Ej: 11-4920-1928"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              />
              {errors.tutorTelefono && <p className="text-red-500 text-[11px] mt-1">{errors.tutorTelefono}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Condición Deportiva</label>
              <select
                value={formData.condicionTipo}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'regular') {
                    setFormData({
                      ...formData,
                      condicionTipo: val,
                      condicion: 'Regular • Al día',
                      estadoCuota: 'Al Día',
                      aptoMedico: true,
                    });
                  } else if (val === 'becado') {
                    setFormData({
                      ...formData,
                      condicionTipo: val,
                      condicion: 'Regular • Becado 100%',
                      estadoCuota: 'Becado',
                      aptoMedico: true,
                    });
                  } else {
                    setFormData({
                      ...formData,
                      condicionTipo: val,
                      condicion: 'Apto Médico Pendiente',
                      estadoCuota: 'Pendiente',
                      aptoMedico: false,
                    });
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              >
                <option value="regular">Regular • Al día</option>
                <option value="becado">Regular • Becado 100%</option>
                <option value="pendiente">Apto Médico Pendiente</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Estado de Cuota</label>
              <select
                value={formData.estadoCuota}
                onChange={(e) => setFormData({ ...formData, estadoCuota: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              >
                <option value="Al Día">Al Día</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Becado">Becado</option>
              </select>
            </div>
          </div>

          {/* Institutional note */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2 text-amber-800">
            <span className="material-symbols-outlined text-[18px] text-amber-600 shrink-0 mt-0.5">verified_user</span>
            <p className="text-[11px] leading-relaxed">
              <strong>Control institucional:</strong> Se verificará que el alumno no supere el máximo de 2 disciplinas extracurriculares simultáneas.
            </p>
          </div>

          {/* Footer Actions */}
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
              className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-dim rounded-xl transition-all shadow-sm cursor-pointer border-none"
            >
              Confirmar Inscripción
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnrollStudentModal;
