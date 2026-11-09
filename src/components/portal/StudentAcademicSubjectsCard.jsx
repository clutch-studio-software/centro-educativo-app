import React from 'react';

/**
 * Tarjeta con la lista de materias académicas y profesores asignados del estudiante
 */
const StudentAcademicSubjectsCard = ({ subjects = [] }) => {
  return (
    <div
      data-testid="student-subjects-card"
      className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">menu_book</span>
          </div>
          <div className='text-left'>
            <p className="text-base font-bold text-slate-800">Materias & Profesores Asignados</p>
            <p className="text-xs text-slate-500">Plan de estudios y carga horaria semanal</p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          {subjects.length} materias
        </span>
      </div>

      {subjects.length === 0 ? (
        <p className="text-xs text-slate-500 py-3 text-center">
          No hay materias asignadas para este ciclo lectivo.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {subjects.map((sub) => {
            const subKey = sub.id || sub.nombre;
            const prof = sub.profesor || {};
            const profName =
              typeof prof === 'string'
                ? prof
                : prof.nombre || prof.displayName || 'Docente asignado';

            return (
              <div
                key={subKey}
                data-testid={`subject-item-${subKey}`}
                className="p-3.5 rounded-lg border border-slate-150 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col justify-between gap-2"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{sub.nombre}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px] text-slate-400">
                      schedule
                    </span>
                    {sub.cargaHoraria || '4 hs / semana'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-xs text-slate-700">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                    {prof.initials || 'PR'}
                  </span>
                  <span className="truncate font-medium">{profName}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentAcademicSubjectsCard;
