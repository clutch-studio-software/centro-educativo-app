import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import TeacherFilters from '../../components/admin/teachers/TeacherFilters';
import TeacherTable from '../../components/admin/teachers/TeacherTable';
import NewTeacherModal from '../../components/admin/teachers/NewTeacherModal';
import EditTeacherModal from '../../components/admin/teachers/EditTeacherModal';
import {
  fetchTeachersApi,
  createTeacherApi,
  updateTeacherApi,
  toggleTeacherStatusApi,
  resetTeacherPasswordApi,
  deleteTeacherApi,
  exportTeachersPayrollCsv,
} from '../../services/teachersService';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const PAGE_SIZE = 5;

const TeachersManagement = () => {
  const navigate = useNavigate();

  // Teachers State
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modals State
  const [isNewTeacherModalOpen, setIsNewTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Notification State
  const [notification, setNotification] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  // Load teachers from Firebase
  const loadTeachers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchTeachersApi();
      setTeachers(data);
    } catch (err) {
      console.error('Error al cargar docentes desde Firebase:', err);
      showToast('Error al conectar con la base de datos.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Authentication check for admin panel
  useEffect(() => {
    const checkAdminAuth = async () => {
      const savedUser = localStorage.getItem('school_user');
      const currentUser = savedUser ? JSON.parse(savedUser) : null;

      if (
        currentUser &&
        (currentUser.role === 'user_admin' || currentUser.role === 'Administrador')
      ) {
        return;
      }

      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        try {
          const idTokenResult = await firebaseUser.getIdTokenResult();
          if (
            idTokenResult.claims.role === 'user_admin' ||
            idTokenResult.claims.role === 'Administrador'
          ) {
            return;
          }
        } catch {
          // Continue to redirect if claims check fails
        }
      }

      if (import.meta.env.DEV && !auth.currentUser) {
        try {
          await signInWithEmailAndPassword(
            auth,
            import.meta.env.VITE_ADMIN_EMAIL,
            import.meta.env.VITE_ADMIN_PASSWORD
          );
          loadTeachers();
          return;
        } catch (devErr) {
          console.warn('Auto-login dev admin:', devErr.message);
        }
      }

      if (!auth.currentUser && (!currentUser || currentUser.role !== 'user_admin')) {
        console.warn('Acceso denegado: Se requiere rol user_admin.');
        navigate('/login');
      }
    };

    checkAdminAuth();
  }, [navigate, loadTeachers]);

  // Real-time listener for Auth changes to reload from Firestore
  useEffect(() => {
    let isMounted = true;
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && isMounted) {
        loadTeachers();
      }
    });

    loadTeachers();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [loadTeachers]);

  // Filter Logic
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      // Text search in name, apellido, legajo, dni, especialidad, email
      if (searchTerm) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = (t.nombre || '').toLowerCase().includes(query);
        const matchesApellido = (t.apellido || '').toLowerCase().includes(query);
        const matchesCompleto = (t.nombreCompleto || '').toLowerCase().includes(query);
        const matchesLegajo = (t.legajo || '').toLowerCase().includes(query);
        const matchesDni = (t.dni || '').replace(/\./g, '').includes(query.replace(/\./g, ''));
        const matchesEspecialidad = (t.especialidad || '').toLowerCase().includes(query);
        const matchesEmail = (t.email || '').toLowerCase().includes(query);

        if (
          !matchesName &&
          !matchesApellido &&
          !matchesCompleto &&
          !matchesLegajo &&
          !matchesDni &&
          !matchesEspecialidad &&
          !matchesEmail
        ) {
          return false;
        }
      }

      // Estado filter (Titular, Suplente, Interino, Suspendido)
      if (selectedEstado) {
        if (String(t.estado || '').toLowerCase() !== selectedEstado.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [teachers, searchTerm, selectedEstado]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedEstado]);

  // Pagination calculation
  const totalItems = filteredTeachers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentTeachers = filteredTeachers.slice(startIndex, startIndex + PAGE_SIZE);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedEstado('');
  };

  // Actions
  const handleCreateTeacher = async (teacherData) => {
    try {
      const created = await createTeacherApi(teacherData);
      setTeachers((prev) => [created, ...prev]);
      showToast(
        `¡Docente ${created.nombreCompleto || created.nombre} registrado con legajo ${created.legajo}!`,
        'success'
      );
    } catch (err) {
      console.error('Error al registrar docente:', err);
      showToast('Error al registrar docente.', 'error');
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
  };

  const handleSaveEditTeacher = async (teacherId, teacherData) => {
    try {
      const updated = await updateTeacherApi(teacherId, teacherData);
      setTeachers((prev) => prev.map((t) => (t.id === teacherId ? updated : t)));
      showToast(
        `¡Datos de ${updated.nombreCompleto || updated.nombre} actualizados con éxito!`,
        'success'
      );
      setEditingTeacher(null);
    } catch (err) {
      console.error('Error al actualizar docente:', err);
      showToast('Error al actualizar datos del docente.', 'error');
    }
  };

  const handleToggleStatus = async (teacher) => {
    try {
      const { teacher: updated, nuevoEstado } = await toggleTeacherStatusApi(teacher.id);
      setTeachers((prev) => prev.map((t) => (t.id === teacher.id ? updated : t)));

      if (nuevoEstado === 'Suspendido') {
        showToast(`El docente ${teacher.nombreCompleto || teacher.nombre} fue deshabilitado (Suspendido).`, 'info');
      } else {
        showToast(`El docente ${teacher.nombreCompleto || teacher.nombre} fue habilitado como ${nuevoEstado}.`, 'success');
      }
    } catch (err) {
      console.error('Error al cambiar estado del docente:', err);
      showToast('No se pudo cambiar el estado del docente.', 'error');
    }
  };

  const handleResetPassword = async (teacher) => {
    try {
      const result = await resetTeacherPasswordApi(teacher.id);
      showToast(
        `Contraseña restablecida al DNI (${result.dni}) para ${result.nombre}.`,
        'success'
      );
    } catch (err) {
      console.error('Error al restablecer contraseña:', err);
      showToast('Error al restablecer contraseña.', 'error');
    }
  };

  const handleDeleteTeacher = async (teacher) => {
    const displayName = teacher.nombreCompleto || `${teacher.nombre} ${teacher.apellido || ''}`;
    const confirmed = window.confirm(
      `¿Confirmas la baja y eliminación definitiva del legajo de ${displayName} (${teacher.legajo})?\n\nEsta acción eliminará el registro del personal académico.`
    );
    if (!confirmed) return;

    try {
      await deleteTeacherApi(teacher.id);
      setTeachers((prev) => prev.filter((t) => t.id !== teacher.id));
      showToast(`Legajo de ${displayName} eliminado definitivamente.`, 'success');
    } catch (err) {
      console.error('Error al eliminar docente:', err);
      showToast('No se pudo eliminar el docente.', 'error');
    }
  };

  const handleExportNomina = () => {
    exportTeachersPayrollCsv(filteredTeachers);
    showToast('Exportando nómina docente en formato CSV...', 'info');
  };

  return (
    <AdminLayout activeItem="docentes" breadcrumbs={['Cuerpo Docente']}>
      <div className="flex flex-col w-full gap-6">
        {/* Floating Toast Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold ${
                notification.type === 'success'
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : notification.type === 'error'
                  ? 'bg-red-600 text-white shadow-red-600/30'
                  : 'bg-slate-900 text-white shadow-slate-900/30'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {notification.type === 'success'
                  ? 'check_circle'
                  : notification.type === 'error'
                  ? 'error'
                  : 'info'}
              </span>
              <span>{notification.message}</span>
              <button
                type="button"
                onClick={() => setNotification(null)}
                className="ml-2 text-white/70 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Section Header */}
        <section className="flex flex-col gap-6 w-full">
          <div className="flex flex-col w-full">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1">
              <span className="px-2.5 py-0.5 bg-orange-100 text-amber-600 rounded-full font-bold">
                Área Académica
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Gestión del Plantel Docente y Académico
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Administración centralizada de legajos docentes, designaciones y estado de personal.
            </p>
          </div>

          {/* Action Buttons Top Bar (Sin Malla de asignaciones) */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full">
            {/* Exportar Nómina */}
            <button
              type="button"
              onClick={handleExportNomina}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-slate-700 hover:bg-slate-50 transition-colors rounded-full font-semibold text-xs border border-slate-200 shadow-xs h-10 active:scale-95 duration-200 text-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-amber-500">
                file_download
              </span>
              <span>Exportar Nómina</span>
            </button>

            {/* Registrar Docente */}
            <button
              type="button"
              onClick={() => setIsNewTeacherModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all rounded-full font-bold text-xs shadow-[0_4px_14px_rgba(11,80,213,0.3)] hover:shadow-lg active:scale-95 h-10 duration-200 text-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-emerald-300">
                person_add
              </span>
              <span>+ Registrar Docente</span>
            </button>
          </div>
        </section>

        {/* Filters Section */}
        <TeacherFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedEstado={selectedEstado}
          onEstadoChange={setSelectedEstado}
          onResetFilters={handleResetFilters}
        />

        {/* Indicador de sincronización activo */}
        {isLoading && (
          <div
            data-testid="teachers-sync-indicator"
            className="flex items-center gap-2 text-xs font-bold text-blue-800 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200/80 w-fit"
          >
            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
            <span>Sincronizando nómina docente con base de datos...</span>
          </div>
        )}

        {/* Teachers Table & Pagination Section */}
        <div className="flex flex-col gap-0">
          <TeacherTable
            teachers={currentTeachers}
            isLoading={isLoading}
            onEditTeacher={handleEditTeacher}
            onToggleStatus={handleToggleStatus}
            onResetPassword={handleResetPassword}
            onDeleteTeacher={handleDeleteTeacher}
            onResetFilters={handleResetFilters}
          />

          {/* Pagination Controls */}
          {!isLoading && totalItems > 0 && (
            <div className="px-6 py-4 bg-white/70 border-t border-slate-100 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
                <div className="text-xs font-semibold text-slate-500">
                  Mostrando{' '}
                  <span className="font-bold text-slate-900">
                    {startIndex + 1} - {Math.min(startIndex + PAGE_SIZE, totalItems)}
                  </span>{' '}
                  de <span className="font-bold text-slate-900">{totalItems}</span> docentes registrados
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold transition-colors ${
                      currentPage === 1
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    Anterior
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-colors cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold transition-colors ${
                      currentPage === totalPages
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-700 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>

        {/* Modal for New Teacher Registration */}
        <NewTeacherModal
          isOpen={isNewTeacherModalOpen}
          onClose={() => setIsNewTeacherModalOpen(false)}
          onSubmit={handleCreateTeacher}
        />

        {/* Modal for Editing Existing Teacher */}
        <EditTeacherModal
          isOpen={Boolean(editingTeacher)}
          teacher={editingTeacher}
          onClose={() => setEditingTeacher(null)}
          onSave={handleSaveEditTeacher}
        />
      </div>
    </AdminLayout>
  );
};

export default TeachersManagement;
