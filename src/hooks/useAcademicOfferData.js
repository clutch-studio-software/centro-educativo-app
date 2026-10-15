import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  INITIAL_COURSES,
  INITIAL_SUBJECTS,
} from '../data/mockAcademicOffer';
import { MOCK_TEACHERS } from '../data/mockTeachers';
import { MOCK_STUDENTS } from '../data/mockStudents';
import {
  getEnrolledStudentsForCourse,
  matchesStudentToDivision,
} from '../utils/academicUtils';
import { fetchAdminDashboardData } from '../services/adminService';
import {
  fetchAcademicCourses,
  createAcademicCourse,
  updateAcademicCourse,
  toggleAcademicCourseStatus,
  deleteAcademicCourse,
  syncAcademicCatalog,
} from '../services/academicService';

export const useAcademicOfferData = (showToast) => {
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [teachers] = useState(MOCK_TEACHERS);
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState('curso-ns-1');

  // Sync with Firestore courses and students
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchAcademicCourses().catch((err) => {
        console.warn('Error al cargar cursos desde Firestore, usando respaldo:', err);
        return INITIAL_COURSES;
      }),
      fetchAdminDashboardData().catch((err) => {
        console.warn('Error al cargar estudiantes desde Firestore, usando respaldo:', err);
        return null;
      }),
    ]).then(([firestoreCourses, adminData]) => {
      if (!isMounted) return;
      if (firestoreCourses && firestoreCourses.length > 0) {
        setCourses(firestoreCourses);
        setSelectedCourseId((prev) => {
          const exists = firestoreCourses.some((c) => c.id === prev);
          return exists ? prev : firestoreCourses[0].id;
        });
      }
      if (adminData?.students && adminData.students.length > 0) {
        setStudents(adminData.students);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Handlers for Course actions with Firestore synchronization
  const handleToggleCourseStatus = useCallback(async (course) => {
    const updatedStatus = !course.activo;
    setCourses((prev) =>
      prev.map((c) => (c.id === course.id ? { ...c, activo: updatedStatus } : c))
    );
    showToast(
      `La división "${course.nombre} (${course.division || 'A'})" ha sido ${
        updatedStatus ? 'activada' : 'pausada'
      }.`,
      updatedStatus ? 'success' : 'info'
    );

    try {
      await toggleAcademicCourseStatus(course.id, updatedStatus);
    } catch (err) {
      console.error('Error al actualizar estado en Firestore:', err);
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, activo: !updatedStatus } : c))
      );
      showToast('No se pudo actualizar el estado en Firebase.', 'error');
    }
  }, [showToast]);

  const handleCreateCourse = useCallback(async (newCourseData) => {
    try {
      const created = await createAcademicCourse(newCourseData);
      setCourses((prev) => [created, ...prev]);
      showToast(
        `¡División "${created.nombre} (${created.division || 'A'})" creada y guardada en Firebase!`,
        'success'
      );
      syncAcademicCatalog([created, ...courses]);
    } catch (err) {
      console.error('Error al guardar división en Firestore:', err);
      setCourses((prev) => [newCourseData, ...prev]);
      showToast('Guardado localmente. Error al sincronizar con Firebase.', 'warning');
    }
  }, [courses, showToast]);

  const handleSaveEditCourse = useCallback(async (courseId, updatedCourseData) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ...updatedCourseData } : c))
    );
    showToast(
      `División "${updatedCourseData.nombre} (${updatedCourseData.division || 'A'})" actualizada.`,
      'success'
    );

    try {
      await updateAcademicCourse(courseId, updatedCourseData);
      syncAcademicCatalog(
        courses.map((c) => (c.id === courseId ? { ...c, ...updatedCourseData } : c))
      );
    } catch (err) {
      console.error('Error al actualizar en Firestore:', err);
      showToast('Error al persistir cambios en Firebase.', 'warning');
    }
  }, [courses, showToast]);

  const handleDeleteCourse = useCallback(async (course) => {
    const affectedStudents = getEnrolledStudentsForCourse(students, course);

    setStudents((prev) =>
      prev.map((s) => {
        if (matchesStudentToDivision(s, course)) {
          return {
            ...s,
            curso: 'sin asignar',
            division: 'sin asignar',
            cursoDisplay: 'Sin asignar',
            cursoId: null,
          };
        }
        return s;
      })
    );

    const remainingCourses = courses.filter((c) => c.id !== course.id);
    setCourses(remainingCourses);

    showToast(
      affectedStudents.length > 0
        ? `División "${course.nombre} (${course.division || 'A'})" eliminada. ${affectedStudents.length} alumno(s) quedaron con curso sin asignar.`
        : `División "${course.nombre} (${course.division || 'A'})" eliminada de la oferta académica.`,
      'info'
    );

    try {
      await deleteAcademicCourse(course.id, affectedStudents);
      syncAcademicCatalog(remainingCourses);
    } catch (err) {
      console.error('Error al eliminar división en Firestore:', err);
      showToast('Error al eliminar en Firebase.', 'error');
    }
  }, [courses, students, showToast]);

  // Handlers for Subject actions
  const handleCreateSubject = useCallback((newSubject) => {
    setSubjects((prev) => [newSubject, ...prev]);
    setCourses((prev) =>
      prev.map((c) =>
        c.id === newSubject.cursoId
          ? { ...c, materiasCount: (c.materiasCount || 0) + 1 }
          : c
      )
    );
    setSelectedCourseId(newSubject.cursoId);
    showToast(`Materia "${newSubject.nombre}" agregada al plan.`, 'success');
  }, [showToast]);

  const handleToggleSubjectDictado = useCallback((subject) => {
    const updatedDictado = !subject.dictadoActivo;
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === subject.id ? { ...s, dictadoActivo: updatedDictado } : s
      )
    );
    showToast(
      `Dictado de "${subject.nombre}" ${updatedDictado ? 'reanudado' : 'pausado'}.`,
      'info'
    );
  }, [showToast]);

  const handleSaveReassignedTeacher = useCallback((subjectId, newProfesor) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? { ...s, profesor: newProfesor } : s))
    );
    showToast(`Docente ${newProfesor.nombre} reasignado a la materia.`, 'success');
  }, [showToast]);

  // Group courses by level
  const coursesByLevel = useMemo(() => {
    return {
      inicial: courses.filter((c) => c.nivelId === 'inicial'),
      primario: courses.filter((c) => c.nivelId === 'primario'),
      secundario: courses.filter((c) => c.nivelId === 'secundario'),
    };
  }, [courses]);

  return {
    courses,
    subjects,
    teachers,
    students,
    isLoading,
    selectedCourseId,
    setSelectedCourseId,
    coursesByLevel,
    handleToggleCourseStatus,
    handleCreateCourse,
    handleSaveEditCourse,
    handleDeleteCourse,
    handleCreateSubject,
    handleToggleSubjectDictado,
    handleSaveReassignedTeacher,
  };
};
