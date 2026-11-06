import React, { useState, useMemo } from 'react';
import {
  getAllSportEnrollments,
  getUniqueSportsList,
  getNivelWeight,
  filterEnrollmentsBySearch,
  STUDENT_COMMON_CSV_HEADERS,
  exportReportToCsv,
} from './reportsUtils';
import ReportHeaderActions from './ReportHeaderActions';
import ReportTableHeader from './ReportTableHeader';
import ReportNivelSelect from './ReportNivelSelect';
import ReportEmptyState from './ReportEmptyState';
import ReportSportSelect from './ReportSportSelect';
import ReportSearchInput from './ReportSearchInput';

const EMPTY_LIST = [];

const SPORT_NIVEL_COLUMNS = [
  { label: 'Nivel Educativo', align: 'left' },
  { label: 'Deporte / Disciplina', align: 'left' },
  { label: 'Alumno (Apellido, Nombre)', align: 'left' },
  { label: 'Legajo', align: 'left' },
  { label: 'Curso / División', align: 'left' },
  { label: 'Horario Asignado', align: 'right' },
];

const ReporteDeportesPorNivelView = ({
  students = EMPTY_LIST,
  allSports = EMPTY_LIST,
}) => {
  const [selectedSport, setSelectedSport] = useState('Todos');
  const [selectedNivel, setSelectedNivel] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Consolidar todas las inscripciones deportivas
  const allEnrollments = useMemo(() => {
    return getAllSportEnrollments(students, allSports);
  }, [students, allSports]);

  // Deportes disponibles
  const availableSports = useMemo(() => {
    return getUniqueSportsList(allEnrollments);
  }, [allEnrollments]);

  // Filtrar y ordenar:
  // 1. Nivel Educativo (Inicial -> Primario -> Secundario)
  // 2. Deporte (A-Z)
  // 3. Curso / División
  // 4. Apellido, Nombre
  const filteredEnrollments = useMemo(() => {
    const filtered = allEnrollments.filter((e) => {
      const matchSport =
        selectedSport === 'Todos' ||
        e.sportName.toLowerCase() === selectedSport.toLowerCase();

      const matchNivel =
        selectedNivel === 'Todos' ||
        e.nivel.toLowerCase() === selectedNivel.toLowerCase();

      return matchSport && matchNivel && filterEnrollmentsBySearch(e, searchTerm);
    });

    return filtered.sort((a, b) => {
      const wA = getNivelWeight(a.nivel);
      const wB = getNivelWeight(b.nivel);
      if (wA !== wB) return wA - wB;

      const spCmp = a.sportName.localeCompare(b.sportName, 'es', { sensitivity: 'base' });
      if (spCmp !== 0) return spCmp;

      return a.nombreCompleto.localeCompare(b.nombreCompleto, 'es', { sensitivity: 'base' });
    });
  }, [allEnrollments, selectedSport, selectedNivel, searchTerm]);

  // Conteos por nivel
  const countsByNivel = useMemo(() => {
    return {
      inicial: allEnrollments.filter((e) => e.nivel === 'inicial').length,
      primario: allEnrollments.filter((e) => e.nivel === 'primario').length,
      secundario: allEnrollments.filter((e) => e.nivel === 'secundario').length,
    };
  }, [allEnrollments]);

  // Manejo de exportación CSV
  const handleExportCsv = () => {
    const exportRows = filteredEnrollments.map((e) => ({
      nivel: e.nivel,
      deporte: e.sportName,
      alumno: e.nombreCompleto,
      legajo: e.legajo,
      curso: e.curso,
      division: e.division,
      horario: e.horario,
      profesor: e.profesorName,
    }));

    exportReportToCsv(
      `Reporte_Deportes_Por_Nivel_${selectedNivel}_${selectedSport.replace(/\s+/g, '_')}`,
      [
        { label: 'Nivel Educativo', key: 'nivel' },
        { label: 'Deporte / Disciplina', key: 'deporte' },
        ...STUDENT_COMMON_CSV_HEADERS,
        { label: 'Horario Asignado', key: 'horario' },
        { label: 'Profesor Responsable', key: 'profesor' },
      ],
      exportRows
    );
  };

  return (
    <div data-testid="report-deportes-nivel-container" className="flex flex-col gap-5">
      {/* Barra de Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <ReportSportSelect
            value={selectedSport}
            onChange={setSelectedSport}
            options={availableSports}
            testId="select-filter-sports-level"
          />

          {/* Selector de Nivel Educativo */}
          <ReportNivelSelect
            value={selectedNivel}
            onChange={setSelectedNivel}
            testId="select-filter-nivel-sports"
          />

          <ReportSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por alumno, legajo o curso..."
            testId="input-search-sports-level"
          />
        </div>

        {/* Píldoras de Conteo por Nivel */}
        <div className="flex items-center gap-2 shrink-0 text-xs">
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold">
            Inicial: {countsByNivel.inicial}
          </span>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
            Primario: {countsByNivel.primario}
          </span>
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold">
            Secundario: {countsByNivel.secundario}
          </span>
        </div>
      </div>

      {/* Tabla Oficial */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-4">
        <ReportHeaderActions
          title="Listado de Alumnos por Deporte y Nivel Educativo"
          icon="fitness_center"
          badgeText={`${filteredEnrollments.length} inscriptos`}
          onExportCsv={handleExportCsv}
        />

        {filteredEnrollments.length === 0 ? (
          <ReportEmptyState
            testId="report-sports-level-empty"
            icon="fitness_center"
            title="No se encontraron inscriptos"
            description="No hay estudiantes en el cruce de deporte y nivel educativo seleccionado."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" data-testid="table-report-sports-level">
              <ReportTableHeader columns={SPORT_NIVEL_COLUMNS} />
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredEnrollments.map((enr) => (
                  <tr
                    key={`${enr.sportId}-${enr.studentId}-${enr.nivel}`}
                    data-testid={`row-sport-level-${enr.sportId}-${enr.studentId}`}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                        {enr.nivel}
                      </span>
                    </td>
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

export default ReporteDeportesPorNivelView;
