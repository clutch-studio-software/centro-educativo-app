import React from 'react';

export const SportsDetailBentoGrid = ({
  discipline,
  occupancyCount,
  maxCapacity,
  occupancyPercentage,
  vacantesDisponibles,
  isAlmostFull,
  isFull,
  onOpenReassignTeacher,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {/* Card 1: Profesor Titular */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Profesor Titular
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-lg">sports</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm">
              {discipline.profesor?.iniciales || 'DOC'}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-slate-900 truncate">
                {discipline.profesor?.nombre || 'Sin asignar'}
              </h4>
              <p className="text-xs font-mono text-primary font-bold mt-0.5">
                {discipline.profesor?.legajo ? `Legajo ${discipline.profesor.legajo}` : (discipline.profesor?.telefono || 'Docente')}
              </p>
              <p className="text-xs text-slate-500 truncate mt-1">
                {discipline.profesor?.email || ''}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-50">
          <button
            type="button"
            onClick={onOpenReassignTeacher}
            data-testid="btn-reassign-teacher"
            className="w-full text-center py-2 text-xs font-bold text-primary hover:bg-primary-container/20 rounded-xl transition-colors cursor-pointer border-none bg-transparent"
          >
            Reasignar profesor
          </button>
        </div>
      </div>

      {/* Card 2: Horarios & Espacio */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Horarios &amp; Espacio
            </span>
            <div className="w-8 h-8 rounded-full bg-tertiary-container/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary-fixed-dim text-lg">
                schedule
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center text-start gap-2.5">
              <span className="material-symbols-outlined text-base text-tertiary-fixed-dim shrink-0 mt-0.5">
                event
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {Array.isArray(discipline.dias) ? discipline.dias.join(', ') : (discipline.dias || 'Días a coordinar')}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {discipline.horas || discipline.horario || 'Horario a confirmar'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-base text-tertiary-fixed-dim shrink-0 mt-0.5">
                stadium
              </span>
              <div>
                <p className="text-xs text-start font-bold text-slate-800">{discipline.lugar || 'Campo Deportivo'}</p>
                <p className="text-xs text-slate-500">{discipline.instalacion || discipline.descripcion || 'Instalaciones del Colegio'}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-50">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-secondary">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            Instalaciones disponibles
          </span>
        </div>
      </div>

      {/* Card 3: Ocupación del Cupo */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Ocupación del Cupo
            </span>
            <span className="text-xs font-extrabold text-white bg-tertiary-fixed-dim px-2 py-0.5 rounded-full font-mono shadow-sm">
              {occupancyPercentage}%
            </span>
          </div>
          <div className="items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-extrabold text-slate-900 font-headline">
              {occupancyCount}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              / {maxCapacity} plazas
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-3">
            <div
              className="bg-gradient-to-r from-tertiary-container to-tertiary h-full rounded-full transition-all duration-500"
              style={{ width: `${occupancyPercentage}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs">
            <span className="text-slate-500 font-medium">
              {vacantesDisponibles} {vacantesDisponibles === 1 ? 'vacante disponible' : 'vacantes disponibles'}
            </span>
            <span className="font-bold text-tertiary">
              {isFull ? 'Cupo completo' : isAlmostFull ? 'Cupo casi completo' : 'Cupo disponible'}
            </span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-[11px] font-bold text-slate-600">
              Lista de espera: {discipline.listaEsperaCount} alumnos
            </span>
          </div>
        </div>
      </div>

      {/* Card 4: Políticas y Alcance */}
      <div className="bg-gradient-to-br from-white via-lime-50/30 to-amber-50/20 p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Políticas y Alcance
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-lg">gavel</span>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase">
                Niveles Habilitados
              </p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {discipline.nivelesDetalle}
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-xl text-primary shrink-0 mt-0.5">
                  verified_user
                </span>
                <p className="text-[11px] font-bold text-slate-700 leading-tight">
                  {discipline.politica}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-50">
          <span className="text-[11px] font-semibold text-slate-500">
            {discipline.supervision}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SportsDetailBentoGrid;
