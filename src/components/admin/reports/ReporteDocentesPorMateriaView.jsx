import React, { useState, useMemo } from 'react';
import { normalizeNivel } from '../../../utils/academicUtils';
import { exportReportToCsv } from './reportsUtils';
import ReportHeaderActions from './ReportHeaderActions';
import ReportTableHeader from './ReportTableHeader';
import ReportNivelSelect from './ReportNivelSelect';

const EMPTY_COURSES = [];
const EMPTY_SUBJECTS = [];
const EMPTY_TEACHERS = [];

const DOCENTES_MATERIA_COLUMNS = [
  { label: 'Nombre de la Materia', align: 'left' },
  { label: 'Nivel', align: 'left' },
  { label: 'Cursos Donde se Dicta', align: 'left' },
  { label: 'Lista de Profesores Asignados', align: 'left' },
  { label: 'Carga Horaria', align: 'right' },
];

const ReporteDocentesPorMateriaView = ({
  courses = EMPTY_COURSES,
  subjects = EMPTY_SUBJECTS,
  teachers = EMPTY_TEACHERS,
}) => {
  const [selectedNivel, setSelectedNivel] = useState('Todos');
  const [searchMateria, setSearchMateria] = useState('');

  // Indexar profesores por nombre y por legajo
  const teachersMap = useMemo(() => {
    const map = new Map();
    teachers.forEach((t) => {
      const name = (t.nombreCompleto || `${t.nombre || ''} ${t.apellido || ''}`).trim().toLowerCase();
      const leg = String(t.legajo || '').trim().toLowerCase();
      if (name) map.set(name, t);
      if (leg) map.set(leg, t);
    });
    return map;
  }, [teachers]);

  // Indexar cursos por id
  const coursesMap = useMemo(() => {
    const map = new Map();
    courses.forEach((c) => {
      map.set(c.id, c);
    });
    return map;
  }, [courses]);

  // Consolidar lista de materias con sus docentes
  const consolidatedSubjects = useMemo(() => {
    const group = new Map();

    subjects.forEach((sub) => {
      const course = coursesMap.get(sub.cursoId);
      const nivel = normalizeNivel(course?.nivelId || sub.nivel || 'Primario');

      const key = `${sub.nombre.trim().toLowerCase()}__${nivel.toLowerCase()}`;

      if (!group.has(key)) {
        group.set(key, {
          nombre: sub.nombre.trim(),
          nivel,
          cargaHoraria: sub.cargaHoraria || '4 hs / semana',
          cursos: new Set(),
          profesores: new Map(),
        });
      }

      const item = group.get(key);
      if (course?.nombre) {
        item.cursos.add(course.nombre);
      }

      if (sub.profesor && typeof sub.profesor === 'object') {
        const profName = sub.profesor.nombre || sub.profesor.name;
        if (profName) {
          const matched = teachersMap.get(profName.toLowerCase());
          item.profesores.set(profName, {
            nombre: profName,
            legajo: matched?.legajo || sub.profesor.legajo || 'Sin legajo',
            email: matched?.email || 'Sin correo',
            especialidad: matched?.especialidad || 'Docente a cargo',
          });
        }
      }
    });

    const result = [];
    group.forEach((item) => {
      result.push({
        nombre: item.nombre,
        nivel: item.nivel,
        cargaHoraria: item.cargaHoraria,
        cursos: Array.from(item.cursos),
        profesores: Array.from(item.profesores.values()),
        tieneVacante: item.profesores.size === 0,
      });
    });

    return result.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [subjects, coursesMap, teachersMap]);

  // Filtrado reactivo por nivel y buscador
  const filteredSubjects = useMemo(() => {
    return consolidatedSubjects.filter((sub) => {
      const matchesNivel =
        selectedNivel === 'Todos' || sub.nivel.toLowerCase() === selectedNivel.toLowerCase();
      const q = searchMateria.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sub.nombre.toLowerCase().includes(q) ||
        sub.profesores.some((p) => p.nombre.toLowerCase().includes(q) || p.legajo.toLowerCase().includes(q));

      return matchesNivel && matchesSearch;
    });
  }, [consolidatedSubjects, selectedNivel, searchMateria]);

  // Manejo directo de exportación CSV
  const handleExportCsv = () => {
    const exportRows = [];
    filteredSubjects.forEach((sub) => {
      if (sub.profesores.length === 0) {
        exportRows.push({
          materia: sub.nombre,
          nivel: sub.nivel,
          cursos: sub.cursos.join(', ') || 'No asignado',
          cargaHoraria: sub.cargaHoraria,
          profesor: 'VACANTE SIN DOCENTE',
          legajo: 'N/A',
          email: 'N/A',
        });
      } else {
        sub.profesores.forEach((p) => {
          exportRows.push({
            materia: sub.nombre,
            nivel: sub.nivel,
            cursos: sub.cursos.join(', ') || 'Varios',
            cargaHoraria: sub.cargaHoraria,
            profesor: p.nombre,
            legajo: p.legajo,
            email: p.email,
          });
        });
      }
    });

    exportReportToCsv(
      `Listado_Docentes_Por_Materia_${selectedNivel}`,
      [
        { label: 'Materia', key: 'materia' },
        { label: 'Nivel Educativo', key: 'nivel' },
        { label: 'Cursos donde se dicta', key: 'cursos' },
        { label: 'Carga Horaria', key: 'cargaHoraria' },
        { label: 'Profesor Asignado', key: 'profesor' },
        { label: 'Legajo Docente', key: 'legajo' },
        { label: 'Email Docente', key: 'email' },
      ],
      exportRows
    );
  };

  return (
    <div data-testid="report-docentes-materia-container" className="flex flex-col gap-5">
      {/* Filtros de Nivel y Buscador de Materia */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <ReportNivelSelect
            id="select-materia-nivel"
            testId="select-materia-nivel"
            value={selectedNivel}
            onChange={setSelectedNivel}
          />
        </div>

        <div className="flex flex-col gap-1 w-full md:w-72">
          <label htmlFor="search-materia-input" className="text-[11px] font-bold text-slate-500 uppercase">
            Buscar Materia o Docente
          </label>
          <div className="relative">
            <input
              id="search-materia-input"
              type="text"
              data-testid="input-search-materia"
              placeholder="Ej. Matemática, Historia, Valenzuela..."
              value={searchMateria}
              onChange={(e) => setSearchMateria(e.target.value)}
              className="w-full px-3 py-1.5 pl-8 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden"
            />
            <span className="material-symbols-outlined text-[16px] text-slate-400 absolute left-2.5 top-2">
              search
            </span>
          </div>
        </div>
      </section>

      {/* Tabla Oficial de Docentes por Materia */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3">
        <ReportHeaderActions
          title="Listado de Docentes por Materia"
          icon="menu_book"
          badgeText={`${filteredSubjects.length} materias listadas`}
          onExportCsv={handleExportCsv}
          isExportDisabled={filteredSubjects.length === 0}
        />

        {filteredSubjects.length === 0 ? (
          <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
            <p className="text-xs font-semibold">No se encontraron materias con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" data-testid="table-report-docentes-materia">
              <ReportTableHeader columns={DOCENTES_MATERIA_COLUMNS} />
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSubjects.map((sub) => (
                  <tr key={`${sub.nombre}-${sub.nivel}`} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {sub.nombre}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {sub.nivel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={sub.cursos.join(', ')}>
                      {sub.cursos.length > 0 ? sub.cursos.join(', ') : 'Todos los cursos del nivel'}
                    </td>
                    <td className="py-3 px-4">
                      {sub.profesores.length === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                          Vacante a cubrir
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {sub.profesores.map((p) => (
                            <div key={`${p.nombre}-${p.legajo}`} className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px] text-blue-600">badge</span>
                              <span className="font-bold text-slate-900">{p.nombre}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({p.legajo})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      {sub.cargaHoraria}
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

export default ReporteDocentesPorMateriaView;
