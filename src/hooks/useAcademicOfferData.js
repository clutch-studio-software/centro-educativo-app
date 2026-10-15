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
  sortCourseObjects,
  normalizeAcademicText,
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
    const cleanNombre = (newCourseData.nombre || '').trim();
    const cleanDivision = (newCourseData.division || 'A').toUpperCase().trim();

    // Validar duplicado exacto en el mismo nivel
    const isDuplicate = courses.some((c) => {
      if (c.nivelId !== newCourseData.nivelId) return false;
      const isSameCourse =
        normalizeAcademicText(c.nombre) === normalizeAcademicText(cleanNombre);
      const existingDivision = (c.division || 'A').toUpperCase().trim();
      return isSameCourse && existingDivision === cleanDivision;
    });

    if (isDuplicate) {
      showToast(
        `Ya existe la división "${cleanDivision}" para el curso "${cleanNombre}". No puede haber divisiones duplicadas.`,
        'error'
      );
      return false;
    }

    try {
      const created = await createAcademicCourse({
        ...newCourseData,
        nombre: cleanNombre,
        division: cleanDivision,
      });
      const nextCourses = [created, ...courses];
      setCourses(nextCourses);
      showToast(
        `¡División "${created.nombre} (${created.division || 'A'})" creada y guardada en Firebase!`,
        'success'
      );
      await syncAcademicCatalog(nextCourses);
      return true;
    } catch (err) {
      console.error('Error al guardar división en Firestore:', err);
      const fallbackCourse = {
        ...newCourseData,
        nombre: cleanNombre,
        division: cleanDivision,
      };
      setCourses((prev) => [fallbackCourse, ...prev]);
      showToast('Guardado localmente. Error al sincronizar con Firebase.', 'warning');
      return true;
    }
  }, [courses, showToast]);

  const handleSaveEditCourse = useCallback(
    async (courseId, updatedCourseData) => {
      const previousCourse = courses.find((c) => c.id === courseId);

      const cleanNombre = (updatedCourseData.nombre || '').trim();
      const cleanDivision = (updatedCourseData.division || 'A').toUpperCase().trim();
      const targetNivel = updatedCourseData.nivelId || previousCourse?.nivelId;

      // Validar si la nueva división ya existe en otro curso del mismo nivel
      const isDuplicate = courses.some((c) => {
        if (c.id === courseId) return false;
        if (c.nivelId !== targetNivel) return false;
        const isSameCourse =
          normalizeAcademicText(c.nombre) === normalizeAcademicText(cleanNombre);
        const existingDivision = (c.division || 'A').toUpperCase().trim();
        return isSameCourse && existingDivision === cleanDivision;
      });

      if (isDuplicate) {
        showToast(
          `Ya existe la división "${cleanDivision}" para el curso "${cleanNombre}". No puede haber divisiones duplicadas.`,
          'error'
        );
        return false;
      }

      const prevNombre = (previousCourse?.nombre || '').trim();
      const prevDivision = (previousCourse?.division || 'A').toUpperCase().trim();

      const hasNameOrDivisionChanged =
        previousCourse &&
        (cleanNombre !== prevNombre ||
          cleanDivision !== prevDivision ||
          updatedCourseData.nivelId !== previousCourse.nivelId);

      // Obtener alumnos que pertenecían a este curso antes de la edición
      const affectedStudents = previousCourse
        ? getEnrolledStudentsForCourse(students, previousCourse)
        : [];

      const nextCourses = courses.map((c) =>
        c.id === courseId
          ? {
              ...c,
              ...updatedCourseData,
              nombre: cleanNombre,
              division: cleanDivision,
            }
          : c
      );
      setCourses(nextCourses);

      // Actualizar inmediatamente a los alumnos en el estado local
      if (hasNameOrDivisionChanged && affectedStudents.length > 0) {
        const affectedIds = new Set(affectedStudents.map((s) => s.id));
        const nivelCap = updatedCourseData.nivelId
          ? updatedCourseData.nivelId.charAt(0).toUpperCase() +
            updatedCourseData.nivelId.slice(1)
          : '';
        const newCursoDisplay = nivelCap
          ? `${nivelCap} - ${cleanNombre} ${cleanDivision}`
          : `${cleanNombre} ${cleanDivision}`;

        setStudents((prev) =>
          prev.map((s) => {
            if (
              affectedIds.has(s.id) ||
              (previousCourse && matchesStudentToDivision(s, previousCourse))
            ) {
              return {
                ...s,
                curso: cleanNombre,
                division: cleanDivision,
                cursoDisplay: newCursoDisplay,
                cursoId: courseId,
              };
            }
            return s;
          })
        );
      }

      showToast(
        `División "${cleanNombre} (${cleanDivision})" actualizada.${
          hasNameOrDivisionChanged && affectedStudents.length > 0
            ? ` ${affectedStudents.length} alumno(s) reasociados a la nueva división.`
            : ''
        }`,
        'success'
      );

      try {
        await updateAcademicCourse(
          courseId,
          { ...updatedCourseData, nombre: cleanNombre, division: cleanDivision },
          hasNameOrDivisionChanged ? affectedStudents : []
        );
        syncAcademicCatalog(nextCourses);
      } catch (err) {
        console.error('Error al actualizar en Firestore:', err);
        showToast('Error al persistir cambios en Firebase.', 'warning');
      }
    },
    [courses, students, showToast]
  );

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

  // Group courses by level (ordenados por curso y luego por división)
  const coursesByLevel = useMemo(() => {
    return {
      inicial: sortCourseObjects(courses.filter((c) => c.nivelId === 'inicial')),
      primario: sortCourseObjects(courses.filter((c) => c.nivelId === 'primario')),
      secundario: sortCourseObjects(courses.filter((c) => c.nivelId === 'secundario')),
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
