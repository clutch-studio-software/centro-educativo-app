import {
  collection,
  doc,
  getDocs,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { ensureAdminAuth, fetchTeachersApi } from './teachersService.js';
import { fetchAcademicCourses, fetchAcademicSubjects } from './academicService.js';
import {
  getEnrolledStudentsForCourse,
  matchesSubjectToCourse,
  sortCourseObjects,
} from '../utils/academicUtils.js';
import {
  findCurrentTeacher,
  areCoursesEqual,
} from '../components/admin/teachers/teacherScheduleUtils.js';
import { INITIAL_COURSES, INITIAL_SUBJECTS } from '../data/mockAcademicOffer.js';
import { persistStudentLocal } from './familyPortalService.js';

const DAY_MAPPING = {
  0: { key: 'dom', label: 'Domingo', tokens: ['dom', 'domingo'] },
  1: { key: 'lun', label: 'Lunes', tokens: ['lun', 'lunes'] },
  2: { key: 'mar', label: 'Martes', tokens: ['mar', 'martes'] },
  3: { key: 'mie', label: 'Miércoles', tokens: ['mie', 'mié', 'miercoles', 'miércoles'] },
  4: { key: 'jue', label: 'Jueves', tokens: ['jue', 'jueves'] },
  5: { key: 'vie', label: 'Viernes', tokens: ['vie', 'viernes'] },
  6: { key: 'sab', label: 'Sábado', tokens: ['sab', 'sabado', 'sábado'] },
};

const ALL_WEEKDAY_TOKENS = [
  'lun', 'lunes', 'mar', 'martes', 'mie', 'mié', 'miercoles', 'miércoles',
  'jue', 'jueves', 'vie', 'viernes', 'sab', 'sábado', 'dom', 'domingo',
];

/**
 * Obtiene la información del día de la semana para una fecha YYYY-MM-DD o Date
 */
export const getDayInfoForDate = (dateInput) => {
  let d;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [y, m, day] = dateInput.split('-').map(Number);
    d = new Date(y, m - 1, day, 12, 0, 0);
  } else if (dateInput instanceof Date && !Number.isNaN(dateInput.getTime())) {
    d = dateInput;
  } else {
    d = new Date();
  }
  const dayIndex = d.getDay();
  return DAY_MAPPING[dayIndex] || DAY_MAPPING[1];
};

/**
 * Verifica si un texto de horario contiene el día indicado
 */
const scheduleStringMatchesDay = (scheduleStr, dayInfo) => {
  const norm = String(scheduleStr || '').toLowerCase().trim();
  if (!norm) return false;
  if (norm.includes('lunes a viernes') || norm.includes('lun a vie') || norm.includes('diario')) {
    return ['lun', 'mar', 'mie', 'jue', 'vie'].includes(dayInfo.key);
  }
  return dayInfo.tokens.some((tok) => norm.includes(tok));
};

const hasAnyDayToken = (scheduleStr) => {
  const norm = String(scheduleStr || '').toLowerCase().trim();
  if (!norm) return false;
  return ALL_WEEKDAY_TOKENS.some((tok) => norm.includes(tok));
};

/**
 * Determina los cursos en los que un Docente dicta clases en la fecha indicada (día de la fecha).
 * Regla de negocio:
 * - Preceptores, Administrativos y Directivos pueden tomar asistencia de CUALQUIER curso.
 * - Docentes SOLAMENTE pueden tomar asistencia en los cursos donde dictan clases en el día de la fecha.
 */
export const resolveAuthorizedCoursesForAttendance = ({
  user,
  isDocente = false,
  courses = [],
  teachers = [],
  subjects = [],
  dateStr,
}) => {
  const activeCourses = sortCourseObjects(
    (courses || []).filter((c) => c.activo !== false)
  );
  const dayInfo = getDayInfoForDate(dateStr);

  if (!isDocente) {
    return {
      authorizedCourses: activeCourses,
      currentTeacher: null,
      dayInfo,
      scheduleByCourseId: {},
    };
  }

  const currentTeacher = findCurrentTeacher(user, teachers);
  if (!currentTeacher) {
    return {
      authorizedCourses: [],
      currentTeacher: null,
      dayInfo,
      scheduleByCourseId: {},
    };
  }

  const grilla = Array.isArray(currentTeacher.grillaHoraria)
    ? currentTeacher.grillaHoraria
    : [];
  const catedras = Array.isArray(currentTeacher.catedras)
    ? currentTeacher.catedras
    : [];
  const scheduleByCourseId = {};

  const authorizedCourses = activeCourses.filter((course) => {
    const courseFullName = `${course.nombre} ${course.division || ''}`.trim();
    const matchedSlots = [];

    // 1. Verificar en la grilla horaria semanal del docente para el día de la fecha (dayInfo.key)
    for (const row of grilla) {
      const slot = row?.[dayInfo.key];
      if (slot && slot.curso && areCoursesEqual(courseFullName, slot.curso)) {
        matchedSlots.push(`${slot.materia || 'Clase'} (${row.hora || 'Horario escolar'})`);
      }
    }

    // 2. Verificar en las cátedras del docente si tienen horario explícito para hoy
    for (const cat of catedras) {
      const matchesCourse =
        (cat.cursoId && cat.cursoId === course.id) ||
        areCoursesEqual(courseFullName, cat.curso);

      if (!matchesCourse) continue;

      if (scheduleStringMatchesDay(cat.horario, dayInfo)) {
        matchedSlots.push(`${cat.nombre || 'Cátedra'} (${cat.horario})`);
      } else if (!hasAnyDayToken(cat.horario) && grilla.length === 0 && ['lun', 'mar', 'mie', 'jue', 'vie'].includes(dayInfo.key)) {
        matchedSlots.push(`${cat.nombre || 'Cátedra'} (Turno regular)`);
      }
    }

    // 3. Verificar en el catálogo de materias
    for (const sub of subjects) {
      if (!matchesSubjectToCourse(sub, course)) continue;
      const prof = sub.profesor;
      if (!prof) continue;

      const isSameTeacher =
        (currentTeacher.id && prof.id === currentTeacher.id) ||
        (currentTeacher.email &&
          prof.email &&
          prof.email.toLowerCase() === currentTeacher.email.toLowerCase()) ||
        (currentTeacher.nombre &&
          prof.nombre &&
          (prof.nombre.toLowerCase().includes(currentTeacher.nombre.toLowerCase()) ||
            currentTeacher.nombre.toLowerCase().includes(prof.nombre.toLowerCase())));

      if (isSameTeacher && scheduleStringMatchesDay(sub.horario, dayInfo)) {
        matchedSlots.push(`${sub.nombre} (${sub.horario})`);
      }
    }

    // 4. Si es docente titular asignado directamente al curso (Inicial/Primario) de lunes a viernes
    const isTitularOfCourse =
      (course.docenteId && currentTeacher.id && course.docenteId === currentTeacher.id) ||
      (course.docenteTitular &&
        currentTeacher.nombre &&
        course.docenteTitular.toLowerCase().includes(currentTeacher.nombre.toLowerCase()));

    if (isTitularOfCourse && ['lun', 'mar', 'mie', 'jue', 'vie'].includes(dayInfo.key)) {
      matchedSlots.push(`Docente Titular de Curso (${course.turno || 'Jornada completa'})`);
    }

    if (matchedSlots.length > 0) {
      scheduleByCourseId[course.id] = Array.from(new Set(matchedSlots));
      return true;
    }

    return false;
  });

  return {
    authorizedCourses,
    currentTeacher,
    dayInfo,
    scheduleByCourseId,
  };
};

/**
 * Carga integralmente los datos necesarios para la pantalla de Registro de Asistencia
 */
export const fetchAttendanceManagementData = async () => {
  await ensureAdminAuth();

  const [coursesRes, subjectsRes, teachersRes, studentsSnap] = await Promise.all([
    fetchAcademicCourses().catch(() => []),
    fetchAcademicSubjects().catch(() => []),
    fetchTeachersApi().catch(() => []),
    getDocs(collection(db, 'students')).catch(() => ({ docs: [] })),
  ]);

  const courses =
    Array.isArray(coursesRes) && coursesRes.length > 0 ? coursesRes : INITIAL_COURSES;
  const subjects =
    Array.isArray(subjectsRes) && subjectsRes.length > 0 ? subjectsRes : INITIAL_SUBJECTS;
  const teachers = Array.isArray(teachersRes) ? teachersRes : [];
  const students = studentsSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  return {
    courses: sortCourseObjects(courses),
    subjects,
    teachers,
    students,
  };
};

/**
 * Obtiene los alumnos pertenecientes a un curso determinado
 */
export const getStudentsForAttendanceCourse = (students = [], course) => {
  if (!course) return [];
  const enrolled = getEnrolledStudentsForCourse(students, course);
  return [...enrolled].sort((a, b) => {
    const nameA = `${a.apellido || ''} ${a.nombre || ''}`.trim().toLowerCase();
    const nameB = `${b.apellido || ''} ${b.nombre || ''}`.trim().toLowerCase();
    return nameA.localeCompare(nameB, 'es');
  });
};

/**
 * Construye el mapa de asistencia del curso para la fecha activa combinando Firestore + ediciones locales
 */
export const buildDailyCourseAttendanceMap = ({
  activeCourse,
  courseStudents = [],
  effectiveDate,
  editsMap = {},
}) => {
  const map = {};
  if (!activeCourse) return map;

  for (const student of courseStudents) {
    const editKey = `${activeCourse.id}_${effectiveDate}_${student.id}`;
    if (editsMap[editKey]) {
      map[student.id] = editsMap[editKey];
      continue;
    }

    const historial = Array.isArray(student.asistencias?.historial)
      ? student.asistencias.historial
      : [];
    const existing = historial.find((h) => h.fecha === effectiveDate);

    if (existing) {
      map[student.id] = {
        estado:
          existing.estado === 'justificacion_pendiente'
            ? 'justificada'
            : existing.estado || 'presente',
        motivo: existing.motivo || '',
      };
    } else {
      map[student.id] = {
        estado: 'presente',
        motivo: '',
      };
    }
  }
  return map;
};

/**
 * Calcula los totales del parte diario para un curso
 */
export const computeDailyCourseAttendanceMetrics = (courseStudents = [], currentAttendanceMap = {}) => {
  let presentes = 0;
  let tardanzas = 0;
  let injustificadas = 0;
  let justificadas = 0;

  for (const st of courseStudents) {
    const entry = currentAttendanceMap[st.id];
    const est = entry?.estado || 'presente';
    if (est === 'presente') presentes += 1;
    else if (est === 'tardanza') tardanzas += 1;
    else if (est === 'injustificada') injustificadas += 1;
    else if (est === 'justificada') justificadas += 1;
  }

  return {
    total: courseStudents.length,
    presentes,
    tardanzas,
    injustificadas,
    justificadas,
  };
};

const STATUS_LABELS = {
  presente: 'Presente',
  tardanza: 'Tardanza',
  injustificada: 'Falta Injustificada',
  justificada: 'Falta Justificada',
};

const DEFAULT_MOTIVOS = {
  presente: 'Asistencia regular registrada en clase.',
  tardanza: 'Ingreso tardío registrado en el curso.',
  injustificada: 'Ausencia sin justificativo registrada en parte diario.',
  justificada: 'Inasistencia justificada por preceptoría / administración.',
};

/**
 * Recalcula las métricas de asistencia de un alumno a partir de su historial completo
 */
export const computeUpdatedAttendanceObject = (rawAsistencias = {}, updatedHistorial = []) => {
  const presentes = updatedHistorial.filter((h) => h.estado === 'presente').length;
  const tardanzas = updatedHistorial.filter(
    (h) => h.estado === 'tardanza' || String(h.tipo || '').toLowerCase().includes('tardanza')
  ).length;
  const faltasInjustificadas = updatedHistorial.filter(
    (h) =>
      h.estado === 'injustificada' ||
      String(h.tipo || '').toLowerCase().includes('injustificada')
  ).length;
  const faltasJustificadas = updatedHistorial.filter(
    (h) =>
      h.estado === 'justificada' ||
      h.estado === 'justificacion_pendiente' ||
      (String(h.tipo || '').toLowerCase().includes('justificada') &&
        !String(h.tipo || '').toLowerCase().includes('injustificada'))
  ).length;

  const totalFaltas = faltasInjustificadas + faltasJustificadas;
  const totalEventos = presentes + totalFaltas + tardanzas;
  const baseDias = Math.max(totalEventos, 20);
  const faltaEquivalente = totalFaltas + tardanzas * 0.5;
  const porcentajeAsistencia = Math.max(
    0,
    Math.min(100, Math.round(((baseDias - faltaEquivalente) / baseDias) * 100))
  );

  return {
    ...rawAsistencias,
    presentes,
    tardanzas,
    faltasInjustificadas,
    faltasJustificadas,
    totalFaltas,
    totalClases: totalEventos,
    porcentajeAsistencia,
    porcentaje: porcentajeAsistencia,
    historial: updatedHistorial,
  };
};

/**
 * Guarda la asistencia diaria de todo un curso en Firebase Firestore
 */
export const saveCourseDailyAttendanceApi = async ({
  course,
  dateStr,
  courseStudents = [],
  attendanceMap = {},
  staffUser = null,
}) => {
  if (!course || !dateStr) {
    throw new Error('Debe seleccionar un curso y una fecha válida.');
  }

  await ensureAdminAuth();

  const staffName =
    staffUser?.nombreCompleto ||
    staffUser?.displayName ||
    staffUser?.nombre ||
    staffUser?.email?.split('@')[0] ||
    'Personal Institucional';
  const staffRole = staffUser?.role || 'Staff';
  const courseLabel = `${course.nombre} ${course.division || ''}`.trim();
  const nowIso = new Date().toISOString();

  const batch = writeBatch(db);
  const updatedStudentsList = [];

  for (const student of courseStudents) {
    if (!student?.id) continue;

    const recordInput = attendanceMap[student.id] || {
      estado: 'presente',
      motivo: '',
    };
    const estado = recordInput.estado || 'presente';
    const tipoLabel = STATUS_LABELS[estado] || 'Presente';
    const motivoText =
      (recordInput.motivo && String(recordInput.motivo).trim()) ||
      DEFAULT_MOTIVOS[estado] ||
      'Registro diario de asistencia';

    const rawAsistencias =
      student.asistencias && typeof student.asistencias === 'object'
        ? student.asistencias
        : { historial: [] };

    const existingHistorial = Array.isArray(rawAsistencias.historial)
      ? [...rawAsistencias.historial]
      : Array.isArray(rawAsistencias.detalle)
        ? [...rawAsistencias.detalle]
        : [];

    const existingIdx = existingHistorial.findIndex((h) => h.fecha === dateStr);
    const prevEntry = existingIdx >= 0 ? existingHistorial[existingIdx] : null;

    const entryPayload = {
      ...(prevEntry || {}),
      id: prevEntry?.id || `att-${dateStr}-${student.id}`,
      fecha: dateStr,
      estado,
      tipo: tipoLabel,
      motivo: motivoText,
      curso: courseLabel,
      registradoPor: staffName,
      registradoPorRol: staffRole,
      updatedAt: nowIso,
    };

    if (existingIdx >= 0) {
      existingHistorial[existingIdx] = entryPayload;
    } else {
      existingHistorial.unshift(entryPayload);
    }

    // Ordenar historial por fecha descendente
    existingHistorial.sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')));

    const updatedAsistencias = computeUpdatedAttendanceObject(rawAsistencias, existingHistorial);
    const updatedStudent = {
      ...student,
      asistencias: updatedAsistencias,
    };

    updatedStudentsList.push(updatedStudent);
    persistStudentLocal(updatedStudent);

    const studentRef = doc(db, 'students', student.id);
    batch.update(studentRef, {
      asistencias: updatedAsistencias,
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  return updatedStudentsList;
};

/**
 * Aprueba una justificación de inasistencia enviada por el tutor de un alumno
 */
export const approveStudentJustificationApi = async ({
  student,
  absenceId,
  staffUser,
}) => {
  if (!student?.id || !absenceId) return student;
  await ensureAdminAuth();

  const staffName =
    staffUser?.nombreCompleto ||
    staffUser?.displayName ||
    staffUser?.nombre ||
    'Preceptoría / Administración';

  const rawAsistencias =
    student.asistencias && typeof student.asistencias === 'object'
      ? student.asistencias
      : { historial: [] };

  const existingHistorial = Array.isArray(rawAsistencias.historial)
    ? [...rawAsistencias.historial]
    : [];

  const updatedHistorial = existingHistorial.map((h) => {
    if (String(h.id) === String(absenceId) || h.fecha === absenceId) {
      return {
        ...h,
        estado: 'justificada',
        tipo: 'Falta Justificada',
        justificada: true,
        justificacion: {
          ...(h.justificacion || {}),
          estado: 'Aprobada por Preceptoría',
          aprobadoPor: staffName,
          fechaAprobacion: new Date().toISOString(),
        },
      };
    }
    return h;
  });

  const updatedAsistencias = computeUpdatedAttendanceObject(rawAsistencias, updatedHistorial);
  const updatedStudent = {
    ...student,
    asistencias: updatedAsistencias,
  };

  persistStudentLocal(updatedStudent);

  await updateDoc(doc(db, 'students', student.id), {
    asistencias: updatedAsistencias,
    updatedAt: serverTimestamp(),
  });

  return updatedStudent;
};
