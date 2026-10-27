import React from 'react';

const DeleteDisciplineModal = ({
  isOpen,
  discipline,
  isDeleting = false,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !discipline) return null;

  const inscriptosCount = Array.isArray(discipline.inscriptos)
    ? discipline.inscriptos.length
    : Number(discipline.cupoOcupado) || 0;

  return (
    <div
      data-testid="delete-discipline-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Modal Dialog Card */}
      <div
        data-testid="delete-discipline-modal-content"
        className="relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden text-left animate-in zoom-in-95 duration-200 p-6 sm:p-7"
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100/80 shadow-xs">
            <span className="material-symbols-outlined text-2xl">delete_forever</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
              Eliminar Actividad Extracurricular
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Esta acción dará de baja la disciplina definitivamente del catálogo escolar.
            </p>
          </div>
        </div>

        {/* Resumen de la Actividad */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl select-none">{discipline.emoji || '🏃'}</span>
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-800 block truncate">
                {discipline.nombre}
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                {discipline.niveles || 'Todos los niveles'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Alumnos inscriptos:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                inscriptosCount > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {inscriptosCount} {inscriptosCount === 1 ? 'alumno' : 'alumnos'}
            </span>
          </div>
        </div>

        {/* Alerta de Desvinculación y Liberación de Cupo */}
        <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200/60 mb-6 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-600 text-lg shrink-0 mt-0.5">
            info
          </span>
          <div className="text-[11px] text-amber-900 leading-relaxed">
            {inscriptosCount > 0 ? (
              <>
                <strong className="font-bold">Baja automática de alumnos:</strong> Al confirmar la eliminación, los{' '}
                <strong>{inscriptosCount} alumnos inscriptos</strong> serán dados de baja inmediatamente y se registrará
                la constancia en su legajo escolar, <strong>liberando su cupo</strong> para que puedan optar por otra
                actividad (límite de 2 por alumno).
              </>
            ) : (
              <>
                <strong className="font-bold">Liberación de cátedra:</strong> La disciplina será removida de la oferta
                institucional y ningún alumno ocupará vacantes en la misma.
              </>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            data-testid="btn-cancel-delete-discipline"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            data-testid="btn-confirm-delete-discipline"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50 border-none"
          >
            {isDeleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">delete</span>
                <span>Eliminar Actividad</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDisciplineModal;
