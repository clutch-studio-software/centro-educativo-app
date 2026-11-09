import React from 'react';

/**
 * Modal de confirmación para baja inmediata o diferida del transporte escolar
 */
const ConfirmCancelTransportModal = ({
  isCancelableToday,
  nextMonthDisplay,
  onAbort,
  onConfirm,
}) => {
  return (
    <div
      data-testid="confirm-cancel-modal"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 text-rose-600">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <h4 className="text-base font-bold text-slate-800">
            Confirmar baja del transporte
          </h4>
        </div>

        <div className="text-xs text-slate-600 space-y-2">
          {isCancelableToday ? (
            <p>
              Como la suscripción se realizó en el día de hoy, la baja se aplicará de forma <strong>inmediata</strong> sin cargos adicionales.
            </p>
          ) : (
            <div className="space-y-1.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
              <p className="font-bold">Normativa de Facturación Mensual:</p>
              <p>
                La baja solicitada tendrá efecto a partir del <strong>{nextMonthDisplay}</strong>. En lo que resta del mes en curso, el servicio continúa habilitado y no podrá darse de baja salvo intervención directa de un Administrador.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            data-testid="btn-abort-cancel-transport"
            onClick={onAbort}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
          >
            Volver
          </button>
          <button
            type="button"
            data-testid="btn-confirm-cancel-transport"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
          >
            Confirmar Baja
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCancelTransportModal;
