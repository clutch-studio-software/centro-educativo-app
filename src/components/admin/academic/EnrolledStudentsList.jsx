import React, { useState, useMemo } from 'react';

const EMPTY_STUDENTS = [];

export const EnrolledStudentsList = ({ enrolledStudents = EMPTY_STUDENTS }) => {
  const [studentSearch, setStudentSearch] = useState('');

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

  const totalEnrolled = enrolledStudents.length;

  return (
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
            <label htmlFor="search-enrolled-student" className="sr-only">
              Buscar alumno o DNI
            </label>
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
              search
            </span>
            <input
              id="search-enrolled-student"
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Buscar alumno o DNI..."
              aria-label="Buscar alumno o DNI"
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {studentSearch && (
              <button
                type="button"
                onClick={() => setStudentSearch('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer border-none bg-transparent"
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
          No se encontraron alumnos con el término &quot;{studentSearch}&quot;.
        </div>
      ) : (
        <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-2xs">
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {filteredStudents.map((student) => {
              const studentKey = student.id || student.dni || student.legajo || student.nombre;
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
                  key={studentKey}
                  data-testid={`enrolled-student-${student.id || student.dni}`}
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
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        String(student.estado || '').includes('Activo')
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
  );
};

export default EnrolledStudentsList;
