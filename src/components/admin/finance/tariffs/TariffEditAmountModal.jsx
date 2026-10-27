import React, { useState } from 'react';

const TariffEditAmountForm = ({ item, onSave, onClose }) => {
  const [amount, setAmount] = useState(() => String(item?.currentAmount ?? ''));

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericAmount = Math.max(0, Number(amount) || 0);
    onSave(item.id, numericAmount);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200/70 text-start">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
          Concepto
        </p>
        <p className="font-headline font-bold text-sm text-slate-900 mt-0.5">
          {item.name}
        </p>
      </div>

      <div className="space-y-1.5 text-start">
        <label
          htmlFor="input-modal-amount"
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
        >
          Nuevo Importe ({item.unit || 'ARS'})
        </label>
        <div className="flex items-center px-3.5 py-2.5 rounded-md bg-white border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 shadow-xs">
          <span className="text-base font-extrabold text-blue-700 mr-2">$</span>
          <input
            id="input-modal-amount"
            data-testid="input-modal-amount"
            aria-label={`Nuevo importe para ${item.name}`}
            type="number"
            min="0"
            step="100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-transparent font-headline font-bold text-lg text-slate-900 outline-none"
          />
          <span className="text-xs font-semibold text-slate-500 shrink-0 ml-2">
            {item.unit || 'ARS'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          id="btn-cancel-edit-amount"
          data-testid="btn-cancel-edit-amount"
          onClick={onClose}
          className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          id="btn-save-edit-amount"
          data-testid="btn-save-edit-amount"
          className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            check
          </span>
          <span>Guardar Monto</span>
        </button>
      </div>
    </form>
  );
};

const TariffEditAmountModal = ({
  isOpen,
  onClose,
  item,
  onSave,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div
      data-testid="tariff-edit-amount-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-md bg-white rounded-md border border-slate-200/90 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700 shrink-0">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                edit
              </span>
            </div>
            <div className="text-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                {item.category || 'Tarifa Institucional'}
              </span>
              <h3
                id="edit-amount-modal-title"
                className="font-headline text-base font-extrabold text-slate-900"
              >
                Modificar Monto
              </h3>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-edit-amount-modal"
            data-testid="btn-close-edit-amount-modal"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        {/* Form Body con key para inicialización pura */}
        <TariffEditAmountForm
          key={item.id}
          item={item}
          onSave={onSave}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default TariffEditAmountModal;
