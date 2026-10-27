import React, { useState, useRef, useEffect } from 'react';

const FinanceReceiptActionsMenu = ({
  receipt,
  onOpenValidate,
  onOpenReject,
  onViewVoucher,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (callback) => {
    setIsOpen(false);
    callback(receipt);
  };

  return (
    <div
      ref={menuRef}
      className="relative inline-block text-left"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        id={`btn-actions-${receipt.id}`}
        data-testid={`btn-actions-${receipt.id}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Acciones para comprobante de ${receipt.tutor}`}
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
      >
        <span>Acciones</span>
        <span
          className={`material-symbols-outlined text-[16px] text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          expand_more
        </span>
      </button>

      {isOpen && (
        <div
          data-testid={`actions-menu-${receipt.id}`}
          className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-md shadow-lg z-30 py-1 flex flex-col text-xs text-start animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Opción Aprobar (solo si está pendiente) */}
          {receipt.status === 'pendiente' && (
            <button
              type="button"
              data-testid={`menu-opt-approve-${receipt.id}`}
              onClick={() => handleAction(onOpenValidate)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer border-none bg-transparent w-full text-left"
            >
              <span className="material-symbols-outlined text-[18px] text-emerald-600">
                check_circle
              </span>
              <span className="font-medium">Aprobar Pago</span>
            </button>
          )}

          {/* Opción Rechazar (solo si está pendiente) */}
          {receipt.status === 'pendiente' && (
            <button
              type="button"
              data-testid={`menu-opt-reject-${receipt.id}`}
              onClick={() => handleAction(onOpenReject)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer border-none bg-transparent w-full text-left"
            >
              <span className="material-symbols-outlined text-[18px] text-red-600">
                close
              </span>
              <span className="font-medium">Rechazar / Observar</span>
            </button>
          )}

          {/* Opción Ver Recibo Oficial (solo si está aprobado) */}
          {receipt.status === 'aprobado' && (
            <button
              type="button"
              data-testid={`menu-opt-receipt-${receipt.id}`}
              onClick={() => handleAction(onViewVoucher)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer border-none bg-transparent w-full text-left"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-600">
                picture_as_pdf
              </span>
              <span className="font-medium">Ver Recibo Oficial</span>
            </button>
          )}

          {/* Opción Ver Observación (solo si está rechazado) */}
          {receipt.status === 'rechazado' && (
            <button
              type="button"
              data-testid={`menu-opt-rejected-${receipt.id}`}
              onClick={() => handleAction(onViewVoucher)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer border-none bg-transparent w-full text-left"
            >
              <span className="material-symbols-outlined text-[18px] text-red-600">
                visibility
              </span>
              <span className="font-medium">Ver Observación</span>
            </button>
          )}

          {/* Opción general: Ver Comprobante Adjunto o aviso si no cargó */}
          {receipt.bankingVoucher ? (
            <button
              type="button"
              data-testid={`menu-opt-voucher-${receipt.id}`}
              onClick={() => handleAction(onViewVoucher)}
              className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer border-none bg-transparent w-full text-left border-t border-slate-100"
            >
              <span className="material-symbols-outlined text-[18px] text-slate-500">
                attach_file
              </span>
              <span className="font-medium">Ver Comprobante</span>
            </button>
          ) : (
            <div
              data-testid={`menu-opt-no-voucher-${receipt.id}`}
              className="px-3.5 py-2 text-slate-400 flex items-center gap-2 text-[11px] italic border-t border-slate-100 select-none"
            >
              <span className="material-symbols-outlined text-[15px] text-amber-500">
                hourglass_empty
              </span>
              <span>Sin comprobante cargado</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinanceReceiptActionsMenu;
