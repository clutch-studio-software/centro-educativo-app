import React, { useState, useRef, useEffect } from 'react';
import {
  getRoleBadge,
  getStatusBadge,
  getAvatarGradient,
  getInitials,
} from './userRbacConstants';

const UserFloatingMenu = ({
  activeUser,
  menuRef,
  menuPosition,
  setActiveMenuUserId,
  onEditUser,
  onResetPassword,
  onToggleStatus,
  onDeleteUser,
  onOpenPermissionsModal,
}) => {
  if (!activeUser) return null;

  const isSuspendido = activeUser.estado === 'Suspendido' || activeUser.estado === 'Inactivo';

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${menuPosition.top}px`,
        right: `${menuPosition.right}px`,
        zIndex: 9999,
      }}
      className="w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-1.5 animate-in fade-in zoom-in-95 duration-150 text-left divide-y divide-slate-100"
    >
      <div className="py-1">
        {/* Modificar datos */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const target = activeUser;
            setActiveMenuUserId(null);
            onEditUser(target);
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-[18px] text-blue-600">edit</span>
          <div className="flex flex-col items-start leading-tight">
            <span>Modificar datos</span>
            <span className="text-[10px] font-normal text-slate-400">
              Editar contacto, cargo y rol
            </span>
          </div>
        </button>

        {/* Ver/Configurar permisos del rol */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const role = activeUser.role;
            setActiveMenuUserId(null);
            onOpenPermissionsModal(role);
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-[18px] text-amber-500">tune</span>
          <div className="flex flex-col items-start leading-tight">
            <span>Permisos del Rol</span>
            <span className="text-[10px] font-normal text-slate-400">
              Ver matriz de accesos de {activeUser.role}
            </span>
          </div>
        </button>

        {/* Restablecer contraseña */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const target = activeUser;
            setActiveMenuUserId(null);
            onResetPassword(target);
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-[18px] text-amber-500">lock_reset</span>
          <div className="flex flex-col items-start leading-tight">
            <span>Restablecer clave</span>
            <span className="text-[10px] font-normal text-slate-400">
              Contraseña inicial a su DNI
            </span>
          </div>
        </button>
      </div>

      {/* Cambiar estado */}
      <div className="py-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const target = activeUser;
            setActiveMenuUserId(null);
            onToggleStatus(target);
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              isSuspendido ? 'text-emerald-600' : 'text-slate-500'
            }`}
          >
            {isSuspendido ? 'toggle_on' : 'toggle_off'}
          </span>
          <div className="flex flex-col items-start leading-tight">
            <span>{isSuspendido ? 'Habilitar usuario' : 'Suspender usuario'}</span>
            <span className="text-[10px] font-normal text-slate-400">
              {isSuspendido ? 'Restaurar acceso al portal' : 'Bloquear acceso al sistema'}
            </span>
          </div>
        </button>
      </div>

      {/* Eliminar usuario */}
      <div className="py-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const target = activeUser;
            setActiveMenuUserId(null);
            onDeleteUser(target);
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border-none bg-transparent"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
          <div className="flex flex-col items-start leading-tight">
            <span>Dar de baja definitiva</span>
            <span className="text-[10px] font-normal text-rose-400">
              Eliminar cuenta y credenciales
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

const UserTable = ({
  users = [],
  rolePermissions = {},
  isLoading = false,
  onEditUser,
  onToggleStatus,
  onResetPassword,
  onDeleteUser,
  onOpenPermissionsModal,
  onResetFilters,
}) => {
  const [activeMenuUserId, setActiveMenuUserId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const menuRef = useRef(null);

  // Cerrar menú al hacer clic afuera o scroll
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuUserId(null);
      }
    };
    const handleScroll = () => {
      setActiveMenuUserId(null);
    };

    if (activeMenuUserId) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [activeMenuUserId]);

  const activeUser = users.find((u) => u.id === activeMenuUserId);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-3 animate-spin">
          <span className="material-symbols-outlined text-[24px]">sync</span>
        </div>
        <p className="text-xs font-bold text-slate-700">Cargando usuarios institucionales...</p>
        <p className="text-[11px] text-slate-400 mt-1">Sincronizando cuentas y roles RBAC</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-400 mb-3">
          <span className="material-symbols-outlined text-[28px]">search_off</span>
        </div>
        <h3 className="text-sm font-bold text-slate-800">No se encontraron usuarios</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          No hay usuarios que coincidan con los filtros aplicados o no hay miembros registrados en este rol.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-xs font-bold transition-all cursor-pointer"
          >
            Limpiar filtros de búsqueda
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] uppercase tracking-wider font-extrabold text-slate-500">
              <th className="py-3.5 px-6">Usuario & Legajo</th>
              <th className="py-3.5 px-6">DNI & Contacto</th>
              <th className="py-3.5 px-6">Rol Institucional</th>
              <th className="py-3.5 px-6">Permisos</th>
              <th className="py-3.5 px-6">Estado</th>
              <th className="py-3.5 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {users.map((user) => {
              const roleBadge = getRoleBadge(user.role);
              const statusBadge = getStatusBadge(user.estado);
              const initials = getInitials(user.nombre, user.apellido);
              const gradient = getAvatarGradient(user.id);
              const isMenuOpen = activeMenuUserId === user.id;

              // Total permisos del rol
              const rolePerms = rolePermissions[user.role] || [];
              const permsCount = rolePerms.length;

              return (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Usuario & Legajo */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-tr ${gradient} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
                      >
                        {initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {user.nombreCompleto || `${user.nombre} ${user.apellido}`.trim()}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {user.legajo}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* DNI & Contacto */}
                  <td className="py-3.5 px-6">
                    <div className="flex flex-col leading-tight">
                      <span className="font-semibold text-slate-700">DNI {user.dni}</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        {user.telefono || 'Sin teléfono registrado'}
                      </span>
                      <span className="text-[10px] text-slate-400 italic">
                        {user.cargo || `Personal ${user.role}`}
                      </span>
                    </div>
                  </td>

                  {/* Rol Institucional */}
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${roleBadge.badgeClass}`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {roleBadge.icon}
                      </span>
                      <span>{roleBadge.label}</span>
                    </span>
                  </td>

                  {/* Permisos */}
                  <td className="py-3.5 px-6">
                    <div className="flex flex-col items-start gap-1">
                      <button
                        type="button"
                        onClick={() => onOpenPermissionsModal(user.role)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-full text-[11px] font-bold border border-slate-200 hover:border-blue-200 transition-all cursor-pointer"
                        title="Ver matriz de permisos de este rol"
                      >
                        <span className="material-symbols-outlined text-[14px] text-blue-600">
                          shield
                        </span>
                        <span>{permsCount} permisos activos</span>
                      </button>
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="py-3.5 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadge.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotClass}`} />
                      <span>{statusBadge.label}</span>
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="py-3.5 px-6 text-right">
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isMenuOpen) {
                            setActiveMenuUserId(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setMenuPosition({
                              top: rect.bottom + 6,
                              right: window.innerWidth - rect.right,
                            });
                            setActiveMenuUserId(user.id);
                          }
                        }}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isMenuOpen
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-transparent hover:border-slate-200'
                        }`}
                        title="Opciones de usuario"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          more_vert
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Menú flotante de acciones */}
      <UserFloatingMenu
        activeUser={activeUser}
        menuRef={menuRef}
        menuPosition={menuPosition}
        setActiveMenuUserId={setActiveMenuUserId}
        onEditUser={onEditUser}
        onResetPassword={onResetPassword}
        onToggleStatus={onToggleStatus}
        onDeleteUser={onDeleteUser}
        onOpenPermissionsModal={onOpenPermissionsModal}
      />
    </div>
  );
};

export default UserTable;
