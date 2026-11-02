import React, { useState } from 'react';

const TariffTransportForm = ({ route, onSave, onClose }) => {
  const isEditing = Boolean(route);

  const [code, setCode] = useState(() => route?.code || '');
  const [name, setName] = useState(() => route?.name || '');
  const [subtitle, setSubtitle] = useState(() => route?.subtitle || '');
  const [amount, setAmount] = useState(() => String(route?.amount ?? '14000'));
  const [active, setActive] = useState(() => route?.active !== false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const routeData = {
      id: route?.id || `route-${Date.now()}`,
      code: code.trim().toUpperCase() || 'R',
      name: name.trim(),
      subtitle: subtitle.trim() || 'Recorrido escolar estándar',
      amount: Math.max(0, Number(amount) || 0),
      active,
      unit: 'ARS/mes',
    };

    onSave(routeData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="text-start">
          <label
            htmlFor="input-transport-code"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
          >
            Código
          </label>
          <input
            id="input-transport-code"
            data-testid="input-transport-code"
            aria-label="Código de ruta"
            type="text"
            placeholder="Ej: R5"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-sm font-bold text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
        </div>
        <div className="sm:col-span-2 text-start">
          <label
            htmlFor="input-transport-name"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
          >
            Nombre del Recorrido *
          </label>
          <input
            id="input-transport-name"
            data-testid="input-transport-name"
            aria-label="Nombre del recorrido"
            type="text"
            required
            placeholder="Ej: Circuito Norte y Perilago"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
        </div>
      </div>

      <div className="text-start">
        <label
          htmlFor="input-transport-subtitle"
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
        >
          Detalle Operativo / Paradas
        </label>
        <input
          id="input-transport-subtitle"
          data-testid="input-transport-subtitle"
          aria-label="Detalle de paradas"
          type="text"
          placeholder="Ej: Turno Mañana & Tarde (16 paradas)"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div className="text-start">
          <label
            htmlFor="input-transport-amount"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
          >
            Tarifa Mensual (ARS)
          </label>
          <div className="flex items-center px-3 py-2 rounded-md bg-white border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20">
            <span className="text-sm font-bold text-blue-700 mr-1.5">$</span>
            <input
              id="input-transport-amount"
              data-testid="input-transport-amount"
              aria-label="Tarifa mensual"
              type="number"
              min="0"
              step="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent font-headline font-bold text-sm text-slate-900 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-6">
          <label
            htmlFor="toggle-modal-route-active"
            className="relative inline-flex items-center cursor-pointer"
          >
            <input
              id="toggle-modal-route-active"
              data-testid="toggle-modal-route-active"
              type="checkbox"
              aria-label="Ruta habilitada"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600" />
          </label>
          <span className="text-xs font-bold text-slate-700">
            {active ? 'Ruta Activa / Operativa' : 'Ruta Inactiva'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          id="btn-cancel-transport-modal"
          data-testid="btn-cancel-transport-modal"
          onClick={onClose}
          className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          id="btn-save-transport-modal"
          data-testid="btn-save-transport-modal"
          className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            save
          </span>
          <span>{isEditing ? 'Guardar Recorrido' : 'Crear Recorrido'}</span>
        </button>
      </div>
    </form>
  );
};

const TariffTransportModal = ({
  isOpen,
  onClose,
  route,
  onSave,
}) => {
  if (!isOpen) return null;
  const isEditing = Boolean(route);

  return (
    <div
      data-testid="tariff-transport-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-lg bg-white rounded-md border border-slate-200/90 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700 shrink-0">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                directions_bus
              </span>
            </div>
            <div className="text-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Transporte Escolar
              </span>
              <h3
                id="transport-modal-title"
                className="font-headline text-base font-extrabold text-slate-900"
              >
                {isEditing ? `Modificar Recorrido: ${route.code}` : 'Nueva Ruta de Transporte'}
              </h3>
            </div>
          </div>
          <button
            type="button"
            id="btn-close-transport-modal"
            data-testid="btn-close-transport-modal"
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
        <TariffTransportForm
          key={route ? route.id : 'new-route'}
          route={route}
          onSave={onSave}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default TariffTransportModal;
