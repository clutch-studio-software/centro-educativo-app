import React from 'react';
import LoadingSpinner from '../admin/common/LoadingSpinner';

/**
 * Modal universal de confirmación de baja de servicios escolares.
 * Aplica la política institucional:
 * - Cancelación en el mismo día: baja inmediata sin penalidad.
 * - Cancelación posterior al día de alta: no se puede dar de baja inmediata en lo que resta del mes.
 *   La baja queda programada para el 1º del mes siguiente. Solo un administrador puede aplicar baja inmediata si se requiere.
 */
const ConfirmCancelServiceModal = ({
  serviceName = 'Servicio Escolar',
  isCancelableToday = false,
  nextMonthDisplay = 'próximo mes',
  onAbort,
  onConfirm,
  isProcessing = false,
}) => {
  return (
    <dialog
      open
      aria-labelledby="confirm-cancel-title"
      data-testid="confirm-cancel-service-modal"
      className="fixed inset-0 z-50 overflow-hidden bg-transparent p-0 max-w-none w-full h-full border-none m-0"
    >
      <div
        aria-hidden="true"
        onClick={onAbort}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100 text-left relative z-10 pointer-events-auto animate-in zoom-in-95 duration-150">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCancelableToday
                ? 'bg-amber-50 text-amber-600'
                : 'bg-rose-50 text-rose-600'
                }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {isCancelableToday ? 'warning' : 'event_busy'}
              </span>
            </div>
            <div className='text-left'>
              <p
                id="confirm-cancel-title"
                className="text-base font-bold text-slate-900"
              >
                Confirmar Solicitud de Baja: {serviceName}
              </p>
              <p className="text-xs text-slate-500">
                Reglamento de autogestión de servicios escolares
              </p>
            </div>
          </div>

          {isCancelableToday ? (
            <div
              data-testid="same-day-cancel-notice"
              className="p-3 rounded-md bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1.5"
            >
              <p className="font-bold">
                Baja inmediata disponible (mismo día de suscripción)
              </p>
              <p className="leading-relaxed">
                Al tramitar la baja dentro del mismo día de la inscripción, el servicio
                se cancelará inmediatamente y no se generará cargo proporcional en la facturación del período.
              </p>
            </div>
          ) : (
            <div
              data-testid="deferred-cancel-notice"
              className="p-3.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2"
            >
              <p className="font-bold text-slate-900">
                ℹ Política de baja a partir del mes siguiente:
              </p>
              <p className="leading-relaxed">
                La inscripción fue realizada con anterioridad. Por normativa escolar,{' '}
                <strong>no se podrá dar de baja en lo que resta del mes</strong>.
              </p>
              <div className="p-2.5 rounded-lg bg-purple-50 text-purple-900 border border-purple-200">
                <p className="font-semibold text-[11px]">
                  Efecto de la baja: A partir del {nextMonthDisplay}.
                </p>
                <p className="text-[10px] mt-0.5 text-purple-700">
                  El mes en curso se abona con el proporcional correspondiente ya devengado.
                </p>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                * Nota: Solo un administrador institucional podrá realizar una baja inmediata excepcional dentro del mes en curso si se requiere.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              data-testid="btn-abort-cancel-service"
              disabled={isProcessing}
              onClick={onAbort}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Volver sin cambios
            </button>
            <button
              type="button"
              data-testid="btn-confirm-cancel-service"
              disabled={isProcessing}
              onClick={onConfirm}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer shadow-sm ${isCancelableToday
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-rose-600 hover:bg-rose-700'
                }`}
            >
              {isProcessing
                ? <span className="animate-pulse"> Procesando </span>
                : isCancelableToday
                  ? 'Confirmar Baja Inmediata'
                  : 'Solicitar Baja para Mes Próximo'}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmCancelServiceModal;
