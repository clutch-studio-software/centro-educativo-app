import React from 'react';

/**
 * Tarjeta de visualización de deportes y actividades extracurriculares del estudiante
 */
const StudentSportsCard = ({ sports = [] }) => {
  return (
    <div
      data-testid="student-sports-card"
      className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">sports_soccer</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Deportes Extracurriculares</h2>
            <p className="text-xs text-slate-500">Talleres deportivos vespertinos (Máx. 2)</p>
          </div>
        </div>
        <span
          data-testid="student-sports-count-badge"
          className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
        >
          {sports.length} / 2 activos
        </span>
      </div>

      {sports.length === 0 ? (
        <div
          data-testid="no-sports-message"
          className="p-4 rounded-lg bg-slate-50 border border-dashed border-slate-250 text-center text-xs text-slate-500"
        >
          El estudiante no se encuentra inscripto en ninguna disciplina deportiva extracurricular actualmente.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sports.map((sp) => {
            const spKey = sp.id || sp.nombre;
            return (
              <div
                key={spKey}
                data-testid={`enrolled-sport-item-${spKey}`}
                className="p-3.5 rounded-lg border border-emerald-100 bg-emerald-50/40 flex flex-col justify-between gap-2"
              >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-600 text-base">
                      fitness_center
                    </span>
                    {sp.nombre}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {sp.categoria || 'Deportes Institucionales'}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Matriculado
                </span>
              </div>

              <div className="pt-2 border-t border-emerald-100/70 text-xs text-slate-600 space-y-1">
                <p className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-slate-400">
                    schedule
                  </span>
                  Horarios: <strong>{sp.horarios || 'Días a confirmar'}</strong>
                </p>
                <p className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-slate-400">
                    person
                  </span>
                  Profesor: <strong>{sp.profesor || 'Coordinación deportiva'}</strong>
                </p>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
};

export default StudentSportsCard;
