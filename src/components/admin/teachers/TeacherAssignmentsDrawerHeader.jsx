import React from 'react';

export const TeacherAssignmentsDrawerHeader = ({ teacher, readOnly, onClose }) => {
  const displayName =
    teacher.nombreCompleto ||
    (teacher.apellido ? `${teacher.nombre} ${teacher.apellido}` : teacher.nombre);

  return (
    <div
      data-testid="teacher-assignments-header"
      className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10"
    >
      <div className="flex text-start flex-col">
        <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
          {readOnly ? 'Consulta de Asignación Académica' : 'Planificación Académica 2026'}
        </span>
        <h2 id="slide-over-title" className="text-xl font-extrabold text-slate-900">
          {displayName}
        </h2>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-xs text-blue-600 font-bold">
            {teacher.legajo}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-500 font-medium">
            {teacher.especialidad}
          </span>
        </div>
      </div>
      <button
        type="button"
        data-testid="btn-close-drawer"
        onClick={onClose}
        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
        title="Cerrar panel"
      >
        <span className="material-symbols-outlined text-[20px]">close</span>
      </button>
    </div>
  );
};

export const TeacherAccumulatedHoursCard = ({
  totalHoras,
  maxHoras,
  isOverLimit,
  porcentajeCarga,
}) => (
  <div
    data-testid="accumulated-hours-card"
    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
      isOverLimit
        ? 'bg-rose-50/80 border-rose-200'
        : 'bg-slate-50 border-slate-100'
    }`}
  >
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Carga Semanal Acumulada
        </span>
        {isOverLimit ? (
          <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100/90 border border-rose-200 px-2 py-0.5 rounded-full">
            ⚠️ Excede {maxHoras} hs
          </span>
        ) : (
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            {maxHoras - totalHoras} hs disponibles
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span
          data-testid="total-hours-value"
          className={`text-2xl font-extrabold ${
            isOverLimit ? 'text-rose-600' : 'text-blue-600'
          }`}
        >
          {totalHoras}
        </span>
        <span className="text-xs text-slate-500 font-medium">
          de {maxHoras} hs máximas permitidas
        </span>
      </div>
    </div>
    <div className="w-32 bg-slate-200 h-2.5 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${
          isOverLimit
            ? 'bg-rose-500 w-full'
            : 'bg-gradient-to-r from-blue-600 to-emerald-500'
        }`}
        style={{ width: `${porcentajeCarga}%` }}
      />
    </div>
  </div>
);

export const TeacherAssignmentsDrawerFooter = ({
  readOnly,
  isOverLimit,
  onClose,
  onConfirmSave,
}) => (
  <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
    <button
      type="button"
      data-testid="btn-cancel-drawer"
      onClick={onClose}
      className="px-5 py-2.5 bg-white text-slate-700 font-bold text-xs rounded-full hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
    >
      {readOnly ? 'Cerrar' : 'Cancelar'}
    </button>
    {!readOnly && (
      <button
        type="button"
        data-testid="btn-save-assignments"
        disabled={isOverLimit}
        onClick={onConfirmSave}
        title={
          isOverLimit
            ? 'No se puede guardar: la carga semanal supera el límite institucional de 30 hs.'
            : 'Confirmar y guardar asignaciones'
        }
        className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs rounded-full transition-all ${
          isOverLimit
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-[0_4px_14px_rgba(11,80,213,0.3)] active:scale-95 cursor-pointer'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">save</span>
        <span>Confirmar y Guardar Asignaciones</span>
      </button>
    )}
  </div>
);
