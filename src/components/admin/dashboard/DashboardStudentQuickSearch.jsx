import React, { useState, useMemo } from 'react';

const EMPTY_STUDENTS = [];

const DashboardStudentQuickSearch = ({
  students = EMPTY_STUDENTS,
  title,
  icon,
  iconColor = 'text-rose-600',
  buttonBgColor = 'bg-rose-600 hover:bg-rose-700',
  buttonLabel = 'Atender',
  buttonIcon = 'add',
  buttonTestIdPrefix = 'btn-attend-student',
  inputTestId = 'input-search-student',
  searchPlaceholder = 'Buscar estudiante...',
  ariaLabel = 'Buscar estudiante',
  sectionTestId = 'student-quick-search-section',
  onSelectStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = searchTerm.toLowerCase().trim();
    return students
      .filter((s) => {
        const name = (s.nombreCompleto || `${s.nombre || ''} ${s.apellido || ''}`).toLowerCase();
        const leg = String(s.legajo || s.studentID_login || '').toLowerCase();
        const dni = String(s.dni || '').replace(/\D/g, '');
        const curso = String(s.curso || '').toLowerCase();
        return name.includes(query) || leg.includes(query) || dni.includes(query) || curso.includes(query);
      })
      .slice(0, 5);
  }, [students, searchTerm]);

  return (
    <section
      data-testid={sectionTestId}
      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-3"
    >
      <div className="flex items-center gap-2">
        <span className={`material-symbols-outlined text-[20px] ${iconColor}`}>{icon}</span>
        <h3 className="font-extrabold text-slate-900 text-sm">{title}</h3>
      </div>
      <div className="relative">
        <input
          type="text"
          data-testid={inputTestId}
          aria-label={ariaLabel}
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2.5 pl-10 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-slate-400/20 focus:outline-hidden"
        />
        <span className="material-symbols-outlined text-[18px] text-slate-400 absolute left-3 top-3">
          search
        </span>
      </div>

      {filteredStudents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-1 animate-in fade-in">
          {filteredStudents.map((st) => (
            <div
              key={st.id}
              data-testid={`search-student-result-${st.id}`}
              className="p-3 bg-slate-50 border border-slate-200/80 rounded-md flex items-start justify-between gap-2"
            >
              <div className="flex text-left flex-col min-w-0">
                <span className="font-bold text-xs text-slate-900 truncate">
                  {st.nombreCompleto || `${st.nombre} ${st.apellido}`}
                </span>
                <span className="text-[10px] text-left text-slate-500 font-mono">
                  {st.studentID_login} · {st.curso}{st.division ? ` - División ${st.division}` : ''}
                </span>
              </div>
              <button
                type="button"
                data-testid={`${buttonTestIdPrefix}-${st.id}`}
                onClick={() => onSelectStudent?.(st)}
                className={`px-2.5 py-1.5 ${buttonBgColor} text-white rounded-lg font-bold text-[11px] shrink-0 cursor-pointer flex items-center gap-1 shadow-2xs`}
              >
                <span className="material-symbols-outlined text-[14px]">{buttonIcon}</span>
                <span>{buttonLabel}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default DashboardStudentQuickSearch;
