import React from 'react';
import { RBAC_ROLES } from './userRbacConstants';

const RoleTabs = ({ activeRole, onSelectRole, roleCounts }) => {
  const tabs = [
    {
      id: 'Todos',
      name: 'Todos los Roles',
      shortName: 'Todos',
      icon: 'groups',
      count: roleCounts.Todos || 0,
    },
    ...RBAC_ROLES.map((r) => ({
      id: r.id,
      name: r.displayName,
      shortName: r.name,
      icon: r.icon,
      count: roleCounts[r.id] || 0,
    })),
  ];

  return (
    <div className="w-full overflow-x-auto scrollbar-none pb-1">
      <div
        data-testid="role-tabs-container"
        className="flex items-center gap-2 p-1.5 bg-slate-200/60 backdrop-blur-md rounded-2xl border border-slate-200/80 w-max min-w-full sm:min-w-0"
      >
        {tabs.map((tab) => {
          const isActive = activeRole === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectRole(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 duration-150 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50 border border-slate-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[18px] transition-colors ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                {tab.icon}
              </span>
              <span>{tab.shortName}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    : 'bg-slate-300/60 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleTabs;
