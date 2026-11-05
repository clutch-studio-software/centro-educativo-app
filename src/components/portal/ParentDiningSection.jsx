import React from 'react';

/**
 * Sección de autogestión del comedor escolar para padres y tutores
 */
const ParentDiningSection = ({
  student,
  onToggleDining,
  isProcessing = false,
}) => {
  const servicios = Array.isArray(student?.servicios) ? student.servicios : [];
  const isEnrolled =
    servicios.some((s) => String(s).toLowerCase().includes('comedor')) ||
    Boolean(student?.comedor);

  return (
    <div
      data-testid="parent-dining-section"
      className="bg-white rounded-md border border-slate-200 p-5 md:p-6 space-y-4 shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">restaurant</span>
          </div>
          <div className='text-left'>
            <p className="text-base font-bold text-slate-800">
              Autogestión de Comedor Escolar
            </p>
            <p className="text-xs text-slate-500">
              Servicio diario de almuerzo institucional y merienda
            </p>
          </div>
        </div>
        <span
          data-testid="dining-status-tag"
          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            isEnrolled
              ? 'bg-orange-50 text-orange-700 border-orange-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          {isEnrolled ? 'Servicio Contratado' : 'Sin servicio'}
        </span>
      </div>

      <div className="p-4 rounded-md bg-orange-50/40 border border-orange-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 text-xs text-left text-slate-600">
          <p className="font-bold text-slate-800 text-sm">
            {isEnrolled ? 'Menú Escolar Habilitado' : 'Habilitar Servicio de Almuerzo'}
          </p>
          <p>
            Plato principal, opciones vegetarianas/celíacas y control bromatológico constante.
          </p>
        </div>

        <button
          type="button"
          data-testid="btn-toggle-dining"
          disabled={isProcessing}
          onClick={() => onToggleDining(!isEnrolled)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
            isEnrolled
              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              : 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm'
          }`}
        >
          {isEnrolled ? 'Dar de baja comedor' : 'Inscribir al comedor escolar'}
        </button>
      </div>
    </div>
  );
};

export default ParentDiningSection;
