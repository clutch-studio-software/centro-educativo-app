import React from 'react';

const TariffStickyBottomBar = ({
  isSaving,
  isSaved,
  onReset,
  onSave,
  onOpenAudit,
  auditLogs
}) => {
  const lastAuditLog = auditLogs[0]
  console.log(lastAuditLog)
  return (
    <aside
      aria-label="Barra de guardado de tarifas"
      data-testid="tariff-sticky-bottom-bar"
      className="fixed bottom-0 left-0 lg:left-72 right-0 bg-white/95 backdrop-blur-md z-30 px-6 lg:px-8 py-3.5 border-t border-slate-200/90 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      {/* Audit metadata trail */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 shrink-0">
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            verified_user
          </span>
        </div>
        <div className="flex flex-col text-start">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">
              Parámetros listos para guardar
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-2xs shadow-emerald-500" />
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Última modificación guardada:{' '}
            <span className="font-semibold text-slate-800">{lastAuditLog?.formattedDate.split(',')[0]}</span>{' '}
            por{' '}
            <span className="font-semibold text-blue-700">{lastAuditLog?.user?.name}</span>
          </span>
        </div>
      </div>

      {/* Actions CTA */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {/* Botón Auditoría */}
        <button
          type="button"
          id="btnAuditoria"
          data-testid="btn-open-audit-modal"
          onClick={onOpenAudit}
          className="px-4 py-2.5 rounded-full bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-xs border border-slate-200/80 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px] text-blue-700" aria-hidden="true">
            manage_search
          </span>
          <span>Auditoría</span>
        </button>

        {/* Botón Secundario: Restablecer Valores Anteriores */}
        <button
          type="button"
          id="btnRestablecer"
          data-testid="btn-reset-tariffs"
          onClick={onReset}
          disabled={isSaving}
          className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px] text-slate-500" aria-hidden="true">
            history
          </span>
          <span>Restablecer Valores Anteriores</span>
        </button>

        {/* Botón Primario Prominente: Guardar Cambios */}
        <button
          type="button"
          id="btnGuardar"
          data-testid="btn-save-tariffs"
          onClick={onSave}
          disabled={isSaving}
          className={`px-6 py-2.5 rounded-full font-bold text-xs lg:text-sm transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 ${
            isSaved
              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25'
          }`}
        >
          {isSaving ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[18px]" aria-hidden="true">
                progress_activity
              </span>
              <span>Guardando Parámetros...</span>
            </>
          ) : isSaved ? (
            <>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                check_circle
              </span>
              <span>¡Valores 2026 Publicados!</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                save
              </span>
              <span>Guardar Cambios de Tarifas</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default TariffStickyBottomBar;
