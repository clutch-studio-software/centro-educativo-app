import React from 'react';
import { RBAC_ROLES, getRoleBadge } from './userRbacConstants';

const RoleSummaryBanner = ({ activeRole, rolePermissions = {}, onOpenPermissionsModal }) => {
  const roleConfig = RBAC_ROLES.find((r) => r.id === activeRole);
  const badgeInfo = getRoleBadge(activeRole);
  const currentPermissions = roleConfig ? rolePermissions[activeRole] || [] : [];

  if (activeRole === 'Todos') {
    return (
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-sm border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/15">
            <span className="material-symbols-outlined text-[24px] text-blue-400">
              admin_panel_settings
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">
                Control Global de Accesos Basado en Roles (RBAC)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                5 Roles Activos
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Administración unificada del personal institucional: Directivos, Administrativos, Docentes, Enfermería y Preceptoría.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenPermissionsModal('Directivo')}
          className="shrink-0 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-amber-400">tune</span>
          <span>Matriz de Permisos RBAC</span>
        </button>
      </div>
    );
  }

  if (!roleConfig) return null;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-start md:items-center gap-3.5">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${roleConfig.gradient} text-white flex items-center justify-center shrink-0 shadow-md`}
        >
          <span className="material-symbols-outlined text-[22px]">{roleConfig.icon}</span>
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">{roleConfig.displayName}</h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${badgeInfo.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${badgeInfo.dotClass}`} />
              <span>Rol Institucional</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              {currentPermissions.length} permisos habilitados
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">{roleConfig.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
        <button
          type="button"
          onClick={() => onOpenPermissionsModal(activeRole)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold transition-all border border-slate-200 hover:border-blue-200 active:scale-95 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-blue-600">tune</span>
          <span>Configurar Permisos de {roleConfig.name}</span>
        </button>
      </div>
    </div>
  );
};

export default RoleSummaryBanner;
