import React from 'react';

/**
 * Tarjeta de visualización del servicio de comedor escolar
 */
const StudentDiningCard = ({ diningDetails }) => {
  const isEnrolled = Boolean(diningDetails?.activo);
  const observations =
    diningDetails?.observaciones ||
    (isEnrolled
      ? 'Menú escolar institucional balanceado y supervisado por nutricionistas.'
      : 'El estudiante no está inscripto al servicio de comedor escolar.');

  return (
    <div
      data-testid="student-dining-card"
      className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">restaurant</span>
          </div>
          <div className='text-left'>
            <p className="text-base font-bold text-slate-800">Comedor Escolar</p>
            <p className="text-xs text-slate-500">Servicio de almuerzo diario institucional</p>
          </div>
        </div>
        <span
          data-testid="student-dining-status-badge"
          className={`text-xs font-bold px-2.5 py-1 rounded-full border ${isEnrolled
              ? 'bg-orange-50 text-orange-700 border-orange-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
        >
          {isEnrolled ? 'Servicio Activo' : 'No Inscripto'}
        </span>
      </div>

      <div
        data-testid="student-dining-content"
        className="py-3.5 rounded-md bg-slate-50 border border-slate-250 text-xs text-slate-600"
      >
        <span className="material-symbols-outlined text-[30px] text-center text-orange-500">
          calendar_meal
        </span>
        <p className="font-semibold text-slate-700">Estado del servicio</p>
        <p>{observations}</p>
        {isEnrolled && (
          <div className="pt-2 border-t border-slate-200/60 items-center gap-1.5 text-slate-500 text-[12px]">
            <span>Incluye plato principal, guarnición, postre y bebida mineralizada.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDiningCard;
