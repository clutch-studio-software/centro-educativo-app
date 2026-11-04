import React, { useState, useMemo } from 'react';
import { formatFullName, exportReportToCsv } from './reportsUtils';
import { normalizeNivel } from '../../../utils/academicUtils';
import ReportHeaderActions from './ReportHeaderActions';
import ReportTableHeader from './ReportTableHeader';
import ReportNivelSelect from './ReportNivelSelect';

const EMPTY_STUDENTS = [];

const ALUMNOS_CURSO_COLUMNS = [
  { label: 'Nivel Educativo', align: 'left' },
  { label: 'Curso / División', align: 'left' },
  { label: 'Legajo', align: 'left' },
  { label: 'Apellido y Nombre', align: 'left' },
  { label: 'DNI', align: 'left' },
  { label: 'Servicios', align: 'right' },
];

const ReporteAlumnosPorCursoView = ({
  students = EMPTY_STUDENTS,
}) => {
  const [selectedNivel, setSelectedNivel] = useState('Todos');
  const [selectedCurso, setSelectedCurso] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Cursos disponibles agrupados por nivel
  const cursosDisponibles = useMemo(() => {
    const set = new Set();
    students.forEach((s) => {
      const c = String(s.curso || '').trim();
      const n = normalizeNivel(s.nivel);
      if (c && c !== 'Sin asignar') {
        if (selectedNivel === 'Todos' || n.toLowerCase() === selectedNivel.toLowerCase()) {
          set.add(c);
        }
      }
    });
    return Array.from(set).sort();
  }, [students, selectedNivel]);

  // Curso efectivo derivado: si el curso seleccionado no pertenece al nivel, usa 'Todos'
  const effectiveCurso = cursosDisponibles.includes(selectedCurso) ? selectedCurso : 'Todos';

  // Alumnos filtrados según los criterios
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const sNivel = normalizeNivel(s.nivel).toLowerCase();
      const sCurso = String(s.curso || '').trim();
      const q = searchTerm.toLowerCase().trim();

      const matchesNivel =
        selectedNivel === 'Todos' || sNivel === selectedNivel.toLowerCase();
      const matchesCurso = effectiveCurso === 'Todos' || sCurso === effectiveCurso;

      const fullName = (s.nombreCompleto || `${s.nombre || ''} ${s.apellido || ''}`).toLowerCase();
      const legajo = String(s.studentID_login || s.legajo || '').toLowerCase();
      const dni = String(s.dni || '').replace(/\D/g, '');

      const matchesSearch = !q || fullName.includes(q) || legajo.includes(q) || dni.includes(q);

      return matchesNivel && matchesCurso && matchesSearch;
    });
  }, [students, selectedNivel, effectiveCurso, searchTerm]);

  // Manejo directo de exportación CSV
  const handleExportCsv = () => {
    const exportRows = filteredStudents.map((st) => {
      const servicios = Array.isArray(st.servicios) ? st.servicios : [];
      return {
        nivel: normalizeNivel(st.nivel),
        curso: st.curso || 'Sin curso',
        division: st.division || 'A',
        legajo: st.studentID_login || st.legajo || 'Sin legajo',
        nombreCompleto: formatFullName(st),
        dni: st.dni || 'Sin DNI',
        comedor: servicios.some((s) => String(s).toLowerCase().includes('comedor')) ? 'Sí' : 'No',
        transporte: st.recorridoTransporte || (servicios.some((s) => String(s).toLowerCase().includes('transporte')) ? 'Sí' : 'No'),
        deportes: Array.isArray(st.disciplinas) ? st.disciplinas.join(', ') : 'Ninguno',
      };
    });

    exportReportToCsv(
      `Listado_Alumnos_${effectiveCurso === 'Todos' ? selectedNivel : effectiveCurso.replace(/\s+/g, '_')}`,
      [
        { label: 'Nivel Educativo', key: 'nivel' },
        { label: 'Curso', key: 'curso' },
        { label: 'División', key: 'division' },
        { label: 'Legajo', key: 'legajo' },
        { label: 'Apellido y Nombre', key: 'nombreCompleto' },
        { label: 'DNI', key: 'dni' },
        { label: 'Comedor', key: 'comedor' },
        { label: 'Transporte', key: 'transporte' },
        { label: 'Deportes', key: 'deportes' },
      ],
      exportRows
    );
  };

  return (
    <div data-testid="report-alumnos-curso-container" className="flex flex-col gap-5">
      {/* Barra de Filtros Interactivos (oculto en impresión) */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de Nivel */}
          <ReportNivelSelect
            id="select-report-nivel"
            testId="select-report-nivel"
            value={selectedNivel}
            onChange={setSelectedNivel}
          />

          {/* Selector de Curso */}
          <div className="flex flex-col gap-1">
            <label htmlFor="select-report-curso" className="text-[11px] font-bold text-slate-500 uppercase">
              Curso / División
            </label>
            <select
              id="select-report-curso"
              data-testid="select-report-curso"
              value={selectedCurso}
              onChange={(e) => setSelectedCurso(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden cursor-pointer min-w-[160px]"
            >
              <option value="Todos">Todos los Cursos</option>
              {cursosDisponibles.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buscador de Alumnos dentro del filtro */}
        <div className="flex flex-col gap-1 w-full md:w-64">
          <label htmlFor="search-student-in-course" className="text-[11px] font-bold text-slate-500 uppercase">
            Filtrar Alumno
          </label>
          <div className="relative">
            <input
              id="search-student-in-course"
              type="text"
              data-testid="input-search-student-course"
              placeholder="Buscar por nombre o legajo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 pl-8 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
            />
            <span className="material-symbols-outlined text-[16px] text-slate-400 absolute left-2.5 top-2">
              search
            </span>
          </div>
        </div>
      </section>

      {/* Tarjeta de Resumen / Métrica de la División */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-md p-4 shadow-2xs text-left">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Matrícula Filtrada</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{filteredStudents.length} alumnos</p>
          <p className="text-[10px] text-slate-400">Total en la división o nivel seleccionado</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-md p-4 shadow-2xs text-left">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Criterio Actual</span>
          <p className="text-base font-extrabold text-blue-700 mt-1 truncate" title={effectiveCurso}>
            {effectiveCurso === 'Todos' ? `Todos (${selectedNivel})` : effectiveCurso}
          </p>
          <p className="text-[10px] text-slate-400">Nivel {selectedNivel}</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-md p-4 shadow-2xs text-left">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Servicios Activos</span>
          <p className="text-base font-extrabold text-emerald-700 mt-1">
            {filteredStudents.filter((s) => (s.servicios || []).length > 0).length} alumnos
          </p>
          <p className="text-[10px] text-slate-400">Utilizan comedor, deportes o transporte</p>
        </div>
      </section>

      {/* Tabla Oficial de Alumnos por Curso */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3">
        <ReportHeaderActions
          title="Listado Oficial de Alumnos por Curso"
          icon="format_list_numbered"
          badgeText={`${filteredStudents.length} registros`}
          onExportCsv={handleExportCsv}
          isExportDisabled={filteredStudents.length === 0}
        />

        {filteredStudents.length === 0 ? (
          <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
            <p className="text-xs font-semibold">No se encontraron estudiantes para los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" data-testid="table-report-alumnos-curso">
              <ReportTableHeader columns={ALUMNOS_CURSO_COLUMNS} />
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredStudents.map((st) => {
                  const servicios = Array.isArray(st.servicios) ? st.servicios : [];
                  const hasTransport = servicios.some((s) => String(s).toLowerCase().includes('transporte'));
                  const hasComedor = servicios.some((s) => String(s).toLowerCase().includes('comedor'));

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {normalizeNivel(st.nivel)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {st.curso || 'Sin curso'} {st.division ? `(${st.division})` : ''}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-800">
                        {st.studentID_login || st.legajo || 'S/L'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatFullName(st)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {st.dni || 'S/DNI'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {hasComedor && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200" title="Comedor Escolar">
                              Comedor
                            </span>
                          )}
                          {hasTransport && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200" title={st.recorridoTransporte || 'Transporte'}>
                              Transporte
                            </span>
                          )}
                          {!hasComedor && !hasTransport && (
                            <span className="text-[10px] text-slate-400">Regular</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default ReporteAlumnosPorCursoView;
