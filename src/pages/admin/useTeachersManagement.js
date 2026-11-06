import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchTeachersApi,
  createTeacherApi,
  updateTeacherApi,
  toggleTeacherStatusApi,
  resetTeacherPasswordApi,
  deleteTeacherApi,
  updateTeacherAssignmentsApi,
  exportTeachersPayrollCsv,
} from '../../services/teachersService';
import { auth } from '../../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import {
  fetchAcademicCourses,
  syncTeacherCatedrasToAcademicSubjectsApi,
} from '../../services/academicService';
import { INITIAL_COURSES } from '../../data/mockAcademicOffer';

export const PAGE_SIZE = 5;

const ALLOWED_TEACHERS_ROLES = [
  'user_admin',
  'directivo',
  'administrador',
  'admin',
  'administrativo',
  'docente',
  'profesor',
  'staff',
];

const useTeachersAuthCheck = (navigate, loadTeachers) => {
  useEffect(() => {
    const checkTeachersAuth = async () => {
      const savedUser = localStorage.getItem('school_user');
      const currentUser = savedUser ? JSON.parse(savedUser) : null;

      const userRole = String(currentUser?.rol || currentUser?.role || '').toLowerCase();
      if (currentUser && ALLOWED_TEACHERS_ROLES.includes(userRole)) {
        return;
      }

      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        try {
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const claimRole = String(idTokenResult.claims.role || '').toLowerCase();
          if (ALLOWED_TEACHERS_ROLES.includes(claimRole)) {
            return;
          }
        } catch {
          // Continue to redirect if claims check fails
        }
      }

      if (import.meta.env.DEV && !auth.currentUser && !savedUser) {
        try {
          await signInWithEmailAndPassword(
            auth,
            import.meta.env.VITE_ADMIN_EMAIL,
            import.meta.env.VITE_DEV_ADMIN_KEY
          );
          loadTeachers();
          return;
        } catch (devErr) {
          console.warn('Auto-login dev admin:', devErr.message);
        }
      }

      if (currentUser && !ALLOWED_TEACHERS_ROLES.includes(userRole)) {
        console.warn('Acceso denegado a Cuerpo Docente para este rol:', currentUser.role);
        navigate('/admin/dashboard');
        return;
      }

      if (!auth.currentUser && !currentUser) {
        console.warn('Acceso denegado: Se requiere autenticación.');
        navigate('/login');
      }
    };

    void checkTeachersAuth();
  }, [navigate, loadTeachers]);
};

const filterTeachersByCriteria = (teachers, searchTerm, selectedEstado) => {
  return teachers.filter((t) => {
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

    if (selectedEstado) {
      if (selectedEstado.toLowerCase() === 'suspendido') {
        if (String(t.estado || '').toLowerCase() !== 'suspendido' && !t.disabled) {
          return false;
        }
      } else {
        const tCond = String(t.condicion || t.estado || '').toLowerCase();
        if (tCond !== selectedEstado.toLowerCase()) {
          return false;
        }
      }
    }

    return true;
  });
};

export const useTeachersManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const userRole = String(user?.rol || user?.role || 'Directivo').toLowerCase();
  const canManageTeachers =
    userRole === 'directivo' ||
    userRole === 'administrativo' ||
    userRole === 'admin' ||
    userRole === 'user_admin' ||
    userRole === 'administrador';
  const isDocenteRole =
    userRole === 'docente' || userRole === 'profesor' || userRole === 'staff';

  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isNewTeacherModalOpen, setIsNewTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [assigningTeacher, setAssigningTeacher] = useState(null);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    let isMounted = true;
    fetchAcademicCourses()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCourses(data);
        }
      })
      .catch((err) => {
        console.warn('Error al cargar cursos para gestión docente:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

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

  useTeachersAuthCheck(navigate, loadTeachers);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = auth.onAuthStateChanged((fbUser) => {
      if (fbUser && isMounted) {
        void loadTeachers();
      }
    });

    void loadTeachers();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [loadTeachers]);

  const filteredTeachers = useMemo(
    () => filterTeachersByCriteria(teachers, searchTerm, selectedEstado),
    [teachers, searchTerm, selectedEstado]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedEstado]);

  const totalItems = filteredTeachers.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentTeachers = filteredTeachers.slice(startIndex, startIndex + PAGE_SIZE);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedEstado('');
  };

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

  const handleOpenAssignments = useCallback(
    (targetTeacher) => {
      if (isDocenteRole) {
        const isSelf =
          targetTeacher?.id === user?.uid ||
          (user?.email && targetTeacher?.email?.toLowerCase() === user.email.toLowerCase());
        if (!isSelf) {
          showToast('Solo puedes consultar tu propia grilla horaria.', 'error');
          return;
        }
      }
      setAssigningTeacher(targetTeacher);
    },
    [isDocenteRole, user, showToast]
  );

  const handleSaveAssignments = async (teacherId, { catedras, cargaHoras, grillaHoraria }) => {
    try {
      const updated = await updateTeacherAssignmentsApi(teacherId, {
        catedras,
        cargaHoras,
        grillaHoraria,
      });

      const currentTeacher = teachers.find((t) => t.id === teacherId) || assigningTeacher;
      if (currentTeacher) {
        void syncTeacherCatedrasToAcademicSubjectsApi(
          currentTeacher,
          catedras,
          courses
        );
      }

      setTeachers((prev) =>
        prev.map((t) =>
          t.id === teacherId
            ? {
                ...t,
                catedras: updated?.catedras || catedras,
                cargaHoras: updated?.cargaHoras ?? cargaHoras,
                grillaHoraria: updated?.grillaHoraria || grillaHoraria,
              }
            : t
        )
      );
      showToast('Cátedras, cursos y horarios actualizados correctamente.', 'success');
    } catch (err) {
      console.error('Error al guardar cátedras del docente:', err);
      showToast('Error al guardar las asignaciones del docente.', 'error');
    }
  };

  const handleToggleStatus = async (teacher) => {
    try {
      const { teacher: updated, nuevoEstado } = await toggleTeacherStatusApi(teacher.id);
      setTeachers((prev) => prev.map((t) => (t.id === teacher.id ? updated : t)));

      if (nuevoEstado === 'Suspendido') {
        showToast(
          `El docente ${teacher.nombreCompleto || teacher.nombre} fue deshabilitado (Suspendido).`,
          'info'
        );
      } else {
        showToast(
          `El docente ${teacher.nombreCompleto || teacher.nombre} fue habilitado como ${nuevoEstado}.`,
          'success'
        );
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
    const confirmed = globalThis.confirm(
      `¿Confirmas la baja y eliminación definitiva del legajo de ${displayName} (${teacher.legajo})?\n\nEsta acción eliminará el registro del personal académico.`
    );
    if (!confirmed) return;

    try {
      await deleteTeacherApi(teacher.id, teacher.email);
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

  return {
    user,
    canManageTeachers,
    isDocenteRole,
    teachers,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedEstado,
    setSelectedEstado,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
    startIndex,
    currentTeachers,
    isNewTeacherModalOpen,
    setIsNewTeacherModalOpen,
    editingTeacher,
    setEditingTeacher,
    assigningTeacher,
    setAssigningTeacher,
    courses,
    notification,
    setNotification,
    handleResetFilters,
    handleCreateTeacher,
    handleSaveEditTeacher,
    handleOpenAssignments,
    handleSaveAssignments,
    handleToggleStatus,
    handleResetPassword,
    handleDeleteTeacher,
    handleExportNomina,
  };
};
