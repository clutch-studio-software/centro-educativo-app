import React, { useState, useMemo } from 'react';

const ViewDivisionModal = ({
  isOpen,
  onClose,
  course,
  enrolledStudents = [],
  onEdit,
}) => {
  const [studentSearch, setStudentSearch] = useState('');

  // Filtrar alumnos inscriptos en el modal por buscador (hook llamado antes de cualquier early return)
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return enrolledStudents;
    const q = studentSearch.toLowerCase().trim();
    return enrolledStudents.filter((s) => {
      const name = String(s.nombre || '').toLowerCase();
      const apellido = String(s.apellido || '').toLowerCase();
      const dni = String(s.dni || '').toLowerCase();
      const legajo = String(s.legajo || '').toLowerCase();
      return name.includes(q) || apellido.includes(q) || dni.includes(q) || legajo.includes(q);
    });
  }, [enrolledStudents, studentSearch]);

  if (!isOpen || !course) return null;

  const {
    nombre,
    division,
    nombreCompleto,
    turno,
    aula,
    cupoMax = 30,
    docenteTitular,
    preceptor,
    orientacion,
    activo,
    nivelId,
  } = course;

  const displayName = nombre || nombreCompleto || 'Curso';
  const displayDivision = division || 'A';
  const totalEnrolled = enrolledStudents.length;
  const percentage = Math.min(100, Math.round((totalEnrolled / (cupoMax || 1)) * 100));
  const vacantes = Math.max(0, cupoMax - totalEnrolled);
  const isFull = totalEnrolled >= cupoMax;

  const levelBadges = {
    inicial: { label: 'Nivel Inicial', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    primario: { label: 'Nivel Primario', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    secundario: { label: 'Nivel Secundario', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  };

  const currentLevelBadge = levelBadges[nivelId] || levelBadges.primario;

  return (
    <div
      data-testid="view-division-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 mt-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <span className="material-symbols-outlined text-[22px]">visibility</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{displayName}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                  División {displayDivision}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${currentLevelBadge.bg}`}>
                  {currentLevelBadge.label}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {aula || 'Aula Principal'} • {turno || 'Turno Mañana'} •{' '}
                {docenteTitular ? `Docente: ${docenteTitular}` : preceptor ? `Preceptor: ${preceptor}` : 'Sin personal asignado'}
              </p>
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

        {/* Modal Body - Scrollable */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-600">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Inscriptos Reales
              </span>
              <span className="text-base font-extrabold text-slate-900 mt-0.5">
                {totalEnrolled}{' '}
                <span className="text-xs font-normal text-slate-400">/ {cupoMax}</span>
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Ocupación
              </span>
              <span className={`text-base font-extrabold mt-0.5 ${isFull ? 'text-rose-600' : 'text-slate-900'}`}>
                {percentage}%
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Vacantes Libres
              </span>
              <span className={`text-base font-extrabold mt-0.5 ${vacantes === 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {vacantes} {vacantes === 1 ? 'lugar' : 'lugares'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Estado División
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-bold">
                <span className={`w-2 h-2 rounded-full ${activo ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                <span className={activo ? 'text-emerald-700' : 'text-slate-500'}>
                  {activo ? 'Activa' : 'Pausada'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-xs">
              <span className="text-slate-600">Capacidad utilizada del aula</span>
              <span className={isFull ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                {isFull ? '100% Completo' : `${vacantes} vacantes restantes`}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${isFull ? 'bg-rose-500' : percentage >= 85 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>

          {orientacion && (
            <div className="px-3.5 py-2 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-indigo-500">school</span>
              <span className="text-slate-700 font-medium">
                Orientación: <strong className="text-indigo-900 font-bold">{orientacion}</strong>
              </span>
            </div>
          )}

          {/* Listado de Alumnos Inscriptos */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-600">group</span>
                <h4 className="text-sm font-bold text-slate-900">
                  Alumnos Inscriptos en la División ({totalEnrolled})
                </h4>
              </div>

              {totalEnrolled > 0 && (
                <div className="relative w-full sm:w-64">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Buscar alumno o DNI..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  {studentSearch && (
                    <button
                      type="button"
                      onClick={() => setStudentSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {totalEnrolled === 0 ? (
              <div
                data-testid="division-no-students"
                className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs text-slate-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[28px]">group_off</span>
                </div>
                <h5 className="text-xs font-bold text-slate-700">Sin alumnos inscriptos actualmente</h5>
                <p className="text-[11px] text-slate-400 max-w-sm">
                  Esta división aún no tiene alumnos asignados. Puedes matricular y designar alumnos desde el módulo de{' '}
                  <strong className="text-slate-600">Alumnos &amp; Legajos</strong>.
                </p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
                No se encontraron alumnos con el término "{studentSearch}".
              </div>
            ) : (
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-2xs">
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {filteredStudents.map((student, idx) => {
                    const initials =
                      student.initials ||
                      (student.nombre || '')
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase() ||
                      'AL';

                    const avatarGrad =
                      student.avatarGradient || 'from-blue-500 to-indigo-600';

                    return (
                      <div
                        key={student.id || idx}
                        data-testid={`enrolled-student-${student.id}`}
                        className="p-3 bg-white hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${avatarGrad} text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-xs`}
                          >
                            {initials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-slate-900 truncate">
                              {student.nombre} {student.apellido || ''}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              {student.dni && <span>DNI: {student.dni}</span>}
                              {student.legajo && (
                                <>
                                  <span>•</span>
                                  <span>Legajo: {student.legajo}</span>
                                </>
                              )}
                              {student.tutorNombre && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="hidden sm:inline truncate">
                                    Tutor: {student.tutorNombre}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${String(student.estado || '').includes('Activo')
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : String(student.estado || '').includes('Deuda')
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                          >
                            {student.estado || 'Activo'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-medium text-slate-400">
            Total matriculado: <strong className="text-slate-700">{totalEnrolled}</strong> alumnos
          </span>

          <div className="flex items-center gap-2.5">
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
    </div>
  );
};

export default ViewDivisionModal;
