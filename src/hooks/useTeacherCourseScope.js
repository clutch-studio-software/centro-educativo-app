import { useMemo } from 'react';
import { matchesSubjectToCourse, sortCourseObjects } from '../utils/academicUtils';
import {
  findCurrentTeacher,
  areCoursesEqual,
} from '../components/admin/teachers/teacherScheduleUtils';

/**
 * Hook para filtrar el alcance de cursos y materias según el rol del usuario (RBAC).
 * Si el usuario es Docente, limita la visualización a sus cátedras asignadas.
 */
export const useTeacherCourseScope = ({
  courses = [],
  subjects = [],
  teachers = [],
  user,
  isDocente = false,
  coursesByLevel = {},
  activeTab = 'primario',
  selectedCourseId = '',
}) => {
  const currentTeacher = useMemo(() => {
    if (!isDocente) return null;
    return findCurrentTeacher(user, teachers);
  }, [isDocente, user, teachers]);

  const visibleCourses = useMemo(() => {
    if (!isDocente) return courses;
    if (!currentTeacher) return [];

    return courses.filter((course) => {
      const courseFullName = `${course.nombre} ${course.division || ''}`.trim();
      const matchesCatedra =
        Array.isArray(currentTeacher.catedras) &&
        currentTeacher.catedras.some((cat) =>
          areCoursesEqual(courseFullName, cat.curso)
        );
      if (matchesCatedra) return true;

      return subjects.some((sub) => {
        if (!matchesSubjectToCourse(sub, course)) return false;
        const prof = sub.profesor;
        if (!prof) return false;
        if (currentTeacher.id && prof.id === currentTeacher.id) return true;
        if (
          currentTeacher.email &&
          prof.email &&
          prof.email.toLowerCase() === currentTeacher.email.toLowerCase()
        ) {
          return true;
        }
        if (currentTeacher.nombre && prof.nombre) {
          const tNorm = currentTeacher.nombre.toLowerCase();
          const pNorm = prof.nombre.toLowerCase();
          if (pNorm.includes(tNorm) || tNorm.includes(pNorm)) return true;
        }
        return false;
      });
    });
  }, [isDocente, courses, currentTeacher, subjects]);

  const displayedCoursesByLevel = useMemo(() => {
    if (!isDocente) return coursesByLevel;
    return {
      inicial: sortCourseObjects(visibleCourses.filter((c) => c.nivelId === 'inicial')),
      primario: sortCourseObjects(visibleCourses.filter((c) => c.nivelId === 'primario')),
      secundario: sortCourseObjects(visibleCourses.filter((c) => c.nivelId === 'secundario')),
    };
  }, [isDocente, coursesByLevel, visibleCourses]);

  const visibleSubjectsCount = useMemo(() => {
    if (!isDocente) return subjects.length;
    return subjects.filter((s) => visibleCourses.some((c) => matchesSubjectToCourse(s, c))).length;
  }, [isDocente, subjects, visibleCourses]);

  const availableLevels = useMemo(() => {
    return ['inicial', 'primario', 'secundario'].filter(
      (lvl) => (displayedCoursesByLevel[lvl] || []).length > 0
    );
  }, [displayedCoursesByLevel]);

  const effectiveActiveTab = useMemo(() => {
    if (!isDocente || activeTab === 'planes') return activeTab;
    const currentCourses = displayedCoursesByLevel[activeTab] || [];
    if (currentCourses.length > 0) return activeTab;
    return availableLevels[0] || activeTab;
  }, [isDocente, activeTab, displayedCoursesByLevel, availableLevels]);

  const effectiveSelectedCourseId = useMemo(() => {
    if (!isDocente) return selectedCourseId;
    if (visibleCourses.some((c) => c.id === selectedCourseId)) return selectedCourseId;
    return visibleCourses[0]?.id || selectedCourseId;
  }, [isDocente, visibleCourses, selectedCourseId]);

  return {
    currentTeacher,
    visibleCourses,
    displayedCoursesByLevel,
    effectiveActiveTab,
    effectiveSelectedCourseId,
    visibleSubjectsCount,
  };
};

export default useTeacherCourseScope;
