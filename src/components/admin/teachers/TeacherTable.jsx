import React from 'react';

const getBadgeStyle = (especialidadKey) => {
  switch (especialidadKey) {
    case 'exactas':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'robotica':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'lengua':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'deportes':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'artes':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'idiomas':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const getStatusDot = (estado) => {
  switch (estado) {
    case 'activo':
      return 'bg-lime-500';
    case 'licencia':
      return 'bg-amber-500';
    case 'inactivo':
      return 'bg-slate-400';
    default:
      return 'bg-lime-500';
  }
};

const getInitials = (name = '') => {
  const parts = name.replace(/^(Prof\.|Ing\.|Lic\.|Dra\.|Dr\.)\s*/i, '').trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0] || 'DO').slice(0, 2).toUpperCase();
};

const TeacherTable = ({ teachers = [], onOpenAssignments }) => {
  if (teachers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <span className="material-symbols-outlined text-[24px]">person_off</span>
        </div>
        <h3 className="font-bold text-sm text-slate-800">No se encontraron docentes</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          No hay registros que coincidan con los criterios de búsqueda o filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="py-3.5 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider w-32">
                Legajo
              </th>
              <th className="py-3.5 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">
                Docente &amp; Titulación
              </th>
              <th className="py-3.5 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">
                Especialidad
              </th>
              <th className="py-3.5 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">
                Contacto Institucional
              </th>
              <th className="py-3.5 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">
                Cátedras
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {teachers.map((teacher) => {
              const statusDotColor = getStatusDot(teacher.estado);
              const badgeStyle = getBadgeStyle(teacher.especialidadKey);
              const initials = getInitials(teacher.nombre);
              const isLicencia = teacher.estado === 'licencia';

              return (
                <tr
                  key={teacher.id}
                  onClick={() => onOpenAssignments(teacher)}
                  className={`cursor-pointer transition-colors group ${
                    isLicencia ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'hover:bg-blue-50/30'
                  }`}
                  title="Haz clic para ver o editar asignaciones de cátedras"
                >
                  {/* Legajo */}
                  <td className="py-4 px-6 font-mono font-bold text-xs text-blue-600">
                    {teacher.legajo}
                  </td>

                  {/* Docente & Titulación */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        {teacher.avatar ? (
                          <img
                            src={teacher.avatar}
                            alt={teacher.nombre}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100 shadow-sm"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-sm ${
                            teacher.avatar ? 'hidden' : 'flex'
                          }`}
                        >
                          {initials}
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${statusDotColor} ring-2 ring-white`}
                          title={`Estado: ${teacher.estado}`}
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {teacher.nombre}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate" title={teacher.titulacion}>
                          {teacher.titulacion}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Especialidad */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold text-[11px] border ${badgeStyle}`}
                    >
                      {teacher.especialidad}
                    </span>
                  </td>

                  {/* Contacto Institucional */}
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-800 truncate">
                        {teacher.email}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate">
                        {teacher.telefono}
                      </span>
                    </div>
                  </td>

                  {/* Acción rápida / Cátedras */}
                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                        <span className="material-symbols-outlined text-[15px]">calendar_month</span>
                        <span>{teacher.cargaHoras || 0} hs</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAssignments(teacher);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="Ver planificación horaria"
                      >
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TeacherTable;
