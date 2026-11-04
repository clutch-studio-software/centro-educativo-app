import React, { useState } from 'react';
import { addPreceptoriaNoteToStudent } from '../../../services/sportsService';
import DashboardEntryDetailModal from './DashboardEntryDetailModal';
import { PreceptoriaTableRowSkeleton } from './DashboardTableSkeleton';
import DashboardStudentQuickSearch from './DashboardStudentQuickSearch';
import DashboardStudentActionModal from './DashboardStudentActionModal';
import DashboardBaseEntryRow from './DashboardBaseEntryRow';

const PRECEPTORIA_TIPOS = [
  'Tardanza',
  'Falta Justificada',
  'Acta de Convivencia',
  'Sanción Disciplinaria',
  'Felicitación / Mención Especial',
  'Observación General',
];

const PreceptoriaRow = ({ entry, onSelectEntry }) => (
  <DashboardBaseEntryRow
    testId={`preceptoria-row-${entry.id || entry.fecha}`}
    title="Haz clic para ver el acta o novedad completa"
    hoverBgClass="hover:bg-purple-50/50 focus:bg-purple-50/60"
    nameHoverClass="group-hover:text-purple-700"
    entry={entry}
    onSelectEntry={onSelectEntry}
  >
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
  </DashboardBaseEntryRow>
);

const EMPTY_STUDENTS = [];
const EMPTY_ENTRIES = [];

const DashboardPreceptoriaView = ({
  students = EMPTY_STUDENTS,
  recentEntries = EMPTY_ENTRIES,
  onRefreshData,
  isLoading = false,
}) => {
  const [selectedStudentForAction, setSelectedStudentForAction] = useState(null);
  const [viewingDetailEntry, setViewingDetailEntry] = useState(null);

  const handleSavePreceptoria = async ({ tipo, motivo }) => {
    if (!selectedStudentForAction) return;
    await addPreceptoriaNoteToStudent({
      studentId: selectedStudentForAction.id,
      studentDni: selectedStudentForAction.dni,
      studentLegajo: selectedStudentForAction.studentID_login,
      studentName:
        selectedStudentForAction.nombreCompleto ||
        `${selectedStudentForAction.nombre || ''} ${selectedStudentForAction.apellido || ''}`,
      note: {
        tipo,
        motivo,
      },
    });
    onRefreshData?.();
  };

  return (
    <div data-testid="dashboard-preceptoria-view" className="flex flex-col gap-6">
      {/* Banner de Preceptoría */}
      <section
        data-testid="preceptoria-banner"
        className="bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-purple-200 uppercase flex items-center">
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
      <DashboardStudentQuickSearch
        students={students}
        title="Buscador de Alumno para Asentar Tardanza o Acta"
        icon="person_search"
        iconColor="text-purple-600"
        buttonBgColor="bg-purple-600 hover:bg-purple-700"
        buttonLabel="Acta"
        buttonIcon="edit_note"
        buttonTestIdPrefix="btn-preceptoria-student"
        inputTestId="input-search-student-preceptoria"
        searchPlaceholder="Buscar por apellido, nombre, legajo o curso (ej. 1° Año A)..."
        ariaLabel="Buscar alumno para acta de preceptoría"
        sectionTestId="preceptoria-quick-search"
        onSelectStudent={setSelectedStudentForAction}
      />

      {/* Historial Cronológico de Últimas Novedades y Actas */}
      <section
        data-testid="preceptoria-recent-entries"
        className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-purple-600">history_edu</span>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Últimas Novedades y Actas Registradas
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {recentEntries.length} registros archivados
          </span>
        </div>

        {!isLoading && recentEntries.length === 0 ? (
          <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-4xl text-slate-300">fact_check</span>
            <p className="font-medium text-xs">No hay novedades ni actas de preceptoría registradas recientemente.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Fecha y Hora</th>
                  <th className="py-2.5 px-4">Alumno</th>
                  <th className="py-2.5 px-4">Tipo</th>
                  <th className="py-2.5 px-4">Observaciones / Acta</th>
                  <th className="py-2.5 px-4 text-right">Preceptor / Registrador</th>
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
        <DashboardStudentActionModal
          modalTestId="new-preceptoria-modal"
          closeButtonTestId="btn-close-preceptoria-modal"
          submitButtonTestId="btn-submit-preceptoria"
          headerBgClass="bg-purple-50 border-purple-100"
          iconBgClass="bg-purple-600"
          iconName="assignment_ind"
          title="Registrar Novedad / Acta de Preceptoría"
          student={selectedStudentForAction}
          options={PRECEPTORIA_TIPOS}
          selectId="tipo-preceptoria"
          selectTestId="select-preceptoria-type"
          selectLabel="Tipo de Registro"
          textareaId="motivo-preceptoria"
          textareaTestId="textarea-preceptoria-motivo"
          textareaLabel="Observaciones / Justificación / Acta"
          textareaPlaceholder="Describa el incidente, motivo de tardanza o acuerdo de convivencia..."
          submitLabel="Asentar en Registro Disciplinario"
          submitLoadingLabel="Guardando..."
          submitButtonClass="bg-purple-600 hover:bg-purple-700"
          focusRingClass="focus:ring-purple-500/20"
          showNotificationCheckbox={false}
          onClose={() => setSelectedStudentForAction(null)}
          onSubmit={handleSavePreceptoria}
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
