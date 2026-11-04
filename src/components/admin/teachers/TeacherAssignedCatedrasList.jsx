import React from 'react';
import {
  deriveScheduleFromGrilla,
  ICON_BG_CLASSES,
  NIVEL_BADGE_CLASSES,
} from './teacherScheduleUtils';

const TeacherAssignedCatedrasList = ({
  catedrasList,
  grilla,
  onRemoveCatedra,
  readOnly,
}) => (
  <div data-testid="teacher-assigned-catedras-list" className="flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="font-bold text-sm text-slate-800">
        Cátedras Asignadas Actualmente ({catedrasList.length})
      </span>
      <span className="text-[11px] text-slate-400 font-medium">
        Horarios sincronizados con la grilla semanal
      </span>
    </div>

    <div className="flex flex-col gap-2">
      {catedrasList.length === 0 ? (
        <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-500 border border-dashed border-slate-200">
          No hay cátedras vinculadas para este docente.
        </div>
      ) : (
        catedrasList.map((cat) => {
          const iconBg = ICON_BG_CLASSES[cat.badgeColor] || ICON_BG_CLASSES.blue;
          const nivelBadge = NIVEL_BADGE_CLASSES[cat.nivel] || NIVEL_BADGE_CLASSES.Secundario;
          const horarioReal = deriveScheduleFromGrilla(grilla, cat);

          return (
            <div
              key={cat.id || `${cat.nombre}-${cat.curso}`}
              data-testid={`catedra-item-${cat.id}`}
              className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-200/80 transition-all hover:bg-white hover:border-slate-300"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center shrink-0 shadow-2xs`}
                >
                  <span className="material-symbols-outlined text-[19px]">
                    {cat.icon || 'menu_book'}
                  </span>
                </div>
                <div className="flex flex-col min-w-0 gap-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {cat.nombre}
                    </span>
                    {cat.nivel && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${nivelBadge}`}
                      >
                        {cat.nivel}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{cat.curso}</span>
                    <span>•</span>
                    <span className="font-bold text-blue-700">{cat.horasSemanales} hs/sem</span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                      <span className="material-symbols-outlined text-[13px]">schedule</span>
                      <span>{horarioReal}</span>
                    </span>
                  </div>
                </div>
              </div>

              {!readOnly && (
                <button
                  type="button"
                  data-testid={`btn-remove-catedra-${cat.id}`}
                  onClick={() => onRemoveCatedra(cat.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer shrink-0"
                  title="Desasignar cátedra"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  </div>
);

export default TeacherAssignedCatedrasList;
