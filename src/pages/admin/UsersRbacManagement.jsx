import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminToast from '../../components/admin/AdminToast';
import AdminSectionTitle from '../../components/admin/AdminSectionTitle';
import AdminTablePagination from '../../components/admin/AdminTablePagination';
import RoleTabs from '../../components/admin/users/RoleTabs';
import RoleSummaryBanner from '../../components/admin/users/RoleSummaryBanner';
import UserFilters from '../../components/admin/users/UserFilters';
import UserTable from '../../components/admin/users/UserTable';
import NewUserModal from '../../components/admin/users/NewUserModal';
import EditUserModal from '../../components/admin/users/EditUserModal';
import RolePermissionsModal from '../../components/admin/users/RolePermissionsModal';
import {
  fetchRbacUsersApi,
  createRbacUserApi,
  updateRbacUserApi,
  toggleRbacUserStatusApi,
  resetRbacUserPasswordApi,
  deleteRbacUserApi,
  fetchRolePermissionsApi,
  saveRolePermissionsApi,
  exportUsersCsv,
  ensureAdminAuth,
} from '../../services/usersRbacService';
import { auth } from '../../services/firebase';

const PAGE_SIZE = 6;

const UsersManagementHeader = ({
  onExportCsv,
  onOpenNewUserModal,
  onOpenPermissionsModal,
}) => (
  <section data-testid="rbac-management-header" className="flex flex-col gap-4">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <AdminSectionTitle
        icon="admin_panel_settings"
        title="Usuarios & Roles Institucionales (RBAC)"
        subtitle="Administración integral de cuentas por rol: Directivo, Administrativo, Docente, Enfermería y Preceptoría."
      />

      <div data-testid="buttons-actions-rbac" className="flex flex-wrap items-center gap-3">
        {/* Botón Matriz de Permisos */}
        <button
          type="button"
          onClick={() => onOpenPermissionsModal('Directivo')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-slate-700 hover:bg-slate-50 transition-colors rounded-full font-semibold text-xs border border-slate-200 shadow-xs h-10 active:scale-95 duration-200 text-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] text-blue-600">tune</span>
          <span>Matriz de Permisos</span>
        </button>

        {/* Botón Exportar Nómina */}
        <button
          type="button"
          onClick={onExportCsv}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-slate-700 hover:bg-slate-50 transition-colors rounded-full font-semibold text-xs border border-slate-200 shadow-xs h-10 active:scale-95 duration-200 text-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] text-amber-500">
            file_download
          </span>
          <span>Exportar Nómina</span>
        </button>

        {/* Botón Registrar Usuario */}
        <button
          type="button"
          onClick={onOpenNewUserModal}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all rounded-full font-bold text-xs shadow-[0_4px_14px_rgba(11,80,213,0.3)] hover:shadow-lg active:scale-95 h-10 duration-200 text-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px] text-emerald-300">
            person_add
          </span>
          <span>Registrar Usuario</span>
        </button>
      </div>
    </div>
  </section>
);


const UsersRbacModals = ({
  isNewUserModalOpen,
  activeRole,
  onCloseNewUserModal,
  onCreateUser,
  editingUser,
  rolePermissions,
  onCloseEditUser,
  onSaveEditUser,
  permissionsModalRole,
  onClosePermissionsModal,
  onSavePermissions,
}) => (
  <>
    <NewUserModal
      isOpen={isNewUserModalOpen}
      activeRole={activeRole}
      onClose={onCloseNewUserModal}
      onSubmit={onCreateUser}
    />

    <EditUserModal
      isOpen={Boolean(editingUser)}
      user={editingUser}
      rolePermissions={rolePermissions}
      onClose={onCloseEditUser}
      onSave={onSaveEditUser}
    />

    <RolePermissionsModal
      isOpen={Boolean(permissionsModalRole)}
      initialRole={permissionsModalRole || 'Directivo'}
      rolePermissions={rolePermissions}
      onClose={onClosePermissionsModal}
      onSavePermissions={onSavePermissions}
    />
  </>
);

const useUsersRbacState = () => {
  // Estado de Datos
  const [users, setUsers] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Tab activo de Rol ('Todos' | 'Directivo' | 'Administrativo' | 'Docente' | 'Enfermeria' | 'Preceptoria')
  const [activeRole, setActiveRole] = useState('Todos');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);

  // Modales
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [permissionsModalRole, setPermissionsModalRole] = useState(null);

  // Notificación flotante Toast
  const [notification, setNotification] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  // Cargar datos desde Firebase / LocalStorage
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      await ensureAdminAuth();
      const [loadedUsers, loadedPermissions] = await Promise.all([
        fetchRbacUsersApi(),
        fetchRolePermissionsApi(),
      ]);
      setUsers(loadedUsers);
      setRolePermissions(loadedPermissions);
    } catch (err) {
      console.error('Error cargando datos de RBAC:', err);
      showToast('Error al conectar con la base de datos de usuarios.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Auth check inicial
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        await ensureAdminAuth();
        if (isMounted) {
          loadData();
        }
      } catch (err) {
        console.warn('Verificación de admin:', err.message);
      }
    };

    checkAuth();

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && isMounted) {
        loadData();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [loadData]);

  // Conteos por rol para los badges de las pestañas
  const roleCounts = useMemo(() => {
    const counts = {
      Todos: users.length,
      Directivo: 0,
      Administrativo: 0,
      Docente: 0,
      Enfermeria: 0,
      Preceptoria: 0,
    };

    users.forEach((u) => {
      if (counts[u.role] !== undefined) {
        counts[u.role] += 1;
      }
    });

    return counts;
  }, [users]);

  // Lógica de Filtrado
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Filtro por Rol según pestaña activa
      if (activeRole !== 'Todos' && u.role !== activeRole) {
        return false;
      }

      // 2. Filtro de búsqueda en texto
      if (searchTerm) {
        const query = searchTerm.toLowerCase().trim();
        const matchesNombre = (u.nombre || '').toLowerCase().includes(query);
        const matchesApellido = (u.apellido || '').toLowerCase().includes(query);
        const matchesCompleto = (u.nombreCompleto || '').toLowerCase().includes(query);
        const matchesEmail = (u.email || '').toLowerCase().includes(query);
        const matchesDni = (u.dni || '').replace(/\./g, '').includes(query.replace(/\./g, ''));
        const matchesLegajo = (u.legajo || '').toLowerCase().includes(query);
        const matchesCargo = (u.cargo || '').toLowerCase().includes(query);
        const matchesCondicion = (u.condicion || '').toLowerCase().includes(query);

        if (
          !matchesNombre &&
          !matchesApellido &&
          !matchesCompleto &&
          !matchesEmail &&
          !matchesDni &&
          !matchesLegajo &&
          !matchesCargo &&
          !matchesCondicion
        ) {
          return false;
        }
      }

      // 3. Filtro por Estado
      if (selectedEstado) {
        if (String(u.estado || '').toLowerCase() !== selectedEstado.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [users, activeRole, searchTerm, selectedEstado]);

  // Reiniciar página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [activeRole, searchTerm, selectedEstado]);

  // Paginación
  const totalItems = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedEstado('');
  };

  // --- Handlers de Acciones de Usuario ---

  const handleCreateUser = async (userData) => {
    try {
      const created = await createRbacUserApi(userData);
      setUsers((prev) => [created, ...prev]);
      showToast(
        `¡Usuario ${created.nombreCompleto || created.nombre} registrado con legajo ${created.legajo}!`,
        'success'
      );
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      showToast(err.message || 'Error al registrar usuario en Firebase.', 'error');
      throw err;
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const handleSaveEditUser = async (userId, userData) => {
    try {
      const updated = await updateRbacUserApi(userId, userData);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
      showToast(
        `¡Datos de ${updated.nombreCompleto || updated.nombre} actualizados con éxito!`,
        'success'
      );
      setEditingUser(null);
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      showToast('Error al actualizar datos del usuario.', 'error');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const { user: updated, nuevoEstado } = await toggleRbacUserStatusApi(user.id);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));

      if (nuevoEstado === 'Suspendido') {
        showToast(
          `El usuario ${user.nombreCompleto || user.nombre} fue suspendido del sistema.`,
          'info'
        );
      } else {
        showToast(
          `El usuario ${user.nombreCompleto || user.nombre} fue habilitado como ${nuevoEstado}.`,
          'success'
        );
      }
    } catch (err) {
      console.error('Error al cambiar estado del usuario:', err);
      showToast('No se pudo cambiar el estado del usuario.', 'error');
    }
  };

  const handleResetPassword = async (user) => {
    try {
      const result = await resetRbacUserPasswordApi(user.id);
      showToast(
        `Contraseña restablecida al DNI (${result.dni}) para ${result.nombre}.`,
        'success'
      );
    } catch (err) {
      console.error('Error al restablecer contraseña:', err);
      showToast('Error al restablecer contraseña.', 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    const displayName = user.nombreCompleto || `${user.nombre} ${user.apellido || ''}`;
    const confirmed = window.confirm(
      `¿Confirmas la baja y eliminación definitiva de la cuenta de ${displayName} (${user.legajo})?\n\nEsta acción revocará sus accesos y permisos en el sistema.`
    );
    if (!confirmed) return;

    try {
      await deleteRbacUserApi(user.id, user.email);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      showToast(`Cuenta de ${displayName} eliminada definitivamente.`, 'success');
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      showToast('No se pudo eliminar el usuario.', 'error');
    }
  };

  const handleExportCsv = () => {
    exportUsersCsv(filteredUsers, activeRole);
    showToast(`Exportando nómina de usuarios (${activeRole}) en formato CSV...`, 'info');
  };

  // --- Handlers de Matriz de Permisos RBAC ---

  const handleOpenPermissionsModal = (roleToConfigure = 'Directivo') => {
    const targetRole = roleToConfigure === 'Todos' ? 'Directivo' : roleToConfigure;
    setPermissionsModalRole(targetRole);
  };

  const handleSavePermissions = async (updatedPermissions, roleConfigured) => {
    try {
      const saved = await saveRolePermissionsApi(updatedPermissions);
      setRolePermissions(saved);
      showToast(
        `¡Matriz de permisos de ${roleConfigured} actualizada exitosamente!`,
        'success'
      );
    } catch (err) {
      console.error('Error guardando matriz de permisos:', err);
      showToast('No se pudo guardar la configuración de permisos.', 'error');
    }
  };

  return {
    notification,
    setNotification,
    activeRole,
    setActiveRole,
    roleCounts,
    rolePermissions,
    searchTerm,
    setSearchTerm,
    selectedEstado,
    setSelectedEstado,
    handleResetFilters,
    isLoading,
    currentUsers,
    totalItems,
    totalPages,
    startIndex,
    currentPage,
    setCurrentPage,
    handleEditUser,
    handleToggleStatus,
    handleResetPassword,
    handleDeleteUser,
    handleOpenPermissionsModal,
    handleExportCsv,
    isNewUserModalOpen,
    setIsNewUserModalOpen,
    handleCreateUser,
    editingUser,
    setEditingUser,
    handleSaveEditUser,
    permissionsModalRole,
    setPermissionsModalRole,
    handleSavePermissions,
  };
};

const UsersRbacManagement = () => {
  const {
    notification,
    setNotification,
    activeRole,
    setActiveRole,
    roleCounts,
    rolePermissions,
    searchTerm,
    setSearchTerm,
    selectedEstado,
    setSelectedEstado,
    handleResetFilters,
    isLoading,
    currentUsers,
    totalItems,
    totalPages,
    startIndex,
    currentPage,
    setCurrentPage,
    handleEditUser,
    handleToggleStatus,
    handleResetPassword,
    handleDeleteUser,
    handleOpenPermissionsModal,
    handleExportCsv,
    isNewUserModalOpen,
    setIsNewUserModalOpen,
    handleCreateUser,
    editingUser,
    setEditingUser,
    handleSaveEditUser,
    permissionsModalRole,
    setPermissionsModalRole,
    handleSavePermissions,
  } = useUsersRbacState();

  return (
    <AdminLayout activeItem="usuarios" breadcrumbs={['Administración', 'Usuarios & Roles (RBAC)']}>
      <div className="flex flex-col w-full gap-6">
        {/* Notificación Flotante Toast */}
        <AdminToast notification={notification} onClose={() => setNotification(null)} />

        {/* Encabezado Principal y Acciones */}
        <UsersManagementHeader
          onExportCsv={handleExportCsv}
          onOpenNewUserModal={() => setIsNewUserModalOpen(true)}
          onOpenPermissionsModal={handleOpenPermissionsModal}
        />

        {/* Barra de Pestañas por Rol (Directivo, Administrativo, Docente, Enfermería, Preceptoría) */}
        <RoleTabs
          activeRole={activeRole}
          onSelectRole={setActiveRole}
          roleCounts={roleCounts}
        />

        {/* Banner Contextual del Rol Seleccionado */}
        <RoleSummaryBanner
          activeRole={activeRole}
          rolePermissions={rolePermissions}
          onOpenPermissionsModal={handleOpenPermissionsModal}
        />

        {/* Filtros de Búsqueda y Estado */}
        <UserFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedEstado={selectedEstado}
          onEstadoChange={setSelectedEstado}
          onResetFilters={handleResetFilters}
        />

        {/* Indicador de sincronización en segundo plano */}
        {isLoading && (
          <div
            data-testid="users-sync-indicator"
            className="flex items-center gap-2 text-xs font-bold text-blue-800 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/80 w-fit"
          >
            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
            <span>Sincronizando cuentas y permisos RBAC...</span>
          </div>
        )}

        {/* Tabla de Usuarios y Paginación */}
        <div className="flex flex-col gap-0">
          <UserTable
            users={currentUsers}
            rolePermissions={rolePermissions}
            isLoading={isLoading}
            onEditUser={handleEditUser}
            onToggleStatus={handleToggleStatus}
            onResetPassword={handleResetPassword}
            onDeleteUser={handleDeleteUser}
            onOpenPermissionsModal={handleOpenPermissionsModal}
            onResetFilters={handleResetFilters}
          />

          <AdminTablePagination
            isLoading={isLoading}
            totalItems={totalItems}
            startIndex={startIndex}
            pageSize={PAGE_SIZE}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemLabel="usuarios registrados"
          />
        </div>

        {/* Modales */}
        <UsersRbacModals
          isNewUserModalOpen={isNewUserModalOpen}
          activeRole={activeRole}
          onCloseNewUserModal={() => setIsNewUserModalOpen(false)}
          onCreateUser={handleCreateUser}
          editingUser={editingUser}
          rolePermissions={rolePermissions}
          onCloseEditUser={() => setEditingUser(null)}
          onSaveEditUser={handleSaveEditUser}
          permissionsModalRole={permissionsModalRole}
          onClosePermissionsModal={() => setPermissionsModalRole(null)}
          onSavePermissions={handleSavePermissions}
        />
      </div>
    </AdminLayout>
  );
};

export default UsersRbacManagement;
