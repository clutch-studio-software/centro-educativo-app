import { useState, useEffect, useMemo } from 'react';
import {
  fetchAttendanceManagementData,
  resolveAuthorizedCoursesForAttendance,
  getStudentsForAttendanceCourse,
  buildDailyCourseAttendanceMap,
  computeDailyCourseAttendanceMetrics,
  saveCourseDailyAttendanceApi,
  approveStudentJustificationApi,
  rejectStudentJustificationApi,
} from '../../services/attendanceService.js';
import { getTodayDateString } from '../../utils/transportSubscriptionUtils.js';

/**
 * Hook de estado y acciones para la pantalla de Registro Diario de Asistencia por Curso
 */
export const useAttendanceManagementState = ({ user, isDocente }) => {
  const todayStr = useMemo(() => getTodayDateString(new Date()), []);

  const [dataState, setDataState] = useState({
    loading: true,
    saving: false,
    courses: [],
    subjects: [],
    teachers: [],
    students: [],
    feedback: null,
  });

  const [filterState, setFilterState] = useState({
    nivelFilter: 'todos',
    selectedCourseId: '',
    selectedDate: todayStr,
  });

  const [editsMap, setEditsMap] = useState({});

  useEffect(() => {
    let mounted = true;
    fetchAttendanceManagementData()
      .then((res) => {
        if (!mounted) return;
        setDataState((prev) => ({
          ...prev,
          loading: false,
          courses: res.courses,
          subjects: res.subjects,
          teachers: res.teachers,
          students: res.students,
        }));
      })
      .catch((err) => {
        if (!mounted) return;
        setDataState((prev) => ({
          ...prev,
          loading: false,
          feedback: { type: 'error', message: err.message || 'Error al cargar cursos y alumnos.' },
        }));
      });
    return () => {
      mounted = false;
    };
  }, []);

  const effectiveDate = isDocente ? todayStr : filterState.selectedDate;

  const { authorizedCourses, currentTeacher, dayInfo, scheduleByCourseId } = useMemo(
    () =>
      resolveAuthorizedCoursesForAttendance({
        user,
        isDocente,
        courses: dataState.courses,
        teachers: dataState.teachers,
        subjects: dataState.subjects,
        dateStr: effectiveDate,
      }),
    [user, isDocente, dataState.courses, dataState.teachers, dataState.subjects, effectiveDate]
  );

  const filteredCourses = useMemo(() => {
    if (isDocente || filterState.nivelFilter === 'todos') {
      return authorizedCourses;
    }
    return authorizedCourses.filter(
      (c) => String(c.nivelId || c.nivel || '').toLowerCase() === filterState.nivelFilter
    );
  }, [authorizedCourses, isDocente, filterState.nivelFilter]);

  const activeCourse = useMemo(() => {
    if (filteredCourses.length === 0) return null;
    return filteredCourses.find((c) => c.id === filterState.selectedCourseId) || filteredCourses[0];
  }, [filteredCourses, filterState.selectedCourseId]);

  const courseStudents = useMemo(
    () => getStudentsForAttendanceCourse(dataState.students, activeCourse),
    [dataState.students, activeCourse]
  );

  const currentAttendanceMap = useMemo(
    () =>
      buildDailyCourseAttendanceMap({
        activeCourse,
        courseStudents,
        effectiveDate,
        editsMap,
      }),
    [activeCourse, courseStudents, effectiveDate, editsMap]
  );

  const metrics = useMemo(
    () => computeDailyCourseAttendanceMetrics(courseStudents, currentAttendanceMap),
    [courseStudents, currentAttendanceMap]
  );

  const updateStudentEdit = (studentId, patch) => {
    if (!activeCourse) return;
    const editKey = `${activeCourse.id}_${effectiveDate}_${studentId}`;
    const current = currentAttendanceMap[studentId] || { estado: 'presente', motivo: '' };
    setEditsMap((prev) => ({
      ...prev,
      [editKey]: { ...current, ...patch },
    }));
  };

  const handleMarkAllPresent = () => {
    if (!activeCourse) return;
    const nextEdits = { ...editsMap };
    for (const st of courseStudents) {
      const editKey = `${activeCourse.id}_${effectiveDate}_${st.id}`;
      nextEdits[editKey] = {
        estado: 'presente',
        motivo: currentAttendanceMap[st.id]?.motivo || '',
      };
    }
    setEditsMap(nextEdits);
  };

  const handleSaveAttendance = async () => {
    if (!activeCourse || courseStudents.length === 0 || dataState.saving) return;
    setDataState((prev) => ({ ...prev, saving: true, feedback: null }));

    try {
      const updatedList = await saveCourseDailyAttendanceApi({
        course: activeCourse,
        dateStr: effectiveDate,
        courseStudents,
        attendanceMap: currentAttendanceMap,
        staffUser: user,
      });

      const updatedById = new Map(updatedList.map((s) => [String(s.id), s]));
      setDataState((prev) => ({
        ...prev,
        saving: false,
        students: prev.students.map((st) => updatedById.get(String(st.id)) || st),
        feedback: {
          type: 'success',
          message: `Parte diario de asistencia guardado en Firebase para ${activeCourse.nombre} ${activeCourse.division || ''} (${effectiveDate}).`,
        },
      }));
    } catch (err) {
      setDataState((prev) => ({
        ...prev,
        saving: false,
        feedback: {
          type: 'error',
          message: err.message || 'No se pudo guardar el registro de asistencia.',
        },
      }));
    }
  };

  const handleApproveJustification = async (student, absenceId) => {
    if (dataState.saving) return;
    setDataState((prev) => ({ ...prev, saving: true, feedback: null }));
    try {
      const updatedStudent = await approveStudentJustificationApi({
        student,
        absenceId,
        staffUser: user,
      });
      setDataState((prev) => ({
        ...prev,
        saving: false,
        students: prev.students.map((s) =>
          String(s.id) === String(updatedStudent.id) ? updatedStudent : s
        ),
        feedback: {
          type: 'success',
          message: `Justificación de inasistencia aprobada para ${student.nombreCompleto || student.nombre}.`,
        },
      }));
    } catch (err) {
      setDataState((prev) => ({
        ...prev,
        saving: false,
        feedback: {
          type: 'error',
          message: err.message || 'Error al aprobar la justificación.',
        },
      }));
    }
  };

  const handleRejectJustification = async (student, absenceId, reason = '') => {
    if (dataState.saving) return;
    setDataState((prev) => ({ ...prev, saving: true, feedback: null }));
    try {
      const updatedStudent = await rejectStudentJustificationApi({
        student,
        absenceId,
        reason,
        staffUser: user,
      });
      setDataState((prev) => ({
        ...prev,
        saving: false,
        students: prev.students.map((s) =>
          String(s.id) === String(updatedStudent.id) ? updatedStudent : s
        ),
        feedback: {
          type: 'success',
          message: `Justificación rechazada para ${student.nombreCompleto || student.nombre}.`,
        },
      }));
    } catch (err) {
      setDataState((prev) => ({
        ...prev,
        saving: false,
        feedback: {
          type: 'error',
          message: err.message || 'Error al rechazar la justificación.',
        },
      }));
    }
  };

  return {
    todayStr,
    dataState,
    setDataState,
    filterState,
    setFilterState,
    effectiveDate,
    currentTeacher,
    dayInfo,
    scheduleByCourseId,
    filteredCourses,
    activeCourse,
    courseStudents,
    currentAttendanceMap,
    metrics,
    updateStudentEdit,
    handleMarkAllPresent,
    handleSaveAttendance,
    handleApproveJustification,
    handleRejectJustification,
  };
};
