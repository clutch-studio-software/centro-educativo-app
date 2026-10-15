import React from 'react';

export const AcademicTabsNav = ({
  levels,
  coursesByLevel,
  activeTab,
  onSelectTab,
  subjectsCount,
}) => {
  return (
    <div className="mt-6 border-b border-slate-200/80 flex items-center justify-between">
      <div
        className="flex space-x-2 sm:space-x-4 text-sm font-semibold overflow-x-auto pb-px"
        data-purpose="tab-navigation"
      >
        {levels.map((level) => {
          const count = (coursesByLevel[level.id] || []).length;
          const isActive = activeTab === level.id;
          return (
            <button
              key={level.id}
              type="button"
              id={`tabBtn-${level.id}`}
              data-testid={`tab-${level.id}`}
              onClick={() => onSelectTab(level.id)}
              className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all font-semibold text-sm cursor-pointer whitespace-nowrap bg-transparent ${
                isActive
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {level.id === 'inicial'
                  ? 'toys'
                  : level.id === 'primario'
                  ? 'school'
                  : 'history_edu'}
              </span>
              <span>{level.name}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                {count} {level.id === 'inicial' ? 'Salas' : 'Divisiones'}
              </span>
            </button>
          );
        })}

        <button
          type="button"
          id="tabBtnPlanes"
          data-testid="tab-planes-materias"
          onClick={() => onSelectTab('planes')}
          className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all font-semibold text-sm cursor-pointer whitespace-nowrap bg-transparent ${
            activeTab === 'planes'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">menu_book</span>
          <span>Planes de Materias</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500 font-semibold border border-slate-200">
            {subjectsCount} Materias
          </span>
        </button>
      </div>
    </div>
  );
};

export default AcademicTabsNav;
