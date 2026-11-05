import React, { useState, useMemo } from 'react';
import {
  getAllTransportEnrollments,
  filterEnrollmentsBySearch,
  STUDENT_COMMON_CSV_HEADERS,
  exportReportToCsv,
} from './reportsUtils';
import { TRANSPORT_ROUTES } from '../../../utils/academicUtils';
import ReportHeaderActions from './ReportHeaderActions';
import ReportTableHeader from './ReportTableHeader';
import ReportNivelSelect from './ReportNivelSelect';
import ReportEmptyState from './ReportEmptyState';
import ReportSearchInput from './ReportSearchInput';

const EMPTY_LIST = [];

const TRANSPORT_COLUMNS = [
  { label: 'Recorrido Asignado', align: 'left' },
  { label: 'Horarios (Ida / Regreso)', align: 'left' },
  { label: 'Alumno (Apellido, Nombre)', align: 'left' },
  { label: 'Legajo', align: 'left' },
  { label: 'Curso / División', align: 'left' },
  { label: 'Nivel Educativo', align: 'left' },
  { label: 'Domicilio / Parada', align: 'right' },
];

const ReporteTransportePorRecorridoView = ({
  students = EMPTY_LIST,
}) => {
  const [selectedRouteId, setSelectedRouteId] = useState('Todos');
  const [selectedNivel, setSelectedNivel] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Consolidar todos los alumnos con servicio de transporte escolar
  const allTransportStudents = useMemo(() => {
    return getAllTransportEnrollments(students);
  }, [students]);

  // Resumen de alumnos por recorrido (para las tarjetas superiores)
  const routeStats = useMemo(() => {
    return TRANSPORT_ROUTES.map((route) => {
      const count = allTransportStudents.filter(
        (st) =>
          st.recorridoId.toLowerCase() === route.id.toLowerCase() ||
          st.recorridoNombre.toLowerCase() === route.nombre.toLowerCase()
      ).length;
      return { ...route, count };
    });
  }, [allTransportStudents]);

  // Filtrado de alumnos
  const filteredStudents = useMemo(() => {
    return allTransportStudents.filter((st) => {
      const matchRoute =
        selectedRouteId === 'Todos' ||
        st.recorridoId.toLowerCase() === selectedRouteId.toLowerCase() ||
        st.recorridoNombre.toLowerCase() === selectedRouteId.toLowerCase();

      const matchNivel =
        selectedNivel === 'Todos' ||
        st.nivel.toLowerCase() === selectedNivel.toLowerCase();

      return matchRoute && matchNivel && filterEnrollmentsBySearch(st, searchTerm);
    });
  }, [allTransportStudents, selectedRouteId, selectedNivel, searchTerm]);

  // Manejador de exportación CSV
  const handleExportCsv = () => {
    const exportRows = filteredStudents.map((st) => ({
      recorrido: st.recorridoNombre,
      zona: st.zona,
      horarios: `${st.horarioIda} / ${st.horarioRegreso}`,
      alumno: st.nombreCompleto,
      legajo: st.legajo,
      dni: st.dni,
      curso: st.curso,
      division: st.division,
      nivel: st.nivel,
      domicilio: st.domicilio,
    }));

    exportReportToCsv(
      `Reporte_Transporte_Escolar_${selectedRouteId.replace(/\s+/g, '_')}`,
      [
        { label: 'Recorrido Asignado', key: 'recorrido' },
        { label: 'Zona / Paradas', key: 'zona' },
        { label: 'Horarios (Ida / Regreso)', key: 'horarios' },
        ...STUDENT_COMMON_CSV_HEADERS,
        { label: 'Domicilio Registrado', key: 'domicilio' },
      ],
      exportRows
    );
  };

  return (
    <div data-testid="report-transporte-recorrido-container" className="flex flex-col gap-5">
      {/* 4 Fichas de Recorridos Oficiales del TPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-2">
        {routeStats.map((r) => {
          const isSelected = selectedRouteId === r.id;
          return (
            <button
              key={r.id}
              type="button"
              data-testid={`card-route-stat-${r.id.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setSelectedRouteId(isSelected ? 'Todos' : r.id)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-400 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200/80 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-blue-700">
                  <span className="material-symbols-outlined text-[20px]">directions_bus</span>
                  <span className="font-extrabold text-xs">{r.id}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800">
                  {r.count} alumnos
                </span>
              </div>
              <h4 className="font-extrabold text-xs text-slate-800 mt-2 truncate">
                {r.nombre.replace(/Recorrido \d+ - /g, '')}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                {r.zona}
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono font-semibold text-slate-400 mt-2 border-t border-slate-100 pt-1.5">
                <span>Ida: <strong>{r.horarioIda}</strong></span>
                <span>Regreso: <strong>{r.horarioRegreso}</strong></span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Selector de Recorrido */}
          <div className="flex items-center gap-2">
            <label htmlFor="filter-route-select" className="text-xs font-bold text-slate-600 whitespace-nowrap">
              Recorrido:
            </label>
            <select
              id="filter-route-select"
              data-testid="select-filter-transport-route"
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
            >
              <option value="Todos">Todos los Recorridos ({allTransportStudents.length})</option>
              {TRANSPORT_ROUTES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Nivel */}
          <ReportNivelSelect
            value={selectedNivel}
            onChange={setSelectedNivel}
            testId="select-filter-nivel-transport"
          />

          <ReportSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por alumno, legajo, curso o domicilio..."
            testId="input-search-transport-students"
          />
        </div>

        {/* Resumen */}
        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 shrink-0 self-end md:self-auto">
          {filteredStudents.length} estudiantes asignados
        </span>
      </div>

      {/* Tabla Oficial */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-4">
        <ReportHeaderActions
          title="Listado de Alumnos por Recorrido del Servicio de Transporte"
          icon="directions_bus"
          badgeText={`${filteredStudents.length} inscriptos`}
          onExportCsv={handleExportCsv}
        />

        {filteredStudents.length === 0 ? (
          <ReportEmptyState
            testId="report-transport-empty"
            icon="directions_bus"
            title="No se encontraron alumnos"
            description="No hay estudiantes asignados al recorrido seleccionado o que cumplan con la búsqueda."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" data-testid="table-report-transport-students">
              <ReportTableHeader columns={TRANSPORT_COLUMNS} />
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((st) => (
                  <tr
                    key={`${st.recorridoId}-${st.studentId}`}
                    data-testid={`row-transport-${st.recorridoId}-${st.studentId}`}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {st.recorridoNombre}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {st.horarioIda} - {st.horarioRegreso}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {st.nombreCompleto}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {st.legajo}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {st.curso}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                        {st.nivel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-medium truncate max-w-xs">
                      {st.domicilio}
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

export default ReporteTransportePorRecorridoView;
