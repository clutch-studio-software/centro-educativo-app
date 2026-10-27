import React, { useState, useEffect, useMemo } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { formatDni, calcularEdad } from '../../utils/validators';
import { getStudentEnrolledDisciplines } from './sports/sportsScheduleUtils';
import {
  subscribeToSportsActivities,
  addPreceptoriaNoteToStudent,
  deletePreceptoriaNoteFromStudent,
  addEnfermeriaNoteToStudent,
} from '../../services/sportsService';
import { normalizeRole } from './users/userRbacConstants';

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

const getStatusBadge = (estado) => {
  switch (estado) {
    case 'Activo - Regular':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-md bg-emerald-500 animate-pulse"></span>
          Activo - Regular
        </span>
      );
    case 'Condicional':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-100/80 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-md bg-amber-500"></span>
          Condicional
        </span>
      );
    case 'Baja Administrativa':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-red-100/80 text-red-800 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-md bg-red-500"></span>
          Baja Administrativa
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          {estado || 'Sin estado'}
        </span>
      );
  }
};

const resolveTutorInfo = (student, tutors = []) => {
  const matchedTutor =
    (tutors || []).find((t) => t.id && student.parentId && t.id === student.parentId) ||
    (tutors || []).find((t) => Array.isArray(t.studentIds) && t.studentIds.includes(student.id)) ||
    (tutors || []).find(
      (t) =>
        t.email &&
        student.tutorEmail &&
        t.email.trim().toLowerCase() === student.tutorEmail.trim().toLowerCase()
    ) ||
    null;

  const resolvedTutorNombre =
    student.tutorNombre && student.tutorNombre !== 'Tutor'
      ? student.tutorNombre
      : matchedTutor?.nombre || student.tutorNombre || 'No asignado';

  const rawTutorDni = student.tutorDni || matchedTutor?.dni || '';
  const resolvedTutorDni = rawTutorDni ? formatDni(rawTutorDni) : 'S/D';
  const resolvedTutorTelefono = student.tutorTelefono || matchedTutor?.telefono || 'No registrado';
  const resolvedTutorEmail = student.tutorEmail || matchedTutor?.email || 'Sin email';
  const resolvedTutorDomicilio = student.tutorDomicilio || matchedTutor?.domicilio || '';

  return {
    resolvedTutorNombre,
    resolvedTutorDni,
    resolvedTutorTelefono,
    resolvedTutorEmail,
    resolvedTutorDomicilio,
  };
};
const StudentDetailsHeader = ({ student, nivelStyle, onClose }) => {
  const avatarInitials = student.initials || student.nombre?.slice(0, 2).toUpperCase() || 'AL';
  const legajoDisplay = student.legajo || `#LEG-${student.id.slice(0, 6)}`;
  const dniDisplay = formatDni(student.dni) || 'S/D';

  return (
    <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-b from-slate-50/70 to-white flex items-start justify-between gap-4 shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${nivelStyle.avatarGrad} text-white shadow-md flex items-center justify-center font-extrabold text-xl shrink-0`}
        >
          {avatarInitials}
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
              {legajoDisplay}
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-semibold text-slate-600">
              DNI: {dniDisplay}
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
        className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent shrink-0"
        title="Cerrar modal"
      >
        <span className="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>
  );
};

const StudentInstitutionalServicesBlock = ({ student }) => {
  const institutionalServices = (Array.isArray(student.servicios) ? student.servicios : [])
    .map((s) => (s === 'Transporte' ? 'Transporte Escolar' : s))
    .filter((s) => ['Comedor Escolar', 'Transporte Escolar'].includes(s));

  const hasServicios = institutionalServices.length > 0;

  return (
    <div className="bg-white p-3 rounded-md border border-slate-200/70 flex flex-col gap-1.5">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
        Servicios Institucionales
      </span>
      {hasServicios ? (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {institutionalServices.map((srv) => (
            <span
              key={srv}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/60 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[13px] text-blue-500">
                {srv.includes('Comedor') ? 'restaurant' : 'directions_bus'}
              </span>
              {srv}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-xs text-slate-400 italic">
          Sin servicios institucionales (Comedor o Transporte Escolar) contratados.
        </span>
      )}
    </div>
  );
};

const StudentExtracurricularBlock = ({ enrolledDisciplines = [] }) => {
  const hasDisciplines = enrolledDisciplines.length > 0;

  return (
    <div className="bg-white p-3 rounded-md border border-slate-200/70 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Actividades Extracurriculares & Deportivas
        </span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${hasDisciplines
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
        >
          {enrolledDisciplines.length}/2 permitidas
        </span>
      </div>

      {hasDisciplines ? (
        <div className="space-y-2 pt-0.5">
          {enrolledDisciplines.map((disc) => (
            <div
              key={disc.id || disc.nombre}
              className="p-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl select-none">{disc.emoji || '🏃'}</span>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-slate-900 truncate">
                    {disc.nombre || disc.titulo}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-slate-400">
                        schedule
                      </span>
                      {Array.isArray(disc.dias) ? disc.dias.join(', ') : disc.dias || 'Días a confirmar'} ·{' '}
                      {disc.horario || disc.horas || '16:00 - 17:30'}
                    </span>
                    {disc.profesor?.nombre && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <span className="material-symbols-outlined text-[13px] text-slate-400">
                          person
                        </span>
                        Prof. {disc.profesor.nombre}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                Inscripto
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic m-0">
          El alumno no se encuentra inscripto en actividades extracurriculares (0/2 permitidas). Las inscripciones se gestionan desde el panel de Actividades Extracurriculares.
        </p>
      )}
    </div>
  );
};

const StudentAcademicSection = ({ student, nivelStyle, enrolledDisciplines, isAdminRole }) => {
  const cursoDisplay = student.curso && student.curso !== 'sin asignar' ? student.curso : 'Sin asignar';
  const divisionDisplay =
    student.division && student.division !== 'sin asignar'
      ? `División ${student.division}`
      : 'Sin asignar';

  return (
    <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col gap-3">
      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px] text-slate-400">school</span>
        Información Académica & Servicios
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-3 rounded-md border border-slate-200/70">
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

        <div className="bg-white p-3 rounded-md border border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Curso Asignado
          </span>
          <span className="font-bold text-slate-800">
            {cursoDisplay}
          </span>
        </div>

        <div className="bg-white p-3 rounded-md border border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            División
          </span>
          <span className="font-bold text-slate-800">
            {divisionDisplay}
          </span>
        </div>
      </div>

      {isAdminRole && <StudentInstitutionalServicesBlock student={student} />
      }
      {isAdminRole && <StudentExtracurricularBlock enrolledDisciplines={enrolledDisciplines} />}
    </div>
  );
};

const StudentPersonalSection = ({ student, edad }) => {
  const dniDisplay = formatDni(student.dni) || 'No especificado';
  const fechaDisplay = formatDateDisplay(student.fechaNacimiento);
  const edadDisplay = edad !== null ? `${edad} años` : 'Sin fecha válida';
  const domicilioDisplay = student.domicilio || 'Sin domicilio especificado';

  return (
    <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col gap-3">
      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px] text-slate-400">badge</span>
        Datos Personales del Alumno
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-3 rounded-md border border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            DNI / Documento
          </span>
          <span className="font-mono font-bold text-slate-800 text-sm">
            {dniDisplay}
          </span>
        </div>

        <div className="bg-white p-3 rounded-md border border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Fecha de Nacimiento
          </span>
          <span className="font-semibold text-slate-800">
            {fechaDisplay}
          </span>
        </div>

        <div className="bg-white p-3 rounded-md border border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Edad Calculada
          </span>
          <span className="font-semibold text-slate-800">
            {edadDisplay}
          </span>
        </div>

        <div className="sm:col-span-3 bg-white p-3 rounded-md border border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Domicilio Registrado
          </span>
          <span className="font-medium text-slate-800">
            {domicilioDisplay}
          </span>
        </div>
      </div>
    </div>
  );
};

const StudentTutorSection = ({ tutorInfo }) => (
  <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col gap-3">
    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
      <span className="material-symbols-outlined text-[16px] text-slate-400">supervisor_account</span>
      Tutor Responsable & Contacto de Urgencia
    </h3>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
      <div className="bg-white p-3 rounded-md border border-slate-200/70">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
          Nombre del Tutor
        </span>
        <span className="font-bold text-slate-800 text-sm">
          {tutorInfo.resolvedTutorNombre}
        </span>
      </div>

      <div className="bg-white p-3 rounded-md border border-slate-200/70">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
          DNI del Tutor
        </span>
        <span className="font-mono font-semibold text-slate-800">
          {tutorInfo.resolvedTutorDni}
        </span>
      </div>

      <div className="bg-white p-3 rounded-md border border-slate-200/70">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
          Teléfono / WhatsApp
        </span>
        <span className="font-mono font-semibold text-blue-700 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-blue-500">call</span>
          {tutorInfo.resolvedTutorTelefono}
        </span>
      </div>

      <div className="bg-white p-3 rounded-md border border-slate-200/70">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
          Correo Electrónico
        </span>
        <span className="font-medium text-slate-700 truncate block">
          {tutorInfo.resolvedTutorEmail}
        </span>
      </div>

      {tutorInfo.resolvedTutorDomicilio && (
        <div className="sm:col-span-2 bg-white p-3 rounded-md border border-slate-200/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Domicilio del Tutor
          </span>
          <span className="font-medium text-slate-800">
            {tutorInfo.resolvedTutorDomicilio}
          </span>
        </div>
      )}
    </div>
  </div>
);

const formatEntryDate = (fecha) => {
  if (!fecha) return 'Fecha no registrada';
  try {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(fecha);
  }
};

const PreceptoriaEntryItem = ({ entry, onDelete }) => {
  const handleDelete = () => {
    if (!onDelete) return;
    const itemTitle = entry.titulo || entry.tipo || 'este registro';
    const confirmDelete = window.confirm(
      `¿Deseas eliminar el registro de preceptoría "${itemTitle}"? Esta acción removerá la nota del legajo del alumno.`
    );
    if (confirmDelete) {
      onDelete(entry);
    }
  };

  return (
    <div className="p-3 bg-white border border-slate-200/80 rounded-md flex flex-col gap-1.5 shadow-2xs text-xs">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {entry.tipo || 'Observación'}
          </span>
          <strong className="text-slate-900 font-semibold text-xs">
            {entry.titulo || 'Registro administrativo'}
          </strong>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">schedule</span>
            {formatEntryDate(entry.fecha)}
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              title="Eliminar registro de preceptoría"
              aria-label="Eliminar registro de preceptoría"
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[15px]">delete</span>
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium m-0">
        <strong className="text-slate-500 font-semibold">Justificativo: </strong>
        {entry.motivo || 'Sin justificación especificada.'}
      </p>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="material-symbols-outlined text-[14px] text-indigo-500">
            account_circle
          </span>
          <span className="font-medium text-slate-700">
            Registrado por:{' '}
            <strong className="text-slate-900 font-semibold">
              {entry.autor || 'Preceptoría y Administración'}
            </strong>
          </span>
          {entry.autorEmail && (
            <span className="text-[10px] text-slate-400 font-mono">
              ({entry.autorEmail})
            </span>
          )}
        </div>

        {entry.categoria && (
          <span className="text-[10px] font-semibold text-slate-400">
            Área: {entry.categoria}
          </span>
        )}
      </div>
    </div>
  );
};

const NewPreceptoriaEntryForm = ({ onSave, onCancel }) => {
  const [tipo, setTipo] = useState('Observación de Convivencia');
  const [motivo, setMotivo] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!motivo.trim()) return;
    onSave({ tipo, motivo: motivo.trim() });
    setMotivo('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3.5 bg-indigo-50/60 border border-indigo-200/80 rounded-md space-y-3 text-xs"
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-indigo-600">
            edit_note
          </span>
          Nueva Entrada de Preceptoría
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      <div>
        <label
          htmlFor="preceptoria-tipo-select"
          className="block text-[11px] font-semibold text-slate-700 mb-1"
        >
          Tipo de Registro
        </label>
        <select
          id="preceptoria-tipo-select"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs text-slate-800"
        >
          <option value="Observación de Convivencia">Observación de Convivencia</option>
          <option value="Asistencia / Tardanza">Asistencia / Tardanza</option>
          <option value="Notificación Disciplinaria">Notificación Disciplinaria</option>
          <option value="Justificativo Administrativo">Justificativo Administrativo</option>
          <option value="Observación General">Observación General</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="preceptoria-motivo-input"
          className="block text-[11px] font-semibold text-slate-700 mb-1"
        >
          Observación / Justificativo
        </label>
        <textarea
          id="preceptoria-motivo-input"
          rows={2}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Escriba la observación institucional..."
          className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs text-slate-800"
          required
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg border-none bg-transparent cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!motivo.trim()}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border-none cursor-pointer flex items-center gap-1 ${!motivo.trim()
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
        >
          <span className="material-symbols-outlined text-[14px]">save</span>
          <span>Guardar Entrada</span>
        </button>
      </div>
    </form>
  );
};

const StudentPreceptoriaSection = ({ entradas = [], onAddEntry, onDeleteEntry }) => {
  const [isAdding, setIsAdding] = useState(false);
  const hasEntradas = Array.isArray(entradas) && entradas.length > 0;

  return (
    <div
      data-testid="student-details-preceptorado-section"
      className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-indigo-500">
            assignment
          </span>
          Entradas de Preceptoría
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${hasEntradas
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
              : 'bg-slate-200/70 text-slate-400 border-transparent'
              }`}
          >
            {hasEntradas ? `${entradas.length} ${entradas.length === 1 ? 'registro' : 'registros'}` : '0 registros'}
          </span>
          {onAddEntry && !isAdding && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="px-2 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[13px]">add</span>
              <span>Nueva Nota</span>
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <NewPreceptoriaEntryForm
          onSave={(data) => {
            onAddEntry(data);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {hasEntradas ? (
        <div className="space-y-2.5">
          {entradas.map((entry) => (
            <PreceptoriaEntryItem
              key={entry.id || entry.fecha || entry.titulo}
              entry={entry}
              onDelete={onDeleteEntry}
            />
          ))}
        </div>
      ) : (
        !isAdding && (
          <div className="p-5 bg-white border border-dashed border-slate-200 rounded-md flex flex-col items-center justify-center text-center gap-2">
            <div className="w-10 h-10 rounded-md bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">fact_check</span>
            </div>
            <p className="text-xs font-semibold text-slate-700 m-0">
              Sin observaciones o registros de preceptoría por el momento.
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm m-0">
              En esta sección se registrarán las asistencias especiales, justificaciones de bajas y transferencias, actas de convivencia y sanciones.
            </p>
          </div>
        )
      )}
    </div>
  );
};

const EnfermeriaEntryItem = ({ entry }) => (
  <div
    data-testid={`enfermeria-entry-${entry.id || entry.fecha}`}
    className="p-3 bg-white border border-slate-200/90 rounded-md space-y-2 text-left shadow-xs transition-all hover:border-rose-200"
  >
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">medical_services</span>
          {entry.tipo || 'Atención de Enfermería'}
        </span>
        {entry.notificadoFamilias && (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">contact_phone</span>
            Tutor notificado
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">schedule</span>
          {formatEntryDate(entry.fecha)}
        </span>
        <span
          title="Registro médico inmutable"
          className="text-[10px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-0.5"
        >
          <span className="material-symbols-outlined text-[11px]">lock</span>
        </span>
      </div>
    </div>

    <p className="text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 font-medium m-0 leading-relaxed">
      <strong className="text-slate-500 font-semibold">Detalle de Atención: </strong>
      {entry.motivo || entry.detalle || 'Sin observaciones registradas.'}
    </p>

    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex-wrap gap-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="material-symbols-outlined text-[14px] text-rose-500">
          health_and_safety
        </span>
        <span className="font-medium text-slate-700">
          Atendido por:{' '}
          <strong className="text-slate-900 font-semibold">
            {entry.autor || 'Enfermería Escolar'}
          </strong>
        </span>
        {entry.autorEmail && (
          <span className="text-[10px] text-slate-400 font-mono">
            ({entry.autorEmail})
          </span>
        )}
      </div>
      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
        Gabinete de Salud
      </span>
    </div>
  </div>
);

const NewEnfermeriaEntryForm = ({ onSave, onCancel }) => {
  const [tipo, setTipo] = useState('Atención / Primeros Auxilios');
  const [motivo, setMotivo] = useState('');
  const [notificadoFamilias, setNotificadoFamilias] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!motivo.trim()) return;
    onSave({ tipo, motivo: motivo.trim(), notificadoFamilias });
    setMotivo('');
    setNotificadoFamilias(false);
  };

  return (
    <form
      data-testid="new-enfermeria-entry-form"
      onSubmit={handleSubmit}
      className="p-3.5 bg-rose-50/60 border border-rose-200/80 rounded-md space-y-3 text-xs"
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-rose-950 text-xs flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-rose-600">
            medical_services
          </span>
          Nueva Atención de Enfermería
        </span>
        <button
          type="button"
          onClick={onCancel}
          className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      <div>
        <label
          htmlFor="enfermeria-tipo-select"
          className="block text-[11px] font-semibold text-slate-700 mb-1"
        >
          Tipo de Atención / Evento
        </label>
        <select
          id="enfermeria-tipo-select"
          data-testid="enfermeria-tipo-select"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800"
        >
          <option value="Atención / Primeros Auxilios">Atención / Primeros Auxilios</option>
          <option value="Suministro de Medicación Autorizada">Suministro de Medicación Autorizada</option>
          <option value="Certificado Médico / Aptitud Física">Certificado Médico / Aptitud Física</option>
          <option value="Incidente Escolar / Golpe / Caída">Incidente Escolar / Golpe / Caída</option>
          <option value="Alergia / Síntoma de Salud">Alergia / Síntoma de Salud</option>
          <option value="Retiro Anticipado por Salud">Retiro Anticipado por Salud</option>
          <option value="Observación de Gabinete Médico">Observación de Gabinete Médico</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="enfermeria-motivo-input"
          className="block text-[11px] font-semibold text-slate-700 mb-1"
        >
          Descripción clínica y procedimiento realizado
        </label>
        <textarea
          id="enfermeria-motivo-input"
          data-testid="enfermeria-motivo-input"
          rows={2}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Describa la atención brindada, síntomas, signos vitales o medicación administrada..."
          className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs text-slate-800"
          required
        />
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <input
          type="checkbox"
          id="enfermeria-notificado-input"
          data-testid="enfermeria-notificado-input"
          checked={notificadoFamilias}
          onChange={(e) => setNotificadoFamilias(e.target.checked)}
          className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
        />
        <label htmlFor="enfermeria-notificado-input" className="text-[11px] font-medium text-slate-700 cursor-pointer select-none">
          Se notificó a los padres o tutores del alumno
        </label>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg border-none bg-transparent cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          data-testid="save-enfermeria-entry-btn"
          disabled={!motivo.trim()}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border-none cursor-pointer flex items-center gap-1 ${!motivo.trim()
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
            }`}
        >
          <span className="material-symbols-outlined text-[14px]">save</span>
          <span>Guardar Atención</span>
        </button>
      </div>
    </form>
  );
};

const StudentEnfermeriaSection = ({ entradas = [], onAddEntry }) => {
  const [isAdding, setIsAdding] = useState(false);
  const hasEntradas = Array.isArray(entradas) && entradas.length > 0;

  return (
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
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${hasEntradas
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-slate-200/70 text-slate-400 border-transparent'
              }`}
          >
            {hasEntradas ? `${entradas.length} ${entradas.length === 1 ? 'registro' : 'registros'}` : '0 registros'}
          </span>
          <span
            title="Los registros médicos escolares son permanentes e inmutables"
            className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-md flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[12px]">lock</span>
            Inmutable
          </span>
          {onAddEntry && !isAdding && (
            <button
              type="button"
              data-testid="add-enfermeria-entry-btn"
              onClick={() => setIsAdding(true)}
              className="px-2 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[13px]">add</span>
              <span>Registrar Atención</span>
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <NewEnfermeriaEntryForm
          onSave={(data) => {
            onAddEntry(data);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      )}

      {hasEntradas ? (
        <div className="space-y-2.5">
          {entradas.map((entry) => (
            <EnfermeriaEntryItem
              key={entry.id || entry.fecha || entry.motivo}
              entry={entry}
            />
          ))}
        </div>
      ) : (
        !isAdding && (
          <div className="p-5 bg-white border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">
                health_and_safety
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-700 m-0">
              Sin registros médicos o de enfermería por el momento.
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm m-0">
              En esta sección se registran las atenciones médicas escolares, certificados de aptitud física y suministro de primeros auxilios (no eliminables por normativa de salud).
            </p>
          </div>
        )
      )}
    </div>
  );
};

const EMPTY_DISCIPLINES = [];

const StudentDetailsModal = ({
  isOpen,
  student,
  tutors = [],
  allDisciplines = EMPTY_DISCIPLINES,
  onClose,
  onEditStudent,
}) => {
  const { user: currentUser } = useAuth();
  const [studentDocData, setStudentDocData] = useState(null);

  const handleAddPreceptoriaEntry = async ({ tipo, motivo }) => {
    if (!student || !motivo?.trim()) return;
    const authorName =
      currentUser?.nombreCompleto ||
      (currentUser?.nombre ? `${currentUser.nombre} ${currentUser.apellido || ''}`.trim() : null) ||
      currentUser?.displayName ||
      currentUser?.name ||
      currentUser?.email?.split('@')[0] ||
      'Personal Institucional';
    const authorRole = currentUser?.role || 'Preceptoría';
    const authorEmail = currentUser?.email || '';

    await addPreceptoriaNoteToStudent({
      studentId: student.id,
      studentDni: student.dni,
      studentLegajo: student.legajo,
      studentName: student.nombre,
      note: {
        tipo: tipo || 'Observación de Preceptoría',
        titulo: tipo || 'Observación de Preceptoría',
        motivo: motivo.trim(),
        autor: authorName,
        autorRol: authorRole,
        autorEmail: authorEmail,
        autorUid: currentUser?.uid || null,
        categoria: 'Preceptoría',
      },
    });
  };

  const handleAddEnfermeriaEntry = async ({ tipo, motivo, notificadoFamilias }) => {
    if (!student || !motivo?.trim()) return;
    const authorName =
      currentUser?.nombreCompleto ||
      (currentUser?.nombre ? `${currentUser.nombre} ${currentUser.apellido || ''}`.trim() : null) ||
      currentUser?.displayName ||
      currentUser?.name ||
      currentUser?.email?.split('@')[0] ||
      'Personal de Salud';
    const authorRole = currentUser?.role || 'Enfermería Escolar';
    const authorEmail = currentUser?.email || '';

    await addEnfermeriaNoteToStudent({
      studentId: student.id,
      studentDni: student.dni,
      studentLegajo: student.legajo,
      studentName: student.nombre,
      note: {
        tipo: tipo || 'Atención / Primeros Auxilios',
        motivo: motivo.trim(),
        notificadoFamilias: !!notificadoFamilias,
        autor: authorName,
        autorRol: authorRole,
        autorEmail: authorEmail,
        autorUid: currentUser?.uid || null,
        categoria: 'Enfermería',
      },
    });
  };

  const handleDeletePreceptoriaEntry = async (entryToDelete) => {
    if (!student || !entryToDelete) return;
    try {
      await deletePreceptoriaNoteFromStudent({
        studentId: student.id,
        studentDni: student.dni,
        studentLegajo: student.legajo,
        studentName: student.nombre,
        noteId: entryToDelete.id,
        noteFecha: entryToDelete.fecha,
      });
    } catch (err) {
      console.error('Error al eliminar registro de preceptoría:', err);
    }
  };

  useEffect(() => {
    if (!isOpen || !student?.id) return;
    let isMounted = true;

    const unsub = onSnapshot(
      doc(db, 'students', String(student.id)),
      (snap) => {
        if (isMounted && snap.exists()) {
          setStudentDocData(snap.data());
        }
      },
      () => { }
    );

    return () => {
      isMounted = false;
      unsub();
    };
  }, [isOpen, student?.id]);

  const entradasPreceptoria = useMemo(() => {
    const fromDoc = studentDocData?.entradasPreceptoria;
    if (Array.isArray(fromDoc) && fromDoc.length > 0) return fromDoc;
    if (Array.isArray(student?.entradasPreceptoria)) return student.entradasPreceptoria;
    return [];
  }, [studentDocData, student?.entradasPreceptoria]);

  const entradasEnfermeria = useMemo(() => {
    const fromDoc = studentDocData?.entradasEnfermeria;
    if (Array.isArray(fromDoc) && fromDoc.length > 0) return fromDoc;
    if (Array.isArray(student?.entradasEnfermeria)) return student.entradasEnfermeria;
    return [];
  }, [studentDocData, student]);

  const userRoleNorm = normalizeRole(currentUser?.role);
  const isAdminRole =
    currentUser?.role === 'user_admin' ||
    ['Directivo', 'Administrativo'].includes(userRoleNorm);
  const canAddEnfermeria =
    currentUser?.role === 'user_admin' ||
    ['Directivo', 'Administrativo', 'Enfermeria'].includes(userRoleNorm);
  const canAddPreceptoria =
    currentUser?.role === 'user_admin' ||
    ['Directivo', 'Administrativo', 'Preceptoria'].includes(userRoleNorm);

  const hasExternalDisciplines = Array.isArray(allDisciplines) && allDisciplines.length > 0;
  const [subscribedDisciplines, setSubscribedDisciplines] = useState([]);

  useEffect(() => {
    if (!isOpen || hasExternalDisciplines) return;

    const unsubscribe = subscribeToSportsActivities((list) => {
      if (Array.isArray(list) && list.length > 0) {
        setSubscribedDisciplines(list);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isOpen, hasExternalDisciplines]);

  const activeDisciplines = hasExternalDisciplines ? allDisciplines : subscribedDisciplines;

  const enrolledDisciplines = useMemo(() => {
    if (!student) return [];
    return getStudentEnrolledDisciplines(student, activeDisciplines);
  }, [student, activeDisciplines]);

  if (!isOpen || !student) return null;

  const edad = calcularEdad(student.fechaNacimiento);
  const nivelStyle = getNivelStyle(student.nivel);
  const tutorInfo = resolveTutorInfo(student, tutors);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        data-testid="student-details-modal-overlay"
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      />
      <div
        data-testid="student-details-modal-content"
        className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-left animate-in zoom-in-95 duration-200"
      >
        <StudentDetailsHeader student={student} nivelStyle={nivelStyle} onClose={onClose} />

        {/* Contenido con Scroll */}
        <div
          className="p-5 sm:p-6 overflow-y-auto space-y-5 no-scrollbar text-left flex-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <StudentAcademicSection
            student={student}
            nivelStyle={nivelStyle}
            enrolledDisciplines={enrolledDisciplines}
            isAdminRole={isAdminRole}
          />
          <StudentPersonalSection student={student} edad={edad} />
          <StudentTutorSection tutorInfo={tutorInfo} />

          {/* SECCIÓN 4: Entradas de Enfermería (Historial Médico Protegido / Inmutable) */}
          <StudentEnfermeriaSection
            entradas={entradasEnfermeria}
            onAddEntry={canAddEnfermeria ? handleAddEnfermeriaEntry : null}
          />

          {/* SECCIÓN 5: Entradas de Preceptoría */}
          {canAddPreceptoria && <StudentPreceptoriaSection
            entradas={entradasPreceptoria}
            onAddEntry={canAddPreceptoria ? handleAddPreceptoriaEntry : null}
            onDeleteEntry={canAddPreceptoria ? handleDeletePreceptoriaEntry : null}
          />}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            data-testid="student-details-close-btn"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-md transition-colors cursor-pointer border-none"
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md transition-colors cursor-pointer border-none flex items-center gap-1.5 shadow-xs"
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
