import React from 'react';

const DisciplineDetailsModal = ({ isOpen, discipline, onClose, onEdit }) => {
  if (!isOpen || !discipline) return null;

  const cupoOcupado = discipline.cupoOcupado || 0;
  const cupoMax = discipline.cupoMax || 1;
  const percentage = Math.min(100, Math.round((cupoOcupado / cupoMax) * 100));
  const vacantesDisponibles = Math.max(0, cupoMax - cupoOcupado);
  const inscriptos = discipline.inscriptos || [];

  return (
    <div
      data-testid="discipline-details-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl ${
                discipline.bgColor || 'bg-blue-50'
              } ${
                discipline.textColor || 'text-blue-600'
              } flex items-center justify-center font-bold text-2xl shadow-xs shrink-0 select-none`}
            >
              {discipline.emoji || '🏅'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {discipline.nombre}
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    discipline.activo
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {discipline.activo ? 'Oferta Activa' : 'En Pausa'}
                </span>
              </div>
              <p className="text-xs text-slate-500">{discipline.lugar || 'Campus Deportivo'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="close-details-modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Profesor */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/80 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                {discipline.profesor?.iniciales || 'DOC'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Profesor Responsable
                </span>
                <span className="font-bold text-slate-900 text-sm truncate">
                  {discipline.profesor?.nombre || 'Sin asignar'}
                </span>
                {discipline.profesor?.email && (
                  <span className="text-slate-500 truncate">{discipline.profesor.email}</span>
                )}
                {discipline.profesor?.telefono && (
                  <span className="text-slate-400 text-[11px]">{discipline.profesor.telefono}</span>
                )}
              </div>
            </div>

            {/* Horarios & Niveles */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/80 flex flex-col justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Días y Horarios
                </span>
                <p className="font-bold text-slate-800 mt-0.5">{discipline.horario}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Nivel Escolar
                </span>
                <p className="font-semibold text-blue-700 mt-0.5">{discipline.niveles}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {discipline.descripcion && (
            <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-100/70">
              <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block mb-1">
                Objetivo y Propuesta Formativa
              </span>
              <p className="text-slate-700 leading-relaxed">{discipline.descripcion}</p>
            </div>
          )}

          {/* Vacantes y Cupo Progress Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between font-semibold">
              <span className="text-slate-700">Estado de Vacantes y Cupos</span>
              <span className="text-slate-900 font-bold">
                {cupoOcupado} / {cupoMax} ocupados ({vacantesDisponibles} disponibles)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentage >= 100
                    ? 'bg-amber-500'
                    : percentage >= 75
                      ? 'bg-blue-600'
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Padrón de Alumnos Inscriptos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-blue-600">group</span>
                Padrón de Alumnos Inscriptos ({inscriptos.length})
              </h4>
              <span className="text-[11px] text-slate-400">Control de aptitud médica</span>
            </div>

            {inscriptos.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl text-slate-500">
                No hay alumnos inscriptos registrados actualmente en esta disciplina.
              </div>
            ) : (
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-4">Alumno</th>
                      <th className="py-2.5 px-4">Curso / Nivel</th>
                      <th className="py-2.5 px-4">Tutor & Teléfono</th>
                      <th className="py-2.5 px-4 text-center">Apto Médico</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                    {inscriptos.map((ins) => (
                      <tr key={ins.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-semibold text-slate-900">{ins.alumno}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {ins.curso} ({ins.nivel})
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span>{ins.tutor}</span>
                            <span className="text-[10px] text-slate-400">{ins.telefono}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ins.aptoMedico
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {ins.aptoMedico ? 'Apto al día' : 'Pendiente'}
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

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer border-none bg-transparent"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(discipline);
            }}
            data-testid="edit-from-details-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            Editar Disciplina
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisciplineDetailsModal;
