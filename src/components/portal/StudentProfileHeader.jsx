import React from 'react';
import { getStudentAttendanceData } from '../../utils/studentPortalRecordsUtils.js';

/**
 * Normaliza y formatea los datos del perfil del alumno para el encabezado
 */
const parseStudentHeaderData = (student) => {
  if (!student) return null;
  const fullName =
    student.nombreCompleto ||
    `${student.nombre || ''} ${student.apellido || ''}`.trim() ||
    'Estudiante';

  const initials = (student.initials ||
    fullName
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
  ).toUpperCase();

  return {
    fullName,
    initials,
    legajo: student.legajo || student.studentID_login || 'Sin legajo',
    dni: student.dni || 'Sin DNI',
    nivel: student.nivel || 'Nivel Primario',
    curso: student.curso || 'Sin asignar',
    division: student.division || 'A',
    turno: student.turno || 'Turno Mañana',
    status: student.estado || student.status || 'Activo - Regular',
  };
};

/**
 * Encabezado con información académica consolidada del estudiante
 */
const StudentProfileHeader = ({ student, isParentView = false }) => {
  const data = parseStudentHeaderData(student);
  const attendanceData = getStudentAttendanceData(student);
  if (!data) return null;

  return (
    <div
      data-testid="student-profile-header"
      className="bg-white rounded-md border border-slate-200/80 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6"
    >
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-2xl md:text-3xl font-extrabold shadow-md shrink-0">
        {data.initials}
      </div>

      <div className="flex-1 text-center md:text-left space-y-2">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
          <h1
            data-testid="student-header-fullname"
            className="text-2xl md:text-3xl font-bold font-headline text-slate-800"
          >
            {data.fullName}
          </h1>
          <span
            data-testid="student-header-status-badge"
            className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
          >
            {data.status == 'active' ? 'Activo' : 'Suspendido'}
          </span>

          {isParentView && (
            <span
              data-testid="student-header-parent-view-badge"
              className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200"
            >
              Hijo/a a cargo
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-1.5 gap-x-4 text-xs md:text-sm text-slate-600 font-medium">
          <span data-testid="student-header-legajo" className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base text-slate-400">badge</span>
            Legajo: <strong className="text-slate-800">{data.legajo}</strong>
          </span>
          <span data-testid="student-header-dni" className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base text-slate-400">fingerprint</span>
            DNI: <strong className="text-slate-800">{data.dni}</strong>
          </span>
          <span data-testid="student-header-nivel" className="flex items-center gap-1">
            <span className="material-symbols-outlined text-base text-slate-400">school</span>
            Nivel: <strong className="text-slate-800">{data.nivel}</strong>
          </span>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
            Curso: {data.curso}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
            División: {data.division}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
            {data.turno}
          </span>
          {attendanceData?.faltasInjustificadas > 0 ? (
            <span
              data-testid="student-header-absences-badge"
              className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-200 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">warning</span>
              {attendanceData.faltasInjustificadas}{' '}
              {attendanceData.faltasInjustificadas === 1
                ? 'falta injustificada'
                : 'faltas injustificadas'}
            </span>
          ) : (
            <span
              data-testid="student-header-absences-badge"
              className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">check_circle</span>
              Sin faltas injustificadas
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfileHeader;
