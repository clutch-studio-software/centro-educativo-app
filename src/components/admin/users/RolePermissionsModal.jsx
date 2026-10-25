import React, { useState } from 'react';
import {
  RBAC_ROLES,
  PERMISSION_MODULES,
  DEFAULT_ROLE_PERMISSIONS,
  getRoleBadge,
} from './userRbacConstants';

const EMPTY_ROLE_PERMISSIONS = {};

const RolePermissionsHeaderBar = ({
  selectedRole,
  onSelectRole,
  localPermissions,
  filterQuery,
  onFilterChange,
  roleBadge,
  currentRolePermsCount,
  totalAvailablePerms,
  onResetToDefaults,
}) => {
  return (
    <>
      {/* Selector de Rol y Barra de Estado */}
      <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        {/* Selector de pestañas de rol */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {RBAC_ROLES.map((role) => {
            const isSelected = selectedRole === role.id;
            const permsCount = (localPermissions[role.id] || []).length;

            return (
              <button
                key={role.id}
                type="button"
                onClick={() => onSelectRole(role.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap active:scale-95 ${isSelected
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${isSelected ? 'text-blue-600' : 'text-slate-400'
                    }`}
                >
                  {role.icon}
                </span>
                <span>{role.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${isSelected
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-slate-200 text-slate-600'
                    }`}
                >
                  {permsCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Buscador de permisos en el modal */}
        <div className="relative min-w-[220px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
            search
          </span>
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => onFilterChange(e.target.value)}
            placeholder="Buscar permiso..."
            className="w-full pl-8 pr-3 py-1.5 bg-white rounded-full text-xs font-medium text-slate-800 placeholder:text-slate-400 border border-slate-200 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Resumen del Rol Seleccionado */}
      <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleBadge.badgeClass}`}
          >
            <span className="material-symbols-outlined text-[15px]">{roleBadge.icon}</span>
            <span>{roleBadge.label}</span>
          </span>
          <span className="text-xs text-slate-500">
            <strong className="text-slate-800 font-bold">{currentRolePermsCount}</strong> de{' '}
            {totalAvailablePerms} privilegios habilitados
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetToDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 rounded-full text-[11px] font-bold border border-slate-200 hover:border-amber-200 transition-colors cursor-pointer"
            title="Restaurar la configuración predeterminada del rol"
          >
            <span className="material-symbols-outlined text-[14px]">restart_alt</span>
            <span>Restablecer por defecto</span>
          </button>
        </div>
      </div>
    </>
  );
};

const RolePermissionModuleCard = ({
  module,
  currentRolePermsSet,
  onToggleModule,
  onTogglePermission,
}) => {
  const modulePermIds = module.permissions.map((p) => p.id);
  const enabledInModule = modulePermIds.filter((id) =>
    currentRolePermsSet.has(id)
  );
  const allEnabled =
    modulePermIds.length > 0 &&
    enabledInModule.length === modulePermIds.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
      {/* Encabezado del módulo */}
      <div className="px-5 py-3.5 text-start bg-slate-50/90 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-blue-600">
            {module.icon}
          </span>
          <div>
            <p className="text-[14px] font-extrabold text-slate-900">
              {module.title}
            </p>
            <p className="text-[11px] text-slate-500">
              {module.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-slate-500 mr-1">
            {enabledInModule.length} de {modulePermIds.length} activos
          </span>
          <button
            type="button"
            onClick={() => onToggleModule(modulePermIds, !allEnabled)}
            className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
          >
            {allEnabled ? 'Desactivar todos' : 'Activar todos'}
          </button>
        </div>
      </div>

      {/* Lista de permisos dentro del módulo */}
      <div className="p-3 divide-y divide-slate-100">
        {module.permissions.map((perm) => {
          const isChecked = currentRolePermsSet.has(perm.id);

          return (
            <div
              key={perm.id}
              onClick={() => onTogglePermission(perm.id)}
              className="p-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 text-start rounded-md transition-colors cursor-pointer group"
            >
              <div className="flex flex-col pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {perm.label}
                  </span>
                  <span className="font-mono text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    {perm.id}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  {perm.description}
                </span>
              </div>

              {/* Toggle Switch */}
              <div className="shrink-0 pt-0.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isChecked}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePermission(perm.id);
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isChecked ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isChecked ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RolePermissionsModalContent = ({
  initialRole = 'Directivo',
  rolePermissions = EMPTY_ROLE_PERMISSIONS,
  onClose,
  onSavePermissions,
}) => {
  const [selectedRole, setSelectedRole] = useState(initialRole || 'Directivo');
  const [localPermissions, setLocalPermissions] = useState(() => ({ ...rolePermissions }));
  const [isSaving, setIsSaving] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const currentRolePerms = localPermissions[selectedRole] || [];
  const currentRolePermsSet = new Set(currentRolePerms);
  const roleConfig = RBAC_ROLES.find((r) => r.id === selectedRole) || RBAC_ROLES[0];
  const roleBadge = getRoleBadge(selectedRole);

  // Conteo total de permisos posibles
  const totalAvailablePerms = PERMISSION_MODULES.reduce(
    (acc, mod) => acc + mod.permissions.length,
    0
  );

  const handleTogglePermission = (permId) => {
    setLocalPermissions((prev) => {
      const perms = prev[selectedRole] || [];
      const hasPerm = perms.includes(permId);
      const newPerms = hasPerm
        ? perms.filter((id) => id !== permId)
        : [...perms, permId];

      return {
        ...prev,
        [selectedRole]: newPerms,
      };
    });
  };

  const handleToggleModule = (modulePermIds, enable) => {
    setLocalPermissions((prev) => {
      const perms = new Set(prev[selectedRole] || []);
      modulePermIds.forEach((id) => {
        if (enable) {
          perms.add(id);
        } else {
          perms.delete(id);
        }
      });
      return {
        ...prev,
        [selectedRole]: Array.from(perms),
      };
    });
  };

  const handleResetToDefaults = () => {
    const defaultForRole = DEFAULT_ROLE_PERMISSIONS[selectedRole] || [];
    setLocalPermissions((prev) => ({
      ...prev,
      [selectedRole]: [...defaultForRole],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSavePermissions(localPermissions, selectedRole);
      onClose();
    } catch (err) {
      console.error('Error guardando permisos:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtrado de módulos y permisos según búsqueda
  const filteredModules = PERMISSION_MODULES.map((mod) => {
    if (!filterQuery) return mod;
    const q = filterQuery.toLowerCase();
    const matchedPerms = mod.permissions.filter(
      (p) =>
        p.label.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        mod.title.toLowerCase().includes(q)
    );
    return {
      ...mod,
      permissions: matchedPerms,
    };
  }).filter((mod) => mod.permissions.length > 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-permissions-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <span className="material-symbols-outlined text-[24px]">tune</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="role-permissions-title" className="text-base sm:text-lg font-extrabold text-slate-900">
                  Matriz de Permisos por Rol (RBAC)
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Seguridad Institucional
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Define las capacidades, autorizaciones y módulos accesibles para cada perfil de usuario.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <RolePermissionsHeaderBar
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          localPermissions={localPermissions}
          filterQuery={filterQuery}
          onFilterChange={setFilterQuery}
          roleBadge={roleBadge}
          currentRolePermsCount={currentRolePerms.length}
          totalAvailablePerms={totalAvailablePerms}
          onResetToDefaults={handleResetToDefaults}
        />

        {/* Contenido scrolleable con categorías de permisos */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/40">
          {filteredModules.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No se encontraron permisos que coincidan con &quot;{filterQuery}&quot;.
            </div>
          ) : (
            filteredModules.map((module) => (
              <RolePermissionModuleCard
                key={module.id}
                module={module}
                currentRolePermsSet={currentRolePermsSet}
                onToggleModule={handleToggleModule}
                onTogglePermission={handleTogglePermission}
              />
            ))
          )}
        </div>

        {/* Footer con botones de acción */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Los cambios en <strong className="text-slate-800 font-bold">{roleConfig.name}</strong> se aplicarán a todos los usuarios con este rol.
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  <span>Guardando matriz...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Guardar Permisos de {roleConfig.name}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RolePermissionsModal = ({
  isOpen,
  initialRole = 'Directivo',
  rolePermissions = EMPTY_ROLE_PERMISSIONS,
  onClose,
  onSavePermissions,
}) => {
  if (!isOpen) return null;

  return (
    <RolePermissionsModalContent
      key={initialRole || 'role-permissions'}
      initialRole={initialRole}
      rolePermissions={rolePermissions}
      onClose={onClose}
      onSavePermissions={onSavePermissions}
    />
  );
};

export default RolePermissionsModal;
