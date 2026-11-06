import React, { useState } from 'react';
import {
  addEnfermeriaNoteToStudent,
  markEnfermeriaNoteAsNotified,
} from '../../../services/sportsService';
import DashboardEntryDetailModal from './DashboardEntryDetailModal';
import { EnfermeriaTableRowSkeleton } from './DashboardTableSkeleton';
import DashboardStudentQuickSearch from './DashboardStudentQuickSearch';
import DashboardStudentActionModal from './DashboardStudentActionModal';
import DashboardBaseEntryRow from './DashboardBaseEntryRow';

const ENFERMERIA_TIPOS = [
  'Atención / Primeros Auxilios',
  'Administración de Medicación',
  'Malestar General / Reposo',
  'Golpe o Traumatismo',
  'Derivación Médica de Urgencia',
];

const AttentionRow = ({ entry, onSelectEntry }) => (
  <DashboardBaseEntryRow
    testId={`attention-row-${entry.id || entry.fecha}`}
    title="Haz clic para ver el detalle clínico completo"
    hoverBgClass="hover:bg-rose-50/50 focus:bg-rose-50/60"
    nameHoverClass="group-hover:text-rose-700"
    entry={entry}
    onSelectEntry={onSelectEntry}
  >
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
  </DashboardBaseEntryRow>
);

const EMPTY_STUDENTS = [];
const EMPTY_ENTRIES = [];

const DashboardEnfermeriaView = ({
  students = EMPTY_STUDENTS,
  recentEntries = EMPTY_ENTRIES,
  onRefreshData,
  isLoading = false,
  user = null,
}) => {
  const [selectedStudentForAttention, setSelectedStudentForAttention] = useState(null);
  const [viewingDetailEntry, setViewingDetailEntry] = useState(null);

  const handleMarkAsNotified = async (entry) => {
    const author =
      user?.displayName ||
      user?.nombreCompleto ||
      user?.email?.split('@')[0] ||
      'Enfermería Escolar';

    await markEnfermeriaNoteAsNotified({
      studentId: entry.studentId,
      studentDni: entry.studentDni,
      noteId: entry.id,
      author,
    });
    onRefreshData?.();
  };

  const handleSaveAttention = async ({ tipo, motivo, notificadoFamilias }) => {
    if (!selectedStudentForAttention) return;
    await addEnfermeriaNoteToStudent({
      studentId: selectedStudentForAttention.id,
      studentDni: selectedStudentForAttention.dni,
      studentLegajo: selectedStudentForAttention.studentID_login,
      studentName:
        selectedStudentForAttention.nombreCompleto ||
        `${selectedStudentForAttention.nombre || ''} ${selectedStudentForAttention.apellido || ''}`,
      note: {
        tipo,
        motivo,
        notificadoFamilias,
      },
    });
    onRefreshData?.();
  };

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
      <DashboardStudentQuickSearch
        students={students}
        title="Buscador Rápido de Alumno para Atención Médica"
        icon="person_search"
        iconColor="text-rose-600"
        buttonBgColor="bg-rose-600 hover:bg-rose-700"
        buttonLabel="Atender"
        buttonIcon="add"
        buttonTestIdPrefix="btn-attend-student"
        inputTestId="input-search-student-enfermeria"
        searchPlaceholder="Buscar por apellido, nombre, legajo o DNI del alumno..."
        ariaLabel="Buscar alumno para atención de enfermería"
        sectionTestId="enfermeria-quick-search"
        onSelectStudent={setSelectedStudentForAttention}
      />

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

        {!isLoading && recentEntries.length === 0 ? (
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
                {isLoading ? (
                  <>
                    {[1, 2, 3, 4].map((idx) => (
                      <EnfermeriaTableRowSkeleton key={idx} />
                    ))}
                  </>
                ) : (
                  recentEntries.map((entry) => (
                    <AttentionRow
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

      {selectedStudentForAttention && (
        <DashboardStudentActionModal
          modalTestId="new-attention-modal"
          closeButtonTestId="btn-close-attention-modal"
          submitButtonTestId="btn-submit-attention"
          headerBgClass="bg-rose-50 border-rose-100"
          iconBgClass="bg-rose-600"
          iconName="medical_services"
          title="Registrar Atención de Enfermería"
          student={selectedStudentForAttention}
          options={ENFERMERIA_TIPOS}
          selectId="tipo-atencion"
          selectTestId="select-attention-type"
          selectLabel="Tipo de Atención Médica"
          textareaId="motivo-atencion"
          textareaTestId="textarea-attention-motivo"
          textareaLabel="Diagnóstico / Motivo / Indicaciones Clínicas"
          textareaPlaceholder="Describa el motivo de consulta, signos vitales o medicación suministrada..."
          submitLabel="Asentar en Ficha Médica"
          submitLoadingLabel="Guardando..."
          submitButtonClass="bg-rose-600 hover:bg-rose-700"
          focusRingClass="focus:ring-rose-500/20"
          showNotificationCheckbox
          onClose={() => setSelectedStudentForAttention(null)}
          onSubmit={handleSaveAttention}
        />
      )}

      {viewingDetailEntry && (
        <DashboardEntryDetailModal
          entry={viewingDetailEntry}
          onClose={() => setViewingDetailEntry(null)}
          category="enfermeria"
          onMarkAsNotified={handleMarkAsNotified}
        />
      )}
    </div>
  );
};

export default DashboardEnfermeriaView;
