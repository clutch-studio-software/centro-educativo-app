import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminStatCard from '../../components/admin/AdminStatCard';
import StudentFilters from '../../components/admin/StudentFilters';
import StudentTable from '../../components/admin/StudentTable';
import StudentPagination from '../../components/admin/StudentPagination';
import NewStudentModal from '../../components/admin/NewStudentModal';
import { MOCK_STUDENTS, MOCK_INSTITUTION_METRICS } from '../../data/mockStudents';
import { auth } from '../../services/firebase';

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

      // In development mode, auto-provision fallback mock admin so preview is seamless
      if (import.meta.env.DEV) {
        const mockAdmin = {
          uid: 'admin-preview',
          email: 'direccion@educar.edu.ar',
          nombre: 'Lic. Martín Valdez',
          role: 'user_admin',
        };
        localStorage.setItem('school_user', JSON.stringify(mockAdmin));
        return;
      }

      // In production without admin credentials, redirect to login
      console.warn('Acceso denegado: Se requiere rol user_admin.');
      navigate('/login');
    };

    checkAdminAuth();
  }, [navigate]);

  // Students Data State
  const [students, setStudents] = useState(MOCK_STUDENTS);

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
    return students.filter((student) => {
      // Search filter (nombre, legajo, dni, tutor)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = student.nombre.toLowerCase().includes(query);
        const matchesLegajo = student.legajo.toLowerCase().includes(query);
        const matchesDni = student.dni.replace(/\./g, '').includes(query.replace(/\./g, ''));
        const matchesTutor = student.tutorNombre?.toLowerCase().includes(query);

        if (!matchesName && !matchesLegajo && !matchesDni && !matchesTutor) {
          return false;
        }
      }

      // Level filter
      if (levelFilter !== 'todos' && student.nivel !== levelFilter) {
        return false;
      }

      // Course filter
      if (courseFilter !== 'todos' && !student.curso.includes(courseFilter)) {
        return false;
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
  const handleAddStudent = (newStudent) => {
    setStudents((prev) => [newStudent, ...prev]);
    setCurrentPage(1);
    setNotification({
      type: 'success',
      message: `¡Alumno ${newStudent.nombre} registrado con éxito con legajo ${newStudent.legajo}!`,
    });
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

  const handleDeleteStudent = (student) => {
    if (window.confirm(`¿Confirmas la baja definitiva del legajo de ${student.nombre}?`)) {
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      setNotification({
        type: 'success',
        message: `Legajo de ${student.nombre} dado de baja exitosamente.`,
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
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold ${
                notification.type === 'success'
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-slate-900 text-white shadow-slate-900/30'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {notification.type === 'success' ? 'check_circle' : 'info'}
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
              value={MOCK_INSTITUTION_METRICS.totalStudents.toLocaleString()}
              subtitle={MOCK_INSTITUTION_METRICS.totalAssignedPct}
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
              value={MOCK_INSTITUTION_METRICS.inicialStudents}
              subtitle={MOCK_INSTITUTION_METRICS.inicialSubtitle}
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
              value={MOCK_INSTITUTION_METRICS.primarioStudents}
              subtitle={MOCK_INSTITUTION_METRICS.primarioSubtitle}
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
              value={MOCK_INSTITUTION_METRICS.secundarioStudents}
              subtitle={MOCK_INSTITUTION_METRICS.secundarioSubtitle}
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
              value={MOCK_INSTITUTION_METRICS.regularStudentsPct}
              badge={`${MOCK_INSTITUTION_METRICS.conditionalCount} condicionales`}
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

        {/* Tabla Principal de Legajos con Estilo Prisma Alegría */}
        <section data-testid="students-table-section" className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <StudentTable
            students={paginatedStudents}
            onEditStudent={handleEditStudent}
            onGenerateCertificate={handleGenerateCertificate}
            onDeleteStudent={handleDeleteStudent}
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
      />
    </AdminLayout>
  );
};

export default StudentsManagement;
