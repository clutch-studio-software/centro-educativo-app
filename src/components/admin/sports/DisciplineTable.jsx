import React from 'react';

const DisciplineTable = ({
  disciplines = [],
  onViewDetails,
  onEditDiscipline,
  onToggleStatus,
  onResetFilters,
}) => {
  if (disciplines.length === 0) {
    return (
      <div
        data-testid="disciplines-empty-state"
        className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_18px_rgba(15,23,42,0.03)] p-12 text-center flex flex-col items-center justify-center gap-3"
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px]">sports_and_outdoors</span>
        </div>
        <h3 className="text-base font-bold text-slate-800">No se encontraron disciplinas</h3>
        <p className="text-xs text-slate-500 max-w-md">
          No hay actividades deportivas que coincidan con los criterios de búsqueda o filtros seleccionados.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Restablecer filtros
        </button>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_18px_rgba(15,23,42,0.03)] overflow-hidden"
      data-purpose="disciplines-table"
      data-testid="disciplines-table"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="py-3.5 px-6 font-semibold" scope="col">
                Disciplina
              </th>
              <th className="py-3.5 px-6 font-semibold" scope="col">
                Profesor a cargo
              </th>
              <th className="py-3.5 px-6 font-semibold" scope="col">
                Niveles
              </th>
              <th className="py-3.5 px-6 font-semibold text-center" scope="col">
                Estado de Oferta
              </th>
              <th className="py-3.5 px-6 font-semibold text-right" scope="col">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {disciplines.map((disc) => {
              const isFull = disc.cupoOcupado >= disc.cupoMax;
              const isActive = disc.activo;

              return (
                <tr
                  key={disc.id}
                  data-testid={`discipline-row-${disc.id}`}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* Disciplina */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${
                          disc.bgColor || 'bg-blue-50'
                        } ${
                          disc.textColor || 'text-blue-600'
                        } flex items-center justify-center font-bold text-base shadow-xs shrink-0 select-none`}
                      >
                        {disc.emoji || '🏅'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 text-sm tracking-tight truncate">
                          {disc.nombre}
                        </span>
                        {disc.horario && (
                          <span className="text-[11px] text-slate-400 truncate">
                            {disc.horario}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Profesor a cargo */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase shrink-0">
                        {disc.profesor?.iniciales || 'DOC'}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-800 truncate">
                          {disc.profesor?.nombre || 'Sin asignar'}
                        </span>
                        {disc.lugar && (
                          <span className="text-[10px] text-slate-400 truncate">
                            {disc.lugar}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Niveles */}
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {disc.niveles || 'Todos los niveles'}
                    </span>
                  </td>

                  {/* Estado de Oferta */}
                  <td className="py-4 px-6 text-center">
                    <div className="inline-flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(disc)}
                        data-testid={`toggle-status-${disc.id}`}
                        aria-label={`${isActive ? 'Desactivar' : 'Activar'} ${disc.nombre}`}
                        title={isActive ? 'Activo (Click para pausar)' : 'En Pausa (Click para activar)'}
                        className={`w-8 h-4 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
                          isActive ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`w-3 h-3 bg-white rounded-full shadow-xs transform transition-transform duration-200 ${
                            isActive ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span
                        className={`text-[11px] font-semibold ${
                          isActive
                            ? isFull
                              ? 'text-amber-700 font-bold'
                              : 'text-emerald-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {!isActive ? 'En Pausa' : isFull ? 'Completo' : 'Activo'}
                      </span>
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewDetails(disc)}
                        data-testid={`btn-view-details-${disc.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50/70 hover:bg-blue-100/70 transition-colors cursor-pointer border-none"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                        <span>Ver detalles</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditDiscipline(disc)}
                        data-testid={`btn-edit-discipline-${disc.id}`}
                        aria-label={`Editar ${disc.nombre}`}
                        title="Editar"
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DisciplineTable;
