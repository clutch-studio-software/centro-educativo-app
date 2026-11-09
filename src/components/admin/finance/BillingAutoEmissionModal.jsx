import React, { useEffect, useRef } from 'react';

const BillingAutoEmissionModal = ({
  isOpen,
  month,
  receiptsCount = 0,
  onClose,
  onGoToFinance,
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal?.();
    } else if (!isOpen && dialog.open) {
      dialog.close?.();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      aria-labelledby="auto-emission-title"
      data-testid="billing-auto-emission-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs border-none outline-none m-0 max-w-none max-h-none w-full h-full backdrop:bg-transparent animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 relative border border-slate-200/80">
        {/* Encabezado con Ícono Institucional */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[28px]">auto_mode</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-1.5 border border-amber-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Emisión Automática Programada
            </div>
            <h3
              id="auto-emission-title"
              data-testid="auto-emission-title"
              className="text-lg font-headline font-bold text-slate-900 leading-snug"
            >
              Facturas del mes de {month} emitidas automáticamente
            </h3>
          </div>

          <button
            type="button"
            data-testid="btn-close-auto-emission"
            onClick={onClose}
            aria-label="Cerrar aviso"
            className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 -mr-1 -mt-1 cursor-pointer bg-transparent border-none"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Cuerpo del Mensaje */}
        <div className="mt-4 space-y-3.5 text-xs text-slate-600 leading-relaxed">
          <p>
            El plazo reglamentario para la emisión manual de las facturas escolares del ciclo{' '}
            <strong className="text-slate-900 font-semibold">{month}</strong> venció el{' '}
            <strong className="text-slate-900 font-semibold">día 5</strong> de este mes.
          </p>

          <p>
            Al haber iniciado sesión un usuario administrador sin que se hubiera registrado la
            emisión previa, el sistema procedió a{' '}
            <strong className="text-blue-700 font-semibold">
              emitir de forma automática
            </strong>{' '}
            las cuotas y obligaciones arancelarias para todos los alumnos matriculados y sus
            respectivos grupos familiares.
          </p>

          {/* Tarjeta de Resumen Operativo */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Período de Facturación:</span>
              <span className="font-bold text-slate-900">{month}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Comprobantes y Deudas Generadas:</span>
              <span className="font-bold text-blue-700">
                {receiptsCount > 0 ? `${receiptsCount} facturas familiares` : 'Comprobantes emitidos'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Estado Inicial:</span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                Pendientes de cobro / conciliación
              </span>
            </div>
          </div>
        </div>

        {/* Acciones del Modal */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button
            type="button"
            data-testid="btn-dismiss-auto-emission"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-full text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
          >
            Entendido
          </button>
          <button
            type="button"
            data-testid="btn-go-to-finance"
            onClick={onGoToFinance}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all hover:shadow cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[17px]">payments</span>
            Ir a Gestión de Finanzas
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default BillingAutoEmissionModal;
