import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminToast from '../../components/admin/AdminToast';
import AdminStatCard from '../../components/admin/AdminStatCard';
import StudentFilters from '../../components/admin/StudentFilters';
import StudentTable from '../../components/admin/StudentTable';
import StudentPagination from '../../components/admin/StudentPagination';
import NewStudentModal from '../../components/admin/NewStudentModal';
import EditStudentModal from '../../components/admin/EditStudentModal';
import StudentDetailsModal from '../../components/admin/StudentDetailsModal';
import AdminSectionTitle from '../../components/admin/AdminSectionTitle';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {
  fetchAdminDashboardData,
  createParentAndStudentsApi,
  updateUserProfileApi,
  updateStudentAndTutorApi,
  deleteStudentApi,
  fetchAcademicOfferApi,
  DEFAULT_ACADEMIC_OFFER,
} from '../../services/adminService';
import { formatDni } from '../../utils/validators';

const normalizeStudent = (s, parents) => {
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

  const parent =
    (parents || []).find((p) => p.id && s.parentId && p.id === s.parentId) ||
    (parents || []).find((p) => Array.isArray(p.studentIds) && p.studentIds.includes(s.id)) ||
    (parents || []).find(
      (p) =>
        p.email &&
        s.emailPadre &&
        p.email.trim().toLowerCase() === s.emailPadre.trim().toLowerCase()
    ) ||
    null;

  const tutorNombre = parent
    ? parent.nombre
    : s.tutorNombre
      ? s.tutorNombre.replace(' (Tutor)', '')
      : s.emailPadre
        ? `Tutor (${s.emailPadre})`
        : 'Tutor';
  const tutorDni = parent?.dni || s.tutorDni || s.dniPadre || s.dniTutor || '';
  const tutorTelefono = parent?.telefono || s.tutorTelefono || s.telefonoPadre || '';
  const tutorEmail = parent?.email || s.tutorEmail || s.emailPadre || '';
  const tutorDomicilio = parent?.domicilio || s.tutorDomicilio || '';

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
    parentId: s.parentId || parent?.id || null,
    legajo: s.studentID_login || s.legajo || `#LEG-${s.id.slice(0, 6)}`,
    dni: formatDni(s.dni || ''),
    nombre: s.nombre || 'Sin Nombre',
    tutorNombre,
    tutorDni,
    tutorTelefono,
    tutorEmail,
    tutorDomicilio,
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
};

const computeInstitutionMetrics = (students) => {
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
};

const filterStudentsList = (students, { searchQuery, levelFilter, courseFilter, divisionFilter, statusFilter, serviceFilter }) => {
  const normalize = (str) =>
    String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  return students.filter((student) => {
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

    if (levelFilter !== 'todos' && student.nivel !== levelFilter) {
      return false;
    }

    if (courseFilter !== 'todos') {
      if (courseFilter === 'sin asignar') {
        if (student.curso !== 'sin asignar') return false;
      } else if (student.curso !== courseFilter && !student.curso?.toLowerCase().includes(courseFilter.toLowerCase())) {
        return false;
      }
    }

    if (divisionFilter !== 'todos' && student.division !== divisionFilter) {
      return false;
    }

    if (statusFilter !== 'todos' && student.estado !== statusFilter) {
      return false;
    }

    if (serviceFilter !== 'todos' && !student.servicios?.includes(serviceFilter)) {
      return false;
    }

    return true;
  });
};

const useAdminAuthCheck = (navigate) => {
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
            import.meta.env.VITE_DEV_ADMIN_KEY
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
};

const StudentsMetricsGrid = ({ institutionMetrics }) => (
  <div data-testid="students-metrics-grid" className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
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
);

const StudentsManagementHeader = ({
  onExportPadron,
  onOpenNewStudentModal,
  institutionMetrics,
}) => (
  <section data-testid="students-management-header" className="flex flex-col gap-4">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <AdminSectionTitle
        icon="school"
        title="Gestión de Alumnos y Legajos Académicos"
        subtitle="Padrón general, legajos digitales, servicios asignados y regularidad académica."
      />

      <div className="flex items-center gap-3">
        <button
          data-testid="export-padron-button"
          type="button"
          onClick={onExportPadron}
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
          onClick={onOpenNewStudentModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-md shadow-blue-500/25 text-xs font-bold transition-all transform hover:-translate-y-0.5 cursor-pointer border-none"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Nuevo Alumno</span>
        </button>
      </div>
    </div>

    <StudentsMetricsGrid institutionMetrics={institutionMetrics} />
  </section>
);

const StudentsTableSection = ({
  students,
  isLoading,
  onEditStudent,
  onViewStudent,
  onGenerateCertificate,
  onDeleteStudent,
  onToggleStatusStudent,
  onResetFilters,
  safeCurrentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => (
  <section data-testid="students-table-section" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
    <StudentTable
      students={students}
      isLoading={isLoading}
      onEditStudent={onEditStudent}
      onViewStudent={onViewStudent}
      onGenerateCertificate={onGenerateCertificate}
      onDeleteStudent={onDeleteStudent}
      onToggleStatusStudent={onToggleStatusStudent}
      onResetFilters={onResetFilters}
    />

    <StudentPagination
      currentPage={safeCurrentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={onPageChange}
      onItemsPerPageChange={onItemsPerPageChange}
    />
  </section>
);

const useStudentsFilterState = (students) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('todos');
  const [courseFilter, setCourseFilter] = useState('todos');
  const [divisionFilter, setDivisionFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [serviceFilter, setServiceFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredStudents = useMemo(
    () =>
      filterStudentsList(students, {
        searchQuery,
        levelFilter,
        courseFilter,
        divisionFilter,
        statusFilter,
        serviceFilter,
      }),
    [students, searchQuery, levelFilter, courseFilter, divisionFilter, statusFilter, serviceFilter]
  );

  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedStudents = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredStudents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudents, safeCurrentPage, itemsPerPage]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleLevelChange = (val) => {
    setLevelFilter(val);
    setCourseFilter('todos');
    setDivisionFilter('todos');
    setCurrentPage(1);
  };

  const handleCourseChange = (val) => {
    setCourseFilter(val);
    setDivisionFilter('todos');
    setCurrentPage(1);
  };

  const handleDivisionChange = (val) => {
    setDivisionFilter(val);
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
    setDivisionFilter('todos');
    setStatusFilter('todos');
    setServiceFilter('todos');
    setCurrentPage(1);
  };

  return {
    searchQuery,
    levelFilter,
    courseFilter,
    divisionFilter,
    statusFilter,
    serviceFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    paginatedStudents,
    totalItems,
    totalPages,
    safeCurrentPage,
    handleSearchChange,
    handleLevelChange,
    handleCourseChange,
    handleDivisionChange,
    handleStatusChange,
    handleServiceChange,
    handleResetFilters,
  };
};

const StudentsModals = ({
  isNewStudentModalOpen,
  setIsNewStudentModalOpen,
  handleAddStudent,
  editingStudent,
  setEditingStudent,
  handleSaveEditStudent,
  viewingStudent,
  setViewingStudent,
  parentsList,
  academicOffer,
}) => (
  <>
    <NewStudentModal
      isOpen={isNewStudentModalOpen}
      onClose={() => setIsNewStudentModalOpen(false)}
      onAddStudent={handleAddStudent}
      tutors={parentsList}
    />
    <EditStudentModal
      isOpen={!!editingStudent}
      student={editingStudent}
      tutors={parentsList}
      academicOffer={academicOffer}
      onClose={() => setEditingStudent(null)}
      onSaveStudent={handleSaveEditStudent}
    />
    <StudentDetailsModal
      isOpen={!!viewingStudent}
      student={viewingStudent}
      tutors={parentsList}
      onClose={() => setViewingStudent(null)}
      onEditStudent={(student) => {
        setViewingStudent(null);
        setEditingStudent(student);
      }}
    />
  </>
);

const useStudentActions = ({
  loadStudentsData,
  setCurrentPage,
  setStudents,
  students,
  setNotification,
  setIsLoading,
}) => {
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

  const handleToggleStatusStudent = async (student) => {
    const isCurrentlyInactive =
      student.estado === 'Baja Administrativa' ||
      student.status === 'inactive' ||
      student.status === 'baja';

    const newStatus = isCurrentlyInactive ? 'Activo - Regular' : 'Baja Administrativa';
    const actionLabel = isCurrentlyInactive ? 'reactivado con regularidad activa' : 'deshabilitado (baja administrativa)';

    const previousStudents = [...students];
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, estado: newStatus, status: newStatus } : s))
    );

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

    const previousStudents = [...students];
    setStudents((prev) => prev.filter((s) => s.id !== student.id));

    try {
      await deleteStudentApi({ studentId: student.id });

      setNotification({
        type: 'success',
        message: `Legajo de ${student.nombre} eliminado definitivamente.`,
      });
    } catch (err) {
      console.error('Error al eliminar alumno en backend:', err);
      setStudents(previousStudents);
      setNotification({
        type: 'error',
        message: `No se pudo eliminar el alumno: ${err.message || 'Error en la conexión con el servidor.'}`,
      });
    }
  };

  const handleSaveEditStudent = async (payload) => {
    setIsLoading(true);
    try {
      await updateStudentAndTutorApi(payload);
      await loadStudentsData();
      setNotification({
        type: 'success',
        message: `¡Legajo de ${payload.studentData.nombre} actualizado correctamente!`,
      });
    } catch (err) {
      console.error('Error al editar alumno en backend:', err);
      setNotification({
        type: 'error',
        message: `No se pudieron guardar los cambios: ${err.message || 'Error en el servidor.'}`,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleAddStudent,
    handleToggleStatusStudent,
    handleDeleteStudent,
    handleSaveEditStudent,
  };
};

const StudentsManagement = () => {
  const navigate = useNavigate();

  // Authentication check for admin panel
  useAdminAuthCheck(navigate);

  // Students Data State (solo alumnos reales provenientes de Firebase Firestore)
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [parentsList, setParentsList] = useState([]);
  const [academicOffer, setAcademicOffer] = useState(DEFAULT_ACADEMIC_OFFER);

  // Cargar oferta académica desde Firebase
  useEffect(() => {
    fetchAcademicOfferApi()
      .then((data) => {
        if (data) setAcademicOffer(data);
      })
      .catch(() => { });
  }, []);

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
        const normalized = rawStudents.map((s) => normalizeStudent(s, parents));
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
  const institutionMetrics = useMemo(() => computeInstitutionMetrics(students), [students]);

  // Modal & Notification State
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [notification, setNotification] = useState(null);

  // Toast auto-clear
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Filters and Pagination State via Hook
  const {
    searchQuery,
    levelFilter,
    courseFilter,
    divisionFilter,
    statusFilter,
    serviceFilter,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    paginatedStudents,
    totalItems,
    totalPages,
    safeCurrentPage,
    handleSearchChange,
    handleLevelChange,
    handleCourseChange,
    handleDivisionChange,
    handleStatusChange,
    handleServiceChange,
    handleResetFilters,
  } = useStudentsFilterState(students);

  // Student action mutations via hook
  const {
    handleAddStudent,
    handleToggleStatusStudent,
    handleDeleteStudent,
    handleSaveEditStudent,
  } = useStudentActions({
    loadStudentsData,
    setCurrentPage,
    setStudents,
    students,
    setNotification,
    setIsLoading,
  });

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
    setEditingStudent(student);
  };

  const handleViewStudent = (student) => {
    setViewingStudent(student);
  };

  return (
    <AdminLayout activeItem="alumnos" breadcrumbs={['Alumnos & Legajos']}>
      <div data-testid="students-management-page" className="flex flex-col w-full gap-6">
        {/* Feedback Notification Toast */}
        <AdminToast notification={notification} onClose={() => setNotification(null)} />

        {/* Encabezado de Sección y Acciones Principales */}
        <StudentsManagementHeader
          onExportPadron={handleExportPadron}
          onOpenNewStudentModal={() => setIsNewStudentModalOpen(true)}
          institutionMetrics={institutionMetrics}
        />

        {/* Filtros Dinámicos Estilo Prisma Alegría */}
        <StudentFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          levelFilter={levelFilter}
          onLevelChange={handleLevelChange}
          courseFilter={courseFilter}
          onCourseChange={handleCourseChange}
          divisionFilter={divisionFilter}
          onDivisionChange={handleDivisionChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          serviceFilter={serviceFilter}
          onServiceChange={handleServiceChange}
          onResetFilters={handleResetFilters}
          academicOffer={academicOffer}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <div data-testid="students-loading-indicator" className="w-full py-2 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
            <span>Sincronizando alumnos con base de datos...</span>
          </div>
        )}

        {/* Tabla Principal de Alumnos con Estilo Prisma */}
        <StudentsTableSection
          students={paginatedStudents}
          isLoading={isLoading}
          onEditStudent={handleEditStudent}
          onViewStudent={handleViewStudent}
          onGenerateCertificate={handleGenerateCertificate}
          onDeleteStudent={handleDeleteStudent}
          onToggleStatusStudent={handleToggleStatusStudent}
          onResetFilters={handleResetFilters}
          safeCurrentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => {
            setItemsPerPage(val);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Modales de Gestión de Alumnos */}
      <StudentsModals
        isNewStudentModalOpen={isNewStudentModalOpen}
        setIsNewStudentModalOpen={setIsNewStudentModalOpen}
        handleAddStudent={handleAddStudent}
        editingStudent={editingStudent}
        setEditingStudent={setEditingStudent}
        handleSaveEditStudent={handleSaveEditStudent}
        viewingStudent={viewingStudent}
        setViewingStudent={setViewingStudent}
        parentsList={parentsList}
        academicOffer={academicOffer}
      />
    </AdminLayout>
  );
};

export default StudentsManagement;
