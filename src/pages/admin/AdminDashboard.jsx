import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminToast from '../../components/admin/AdminToast';
import { usePermissions } from '../../hooks/usePermissions';
import { fetchAdminDashboardData } from '../../services/adminService';
import { fetchTeachersApi } from '../../services/teachersService';
import DashboardDirectivoView from '../../components/admin/dashboard/DashboardDirectivoView';
import DashboardEnfermeriaView from '../../components/admin/dashboard/DashboardEnfermeriaView';
import DashboardPreceptoriaView from '../../components/admin/dashboard/DashboardPreceptoriaView';
import DashboardDocenteView from '../../components/admin/dashboard/DashboardDocenteView';
import BroadcastNotificationModal from '../../components/admin/dashboard/BroadcastNotificationModal';
import {
  computeEnrollmentStats,
  getRecentEnfermeriaEntries,
  getRecentPreceptoriaEntries,
} from '../../components/admin/dashboard/dashboardUtils';

const AdminDashboard = () => {
  const {
    user,
    role,
    isDirectivo,
    isAdministrativo,
    isDocente,
    isEnfermeria,
    isPreceptoria,
  } = usePermissions();

  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashData, teachersData] = await Promise.all([
        fetchAdminDashboardData(),
        fetchTeachersApi().catch(() => []),
      ]);

      setStudents(dashData.students || []);
      setTeachers(teachersData || []);
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      setNotification({
        type: 'error',
        message: 'No se pudieron sincronizar todos los datos del dashboard.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const stats = useMemo(() => computeEnrollmentStats(students), [students]);
  const recentEnfermeriaEntries = useMemo(
    () => getRecentEnfermeriaEntries(students),
    [students]
  );
  const recentPreceptoriaEntries = useMemo(
    () => getRecentPreceptoriaEntries(students),
    [students]
  );

  const handleBroadcastSuccess = useCallback((result) => {
    const docsCount = result?.stats?.firestoreDocsCreated ?? 0;
    const pushCount = result?.stats?.pushSentCount ?? 0;
    setNotification({
      type: 'success',
      message: `Aviso institucional enviado: ${docsCount} notificaciones registradas y ${pushCount} push enviados.`,
    });
  }, []);

  const canSendBroadcast = isDirectivo || isAdministrativo;
  const headerActions = canSendBroadcast ? (
    <button
      type="button"
      data-testid="open-broadcast-notification-btn"
      onClick={() => setIsBroadcastModalOpen(true)}
      className="min-h-10 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer border-none"
    >
      <span className="material-symbols-outlined text-[18px]">campaign</span>
      <span className="hidden sm:inline">Aviso Institucional</span>
    </button>
  ) : null;

  return (
    <AdminLayout
      activeItem="dashboard"
      breadcrumbs={['Dashboard General']}
      headerActions={headerActions}
    >
      <div data-testid="admin-dashboard-page" className="flex flex-col w-full gap-6">
        <AdminToast notification={notification} onClose={() => setNotification(null)} />

        {isLoading && (
          <div
            data-testid="dashboard-loading-indicator"
            className="flex items-center gap-2 text-xs font-bold text-blue-800 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/80 w-fit"
          >
            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
            <span>Cargando métricas e información institucional...</span>
          </div>
        )}

        {isEnfermeria && (
          <DashboardEnfermeriaView
            students={students}
            recentEntries={recentEnfermeriaEntries}
            onRefreshData={loadData}
            isLoading={isLoading}
            user={user}
          />
        )}

        {isPreceptoria && (
          <DashboardPreceptoriaView
            students={students}
            recentEntries={recentPreceptoriaEntries}
            onRefreshData={loadData}
            isLoading={isLoading}
          />
        )}

        {isDocente && (
          <DashboardDocenteView
            user={user}
            teachers={teachers}
            isLoading={isLoading}
          />
        )}

        {(isDirectivo || isAdministrativo) && (
          <DashboardDirectivoView
            stats={stats}
            roleTitle={role}
          />
        )}
      </div>

      {canSendBroadcast && isBroadcastModalOpen && (
        <BroadcastNotificationModal
          onClose={() => setIsBroadcastModalOpen(false)}
          onSuccess={handleBroadcastSuccess}
        />
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
