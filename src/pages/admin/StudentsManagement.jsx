import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminStatCard from '../../components/admin/AdminStatCard';
import StudentFilters from '../../components/admin/StudentFilters';
import StudentTable from '../../components/admin/StudentTable';
import StudentPagination from '../../components/admin/StudentPagination';
import NewStudentModal from '../../components/admin/NewStudentModal';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {
  fetchAdminDashboardData,
  createParentAndStudentsApi,
  updateUserProfileApi,
  deleteStudentApi
} from '../../services/adminService';
import { formatDni } from '../../utils/validators';

const StudentsManagement = () => {
  const navigate = useNavigate();

  // Authentication check for admin panel
  useEffect(() => {
    const checkAdminAuth = async () => {
      // 1. Check local storage / auth context
      const savedUser = localStorage.getItem('school_user');
      const currentUser = savedUser ? JSON.parse(savedUser) : null;

      if (
        currentUser &&
        (currentUser.role === 'user_admin' || currentUser.role === 'Administrador')
      ) {
        return;
      }

      // 2. Check Firebase user claims if available
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

      // In development mode, auto-authenticate with user_admin credentials in Firebase Auth
      // so that real Firestore reads, writes and token validations work with 100% authorization
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

      // In production without admin credentials, redirect to login
      if (!auth.currentUser && (!currentUser || currentUser.role !== 'user_admin')) {
        console.warn('Acceso denegado: Se requiere rol user_admin.');
        navigate('/login');
      }
    };

    checkAdminAuth();
  }, [navigate]);

  // Students Data State (solo alumnos reales provenientes de Firebase Firestore)
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [parentsList, setParentsList] = useState([]);

  // Fetch from Firebase Firestore on Mount
  const loadStudentsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { parents, students: rawStudents } = await fetchAdminDashboardData();
      const parentsOnly = (parents || [])
        .filter((u) => String(u.role || '').trim().toLowerCase() === 'padre')
        .sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }));
      setParentsList(parentsOnly);

      if (rawStudents && rawStudents.length > 0) {
        const normalized = rawStudents.map((s) => {
          const rawNivel = String(s.nivel || '').toLowerCase();
          const nivel =
            rawNivel === 'inicial'
              ? 'Inicial'
              : rawNivel === 'primaria' || rawNivel === 'primario'
                ? 'Primario'
                : rawNivel === 'secundaria' || rawNivel === 'secundario'
                  ? 'Secundario'
                  : 'Primario';

          const badgeVariant =
            nivel === 'Inicial' ? 'lime' : nivel === 'Primario' ? 'sky' : 'indigo';
          const avatarGradient =
            nivel === 'Inicial'
              ? 'from-orange-400 to-amber-500'
              : nivel === 'Primario'
                ? 'from-blue-500 to-indigo-500'
                : 'from-emerald-400 to-lime-500';

          const parent = (parents || []).find((p) => p.id === s.parentId);
          const tutorNombre = parent
            ? `${parent.nombre} (Tutor)`
            : s.emailPadre
              ? `Tutor (${s.emailPadre})`
              : 'Tutor';
          const tutorTelefono = parent?.telefono || '';
          const tutorEmail = parent?.email || s.emailPadre || '';

          const initials =
            (s.nombre || '')
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase() || 'AL';

          const curso = s.curso || 'sin asignar';
          const division = s.division || 'sin asignar';

          const cursoDisplay =
            curso === 'sin asignar' && division === 'sin asignar'
              ? 'Sin asignar'
              : curso !== 'sin asignar' && division !== 'sin asignar'
                ? `${curso} "${division}"`
                : curso !== 'sin asignar'
                  ? curso
                  : `División ${division}`;

          return {
            id: s.id,
            legajo: s.studentID_login || s.legajo || `#LEG-${s.id.slice(0, 6)}`,
            dni: formatDni(s.dni || ''),
            nombre: s.nombre || 'Sin Nombre',
            tutorNombre,
            tutorTelefono,
            tutorEmail,
            domicilio: s.domicilio || parent?.domicilio || 'Sin domicilio registrado',
            nivel,
            curso,
            division,
            cursoDisplay,
            estado: s.status === 'active' ? 'Activo - Regular' : s.status || 'Activo - Regular',
            servicios: s.servicios || ['Comedor Escolar'],
            initials,
            avatarGradient,
            badgeVariant,
            fechaNacimiento: s.fechaNacimiento || '',
          };
        });

        setStudents(normalized);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudentsData();
  }, [loadStudentsData]);

  // Compute Dynamic Institutional Metrics from live students
  const institutionMetrics = useMemo(() => {
    const total = students.length;
    const inicial = students.filter((s) => s.nivel === 'Inicial').length;
    const primario = students.filter((s) => s.nivel === 'Primario').length;
    const secundario = students.filter((s) => s.nivel === 'Secundario').length;
    const regulares = students.filter((s) => s.estado === 'Activo - Regular').length;
    const regularPct = total > 0 ? `${((regulares / total) * 100).toFixed(1)}%` : '0%';

    return {
      totalStudents: total,
      totalAssignedPct: `${total} alumnos en padrón`,
      inicialStudents: inicial,
      inicialSubtitle: 'Salas de 2 a 5 Años',
      primarioStudents: primario,
      primarioSubtitle: '1º a 7º Grados',
      secundarioStudents: secundario,
      secundarioSubtitle: '1º a 6º Años',
      regularStudentsPct: regularPct,
      conditionalCount: total - regulares,
    };
  }, [students]);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('todos');
  const [courseFilter, setCourseFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [serviceFilter, setServiceFilter] = useState('todos');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal State
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Toast auto-clear
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    const normalize = (str) =>
      String(str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    return students.filter((student) => {
      // Search filter (nombre, legajo, dni, tutor, tutorEmail, etc.)
      if (searchQuery.trim()) {
        const query = normalize(searchQuery);
        const cleanDigitsQuery = searchQuery.replace(/\D/g, '');

        const matchesName = normalize(student.nombre).includes(query);
        const matchesLegajo = normalize(student.legajo).includes(query);
        const matchesDni =
          cleanDigitsQuery.length >= 3 &&
          String(student.dni || '').replace(/\D/g, '').includes(cleanDigitsQuery);
        const matchesTutor = normalize(student.tutorNombre).includes(query);
        const matchesTutorEmail = normalize(student.tutorEmail).includes(query);
        const matchesTutorPhone =
          cleanDigitsQuery.length >= 3 &&
          String(student.tutorTelefono || '').replace(/\D/g, '').includes(cleanDigitsQuery);

        if (!matchesName && !matchesLegajo && !matchesDni && !matchesTutor && !matchesTutorEmail && !matchesTutorPhone) {
          return false;
        }
      }

      // Level filter
      if (levelFilter !== 'todos' && student.nivel !== levelFilter) {
        return false;
      }

      // Course filter
      if (courseFilter !== 'todos') {
        if (courseFilter === 'sin asignar') {
          if (student.curso !== 'sin asignar') return false;
        } else if (!student.curso?.toLowerCase().includes(courseFilter.toLowerCase())) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'todos' && student.estado !== statusFilter) {
        return false;
      }

      // Service filter
      if (serviceFilter !== 'todos' && !student.servicios?.includes(serviceFilter)) {
        return false;
      }

      return true;
    });
  }, [students, searchQuery, levelFilter, courseFilter, statusFilter, serviceFilter]);

  // Paginated Students Slice
  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedStudents = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, safeCurrentPage, itemsPerPage]);

  // Filter Handlers with automatic page reset
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleLevelChange = (val) => {
    setLevelFilter(val);
    setCurrentPage(1);
  };

  const handleCourseChange = (val) => {
    setCourseFilter(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleServiceChange = (val) => {
    setServiceFilter(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setLevelFilter('todos');
    setCourseFilter('todos');
    setStatusFilter('todos');
    setServiceFilter('todos');
    setCurrentPage(1);
  };

  // Add new student handler
  const handleAddStudent = async (newStudent) => {
    setIsLoading(true);
    try {
      await createParentAndStudentsApi({
        parentEmail: newStudent.tutorEmail || 'tutor@ejemplo.com',
        parentName: (newStudent.tutorNombre || '').replace(' (Tutor)', ''),
        parentDni: (newStudent.tutorDni || '00000000').replace(/\./g, ''),
        students: [
          {
            nombre: newStudent.nombre,
            dni: newStudent.dni.replace(/\./g, ''),
            fechaNacimiento: newStudent.fechaNacimiento || '',
            nivel: newStudent.nivel.toLowerCase(),
            curso: newStudent.curso || 'sin asignar',
            division: newStudent.division || 'sin asignar',
            genero: 'No especificado',
          },
        ],
      });

      // Recargar padrón directamente desde Firestore para garantizar que los datos provienen de la BD real
      await loadStudentsData();
      setCurrentPage(1);
      setNotification({
        type: 'success',
        message: `¡Alumno ${newStudent.nombre} matriculado y persistido en Firebase correctamente!`,
      });
    } catch (err) {
      console.error('Error persistiendo alumno en Firebase:', err);
      setNotification({
        type: 'error',
        message: `No se pudo registrar el alumno en Firebase: ${err.message || 'Error en el servidor.'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mock Action Handlers
  const handleExportPadron = () => {
    setNotification({
      type: 'info',
      message: 'Exportando padrón general Ciclo 2027 en formato Excel (.xlsx)...',
    });
  };

  const handleGenerateCertificate = (student) => {
    setNotification({
      type: 'info',
      message: `Generando constancia de alumno regular para ${student.nombre}...`,
    });
  };

  const handleEditStudent = (student) => {
    setNotification({
      type: 'info',
      message: `Abriendo legajo digital de ${student.nombre} (#${student.legajo})...`,
    });
  };

  const handleToggleStatusStudent = async (student) => {
    const isCurrentlyInactive =
      student.estado === 'Baja Administrativa' ||
      student.status === 'inactive' ||
      student.status === 'baja';

    const newStatus = isCurrentlyInactive ? 'Activo - Regular' : 'Baja Administrativa';
    const actionLabel = isCurrentlyInactive ? 'reactivado con regularidad activa' : 'deshabilitado (baja administrativa)';

    // 1. Snapshot previous state for rollback
    const previousStudents = [...students];

    // 2. Optimistic UI update
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, estado: newStatus, status: newStatus } : s))
    );

    // 3. Persist to Firestore via updateUserProfileApi
    try {
      await updateUserProfileApi({
        targetId: student.id,
        targetType: 'student',
        fields: {
          status: newStatus,
        },
      });

      setNotification({
        type: 'info',
        message: `El alumno ${student.nombre} fue ${actionLabel}.`,
      });
    } catch (err) {
      console.error('Error al actualizar estado del alumno en backend:', err);
      // Rollback to previous state
      setStudents(previousStudents);
      setNotification({
        type: 'error',
        message: `No se pudo actualizar el estado: ${err.message || 'Error en la conexión con el servidor.'}`,
      });
    }
  };

  const handleDeleteStudent = async (student) => {
    const confirmed = window.confirm(
      `¿Confirmas la baja y eliminación definitiva del legajo de ${student.nombre} (#${student.legajo})?\n\nEsta acción eliminará el legajo digital del sistema.`
    );
    if (!confirmed) return;

    // 1. Snapshot previous state for rollback
    const previousStudents = [...students];

    // 2. Optimistic delete from UI
    setStudents((prev) => prev.filter((s) => s.id !== student.id));

    // 3. Persist delete via deleteStudentApi
    try {
      await deleteStudentApi({ studentId: student.id });

      setNotification({
        type: 'success',
        message: `Legajo de ${student.nombre} eliminado definitivamente.`,
      });
    } catch (err) {
      console.error('Error al eliminar alumno en backend:', err);
      // Rollback to previous state
      setStudents(previousStudents);
      setNotification({
        type: 'error',
        message: `No se pudo eliminar el alumno: ${err.message || 'Error en la conexión con el servidor.'}`,
      });
    }
  };

  return (
    <AdminLayout activeItem="alumnos" breadcrumbs={['Alumnos & Legajos']}>
      <div data-testid="students-management-page" className="flex flex-col w-full gap-6">
        {/* Feedback Notification Toast */}
        {notification && (
          <div
            data-testid="admin-notification-toast"
            className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300"
          >
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold ${notification.type === 'success'
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
                data-testid="admin-notification-toast-close"
                onClick={() => setNotification(null)}
                className="ml-2 text-white/70 hover:text-white cursor-pointer border-none bg-transparent"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Encabezado de Sección y Acciones Principales */}
        <section data-testid="students-management-header" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-lime-500 text-white shadow-md shadow-lime-500/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">school</span>
                </span>
                <h1 data-testid="students-management-title" className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Gestión de Alumnos y Legajos Académicos
                </h1>
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
                Padrón general, legajos digitales, servicios asignados y regularidad académica Ciclo 2027.
              </p>
            </div>

            {/* Acciones Principales */}
            <div className="flex items-center gap-3">
              <button
                data-testid="export-padron-button"
                type="button"
                onClick={handleExportPadron}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80 rounded-full shadow-sm text-xs font-bold transition-all hover:shadow cursor-pointer"
              >
                <span className="material-symbols-outlined text-orange-500 text-[18px]">
                  file_download
                </span>
                <span>Exportar Padrón (Excel/PDF)</span>
              </button>

              <button
                data-testid="open-new-student-modal-button"
                type="button"
                onClick={() => setIsNewStudentModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-md shadow-blue-500/25 text-xs font-bold transition-all transform hover:-translate-y-0.5 cursor-pointer border-none"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Nuevo Alumno</span>
              </button>
            </div>
          </div>

          {/* Métricas Institucionales (KPIs Prisma Alegría: Lima, Naranja, Azul y Celeste) */}
          <div data-testid="students-metrics-grid" className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            {/* Card 1: Matrícula Total */}
            <AdminStatCard
              testId="stat-card-matricula-total"
              title="Matrícula Total"
              value={institutionMetrics.totalStudents.toLocaleString()}
              subtitle={institutionMetrics.totalAssignedPct}
              hasDot={true}
              subtitleColor="text-emerald-600"
              icon="groups"
              borderColor="border-lime-100"
              iconGradient="from-lime-100 to-emerald-100"
              iconColor="text-emerald-700"
            />

            {/* Card 2: Nivel Inicial */}
            <AdminStatCard
              testId="stat-card-nivel-inicial"
              title="Nivel Inicial"
              value={institutionMetrics.inicialStudents}
              subtitle={institutionMetrics.inicialSubtitle}
              subtitleColor="text-orange-600"
              icon="child_care"
              borderColor="border-orange-100"
              iconGradient="from-amber-100 to-orange-100"
              iconColor="text-orange-600"
            />

            {/* Card 3: Nivel Primario */}
            <AdminStatCard
              testId="stat-card-nivel-primario"
              title="Nivel Primario"
              value={institutionMetrics.primarioStudents}
              subtitle={institutionMetrics.primarioSubtitle}
              subtitleColor="text-blue-600"
              icon="history_edu"
              borderColor="border-blue-100"
              iconGradient="from-sky-100 to-blue-100"
              iconColor="text-blue-600"
            />

            {/* Card 4: Nivel Secundario */}
            <AdminStatCard
              testId="stat-card-nivel-secundario"
              title="Nivel Secundario"
              value={institutionMetrics.secundarioStudents}
              subtitle={institutionMetrics.secundarioSubtitle}
              subtitleColor="text-purple-600"
              icon="auto_stories"
              borderColor="border-purple-100"
              iconGradient="from-purple-100 to-indigo-100"
              iconColor="text-purple-600"
            />

            {/* Card 5: Regulares Activos */}
            <AdminStatCard
              testId="stat-card-regulares-activos"
              title="Regulares Activos"
              value={institutionMetrics.regularStudentsPct}
              badge={`${institutionMetrics.conditionalCount} condicionales`}
              valueColor="text-emerald-600"
              icon="verified"
              borderColor="border-lime-100"
              iconGradient="from-emerald-100 to-lime-200"
              iconColor="text-emerald-700"
            />
          </div>
        </section>

        {/* Filtros Dinámicos Estilo Prisma Alegría */}
        <StudentFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          levelFilter={levelFilter}
          onLevelChange={handleLevelChange}
          courseFilter={courseFilter}
          onCourseChange={handleCourseChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          serviceFilter={serviceFilter}
          onServiceChange={handleServiceChange}
          onResetFilters={handleResetFilters}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <div data-testid="students-loading-indicator" className="w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
            <span>Sincronizando alumnos con base de datos...</span>
          </div>
        )}

        {/* Tabla Principal de Alumnos con Estilo Prisma */}
        <section data-testid="students-table-section" className="flex flex-col gap-4">
          <StudentTable
            students={paginatedStudents}
            isLoading={isLoading}
            onEditStudent={handleEditStudent}
            onGenerateCertificate={handleGenerateCertificate}
            onDeleteStudent={handleDeleteStudent}
            onToggleStatusStudent={handleToggleStatusStudent}
            onResetFilters={handleResetFilters}
          />

          {/* Paginación y Resumen Inferior Prisma */}
          <StudentPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
          />
        </section>
      </div>

      {/* Modal de Nuevo Alumno */}
      <NewStudentModal
        isOpen={isNewStudentModalOpen}
        onClose={() => setIsNewStudentModalOpen(false)}
        onAddStudent={handleAddStudent}
        tutors={parentsList}
      />
    </AdminLayout>
  );
};

export default StudentsManagement;
