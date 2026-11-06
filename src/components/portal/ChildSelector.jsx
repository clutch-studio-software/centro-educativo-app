import React from 'react';

/**
 * Selector de hijos para padres/tutores con uno o más estudiantes a cargo
 */
const ChildSelector = ({ childrenList = [], selectedStudentId, onSelectChild }) => {
  if (!Array.isArray(childrenList) || childrenList.length <= 1) {
    if (childrenList.length === 1) {
      const child = childrenList[0];
      const childName =
        child.nombreCompleto ||
        `${child.nombre || ''} ${child.apellido || ''}`.trim();
      return (
        <div
          data-testid="single-child-banner"
          className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs md:text-sm text-amber-900 font-medium"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 text-lg">
              family_restroom
            </span>
            <span>Estudiante a cargo: <strong>{childName}</strong> ({child.curso || 'Curso regular'})</span>
          </div>
          <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
            {child.nivel || 'Nivel Primario'}
          </span>
        </div>
      );
    }
    return null;
  }

  return (
    <div
      data-testid="multi-child-selector"
      className="bg-white border border-slate-200 rounded-md p-4 shadow-sm space-y-2.5"
    >
      <div className="flex items-center justify-between">
        <label
          htmlFor="child-select-dropdown"
          className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base text-orange-600">
            family_restroom
          </span>
          Seleccionar estudiante a consultar / gestionar ({childrenList.length} vinculados)
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {childrenList.map((ch) => {
          const isSelected = String(ch.id) === String(selectedStudentId);
          const chName =
            ch.nombreCompleto ||
            `${ch.nombre || ''} ${ch.apellido || ''}`.trim() ||
            'Estudiante';

          return (
            <button
              key={ch.id}
              type="button"
              data-testid={`child-card-${ch.id}`}
              onClick={() => onSelectChild(ch.id)}
              className={`p-3 rounded-lg border text-left transition-all duration-150 flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'bg-orange-50/90 border-orange-500 shadow-sm ring-2 ring-orange-400/20'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
              }`}
            >
              <div className="min-w-0 pr-2">
                <p className="text-sm font-bold text-slate-800 truncate">{chName}</p>
                <p className="text-xs text-slate-500 truncate">{ch.curso} • {ch.nivel}</p>
              </div>
              <span
                className={`material-symbols-outlined text-xl ${
                  isSelected ? 'text-orange-600' : 'text-slate-300'
                }`}
              >
                {isSelected ? 'check_circle' : 'radio_button_unchecked'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChildSelector;
