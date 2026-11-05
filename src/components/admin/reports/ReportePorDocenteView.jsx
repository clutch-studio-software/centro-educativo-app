import React, { useState, useMemo } from 'react';
import { buildTeacherFullReport, exportReportToCsv } from './reportsUtils';
import ReportHeaderActions from './ReportHeaderActions';
import ReportTableHeader from './ReportTableHeader';
import ReportProfileCard from './ReportProfileCard';
import ReportEmptyState from './ReportEmptyState';

const EMPTY_TEACHERS = [];

const TEACHER_COURSES_COLUMNS = [
  { label: 'Nivel Educativo', align: 'left' },
  { label: 'Curso / División', align: 'left' },
  { label: 'Materia / Cátedra Asignada', align: 'left' },
  { label: 'Estado', align: 'right' },
];

const TEACHER_SCHEDULES_COLUMNS = [
  { label: 'Día', align: 'left' },
  { label: 'Horario', align: 'left' },
  { label: 'Curso / División', align: 'left' },
  { label: 'Materia / Cátedra', align: 'left' },
  { label: 'Nivel', align: 'right' },
];

const ReportePorDocenteView = ({
  teachers = EMPTY_TEACHERS,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);

  // Docente activo derivado: por defecto null hasta que el usuario busque y seleccione uno
  const selectedTeacher = useMemo(() => {
    if (selectedTeacherId) {
      return teachers.find((t) => t.id === selectedTeacherId) || null;
    }
    return null;
  }, [teachers, selectedTeacherId]);

  // Docentes filtrados por buscador
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase().trim();
    return teachers
      .filter((t) => {
        const name = (t.nombreCompleto || `${t.nombre || ''} ${t.apellido || ''}`).toLowerCase();
        const leg = String(t.legajo || '').toLowerCase();
        const esp = String(t.especialidad || '').toLowerCase();
        return name.includes(q) || leg.includes(q) || esp.includes(q);
      })
      .slice(0, 6);
  }, [teachers, searchTerm]);

  // Reporte consolidado del docente seleccionado
  const reportData = useMemo(() => {
    return buildTeacherFullReport(selectedTeacher);
  }, [selectedTeacher]);

  // Manejo de exportación CSV directo
  const handleExportCsv = () => {
    if (!reportData) return;

    const exportRows = reportData.horarios.map((sch) => ({
      docente: reportData.fullName,
      legajo: reportData.legajo,
      especialidad: reportData.especialidad,
      dia: sch.dia,
      horario: sch.hora,
      curso: sch.curso,
      nivel: sch.nivel,
      materia: sch.materia,
    }));

    exportReportToCsv(
      `Reporte_Docente_${reportData.legajo || 'detalle'}`,
      [
        { label: 'Docente', key: 'docente' },
        { label: 'Legajo', key: 'legajo' },
        { label: 'Especialidad', key: 'especialidad' },
        { label: 'Día', key: 'dia' },
        { label: 'Horario', key: 'horario' },
        { label: 'Curso a Cargo', key: 'curso' },
        { label: 'Nivel Educativo', key: 'nivel' },
        { label: 'Materia / Cátedra', key: 'materia' },
      ],
      exportRows
    );
  };

  return (
    <div data-testid="report-docente-container" className="flex flex-col gap-5">
      {/* Buscador de Docente */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col gap-3 print:hidden">
        <label htmlFor="search-teacher-report" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-amber-600">badge</span>
          <span>Buscar Docente por Nombre, Legajo o Especialidad</span>
        </label>
        <div className="relative">
          <input
            id="search-teacher-report"
            type="text"
            data-testid="input-search-teacher-report"
            placeholder="Escriba para buscar (ej. Valenzuela, #DOC-1092 o Matemática)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/20 focus:outline-hidden"
          />
          <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-2.5">
            search
          </span>
        </div>

        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-1">
            {searchResults.map((tch) => (
              <button
                key={tch.id}
                type="button"
                data-testid={`select-teacher-result-${tch.id}`}
                onClick={() => {
                  setSelectedTeacherId(tch.id);
                  setSearchTerm('');
                }}
                className="p-2.5 bg-slate-50 hover:bg-amber-50/70 border border-slate-200/80 rounded-md text-left flex flex-col transition-colors cursor-pointer"
              >
                <span className="font-bold text-xs text-slate-900 truncate">
                  {tch.nombreCompleto || `${tch.nombre} ${tch.apellido}`}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {tch.legajo} · {tch.especialidad}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {!reportData ? (
        <ReportEmptyState
          testId="report-teacher-empty"
          icon="badge"
          title="Ningún docente seleccionado"
          description="Ingrese el nombre, apellido, legajo o especialidad en el buscador superior para seleccionar un docente y consultar su reporte de cátedras y horarios."
        />
      ) : (
        <>
          {/* Ficha Principal del Docente */}
          <ReportProfileCard
            testId="report-teacher-header-card"
            initials={reportData.fullName.slice(0, 2).toUpperCase()}
            fullName={reportData.fullName}
            legajo={reportData.legajo}
            avatarBg="bg-amber-50 text-amber-700 border-amber-200"
            metaInfo={
              <>
                Especialidad: <strong>{reportData.especialidad}</strong> · DNI: <strong>{reportData.dni}</strong> · Contacto: <strong>{reportData.email}</strong>
              </>
            }
            actions={
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[11px] font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {reportData.cargaHoras} hs semanales
                </span>
                <button
                  type="button"
                  data-testid="btn-change-teacher-report"
                  onClick={() => {
                    setSelectedTeacherId(null);
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

          {/* Tabla 1: Cursos a Cargo por Nivel */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3">
            <ReportHeaderActions
              title="Cursos a Cargo por Nivel Educativo"
              icon="domain"
              badgeText={`${reportData.cursosACargo.length} cursos asignados`}
              onExportCsv={handleExportCsv}
            />

            {reportData.cursosACargo.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No tiene divisiones asignadas formalmente en el sistema.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" data-testid="table-report-teacher-courses">
                  <ReportTableHeader columns={TEACHER_COURSES_COLUMNS} />
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {reportData.cursosACargo.map((c) => (
                      <tr key={`${c.curso}-${c.materia}`} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {c.nivel}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {c.curso}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {c.materia}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Activo
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Tabla 2: Horarios de Cada Curso */}
          <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-600">calendar_month</span>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Horarios Semanales de Dictado de Cada Curso
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                {reportData.horarios.length} bloques horarios
              </span>
            </div>

            {reportData.horarios.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No hay grilla horaria registrada para este profesor.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" data-testid="table-report-teacher-schedules">
                  <ReportTableHeader columns={TEACHER_SCHEDULES_COLUMNS} />
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {reportData.horarios.map((sch) => (
                      <tr key={`${sch.dia}-${sch.hora}-${sch.curso}`} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {sch.dia}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {sch.hora}
                        </td>
                        <td className="py-3 px-4 font-bold text-blue-800">
                          {sch.curso}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {sch.materia}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-500">
                          {sch.nivel}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default ReportePorDocenteView;
