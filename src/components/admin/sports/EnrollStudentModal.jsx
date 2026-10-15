import React, { useState } from 'react';
import { EnrollStudentFormFields } from './EnrollStudentFormFields';

const createNewStudentRecord = (formData) => {
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

  return {
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
};

const validateEnrollForm = (formData) => {
  const newErrors = {};
  if (!formData.nombre.trim()) newErrors.nombre = 'El nombre completo es obligatorio';
  if (!formData.dni.trim()) {
    newErrors.dni = 'El DNI es obligatorio';
  } else if (!/^\d{7,8}$/.test(formData.dni.replace(/\D/g, ''))) {
    newErrors.dni = 'DNI inválido (debe tener 7 u 8 dígitos)';
  }
  if (!formData.tutor.trim()) newErrors.tutor = 'El nombre del tutor es obligatorio';
  if (!formData.tutorTelefono.trim()) newErrors.tutorTelefono = 'El teléfono de contacto es obligatorio';

  return newErrors;
};

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateEnrollForm(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newStudent = createNewStudentRecord(formData);
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
            aria-label="Cerrar modal de inscripción"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <EnrollStudentFormFields
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />

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
