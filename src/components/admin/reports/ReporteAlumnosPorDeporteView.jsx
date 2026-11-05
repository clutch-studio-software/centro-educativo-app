import React, { useState, useMemo } from 'react';
import {
  getAllSportEnrollments,
  getUniqueSportsList,
  filterEnrollmentsBySearch,
  STUDENT_COMMON_CSV_HEADERS,
  exportReportToCsv,
} from './reportsUtils';
import ReportHeaderActions from './ReportHeaderActions';
import ReportTableHeader from './ReportTableHeader';
import ReportEmptyState from './ReportEmptyState';
import ReportSportSelect from './ReportSportSelect';
import ReportSearchInput from './ReportSearchInput';

const EMPTY_LIST = [];

const SPORT_STUDENTS_COLUMNS = [
  { label: 'Deporte / Disciplina', align: 'left' },
  { label: 'Alumno (Apellido, Nombre)', align: 'left' },
  { label: 'Legajo', align: 'left' },
  { label: 'Curso / División', align: 'left' },
  { label: 'Nivel Educativo', align: 'left' },
  { label: 'Horario', align: 'right' },
];

const ReporteAlumnosPorDeporteView = ({
  students = EMPTY_LIST,
  allSports = EMPTY_LIST,
}) => {
  const [selectedSport, setSelectedSport] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Consolidar todas las inscripciones deportivas
  const allEnrollments = useMemo(() => {
    return getAllSportEnrollments(students, allSports);
  }, [students, allSports]);

  // Lista de deportes únicos disponibles para filtrar
  const availableSports = useMemo(() => {
    return getUniqueSportsList(allEnrollments);
  }, [allEnrollments]);

  // Filtrado reactivo por deporte seleccionado y término de búsqueda
  const filteredEnrollments = useMemo(() => {
    return allEnrollments.filter((e) => {
      const matchSport =
        selectedSport === 'Todos' ||
        e.sportName.toLowerCase() === selectedSport.toLowerCase();

      return matchSport && filterEnrollmentsBySearch(e, searchTerm);
    });
  }, [allEnrollments, selectedSport, searchTerm]);

  // Métricas resumidas
  const metrics = useMemo(() => {
    const uniqueStudents = new Set(filteredEnrollments.map((e) => e.studentId)).size;
    const uniqueSports = new Set(filteredEnrollments.map((e) => e.sportName)).size;
    return { uniqueStudents, uniqueSports };
  }, [filteredEnrollments]);

  // Manejador de exportación CSV
  const handleExportCsv = () => {
    const exportRows = filteredEnrollments.map((e) => ({
      deporte: e.sportName,
      alumno: e.nombreCompleto,
      legajo: e.legajo,
      dni: e.dni,
      curso: e.curso,
      division: e.division,
      nivel: e.nivel,
      horario: e.horario,
      profesor: e.profesorName,
    }));

    exportReportToCsv(
      `Reporte_Alumnos_Por_Deporte_${selectedSport.replace(/\s+/g, '_')}`,
      [
        { label: 'Deporte / Disciplina', key: 'deporte' },
        ...STUDENT_COMMON_CSV_HEADERS,
        { label: 'Horario Asignado', key: 'horario' },
        { label: 'Profesor Responsable', key: 'profesor' },
      ],
      exportRows
    );
  };

  return (
    <div data-testid="report-alumnos-deporte-container" className="flex flex-col gap-5">
      {/* Barra de Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 print:hidden">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <ReportSportSelect
            value={selectedSport}
            onChange={setSelectedSport}
            options={availableSports}
            totalCount={allEnrollments.length}
            testId="select-filter-sport"
          />

          <ReportSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por apellido, nombre, legajo o curso..."
            testId="input-search-sport-students"
          />
        </div>

        {/* Resumen de Métricas */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto text-xs font-medium text-slate-500">
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold">
            {metrics.uniqueStudents} alumnos
          </span>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full font-bold">
            {metrics.uniqueSports} disciplinas
          </span>
        </div>
      </div>

      {/* Tabla Oficial de Inscriptos por Deporte */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-4">
        <ReportHeaderActions
          title="Listado Oficial de Alumnos por Deporte"
          icon="sports_soccer"
          badgeText={`${filteredEnrollments.length} inscriptos`}
          onExportCsv={handleExportCsv}
        />

        {filteredEnrollments.length === 0 ? (
          <ReportEmptyState
            testId="report-sport-empty"
            icon="sports_soccer"
            title="No se encontraron inscriptos"
            description="No hay estudiantes registrados para el deporte seleccionado o el criterio de búsqueda actual."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" data-testid="table-report-sport-students">
              <ReportTableHeader columns={SPORT_STUDENTS_COLUMNS} />
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEnrollments.map((enr) => (
                  <tr
                    key={`${enr.sportId}-${enr.studentId}`}
                    data-testid={`row-sport-student-${enr.sportId}-${enr.studentId}`}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="text-base">{enr.sportEmoji}</span>
                      <span>{enr.sportName}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {enr.nombreCompleto}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {enr.legajo}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {enr.curso}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                        {enr.nivel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {enr.horario}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ReporteAlumnosPorDeporteView;
