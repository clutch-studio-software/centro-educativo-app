import React from 'react';

export const SportsDetailHeaderCard = ({
  discipline,
  onOpenConfig,
  onOpenEnroll,
  onOpenEditConfigModal,
  onOpenEnrollModal,
  onToggleOffer,
}) => {
  const handleOpenConfig = onOpenConfig || onOpenEditConfigModal;
  const handleOpenEnroll = onOpenEnroll || onOpenEnrollModal;

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenConfig}
            data-testid="btn-open-config"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors text-xs font-bold shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm text-slate-500">settings</span>
            Configurar Disciplina
          </button>

          <button
            type="button"
            onClick={handleOpenEnroll}
            data-testid="btn-enroll-student-top"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dim text-white transition-all text-xs font-bold shadow-sm shadow-primary/20 cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Inscribir Alumno
          </button>
        </div>
      </div>

      {/* Header Hero Card */}
      <div
        data-testid="discipline-detail-header-card"
        className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${discipline.bgColor || 'bg-gradient-to-tr from-lime-100 via-amber-50 to-blue-50'} flex items-center justify-center text-primary shadow-sm shrink-0 ring-2 ring-lime-400/20 text-3xl select-none`}>
            {discipline.emoji ? (
              <span>{discipline.emoji}</span>
            ) : (
              <span
                className="material-symbols-outlined text-3xl text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {discipline.icon || 'sprint'}
              </span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 font-headline tracking-tight">
                {discipline.titulo}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/50 text-secondary-dim font-bold text-xs uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-secondary ring-2 ring-lime-400/20"></span>
                {discipline.activo ? 'Activo' : 'En Pausa'}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-container/20 text-primary font-bold text-xs">
                Niveles: {discipline.niveles}
              </span>
            </div>
            <h3 className="text-xs text-start text-slate-500 mt-1 font-medium">
              Código de Cátedra:{' '}
              <span className="font-mono text-primary font-bold">{discipline.code}</span> •{' '}
              {discipline.ciclo}
            </h3>
          </div>
        </div>

        {/* Oferta abierta toggle */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
          <span className="text-xs font-bold text-slate-700">
            {discipline.activo ? 'Oferta abierta' : 'Oferta cerrada'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={discipline.activo}
            aria-label={discipline.activo ? 'Oferta abierta' : 'Oferta cerrada'}
            onClick={onToggleOffer}
            data-testid="toggle-offer-switch"
            className={`w-11 h-6 relative inline-flex items-center rounded-full transition-colors focus:outline-none shadow-inner cursor-pointer border-none p-0.5 ${
              discipline.activo ? 'bg-secondary' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform shadow ${
                discipline.activo ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SportsDetailHeaderCard;
