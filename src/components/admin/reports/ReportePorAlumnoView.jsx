import React, { useState, useMemo } from 'react';
import { buildStudentFullReport, exportReportToCsv } from './reportsUtils';
import ReportHeaderActions from './ReportHeaderActions';
import StudentReportCards from './StudentReportCards';
import ReportTableHeader from './ReportTableHeader';
import ReportProfileCard from './ReportProfileCard';
import ReportEmptyState from './ReportEmptyState';

const EMPTY_STUDENTS = [];
const EMPTY_COURSES = [];
const EMPTY_SUBJECTS = [];
const EMPTY_SPORTS = [];

const STUDENT_SUBJECTS_COLUMNS = [
  { label: 'Asignatura / Materia', align: 'left' },
  { label: 'Carga Horaria', align: 'left' },
  { label: 'Profesor / Docente a Cargo', align: 'left' },
  { label: 'Legajo Docente', align: 'right' },
];

const ReportePorAlumnoView = ({
  students = EMPTY_STUDENTS,
  courses = EMPTY_COURSES,
  subjects = EMPTY_SUBJECTS,
  allSports = EMPTY_SPORTS,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Alumno activo derivado: por defecto null hasta que el usuario busque y seleccione uno
  const selectedStudent = useMemo(() => {
    if (selectedStudentId) {
      return students.find((s) => s.id === selectedStudentId) || null;
    }
    return null;
  }, [students, selectedStudentId]);

  // Alumnos filtrados para el buscador
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase().trim();
    return students
      .filter((s) => {
        const name = (s.nombreCompleto || `${s.nombre || ''} ${s.apellido || ''}`).toLowerCase();
        const leg = String(s.studentID_login || s.legajo || '').toLowerCase();
        const dni = String(s.dni || '').replace(/\D/g, '');
        return name.includes(q) || leg.includes(q) || dni.includes(q);
      })
      .slice(0, 6);
  }, [students, searchTerm]);

  // Reporte consolidado del alumno seleccionado
  const reportData = useMemo(() => {
    return buildStudentFullReport(selectedStudent, { courses, subjects, allSports });
  }, [selectedStudent, courses, subjects, allSports]);

  // Manejo de exportación CSV directo
  const handleExportCsv = () => {
    if (!reportData) return;

    const exportRows = reportData.subjects.map((sub) => ({
      alumno: reportData.fullName,
      legajo: reportData.legajo,
      dni: reportData.dni,
      curso: reportData.curso,
      nivel: reportData.nivel,
      materia: sub.nombre,
      profesor: sub.profesor?.nombre || 'Docente a asignar',
      legajoDocente: sub.profesor?.legajo || 'N/A',
      transporte: reportData.transporte.recorrido,
      comedor: reportData.comedor.activo ? 'Sí' : 'No',
    }));

    exportReportToCsv(
      `Reporte_Alumno_${reportData.legajo || 'detalle'}`,
      [
        { label: 'Alumno', key: 'alumno' },
        { label: 'Legajo', key: 'legajo' },
        { label: 'DNI', key: 'dni' },
        { label: 'Curso', key: 'curso' },
        { label: 'Nivel', key: 'nivel' },
        { label: 'Materia', key: 'materia' },
        { label: 'Profesor de la Materia', key: 'profesor' },
        { label: 'Legajo Docente', key: 'legajoDocente' },
        { label: 'Transporte Escolar', key: 'transporte' },
        { label: 'Comedor Escolar', key: 'comedor' },
      ],
      exportRows
    );
  };

  return (
    <div data-testid="report-alumno-container" className="flex flex-col gap-5">
      {/* Buscador de Alumno (oculto en impresión) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col gap-3 print:hidden">
        <label htmlFor="search-student-report" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-blue-600">person_search</span>
          <span>Buscar Estudiante por Nombre, Legajo o DNI</span>
        </label>
        <div className="relative">
          <input
            id="search-student-report"
            type="text"
            data-testid="input-search-student-report"
            placeholder="Escriba para buscar (ej. Gómez, ALU-1042 o DNI)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
          />
          <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-2.5">
            search
          </span>
        </div>

        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-1">
            {searchResults.map((st) => (
              <button
                key={st.id}
                type="button"
                data-testid={`select-student-result-${st.id}`}
                onClick={() => {
                  setSelectedStudentId(st.id);
                  setSearchTerm('');
                }}
                className="p-2.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 rounded-md text-left flex flex-col transition-colors cursor-pointer"
              >
                <span className="font-bold text-xs text-slate-900 truncate">
                  {st.nombreCompleto || `${st.nombre} ${st.apellido}`}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {st.studentID_login} · {st.curso}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {!reportData ? (
        <ReportEmptyState
          testId="report-student-empty"
          icon="person_search"
          title="Ningún alumno seleccionado"
          description="Ingrese el nombre, apellido, DNI o número de legajo en el buscador superior para seleccionar un alumno y consultar su reporte consolidado institucional."
        />
      ) : (
        <>
          {/* Ficha Principal del Alumno */}
          <ReportProfileCard
            testId="report-student-header-card"
            initials={reportData.fullName.slice(0, 2).toUpperCase()}
            fullName={reportData.fullName}
            legajo={reportData.legajo}
            avatarBg="bg-blue-50 text-blue-700 border-blue-100"
            metaInfo={
              <>
                DNI: <strong>{reportData.dni}</strong> · Nivel: <strong>{reportData.nivel}</strong> · Cursado: <strong>{reportData.curso}</strong>
              </>
            }
            actions={
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Matrícula Oficial Activa
                </span>
                <button
                  type="button"
                  data-testid="btn-change-student-report"
                  onClick={() => {
                    setSelectedStudentId(null);
                    setSearchTerm('');
                  }}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">close</span>
                  Cambiar
                </button>
              </div>
            }
          />

          {/* Cuadrícula de 4 Servicios y Cursado */}
          <StudentReportCards reportData={reportData} />

          {/* Tabla de Materias que Cursa y Profesores Asignados */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3">
            <ReportHeaderActions
              title="Materias que Cursa & Profesores de Cada Materia"
              icon="menu_book"
              badgeText={`${reportData.subjects.length} materias vigentes`}
              onExportCsv={handleExportCsv}
            />

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" data-testid="table-report-student-subjects">
                <ReportTableHeader columns={STUDENT_SUBJECTS_COLUMNS} />
                <tbody className="divide-y divide-slate-100 text-xs">
                  {reportData.subjects.map((sub) => (
                    <tr key={sub.id || sub.nombre} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {sub.nombre}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {sub.cargaHoraria || '4 hs / semana'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 font-bold text-slate-900">
                          <span className="material-symbols-outlined text-[14px] text-blue-600">badge</span>
                          {sub.profesor?.nombre || 'Docente a asignar'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500 text-[11px]">
                        {sub.profesor?.legajo || '#DOC-ASIG'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Horarios Deportivos Detallados */}
          {reportData.sports.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="material-symbols-outlined text-[20px] text-emerald-600">schedule</span>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Horarios y Profesores de Actividades Deportivas
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reportData.sports.map((sp) => (
                  <div
                    key={sp.id}
                    className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-md flex flex-col gap-1 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900">{sp.nombre}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {sp.categoria}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[14px] text-slate-400">event</span>
                      {sp.horarios}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Entrenador / Profesor: <strong>{sp.profesor}</strong>
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default ReportePorAlumnoView;
