import React, { useState } from 'react';
import { formatDashboardDate } from './dashboardUtils';

const MODAL_CONFIGS = {
  enfermeria: {
    icon: 'medical_services',
    title: 'Detalle de Atención Médica Escolar',
    headerClass: 'bg-rose-50 border-rose-100',
    iconClass: 'bg-rose-600 text-white',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    btnClass: 'bg-rose-600 hover:bg-rose-700',
    motivoLabel: 'Diagnóstico Clínico / Observaciones / Medicación:',
    defaultAuthor: 'Enfermería Escolar',
  },
  preceptoria: {
    icon: 'assignment_ind',
    title: 'Detalle de Acta / Novedad de Preceptoría',
    headerClass: 'bg-purple-50 border-purple-100',
    iconClass: 'bg-purple-600 text-white',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    btnClass: 'bg-purple-600 hover:bg-purple-700',
    motivoLabel: 'Acta / Descripción de la Novedad:',
    defaultAuthor: 'Preceptoría y Celaduría',
  },
};

const EntryStudentHeader = ({ entry, config }) => (
  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-md flex items-center justify-between gap-3">
    <div className="flex flex-col">
      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
        Alumno / Matrícula
      </span>
      <span className="font-bold text-slate-900 text-sm">
        {entry.studentName || 'Estudiante'}
      </span>
      <span className="text-[11px] text-slate-500 font-mono">
        Legajo: {entry.studentLegajo || 'S/D'} · {entry.studentCurso || 'Curso no especificado'}
      </span>
    </div>
    <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] border ${config.badgeClass}`}>
      {entry.tipo || 'Registro Institucional'}
    </span>
  </div>
);

const EntryMetadataCards = ({ entry, category, defaultAuthor, isNotified }) => (
  <div className="grid grid-cols-2 gap-2.5 pt-1">
    <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-md flex flex-col">
      <span className="text-[10px] text-slate-400 font-medium">Firma / Responsable</span>
      <span className="text-xs font-bold text-slate-800 truncate">
        {entry.autor || defaultAuthor}
      </span>
    </div>

    <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-md flex flex-col">
      <span className="text-[10px] text-slate-400 font-medium">
        {category === 'enfermeria' ? 'Aviso a Familias' : 'Estado del Acta'}
      </span>
      <span
        className={`text-xs font-bold ${
          isNotified ? 'text-emerald-700' : 'text-slate-600'
        }`}
      >
        {category === 'enfermeria'
          ? isNotified
            ? '✓ Notificado a tutores'
            : 'Sin notificación asentada'
          : 'Archivado en legajo'}
      </span>
    </div>
  </div>
);

const UnnotifiedAlertCard = ({
  isConfirming,
  setIsConfirming,
  isSaving,
  onConfirmNotified,
}) => (
  <div
    data-testid="unnotified-alert-card"
    className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-md flex flex-col gap-2.5"
  >
    <div className="flex items-start gap-2.5">
      <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">
        notification_important
      </span>
      <div className="flex flex-col text-left">
        <span className="font-bold text-amber-900 text-xs">
          Aviso a Adultos Responsables Pendiente
        </span>
        <span className="text-[11px] text-amber-800 leading-tight">
          Esta atención aún no ha sido informada a los tutores. Puedes registrar el contacto telefónico o presencial aquí.
        </span>
      </div>
    </div>

    {!isConfirming ? (
      <button
        type="button"
        data-testid="btn-mark-notified"
        onClick={() => setIsConfirming(true)}
        className="self-end px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer border-none"
      >
        <span className="material-symbols-outlined text-[15px]">check_circle</span>
        <span>Marcar como Notificado a Tutores</span>
      </button>
    ) : (
      <div
        data-testid="confirm-notified-box"
        className="p-3 bg-white border border-amber-300 rounded-md flex flex-col gap-2.5 animate-in fade-in"
      >
        <p className="text-[11px] font-semibold text-rose-700 leading-snug">
          ⚠️ <strong>Atención:</strong> Una vez confirmada y asentada la notificación a los tutores,{' '}
          <u>esta acción no se puede deshacer</u>.
        </p>
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
          <button
            type="button"
            data-testid="btn-cancel-mark-notified"
            onClick={() => setIsConfirming(false)}
            disabled={isSaving}
            className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer border-none bg-transparent"
          >
            Cancelar
          </button>
          <button
            type="button"
            data-testid="btn-confirm-mark-notified"
            onClick={onConfirmNotified}
            disabled={isSaving}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer border-none"
          >
            {isSaving ? (
              <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-[15px]">done_all</span>
            )}
            <span>{isSaving ? 'Guardando...' : 'Confirmar Notificación'}</span>
          </button>
        </div>
      </div>
    )}
  </div>
);

export const DashboardEntryDetailModal = ({
  entry,
  onClose,
  category = 'enfermeria',
  onMarkAsNotified,
}) => {
  const [isNotified, setIsNotified] = useState(Boolean(entry?.notificadoFamilias));
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!entry) return null;

  const config = MODAL_CONFIGS[category] || MODAL_CONFIGS.enfermeria;

  const handleConfirmNotified = async () => {
    if (isSaving || !onMarkAsNotified) return;
    setIsSaving(true);
    try {
      await onMarkAsNotified(entry);
      setIsNotified(true);
      setIsConfirming(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      data-testid="entry-detail-modal"
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div
          className={`px-5 py-4 ${config.headerClass} border-b flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl ${config.iconClass} flex items-center justify-center font-bold shrink-0 shadow-xs`}
            >
              <span className="material-symbols-outlined text-[20px]">{config.icon}</span>
            </div>
            <div className="text-left">
              <h3 className="font-extrabold text-slate-900 text-sm">{config.title}</h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Registrado el {formatDashboardDate(entry.fecha)}
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="btn-close-entry-detail-modal"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 text-xs text-left overflow-y-auto max-h-[75vh]">
          <EntryStudentHeader entry={entry} config={config} />

          {/* Alert & Action to Mark as Notified (Only if Enfermería and not yet notified) */}
          {category === 'enfermeria' && !isNotified && (
            <UnnotifiedAlertCard
              isConfirming={isConfirming}
              setIsConfirming={setIsConfirming}
              isSaving={isSaving}
              onConfirmNotified={handleConfirmNotified}
            />
          )}

          {/* Motivo / Diagnóstico Completo */}
          <div className="flex flex-col gap-1.5">
            <span className="font-bold text-slate-700 text-xs">{config.motivoLabel}</span>
            <div className="p-3.5 bg-white border border-slate-200 rounded-md text-slate-800 text-[13px] leading-relaxed whitespace-pre-wrap break-words min-h-[90px] shadow-2xs">
              {entry.motivo || 'Sin detalles registrados para esta entrada.'}
            </div>
          </div>

          <EntryMetadataCards
            entry={entry}
            category={category}
            defaultAuthor={config.defaultAuthor}
            isNotified={isNotified}
          />
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            data-testid="btn-close-entry-detail-footer"
            onClick={onClose}
            className={`px-4 py-2 ${config.btnClass} text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer border-none`}
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardEntryDetailModal;
