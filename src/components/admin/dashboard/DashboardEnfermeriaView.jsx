import React, { useState, useMemo } from 'react';
import { addEnfermeriaNoteToStudent } from '../../../services/sportsService';
import { formatDashboardDate } from './dashboardUtils';

const ENFERMERIA_TIPOS = [
  'Atención / Primeros Auxilios',
  'Administración de Medicación',
  'Malestar General / Reposo',
  'Golpe o Traumatismo',
  'Derivación Médica de Urgencia',
];

const NewAttentionModal = ({ student, onClose, onSaved }) => {
  const [tipo, setTipo] = useState(ENFERMERIA_TIPOS[0]);
  const [motivo, setMotivo] = useState('');
  const [notificadoFamilias, setNotificadoFamilias] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!motivo.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addEnfermeriaNoteToStudent({
        studentId: student.id,
        studentDni: student.dni,
        studentLegajo: student.studentID_login,
        studentName: student.nombreCompleto || `${student.nombre || ''} ${student.apellido || ''}`,
        note: {
          tipo,
          motivo: motivo.trim(),
          notificadoFamilias,
        },
      });
      onSaved?.();
      onClose();
    } catch (err) {
      console.error('Error al guardar atención médica:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="new-attention-modal"
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-5 py-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">medical_services</span>
            </div>
            <div className='text-left'>
              <p className="font-extrabold text-slate-900 text-md">
                Registrar Atención de Enfermería
              </p>
              <p className="text-[11px] text-slate-600">
                {student.nombreCompleto || `${student.nombre} ${student.apellido}`} ({student.studentID_login} · {student.curso})
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="btn-close-attention-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="tipo-atencion" className="font-bold text-slate-700">
              Tipo de Atención Médica
            </label>
            <select
              id="tipo-atencion"
              data-testid="select-attention-type"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-800 text-[14px] font-medium focus:ring-2 focus:ring-rose-500/20 focus:outline-hidden"
            >
              {ENFERMERIA_TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="motivo-atencion" className="font-bold text-slate-700">
              Diagnóstico / Motivo / Indicaciones Clínicas
            </label>
            <textarea
              id="motivo-atencion"
              data-testid="textarea-attention-motivo"
              rows={3}
              required
              placeholder="Describa el motivo de consulta, signos vitales o medicación suministrada..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-[14px] text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-rose-500/20 focus:outline-hidden"
            />
          </div>

          <label htmlFor="check-attention-notificado" className="flex items-center text-left gap-2 p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              id="check-attention-notificado"
              aria-label="Notificar a Adultos Responsables"
              data-testid="check-attention-notificado"
              checked={notificadoFamilias}
              onChange={(e) => setNotificadoFamilias(e.target.checked)}
              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
            />
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-xs">Notificar a Adultos Responsables</span>
              <span className="text-[12px] text-slate-500">
                Se asienta aviso telefónico o notificación al tutor registrado.
              </span>
            </div>
          </label>

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
              data-testid="btn-submit-attention"
              disabled={isSubmitting || !motivo.trim()}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>{isSubmitting ? 'Guardando...' : 'Asentar en Ficha Médica'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AttentionRow = ({ entry }) => (
  <tr
    data-testid={`attention-row-${entry.id || entry.fecha}`}
    className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 text-xs"
  >
    <td className="py-3 px-4 font-mono font-bold text-slate-500 whitespace-nowrap">
      {formatDashboardDate(entry.fecha)}
    </td>
    <td className="py-3 px-4">
      <div className="flex flex-col">
        <span className="font-bold text-slate-900">{entry.studentName}</span>
        <span className="text-[10px] text-slate-400 font-mono">
          {entry.studentLegajo} · {entry.studentCurso}
        </span>
      </div>
    </td>
    <td className="py-3 px-4">
      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
        {entry.tipo || 'Atención Médica'}
      </span>
    </td>
    <td className="py-3 px-4 max-w-xs truncate text-slate-700" title={entry.motivo}>
      {entry.motivo || 'Sin detalles'}
    </td>
    <td className="py-3 px-4 text-center">
      {entry.notificadoFamilias ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
          <span className="material-symbols-outlined text-[12px]">check_circle</span>
          Sí
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
          No
        </span>
      )}
    </td>
    <td className="py-3 px-4 text-right">
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
        <span className="material-symbols-outlined text-[12px] text-rose-500">lock</span>
        {entry.autor || 'Enfermería'}
      </span>
    </td>
  </tr>
);

const EMPTY_STUDENTS = [];
const EMPTY_ENTRIES = [];

const DashboardEnfermeriaView = ({
  students = EMPTY_STUDENTS,
  recentEntries = EMPTY_ENTRIES,
  onRefreshData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForAttention, setSelectedStudentForAttention] = useState(null);

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = searchTerm.toLowerCase().trim();
    return students
      .filter((s) => {
        const name = (s.nombreCompleto || `${s.nombre || ''} ${s.apellido || ''}`).toLowerCase();
        const leg = String(s.legajo || '').toLowerCase();
        const dni = String(s.dni || '').replace(/\D/g, '');
        return name.includes(query) || leg.includes(query) || dni.includes(query);
      })
      .slice(0, 5);
  }, [students, searchTerm]);

  return (
    <div data-testid="dashboard-enfermeria-view" className="flex flex-col gap-6">
      {/* Banner de Gabinete Médico */}
      <section
        data-testid="enfermeria-banner"
        className="bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-900 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex flex-col items-start text-left gap-1 ">
          <span className="text-xs font-bold text-rose-200 uppercase flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-emerald-300">verified</span>
            Gabinete de Salud y Primeros Auxilios
          </span>
          <p className="text-2xl font-black tracking-tight text-white">
            Panel Clínico de Enfermería Escolar
          </p>
          <p className="text-xs text-rose-100 ">
            Registro confidencial e inmutable de atenciones, suministro de medicación autorizada y derivaciones médicas del alumnado.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/20 self-start md:self-auto">
          <div className="flex flex-col text-center">
            <span className="text-2xl font-black text-white">{recentEntries.length}</span>
            <span className="text-[10px] text-rose-200 font-semibold uppercase">Atenciones registradas</span>
          </div>
        </div>
      </section>

      {/* Buscador Rápido de Alumno para Registrar Atención */}
      <section
        data-testid="enfermeria-quick-search"
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-rose-600">person_search</span>
          <h3 className="font-extrabold text-slate-900 text-sm">
            Buscador Rápido de Alumno para Atención Médica
          </h3>
        </div>
        <div className="relative">
          <input
            type="text"
            data-testid="input-search-student-enfermeria"
            aria-label="Buscar alumno para atención de enfermería"
            placeholder="Buscar por apellido, nombre, legajo o DNI del alumno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-rose-500/20 focus:outline-hidden"
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
                className="p-3 bg-slate-50 border border-slate-200/80 rounded-md flex items-start justify-between gap-2"
              >
                <div className="flex text-left flex-col min-w-0">
                  <span className="font-bold text-xs text-slate-900 truncate">
                    {st.nombreCompleto || `${st.nombre} ${st.apellido}`}
                  </span>
                  <span className="text-[10px] text-left text-slate-500 font-mono">
                    {st.studentID_login} · {st.curso} - Division {st.division}
                  </span>
                </div>
                <button
                  type="button"
                  data-testid={`btn-attend-student-${st.id}`}
                  onClick={() => setSelectedStudentForAttention(st)}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] shrink-0 cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  <span>Atender</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Historial Cronológico de Últimas Atenciones Médicas */}
      <section
        data-testid="enfermeria-recent-attentions"
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-rose-600">clinical_notes</span>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Últimas Atenciones de Salud Registradas
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {recentEntries.length} registros archivados
          </span>
        </div>

        {recentEntries.length === 0 ? (
          <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-4xl text-slate-300">health_and_safety</span>
            <p className="font-medium text-xs">No hay atenciones de enfermería registradas recientemente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Fecha y Hora</th>
                  <th className="py-2.5 px-4">Alumno</th>
                  <th className="py-2.5 px-4">Tipo</th>
                  <th className="py-2.5 px-4">Motivo / Diagnóstico</th>
                  <th className="py-2.5 px-4 text-center">Tutor Notificado</th>
                  <th className="py-2.5 px-4 text-right">Profesional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEntries.map((entry) => (
                  <AttentionRow key={entry.id || entry.fecha} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedStudentForAttention && (
        <NewAttentionModal
          student={selectedStudentForAttention}
          onClose={() => setSelectedStudentForAttention(null)}
          onSaved={onRefreshData}
        />
      )}
    </div>
  );
};

export default DashboardEnfermeriaView;
