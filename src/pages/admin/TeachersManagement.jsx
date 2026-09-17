import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import TeacherFilters from '../../components/admin/teachers/TeacherFilters';
import TeacherTable from '../../components/admin/teachers/TeacherTable';
import TeacherAssignmentsDrawer from '../../components/admin/teachers/TeacherAssignmentsDrawer';
import NewTeacherModal from '../../components/admin/teachers/NewTeacherModal';
import {
  fetchTeachersApi,
  createTeacherApi,
  updateTeacherAssignmentsApi,
  exportTeachersPayrollCsv,
} from '../../services/teachersService';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const PAGE_SIZE = 5;

const TeachersManagement = () => {
  const navigate = useNavigate();

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
  }, [navigate]);

  // Teachers State
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('');
  const [selectedEspecialidad, setSelectedEspecialidad] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Drawer State
  const [selectedTeacherForDrawer, setSelectedTeacherForDrawer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNewTeacherModalOpen, setIsNewTeacherModalOpen] = useState(false);

  // Notification State
  const [notification, setNotification] = useState(null);

  const showToast = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  // Load teachers on mount
  const loadTeachers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchTeachersApi();
      setTeachers(data);
    } catch (err) {
      console.error('Error al cargar docentes:', err);
      showToast('Error al cargar nómina docente.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  // Filter Logic
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      // Text search in name, legajo, email
      if (searchTerm) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = (t.nombre || '').toLowerCase().includes(query);
        const matchesLegajo = (t.legajo || '').toLowerCase().includes(query);
        const matchesEmail = (t.email || '').toLowerCase().includes(query);
        if (!matchesName && !matchesLegajo && !matchesEmail) return false;
      }

      // Nivel filter
      if (selectedNivel) {
        if ((t.nivel || '').toLowerCase() !== selectedNivel.toLowerCase()) return false;
      }

      // Especialidad filter
      if (selectedEspecialidad) {
        if ((t.especialidadKey || '').toLowerCase() !== selectedEspecialidad.toLowerCase()) {
          return false;
        }
      }

      // Estado filter
      if (selectedEstado) {
        if ((t.estado || '').toLowerCase() !== selectedEstado.toLowerCase()) return false;
      }

      return true;
    });
  }, [teachers, searchTerm, selectedNivel, selectedEspecialidad, selectedEstado]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedNivel, selectedEspecialidad, selectedEstado]);

  // Pagination calculation
  const totalItems = filteredTeachers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentTeachers = filteredTeachers.slice(startIndex, startIndex + PAGE_SIZE);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedNivel('');
    setSelectedEspecialidad('');
    setSelectedEstado('');
  };

  // Actions
  const handleOpenDrawer = (teacher) => {
    setSelectedTeacherForDrawer(teacher);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTeacherForDrawer(null);
  };

  const handleSaveAssignments = async (teacherId, payload) => {
    try {
      const updated = await updateTeacherAssignmentsApi(teacherId, payload);
      setTeachers((prev) => prev.map((t) => (t.id === teacherId ? updated : t)));
      showToast('¡Asignaciones y carga horaria guardadas exitosamente!', 'success');
      handleCloseDrawer();
    } catch (err) {
      console.error('Error al guardar asignaciones:', err);
      showToast('Error al guardar asignaciones.', 'error');
    }
  };

  const handleCreateTeacher = async (teacherData) => {
    try {
      const created = await createTeacherApi(teacherData);
      setTeachers((prev) => [created, ...prev]);
      showToast(`¡Docente ${created.nombre} registrado con legajo ${created.legajo}!`, 'success');
    } catch (err) {
      console.error('Error al registrar docente:', err);
      showToast('Error al registrar docente.', 'error');
    }
  };

  const handleExportNomina = () => {
    exportTeachersPayrollCsv(filteredTeachers);
    showToast('Exportando nómina docente en formato CSV...', 'info');
  };

  const handleOpenMallaAsignaciones = () => {
    // Si hay docentes, abrimos el primer docente o mostramos vista informativa
    if (teachers.length > 0) {
      setSelectedTeacherForDrawer(teachers[0]);
      setIsDrawerOpen(true);
      showToast('Abriendo visor de malla horaria institucional...', 'info');
    } else {
      showToast('No hay docentes registrados para mostrar la malla horaria.', 'info');
    }
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
              Administración centralizada de legajos docentes, designaciones y carga horaria académica.
            </p>
          </div>

          {/* Action Buttons Top Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl mx-auto">
            {/* Exportar Nómina */}
            <button
              type="button"
              onClick={handleExportNomina}
              className="flex-1 w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-slate-700 hover:bg-slate-50 transition-colors rounded-full font-semibold text-xs border border-slate-200 shadow-xs h-10 active:scale-95 duration-200 text-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-amber-500">
                file_download
              </span>
              <span>Exportar Nómina</span>
            </button>

            {/* Malla de Asignaciones */}
            <button
              type="button"
              onClick={handleOpenMallaAsignaciones}
              className="flex-1 w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-slate-700 hover:bg-slate-50 transition-colors rounded-full font-semibold text-xs border border-slate-200 shadow-xs h-10 active:scale-95 duration-200 text-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-blue-600">
                calendar_view_week
              </span>
              <span>Malla de Asignaciones</span>
            </button>

            {/* Registrar Docente */}
            <button
              type="button"
              onClick={() => setIsNewTeacherModalOpen(true)}
              className="flex-1 w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all rounded-full font-bold text-xs shadow-[0_4px_14px_rgba(11,80,213,0.3)] hover:shadow-lg active:scale-95 h-10 duration-200 text-center cursor-pointer"
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
          selectedNivel={selectedNivel}
          onNivelChange={setSelectedNivel}
          selectedEspecialidad={selectedEspecialidad}
          onEspecialidadChange={setSelectedEspecialidad}
          selectedEstado={selectedEstado}
          onEstadoChange={setSelectedEstado}
          onResetFilters={handleResetFilters}
        />

        {/* Teachers Table & Pagination Section */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <span className="text-xs font-semibold text-slate-500">Cargando nómina docente...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-0">
            <TeacherTable
              teachers={currentTeachers}
              onOpenAssignments={handleOpenDrawer}
            />

            {/* Pagination Controls */}
            {totalItems > 0 && (
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
        )}

        {/* Slide-over Drawer for Assignments */}
        <TeacherAssignmentsDrawer
          isOpen={isDrawerOpen}
          teacher={selectedTeacherForDrawer}
          onClose={handleCloseDrawer}
          onSaveAssignments={handleSaveAssignments}
        />

        {/* Modal for New Teacher Registration */}
        <NewTeacherModal
          isOpen={isNewTeacherModalOpen}
          onClose={() => setIsNewTeacherModalOpen(false)}
          onSubmit={handleCreateTeacher}
        />
      </div>
    </AdminLayout>
  );
};

export default TeachersManagement;
