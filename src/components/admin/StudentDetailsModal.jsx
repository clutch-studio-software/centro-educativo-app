import React from 'react';
import { formatDni, calcularEdad } from '../../utils/validators';

const StudentDetailsModal = ({
  isOpen,
  student,
  onClose,
  onEditStudent,
}) => {
  if (!isOpen || !student) return null;

  const edad = calcularEdad(student.fechaNacimiento);

  // Formatear fecha de nacimiento a DD/MM/AAAA
  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'No registrada';
    try {
      const parts = String(dateString).split('T')[0].split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const getNivelStyle = (nivel) => {
    const n = String(nivel || '').toLowerCase();
    if (n.includes('inic')) {
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        avatarGrad: 'from-emerald-500 to-teal-600',
        icon: 'wb_sunny',
      };
    }
    if (n.includes('prim')) {
      return {
        badge: 'bg-blue-50 text-blue-700 border-blue-200/80',
        avatarGrad: 'from-blue-600 to-indigo-600',
        icon: 'history_edu',
      };
    }
    return {
      badge: 'bg-purple-50 text-purple-700 border-purple-200/80',
      avatarGrad: 'from-purple-600 to-violet-700',
      icon: 'auto_stories',
    };
  };

  const nivelStyle = getNivelStyle(student.nivel);

  const getStatusBadge = (estado) => {
    switch (estado) {
      case 'Activo - Regular':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Activo - Regular
          </span>
        );
      case 'Condicional':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100/80 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Condicional
          </span>
        );
      case 'Baja Administrativa':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100/80 text-red-800 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Baja Administrativa
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {estado || 'Sin estado'}
          </span>
        );
    }
  };

  return (
    <div
      data-testid="student-details-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        data-testid="student-details-modal-content"
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-left animate-in zoom-in-95 duration-200"
      >
        {/* Header con Perfil Principal */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            {/* Avatar con Iniciales y Gradiente según Nivel */}
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${nivelStyle.avatarGrad} text-white shadow-md flex items-center justify-center font-extrabold text-xl shrink-0`}
            >
              {student.initials || student.nombre?.slice(0, 2).toUpperCase() || 'AL'}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2
                  data-testid="student-details-name"
                  className="text-lg sm:text-xl font-extrabold text-slate-900 truncate"
                >
                  {student.nombre}
                </h2>
                {getStatusBadge(student.estado)}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60">
                  {student.legajo || `#LEG-${student.id.slice(0, 6)}`}
                </span>
                <span className="text-slate-300">·</span>
                <span className="font-semibold text-slate-600">
                  DNI: {formatDni(student.dni) || 'S/D'}
                </span>
                <span className="text-slate-300">·</span>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${nivelStyle.badge}`}>
                  {student.nivel}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            data-testid="student-details-close-button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent shrink-0"
            title="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div
          className="p-5 sm:p-6 overflow-y-auto space-y-5 no-scrollbar text-left flex-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* SECCIÓN 1: Ficha Académica & Servicios */}
          <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-slate-400">school</span>
              Información Académica & Servicios
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Nivel Educativo
                </span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-slate-400">
                    {nivelStyle.icon}
                  </span>
                  {student.nivel}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Curso Asignado
                </span>
                <span className="font-bold text-slate-800">
                  {student.curso && student.curso !== 'sin asignar' ? student.curso : 'Sin asignar'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  División
                </span>
                <span className="font-bold text-slate-800">
                  {student.division && student.division !== 'sin asignar'
                    ? `División ${student.division}`
                    : 'Sin asignar'}
                </span>
              </div>
            </div>

            {/* Servicios Contratados */}
            <div className="bg-white p-3 rounded-xl border border-slate-200/70 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Servicios Extracurriculares Contratados
              </span>
              {Array.isArray(student.servicios) && student.servicios.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {student.servicios.map((srv, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/60 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px] text-blue-500">
                        verified
                      </span>
                      {srv}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Sin servicios adicionales contratados para este ciclo.
                </span>
              )}
            </div>
          </div>

          {/* SECCIÓN 2: Información Personal del Alumno */}
          <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-slate-400">badge</span>
              Datos Personales del Alumno
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  DNI / Documento
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {formatDni(student.dni) || 'No especificado'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Fecha de Nacimiento
                </span>
                <span className="font-semibold text-slate-800">
                  {formatDateDisplay(student.fechaNacimiento)}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Edad Calculada
                </span>
                <span className="font-semibold text-slate-800">
                  {edad !== null ? `${edad} años` : 'Sin fecha válida'}
                </span>
              </div>

              <div className="sm:col-span-3 bg-white p-3 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Domicilio Registrado
                </span>
                <span className="font-medium text-slate-800">
                  {student.domicilio || 'Sin domicilio especificado'}
                </span>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: Tutor Responsable */}
          <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-slate-400">supervisor_account</span>
              Tutor Responsable & Contacto de Urgencia
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Nombre del Tutor
                </span>
                <span className="font-bold text-slate-800 text-sm">
                  {student.tutorNombre || 'No asignado'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  DNI del Tutor
                </span>
                <span className="font-mono font-semibold text-slate-800">
                  {student.tutorDni ? formatDni(student.tutorDni) : 'S/D'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Teléfono / WhatsApp
                </span>
                <span className="font-mono font-semibold text-blue-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-blue-500">call</span>
                  {student.tutorTelefono || 'No registrado'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Correo Electrónico
                </span>
                <span className="font-medium text-slate-700 truncate block">
                  {student.tutorEmail || 'Sin email'}
                </span>
              </div>

              {student.tutorDomicilio && (
                <div className="sm:col-span-2 bg-white p-3 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Domicilio del Tutor
                  </span>
                  <span className="font-medium text-slate-800">
                    {student.tutorDomicilio}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 4: Entradas de Enfermería (Placeholder) */}
          <div
            data-testid="student-details-enfermeria-section"
            className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-rose-500">
                  medical_services
                </span>
                Entradas de Enfermería
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-200/70 px-2 py-0.5 rounded-md">
                0 registros
              </span>
            </div>

            <div className="p-5 bg-white border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">
                  health_and_safety
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700 m-0">
                Sin registros médicos o de enfermería por el momento.
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm m-0">
                En esta sección se registrarán las atenciones médicas escolares, certificados de aptitud física y suministro de primeros auxilios.
              </p>
            </div>
          </div>

          {/* SECCIÓN 5: Entradas de Preceptorado (Placeholder) */}
          <div
            data-testid="student-details-preceptorado-section"
            className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-indigo-500">
                  assignment
                </span>
                Entradas de Preceptorado
              </h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-200/70 px-2 py-0.5 rounded-md">
                0 registros
              </span>
            </div>

            <div className="p-5 bg-white border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">
                  fact_check
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-700 m-0">
                Sin observaciones o registros de preceptoría por el momento.
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm m-0">
                En esta sección se registrarán las asistencias especiales, actas de convivencia, sanciones y notificaciones disciplinarias.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            data-testid="student-details-close-btn"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer border-none"
          >
            Cerrar
          </button>

          {onEditStudent && (
            <button
              type="button"
              data-testid="student-details-edit-btn"
              onClick={() => {
                const target = student;
                onClose();
                onEditStudent(target);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer border-none flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Editar Legajo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;
