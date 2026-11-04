import React, { useState, useMemo } from 'react';
import {
  normalizeNivel,
  getEnrolledStudentsForCourse,
} from '../../../utils/academicUtils';
import { exportReportToCsv } from './reportsUtils';
import ReportHeaderActions from './ReportHeaderActions';
import ReportTableHeader from './ReportTableHeader';

const EMPTY_COURSES = [];
const EMPTY_STUDENTS = [];

const NIVELES = ['Todos', 'Inicial', 'Primario', 'Secundario'];

const CURSOS_NIVEL_COLUMNS = [
  { label: 'Nivel Educativo', align: 'left' },
  { label: 'División / Curso', align: 'left' },
  { label: 'Turno', align: 'left' },
  { label: 'Inscriptos / Capacidad', align: 'center' },
  { label: 'Ocupación', align: 'left' },
  { label: 'Estado', align: 'right' },
];

const ReporteCursosPorNivelView = ({
  courses = EMPTY_COURSES,
  students = EMPTY_STUDENTS,
}) => {
  const [selectedNivel, setSelectedNivel] = useState('Todos');

  // Procesar cada curso calculando inscriptos reales y ocupación
  const coursesWithMetrics = useMemo(() => {
    return courses.map((course) => {
      const inscriptos = getEnrolledStudentsForCourse(students, course);
      const enrolledCount = inscriptos.length;
      const cap = Number(course.capacidadMax || course.cupoMaximo || 30);
      const porcentaje = cap > 0 ? Math.min(100, Math.round((enrolledCount / cap) * 100)) : 0;
      const nivel = normalizeNivel(course.nivelId || course.nivel || 'Primario');

      return {
        ...course,
        nivelNormalizado: nivel,
        inscriptosCount: enrolledCount,
        capacidadMaxNum: cap,
        porcentajeOcupacion: porcentaje,
      };
    });
  }, [courses, students]);

  // Filtrado por nivel
  const filteredCourses = useMemo(() => {
    if (selectedNivel === 'Todos') return coursesWithMetrics;
    return coursesWithMetrics.filter(
      (c) => c.nivelNormalizado.toLowerCase() === selectedNivel.toLowerCase()
    );
  }, [coursesWithMetrics, selectedNivel]);

  // Totales consolidados para las tarjetas superiores
  const stats = useMemo(() => {
    let totalCapacidad = 0;
    let totalInscriptos = 0;

    filteredCourses.forEach((c) => {
      totalCapacidad += c.capacidadMaxNum;
      totalInscriptos += c.inscriptosCount;
    });

    const ocupacionGlobal =
      totalCapacidad > 0 ? Math.round((totalInscriptos / totalCapacidad) * 100) : 0;

    return {
      totalDivisiones: filteredCourses.length,
      totalCapacidad,
      totalInscriptos,
      ocupacionGlobal,
    };
  }, [filteredCourses]);

  // Manejo directo de exportación CSV
  const handleExportCsv = () => {
    const exportRows = filteredCourses.map((c) => ({
      nivel: c.nivelNormalizado,
      division: `${c.nombre} (${c.division || 'A'})`,
      turno: c.turno || 'Mañana',
      inscriptos: c.inscriptosCount,
      capacidad: c.capacidadMaxNum,
      ocupacion: `${c.porcentajeOcupacion}%`,
      estado: c.estado || 'Activo',
    }));

    exportReportToCsv(
      `Listado_Cursos_Por_Nivel_${selectedNivel}`,
      [
        { label: 'Nivel Educativo', key: 'nivel' },
        { label: 'Curso / División', key: 'division' },
        { label: 'Turno', key: 'turno' },
        { label: 'Cantidad Inscriptos', key: 'inscriptos' },
        { label: 'Cupo Máximo', key: 'capacidad' },
        { label: 'Porcentaje Ocupación', key: 'ocupacion' },
        { label: 'Estado Cursada', key: 'estado' },
      ],
      exportRows
    );
  };

  return (
    <div data-testid="report-cursos-nivel-container" className="flex flex-col gap-5">
      {/* Selector de Nivel (Pestañas) */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <span className="text-xs font-bold text-slate-700">Filtrar por Nivel Educativo:</span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {NIVELES.map((nivel) => {
            const isSelected = selectedNivel === nivel;
            return (
              <button
                key={nivel}
                type="button"
                data-testid={`btn-filter-nivel-${nivel.toLowerCase()}`}
                onClick={() => setSelectedNivel(nivel)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                }`}
              >
                {nivel === 'Todos' ? 'Todos los Niveles' : `Nivel ${nivel}`}
              </button>
            );
          })}
        </div>
      </section>

      {/* Grid de 3 Métricas Clave */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200/80 rounded-md p-4 shadow-2xs text-left">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Divisiones</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalDivisiones} cursos</p>
          <p className="text-[10px] text-slate-400">En nivel {selectedNivel}</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-md p-4 shadow-2xs text-left">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Matrícula Real</span>
          <p className="text-2xl font-black text-blue-700 mt-1">{stats.totalInscriptos} alumnos</p>
          <p className="text-[10px] text-slate-400">De {stats.totalCapacidad} cupos habilitados</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-md p-4 shadow-2xs text-left">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Ocupación Global</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{stats.ocupacionGlobal}%</p>
          <p className="text-[10px] text-slate-400">Promedio de cobertura de plazas</p>
        </div>
      </section>

      {/* Tabla Oficial de Cursos por Nivel */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3">
        <ReportHeaderActions
          title="Listado de Cursos por Nivel, Turno y Ocupación"
          icon="domain"
          badgeText={`${filteredCourses.length} divisiones listadas`}
          onExportCsv={handleExportCsv}
          isExportDisabled={filteredCourses.length === 0}
        />

        {filteredCourses.length === 0 ? (
          <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-4xl text-slate-300">domain_disabled</span>
            <p className="text-xs font-semibold">No se encontraron cursos para este nivel educativo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" data-testid="table-report-cursos-nivel">
              <ReportTableHeader columns={CURSOS_NIVEL_COLUMNS} />
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredCourses.map((c) => {
                  const isFull = c.porcentajeOcupacion >= 100;
                  const isHigh = c.porcentajeOcupacion >= 80;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {c.nivelNormalizado}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {c.nombre} <span className="text-slate-500 font-normal font-mono">({c.division || 'A'})</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {c.turno || 'Mañana'}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                        {c.inscriptosCount} <span className="text-slate-400 font-normal">/ {c.capacidadMaxNum}</span>
                      </td>
                      <td className="py-3 px-4 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-full bg-slate-100 print:bg-slate-200 rounded-full h-2.5 overflow-hidden border border-slate-200/80 print:border-slate-400"
                            style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                          >
                            <div
                              className={`h-2.5 rounded-full transition-all print:border print:border-black/20 ${
                                isFull
                                  ? 'bg-rose-500 print:bg-rose-600'
                                  : isHigh
                                    ? 'bg-amber-500 print:bg-amber-600'
                                    : 'bg-emerald-500 print:bg-emerald-600'
                              }`}
                              style={{
                                width: `${Math.min(100, c.porcentajeOcupacion)}%`,
                                WebkitPrintColorAdjust: 'exact',
                                printColorAdjust: 'exact',
                              }}
                            />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-700 print:text-black w-8 text-right">
                            {c.porcentajeOcupacion}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                            c.estado === 'Activo' || !c.estado ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              c.estado === 'Activo' || !c.estado ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {c.estado || 'Activo'}
                        </span>
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

export default ReporteCursosPorNivelView;
