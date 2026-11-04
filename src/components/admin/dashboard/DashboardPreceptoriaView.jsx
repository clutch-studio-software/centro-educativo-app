import React, { useState, useMemo } from 'react';
import { addPreceptoriaNoteToStudent } from '../../../services/sportsService';
import { formatDashboardDate } from './dashboardUtils';
import DashboardEntryDetailModal from './DashboardEntryDetailModal';
import { PreceptoriaTableRowSkeleton } from './DashboardTableSkeleton';

const PRECEPTORIA_TIPOS = [
  'Tardanza',
  'Falta Justificada',
  'Acta de Convivencia',
  'Sanción Disciplinaria',
  'Felicitación / Mención Especial',
  'Observación General',
];

const NewPreceptoriaModal = ({ student, onClose, onSaved }) => {
  const [tipo, setTipo] = useState(PRECEPTORIA_TIPOS[0]);
  const [motivo, setMotivo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!motivo.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addPreceptoriaNoteToStudent({
        studentId: student.id,
        studentDni: student.dni,
        studentLegajo: student.studentID_login,
        studentName: student.nombreCompleto || `${student.nombre || ''} ${student.apellido || ''}`,
        note: {
          tipo,
          motivo: motivo.trim(),
        },
      });
      onSaved?.();
      onClose();
    } catch (err) {
      console.error('Error al guardar nota de preceptoría:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="new-preceptoria-modal"
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-5 py-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
          <div className="flex text-left items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm">
                Registrar Novedad / Acta de Preceptoría
              </p>
              <p className="text-[11px] text-slate-600">
                {student.nombreCompleto || `${student.nombre} ${student.apellido}`} (<strong>{student.studentID_login}</strong> · {student.curso})
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="btn-close-preceptoria-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tipo-preceptoria" className="font-bold text-slate-700">
              Tipo de Registro
            </label>
            <select
              id="tipo-preceptoria"
              data-testid="select-preceptoria-type"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="px-3 py-2 bg-slate-50 text-[14px] border border-slate-200 rounded-md text-slate-800 font-medium focus:ring-2 focus:ring-purple-500/20 focus:outline-hidden"
            >
              {PRECEPTORIA_TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="motivo-preceptoria" className="font-bold text-slate-700">
              Observaciones / Justificación / Acta
            </label>
            <textarea
              id="motivo-preceptoria"
              data-testid="textarea-preceptoria-motivo"
              rows={3}
              required
              placeholder="Describa el incidente, motivo de tardanza o acuerdo de convivencia..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="px-3 py-2 text-[14px] bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-500/20 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              data-testid="btn-submit-preceptoria"
              disabled={isSubmitting || !motivo.trim()}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>{isSubmitting ? 'Guardando...' : 'Asentar en Legajo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PreceptoriaRow = ({ entry, onSelectEntry }) => (
  <tr
    data-testid={`preceptoria-row-${entry.id || entry.fecha}`}
    onClick={() => onSelectEntry?.(entry)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelectEntry?.(entry);
      }
    }}
    tabIndex={0}
    role="button"
    title="Haz clic para ver el acta o novedad completa"
    className="hover:bg-purple-50/50 transition-colors border-b border-slate-100 text-xs cursor-pointer group focus:outline-hidden focus:bg-purple-50/60"
  >
    <td className="py-3 px-4 font-mono font-bold text-slate-500 whitespace-nowrap">
      {formatDashboardDate(entry.fecha)}
    </td>
    <td className="py-3 px-4">
      <div className="flex flex-col">
        <span className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
          {entry.studentName}
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          {entry.studentLegajo} · {entry.studentCurso}
        </span>
      </div>
    </td>
    <td className="py-3 px-4">
      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
        {entry.tipo || 'Acta de Preceptoría'}
      </span>
    </td>
    <td className="py-3 px-4 max-w-xs truncate text-slate-700" title={entry.motivo}>
      {entry.motivo || 'Sin detalles'}
    </td>
    <td className="py-3 px-4 text-right">
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
        {entry.autor || 'Preceptoría'}
      </span>
    </td>
  </tr>
);

const EMPTY_STUDENTS = [];
const EMPTY_ENTRIES = [];

const DashboardPreceptoriaView = ({
  students = EMPTY_STUDENTS,
  recentEntries = EMPTY_ENTRIES,
  onRefreshData,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForAction, setSelectedStudentForAction] = useState(null);
  const [viewingDetailEntry, setViewingDetailEntry] = useState(null);

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = searchTerm.toLowerCase().trim();
    return students
      .filter((s) => {
        const name = (s.nombreCompleto || `${s.nombre || ''} ${s.apellido || ''}`).toLowerCase();
        const leg = String(s.legajo || '').toLowerCase();
        const curso = String(s.curso || '').toLowerCase();
        return name.includes(query) || leg.includes(query) || curso.includes(query);
      })
      .slice(0, 5);
  }, [students, searchTerm]);

  return (
    <div data-testid="dashboard-preceptoria-view" className="flex flex-col gap-6">
      {/* Banner de Preceptoría */}
      <section
        data-testid="preceptoria-banner"
        className="bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-purple-200 uppercase tracking-widest flex items-center">
            <span className="material-symbols-outlined text-[24px] text-lime-300 animate-pulse pr-2">verified</span>
            Convivencia & Asistencia Escolar
          </span>
          <p className="text-2xl font-black tracking-tight text-white">
            Panel Operativo de Preceptoría
          </p>
          <p className="text-xs text-purple-100">
            Control de asistencia general, partes de tardanzas, actas disciplinarias y acuerdos de convivencia del alumnado por división.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/20 self-start md:self-auto">
          <div className="flex flex-col text-center">
            <span className="text-2xl font-black text-white">{recentEntries.length}</span>
            <span className="text-[10px] text-purple-200 font-semibold uppercase">Actas y partes</span>
          </div>
        </div>
      </section>

      {/* Buscador Rápido de Alumno por Curso o Nombre */}
      <section
        data-testid="preceptoria-quick-search"
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-purple-600">person_search</span>
          <h3 className="font-extrabold text-slate-900 text-sm">
            Buscador de Alumno para Asentar Tardanza o Acta
          </h3>
        </div>
        <div className="relative">
          <input
            type="text"
            data-testid="input-search-student-preceptoria"
            aria-label="Buscar alumno para acta de preceptoría"
            placeholder="Buscar por apellido, nombre, legajo o curso (ej. 1° Año A)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-purple-500/20 focus:outline-hidden"
          />
          <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-3">
            search
          </span>
        </div>

        {filteredStudents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-1 animate-in fade-in">
            {filteredStudents.map((st) => (
              <div
                key={st.id}
                data-testid={`search-student-result-${st.id}`}
                className="p-3 bg-slate-50 border border-slate-200/80 rounded-md flex items-center justify-between gap-2"
              >
                <div className="flex text-left flex-col min-w-0">
                  <span className="font-bold text-xs text-slate-900 truncate">
                    {st.nombreCompleto || `${st.nombre} ${st.apellido}`}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {st.studentID_login} · {st.curso}
                  </span>
                </div>
                <button
                  type="button"
                  data-testid={`btn-action-student-${st.id}`}
                  onClick={() => setSelectedStudentForAction(st)}
                  className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] shrink-0 cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>Acta</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Historial Cronológico de Últimas Novedades y Actas */}
      <section
        data-testid="preceptoria-recent-entries"
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-purple-600">assignment_turned_in</span>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Últimas Actas y Observaciones de Convivencia
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {recentEntries.length} registros cargados
          </span>
        </div>

        {!isLoading && recentEntries.length === 0 ? (
          <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-4xl text-slate-300">fact_check</span>
            <p className="font-medium text-xs">No hay actas o tardanzas registradas recientemente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Fecha y Hora</th>
                  <th className="py-2.5 px-4">Alumno</th>
                  <th className="py-2.5 px-4">Tipo</th>
                  <th className="py-2.5 px-4">Observación / Acta</th>
                  <th className="py-2.5 px-4 text-right">Preceptor Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <>
                    {[1, 2, 3, 4].map((idx) => (
                      <PreceptoriaTableRowSkeleton key={idx} />
                    ))}
                  </>
                ) : (
                  recentEntries.map((entry) => (
                    <PreceptoriaRow
                      key={entry.id || entry.fecha}
                      entry={entry}
                      onSelectEntry={setViewingDetailEntry}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedStudentForAction && (
        <NewPreceptoriaModal
          student={selectedStudentForAction}
          onClose={() => setSelectedStudentForAction(null)}
          onSaved={onRefreshData}
        />
      )}

      {viewingDetailEntry && (
        <DashboardEntryDetailModal
          entry={viewingDetailEntry}
          onClose={() => setViewingDetailEntry(null)}
          category="preceptoria"
        />
      )}
    </div>
  );
};

export default DashboardPreceptoriaView;
