import React from 'react';
import ReportTableHeader from './ReportTableHeader';

const ENROLLED_STUDENTS_SUBTABLE_COLUMNS = [
  { label: '#', align: 'left' },
  { label: 'Alumno (Apellido, Nombre)', align: 'left' },
  { label: 'Legajo', align: 'left' },
  { label: 'Curso / División', align: 'left' },
  { label: 'Nivel', align: 'right' },
];

const SportDetailCard = ({ sp, isExpanded, onToggleExpand }) => {
  return (
    <div
      data-testid={`card-sport-detail-${sp.id}`}
      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-4"
    >
      {/* Cabecera de la Disciplina */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl p-2 bg-slate-50 rounded-xl border border-slate-100">
            {sp.emoji}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-base text-slate-900">
                {sp.nombre}
              </h4>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {sp.niveles}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-amber-600">person</span>
              <span>Profesor Responsable: <strong>{sp.profesor}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Ocupación con borde para impresión nítida */}
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-slate-700">
              {sp.cupoOcupado} / {sp.cupoMax} cupos ({sp.porcentaje}%)
            </span>
            <div className="w-28 h-2 bg-slate-100 border border-slate-300 rounded-full overflow-hidden mt-1">
              <div
                className={`h-full ${
                  sp.porcentaje >= 90
                    ? 'bg-amber-500'
                    : sp.porcentaje >= 50
                    ? 'bg-blue-600'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${sp.porcentaje}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            data-testid={`btn-toggle-inscriptos-${sp.id}`}
            onClick={() => onToggleExpand(sp.id)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer print:hidden"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
            <span>{isExpanded ? 'Ocultar Nómina' : `Ver Alumnos (${sp.inscriptos.length})`}</span>
          </button>
        </div>
      </div>

      {/* Datos Operativos: Horarios y Lugar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
        <div>
          <span className="text-slate-400 font-medium block">Día(s) de Práctica:</span>
          <span className="font-bold text-slate-800">{sp.dia}</span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block">Franja Horaria Semanal:</span>
          <span className="font-mono font-bold text-blue-800">{sp.hora}</span>
        </div>
        <div>
          <span className="text-slate-400 font-medium block">Lugar / Cancha:</span>
          <span className="font-bold text-slate-800">{sp.lugar}</span>
        </div>
      </div>

      {/* Nómina de Alumnos Inscriptos */}
      <div className={`${isExpanded ? 'block' : 'hidden print:block'} transition-all`}>
        <h5 className="font-bold text-xs text-slate-700 mb-2 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-blue-600">groups</span>
          <span>Alumnos Inscriptos ({sp.inscriptos.length})</span>
        </h5>

        {sp.inscriptos.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">
            No hay estudiantes matriculados formalmente en esta disciplina.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" data-testid={`table-sport-inscriptos-${sp.id}`}>
              <ReportTableHeader columns={ENROLLED_STUDENTS_SUBTABLE_COLUMNS} />
              <tbody className="divide-y divide-slate-100 text-xs">
                {sp.inscriptos.map((st, idx) => (
                  <tr key={`${sp.id}-${st.studentId}`} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2 px-4 font-mono text-slate-400 text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-4 font-bold text-slate-900">
                      {st.nombreCompleto}
                    </td>
                    <td className="py-2 px-4 font-mono text-slate-600">
                      {st.legajo}
                    </td>
                    <td className="py-2 px-4 text-slate-700">
                      {st.curso}
                    </td>
                    <td className="py-2 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                        {st.nivel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SportDetailCard;
