import React from 'react';

const ViewDivisionModal = ({ isOpen, onClose, course, onEdit }) => {
  if (!isOpen || !course) return null;

  const {
    nombre,
    division,
    nombreCompleto,
    turno,
    aula,
    cupoOcupado = 0,
    cupoMax = 30,
    docenteTitular,
    preceptor,
    orientacion,
    activo,
    nivelId,
  } = course;

  const displayName = nombre || nombreCompleto || 'Curso';
  const displayDivision = division || 'A';
  const percentage = Math.min(100, Math.round((cupoOcupado / (cupoMax || 1)) * 100));
  const vacantes = Math.max(0, cupoMax - cupoOcupado);

  const levelBadges = {
    inicial: { label: 'Nivel Inicial', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    primario: { label: 'Nivel Primario', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    secundario: { label: 'Nivel Secundario', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  };

  const currentLevelBadge = levelBadges[nivelId] || levelBadges.primario;

  return (
    <div
      data-testid="view-division-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[22px]">visibility</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{displayName}</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                  División {displayDivision}
                </span>
              </div>
              <p className="text-xs text-slate-500">Detalles pedagógicos y capacidad de la división</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-xs text-slate-600">
          {/* Status banner */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${activo ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}
              ></span>
              <span className="font-semibold text-slate-800">
                Estado: {activo ? 'División Activa' : 'División Pausada'}
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${currentLevelBadge.bg}`}>
              {currentLevelBadge.label}
            </span>
          </div>

          {/* Grid info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Turno / Horario
              </span>
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                <span className="material-symbols-outlined text-[16px] text-amber-500">
                  {turno?.toLowerCase().includes('tarde') ? 'wb_twilight' : 'sunny'}
                </span>
                <span>{turno || 'Mañana'}</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Aula Asignada
              </span>
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                <span className="material-symbols-outlined text-[16px] text-blue-500">meeting_room</span>
                <span>{aula || 'Aula Principal'}</span>
              </div>
            </div>
          </div>

          {orientacion && (
            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block mb-1">
                Orientación Curricular
              </span>
              <span className="font-bold text-slate-800 text-xs">{orientacion}</span>
            </div>
          )}

          {/* Ocupación / Capacidad */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Ocupación de Matrícula</span>
              <span className="font-extrabold text-slate-900">
                {cupoOcupado} / {cupoMax} ({percentage}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  percentage >= 100
                    ? 'bg-rose-500'
                    : percentage >= 85
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className={percentage >= 100 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-semibold'}>
                {vacantes === 0 ? 'Sin vacantes disponibles' : `${vacantes} vacantes libres`}
              </span>
              <span className="text-slate-400">Cupo máximo: {cupoMax} alumnos</span>
            </div>
          </div>

          {/* Personal a cargo */}
          <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              {docenteTitular ? 'Docente Titular' : 'Preceptor a Cargo'}
            </span>
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <span className="material-symbols-outlined text-[18px] text-slate-400">person</span>
              <span>{docenteTitular || preceptor || 'A designar por dirección'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onEdit) onEdit(course);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Editar División
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDivisionModal;
