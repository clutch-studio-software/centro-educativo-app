import React, { useState, useMemo } from 'react';
import { getAllSportEnrollments, sortScheduleSlotsAndDays, exportReportToCsv } from './reportsUtils';
import ReportHeaderActions from './ReportHeaderActions';
import ReportNivelSelect from './ReportNivelSelect';
import ReportEmptyState from './ReportEmptyState';
import ReportSearchInput from './ReportSearchInput';
import SportDetailCard from './SportDetailCard';

const EMPTY_LIST = [];

const ReporteDeportesHorariosProfesorView = ({
  students = EMPTY_LIST,
  allSports = EMPTY_LIST,
}) => {
  const [selectedNivel, setSelectedNivel] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSportIds, setExpandedSportIds] = useState(() => new Set());

  // Consolidar todas las inscripciones deportivas
  const allEnrollments = useMemo(() => {
    return getAllSportEnrollments(students, allSports);
  }, [students, allSports]);

  // Consolidar disciplinas con sus horarios ordenados y alumnos asociados
  const sportsDetailList = useMemo(() => {
    return (allSports || []).map((sp) => {
      const { dia, hora } = sortScheduleSlotsAndDays(
        Array.isArray(sp.dias) ? sp.dias.join(', ') : sp.dias || 'Días de práctica',
        sp.horario || 'Horarios a convenir'
      );

      const inscriptos = allEnrollments.filter((e) => e.sportId === sp.id || e.sportName === sp.nombre);
      const cupoMax = sp.cupoMax || 30;
      const cupoOcupado = inscriptos.length;
      const porcentaje = Math.min(Math.round((cupoOcupado / cupoMax) * 100), 100);

      return {
        id: sp.id,
        nombre: sp.nombre,
        emoji: sp.emoji || '🏅',
        profesor: sp.profesor?.nombre || 'Docente a designar',
        emailProfesor: sp.profesor?.email || '',
        telefonoProfesor: sp.profesor?.telefono || '',
        niveles: sp.niveles || 'Todos los niveles',
        dia,
        hora,
        lugar: sp.lugar || 'Instalaciones deportivas centrales',
        cupoMax,
        cupoOcupado,
        porcentaje,
        inscriptos,
      };
    });
  }, [allSports, allEnrollments]);

  // Filtrado de disciplinas
  const filteredSports = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    return sportsDetailList.filter((sp) => {
      const matchNivel =
        selectedNivel === 'Todos' ||
        sp.niveles.toLowerCase().includes(selectedNivel.toLowerCase()) ||
        sp.inscriptos.some((ins) => ins.nivel.toLowerCase() === selectedNivel.toLowerCase());

      const matchSearch =
        !q ||
        sp.nombre.toLowerCase().includes(q) ||
        sp.profesor.toLowerCase().includes(q) ||
        sp.lugar.toLowerCase().includes(q);

      return matchNivel && matchSearch;
    });
  }, [sportsDetailList, selectedNivel, searchTerm]);

  // Toggle para expandir/colapsar nómina de inscriptos
  const toggleExpand = (sportId) => {
    setExpandedSportIds((prev) => {
      const next = new Set(prev);
      if (next.has(sportId)) {
        next.delete(sportId);
      } else {
        next.add(sportId);
      }
      return next;
    });
  };

  // Exportar a CSV
  const handleExportCsv = () => {
    const exportRows = [];
    filteredSports.forEach((sp) => {
      if (sp.inscriptos.length === 0) {
        exportRows.push({
          deporte: sp.nombre,
          profesor: sp.profesor,
          niveles: sp.niveles,
          dia: sp.dia,
          horario: sp.hora,
          lugar: sp.lugar,
          cupo: `${sp.cupoOcupado} / ${sp.cupoMax}`,
          alumno: 'Sin inscriptos',
          legajo: '-',
          curso: '-',
        });
      } else {
        sp.inscriptos.forEach((ins) => {
          exportRows.push({
            deporte: sp.nombre,
            profesor: sp.profesor,
            niveles: sp.niveles,
            dia: sp.dia,
            horario: sp.hora,
            lugar: sp.lugar,
            cupo: `${sp.cupoOcupado} / ${sp.cupoMax}`,
            alumno: ins.nombreCompleto,
            legajo: ins.legajo,
            curso: ins.curso,
          });
        });
      }
    });

    exportReportToCsv(
      `Reporte_Deportes_Horarios_Profesores_${selectedNivel}`,
      [
        { label: 'Deporte', key: 'deporte' },
        { label: 'Profesor Responsable', key: 'profesor' },
        { label: 'Niveles Permitidos', key: 'niveles' },
        { label: 'Día(s)', key: 'dia' },
        { label: 'Horario', key: 'horario' },
        { label: 'Lugar', key: 'lugar' },
        { label: 'Ocupación de Cupo', key: 'cupo' },
        { label: 'Alumno Inscripto', key: 'alumno' },
        { label: 'Legajo', key: 'legajo' },
        { label: 'Curso', key: 'curso' },
      ],
      exportRows
    );
  };

  return (
    <div data-testid="report-deportes-horarios-profesor-container" className="flex flex-col gap-5">
      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <ReportNivelSelect
            value={selectedNivel}
            onChange={setSelectedNivel}
            testId="select-filter-nivel-sports-prof"
          />

          <ReportSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por deporte, profesor o lugar de práctica..."
            testId="input-search-sports-prof"
          />
        </div>

        <span className="text-xs font-bold text-slate-500">
          {filteredSports.length} disciplinas deportivas
        </span>
      </div>

      {/* Listado de Fichas Detalladas por Disciplina */}
      <section className="flex flex-col gap-4">
        <ReportHeaderActions
          title="Detalle Integral de Deportes: Niveles, Horarios y Profesores"
          icon="schedule"
          badgeText={`${filteredSports.length} disciplinas activas`}
          onExportCsv={handleExportCsv}
        />

        {filteredSports.length === 0 ? (
          <ReportEmptyState
            testId="report-sports-prof-empty"
            icon="schedule"
            title="No se encontraron disciplinas"
            description="No hay actividades deportivas que coincidan con los filtros aplicados."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredSports.map((sp) => (
              <SportDetailCard
                key={sp.id}
                sp={sp}
                isExpanded={expandedSportIds.has(sp.id)}
                onToggleExpand={toggleExpand}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ReporteDeportesHorariosProfesorView;
