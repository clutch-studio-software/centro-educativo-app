import React from 'react';

const FinanceTabs = ({ activeTab, onSelectTab, pendingCount = 14 }) => {
  return (
    <div
      data-testid="finance-tabs-nav"
      className="flex items-center gap-2 p-1.5 rounded-full bg-slate-200/70 max-w-fit mb-6 shadow-inner"
    >
      <button
        type="button"
        id="tab-btn-comprobantes"
        data-testid="tab-btn-comprobantes"
        onClick={() => onSelectTab('comprobantes')}
        className={`flex items-center gap-2.5 px-5 py-2 rounded-full font-headline text-xs lg:text-sm transition-all cursor-pointer border-none ${
          activeTab === 'comprobantes'
            ? 'bg-white text-blue-700 font-bold shadow-xs'
            : 'text-slate-600 font-semibold hover:text-slate-900 bg-transparent'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          receipt
        </span>
        <span>Gestión de Comprobantes y Recibos</span>
        <span
          data-testid="tab-pending-badge"
          className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-extrabold"
        >
          {pendingCount} pendientes
        </span>
      </button>

      <button
        type="button"
        id="tab-btn-aranceles"
        data-testid="tab-btn-aranceles"
        onClick={() => onSelectTab('aranceles')}
        className={`flex items-center gap-2.5 px-5 py-2 rounded-full font-headline text-xs lg:text-sm transition-all cursor-pointer border-none ${
          activeTab === 'aranceles'
            ? 'bg-white text-blue-700 font-bold shadow-xs'
            : 'text-slate-600 font-semibold hover:text-slate-900 bg-transparent'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          price_change
        </span>
        <span>Parametrización de Aranceles &amp; Tarifas</span>
      </button>
    </div>
  );
};

export default FinanceTabs;
