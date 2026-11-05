import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase.js';
import { fetchAdminDashboardData } from './adminService.js';
import {
  fetchSportsActivities,
  enrollStudentInDisciplineApi,
  withdrawStudentFromDisciplineApi,
} from './sportsService.js';
import { TRANSPORT_ROUTES } from '../utils/academicUtils.js';
import { MOCK_STUDENTS } from '../data/mockStudents.js';
import {
  getTodayDateString,
  canCancelTransportToday,
  canCancelServiceToday,
  getNextMonthFirstDay,
  getTransportRouteOccupancy,
  SPRINTER_STANDARD_CAPACITY,
} from '../utils/transportSubscriptionUtils.js';

const LOCAL_STUDENTS_KEY = 'school_students_local';

/**
 * Normaliza cadenas para comparaciones flexibles (DNI, emails, IDs)
 */
const cleanString = (val) => String(val || '').trim().toLowerCase();
const cleanDni = (val) => String(val || '').replace(/\D/g, '');

/**
 * Recupera la caché local de estudiantes para persistencia optimista en modo dev/offline/tutor
 */
export const getCachedStudents = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STUDENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Continuar con lista por defecto
  }
  return MOCK_STUDENTS;
};

/**
 * Persiste los cambios de un estudiante en la caché local
 */
export const persistStudentLocal = (updatedStudent) => {
  if (!updatedStudent || !updatedStudent.id) return;
  try {
    const currentList = getCachedStudents();
    const nextList = currentList.map((st) =>
      String(st.id) === String(updatedStudent.id) ? { ...st, ...updatedStudent } : st
    );
    if (!nextList.some((st) => String(st.id) === String(updatedStudent.id))) {
      nextList.push(updatedStudent);
    }
    localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(nextList));
  } catch {
    // Continuar sin bloquear
  }
};

/**
 * Resuelve los estudiantes vinculados a un usuario autenticado (alumno o tutor)
 */
export const findLinkedStudents = (currentUser, allStudents = []) => {
  const effectiveStudents =
    Array.isArray(allStudents) && allStudents.length > 0
      ? allStudents
      : getCachedStudents();

  if (!currentUser) {
    return effectiveStudents.slice(0, 2);
  }

  const role = cleanString(currentUser.role);
  const userUid = cleanString(currentUser.uid || currentUser.id);
  const userDni = cleanDni(currentUser.dni);
  const userEmail = cleanString(currentUser.email);
  const userStudentId = cleanString(currentUser.studentId);
  const userLegajo = cleanString(currentUser.legajo);

  // Caso 1: Estudiante individual autenticado
  if (role.includes('estudiante') || role.includes('alumno')) {
    const studentMatch = effectiveStudents.find((st) => {
      const stId = cleanString(st.id);
      const stUid = cleanString(st.uid);
      const stLoginId = cleanString(st.studentID_login);
      const stLegajo = cleanString(st.legajo);
      const stDni = cleanDni(st.dni);

      return (
        (userUid && (stId === userUid || stUid === userUid)) ||
        (userStudentId && (stId === userStudentId || stLoginId === userStudentId)) ||
        (userLegajo && (stLegajo === userLegajo || stLoginId === userLegajo)) ||
        (userDni && stDni === userDni)
      );
    });

    if (studentMatch) {
      return [studentMatch];
    }
  }

  // Caso 2: Padre / Tutor o Responsable a cargo (puede tener 1 o más hijos)
  const children = effectiveStudents.filter((st) => {
    const parentId = cleanString(st.parentId);
    const tutorDni = cleanDni(st.tutorDni);
    const tutorEmail = cleanString(st.tutorEmail);
    const emailPadre = cleanString(st.emailPadre);

    const matchesId = Boolean(userUid && parentId === userUid);
    const matchesDni = Boolean(userDni && tutorDni && userDni === tutorDni);
    const matchesEmail = Boolean(
      userEmail &&
        ((tutorEmail && tutorEmail === userEmail) ||
          (emailPadre && emailPadre === userEmail))
    );

    return matchesId || matchesDni || matchesEmail;
  });

  if (children.length > 0) {
    return children;
  }

  // Fallback de demostración / contingencia
  return effectiveStudents.slice(0, 2);
};

/**
 * Carga todos los datos requeridos por el Portal del Estudiante / Tutor
 */
export const fetchFamilyPortalData = async (currentUser) => {
  let adminStudents = [];
  let isFallback = false;

  try {
    const adminData = await fetchAdminDashboardData();
    if (Array.isArray(adminData.students) && adminData.students.length > 0) {
      adminStudents = adminData.students;
    }
    isFallback = adminData.isFallback;
  } catch {
    isFallback = true;
  }

  let sportsActivities = [];
  try {
    sportsActivities = await fetchSportsActivities();
  } catch {
    sportsActivities = [];
  }

  const cachedStudents = getCachedStudents();

  // Si Firestore trajo estudiantes, combinamos con cualquier modificación local
  let allStudents = adminStudents.length > 0 ? adminStudents : cachedStudents;

  if (adminStudents.length > 0 && cachedStudents.length > 0) {
    allStudents = adminStudents.map((st) => {
      const cached = cachedStudents.find((c) => String(c.id) === String(st.id));
      return cached ? { ...st, ...cached } : st;
    });
  }

  const linkedStudents = findLinkedStudents(currentUser, allStudents);

  return {
    students: allStudents,
    linkedStudents,
    allSports: Array.isArray(sportsActivities) && sportsActivities.length > 0 ? sportsActivities : [],
    routes: TRANSPORT_ROUTES,
    isFallback,
  };
};

/**
 * Inscribe a un alumno a un recorrido dinámico de transporte escolar verificando cupo Sprinter
 */
export const enrollStudentInTransportApi = async ({
  student,
  routeId,
  allStudents = [],
  routes = TRANSPORT_ROUTES,
  today = new Date(),
}) => {
  if (!student || !routeId) {
    throw new Error('Faltan datos del estudiante o del recorrido de transporte.');
  }

  // Validar capacidad de 15 plazas (Mercedes-Benz Sprinter estándar)
  const occupancy = getTransportRouteOccupancy(
    routeId,
    allStudents,
    routes,
    SPRINTER_STANDARD_CAPACITY
  );

  if (occupancy.estaLleno) {
    throw new Error(
      `El ${routeId} alcanzó el cupo máximo de 15 plazas (Mercedes-Benz Sprinter escolar). No hay cupos libres disponibles.`
    );
  }

  const currentServicios = Array.isArray(student.servicios) ? [...student.servicios] : [];
  if (!currentServicios.some((s) => String(s).toLowerCase().includes('transporte'))) {
    currentServicios.push('Transporte Escolar');
  }

  const todayStr = getTodayDateString(today);

  const updatedStudentData = {
    ...student,
    servicios: currentServicios,
    recorridoTransporte: routeId,
    transporteFechaInicio: todayStr,
    transporteBajaSolicitada: false,
    transporteBajaProgramada: null,
  };

  persistStudentLocal(updatedStudentData);

  try {
    const studentRef = doc(db, 'students', student.id);
    await updateDoc(studentRef, {
      servicios: currentServicios,
      recorridoTransporte: routeId,
      transporteFechaInicio: todayStr,
      transporteBajaSolicitada: false,
      transporteBajaProgramada: null,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Persistencia local activa para transporte escolar:', err.message);
  }

  return updatedStudentData;
};

/**
 * Cancela o programa la baja del transporte escolar según la regla de negocio
 * (mismo día = baja inmediata | día posterior = baja programada a partir del mes siguiente)
 */
export const cancelStudentTransportApi = async ({
  student,
  today = new Date(),
  isAdminOverride = false,
}) => {
  if (!student) {
    throw new Error('Estudiante no válido para la baja de transporte.');
  }

  const isSameDay = canCancelTransportToday(student, today);

  if (isSameDay || isAdminOverride) {
    // Baja inmediata
    const currentServicios = (student.servicios || []).filter(
      (s) => !String(s).toLowerCase().includes('transporte')
    );

    const updatedStudentData = {
      ...student,
      servicios: currentServicios,
      recorridoTransporte: null,
      transporteFechaInicio: null,
      transporteBajaSolicitada: false,
      transporteBajaProgramada: null,
    };

    persistStudentLocal(updatedStudentData);

    try {
      const studentRef = doc(db, 'students', student.id);
      await updateDoc(studentRef, {
        servicios: currentServicios,
        recorridoTransporte: null,
        transporteFechaInicio: null,
        transporteBajaSolicitada: false,
        transporteBajaProgramada: null,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('Persistencia local activa para baja de transporte:', err.message);
    }

    return {
      student: updatedStudentData,
      immediate: true,
      message: 'La baja del transporte escolar se aplicó de forma inmediata (cancelación en el mismo día).',
    };
  }

  // Baja programada para el mes siguiente
  const nextMonth = getNextMonthFirstDay(today);
  const updatedStudentData = {
    ...student,
    transporteBajaSolicitada: true,
    transporteBajaProgramada: nextMonth.iso,
  };

  persistStudentLocal(updatedStudentData);

  try {
    const studentRef = doc(db, 'students', student.id);
    await updateDoc(studentRef, {
      transporteBajaSolicitada: true,
      transporteBajaProgramada: nextMonth.iso,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Persistencia local activa para baja programada de transporte:', err.message);
  }

  return {
    student: updatedStudentData,
    immediate: false,
    effectiveDate: nextMonth.display,
    message: `Baja programada registrada con éxito. Por normativa institucional, la baja tendrá efecto a partir del ${nextMonth.display}. El mes en curso se abona con el proporcional ya facturado.`,
  };
};

/**
 * Activa o da de baja el servicio de comedor escolar
 */
export const toggleStudentDiningApi = async ({
  student,
  active,
  today = new Date(),
  isAdminOverride = false,
}) => {
  if (!student) throw new Error('Estudiante no válido.');

  const todayStr = getTodayDateString(today);
  const nextMonth = getNextMonthFirstDay(today);

  let updatedStudentData;
  let immediate = true;
  let message = '';

  if (active) {
    const currentServicios = Array.isArray(student.servicios) ? [...student.servicios] : [];
    if (!currentServicios.some((s) => String(s).toLowerCase().includes('comedor'))) {
      currentServicios.push('Comedor Escolar');
    }

    updatedStudentData = {
      ...student,
      comedor: true,
      servicios: currentServicios,
      comedorFechaInicio: todayStr,
      comedorBajaSolicitada: false,
      comedorBajaProgramada: null,
    };
    message = 'Servicio de comedor escolar habilitado exitosamente. Facturación inicial con proporcional del mes.';
  } else {
    const isSameDay = canCancelServiceToday(student.comedorFechaInicio, today);

    if (isSameDay || isAdminOverride) {
      const currentServicios = (student.servicios || []).filter(
        (s) => !String(s).toLowerCase().includes('comedor')
      );
      updatedStudentData = {
        ...student,
        comedor: false,
        servicios: currentServicios,
        comedorFechaInicio: null,
        comedorBajaSolicitada: false,
        comedorBajaProgramada: null,
      };
      immediate = true;
      message = 'La baja del comedor escolar se aplicó de forma inmediata (cancelación en el mismo día).';
    } else {
      updatedStudentData = {
        ...student,
        comedorBajaSolicitada: true,
        comedorBajaProgramada: nextMonth.iso,
      };
      immediate = false;
      message = `Baja programada registrada con éxito. Por normativa institucional, la baja tendrá efecto a partir del ${nextMonth.display}. El mes en curso se abona con el proporcional ya facturado.`;
    }
  }

  persistStudentLocal(updatedStudentData);

  try {
    const studentRef = doc(db, 'students', student.id);
    await updateDoc(studentRef, {
      comedor: updatedStudentData.comedor,
      servicios: updatedStudentData.servicios,
      comedorFechaInicio: updatedStudentData.comedorFechaInicio,
      comedorBajaSolicitada: updatedStudentData.comedorBajaSolicitada,
      comedorBajaProgramada: updatedStudentData.comedorBajaProgramada,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Persistencia local activa para comedor escolar:', err.message);
  }

  return { student: updatedStudentData, immediate, message };
};

/**
 * Autogestión de matrícula en disciplina deportiva
 */
export const enrollStudentInSportService = async ({
  student,
  sportId,
  today = new Date(),
}) => {
  if (!student || !sportId) {
    throw new Error('Estudiante o actividad deportiva no válida.');
  }

  const todayStr = getTodayDateString(today);
  const currentDeportes = Array.isArray(student.deportes) ? [...student.deportes] : [];
  if (!currentDeportes.includes(sportId)) {
    currentDeportes.push(sportId);
  }

  const prevSubs = student.deportesSuscripciones || {};
  const updatedSubs = {
    ...prevSubs,
    [sportId]: {
      fechaInicio: todayStr,
      bajaSolicitada: false,
      bajaProgramada: null,
    },
  };

  const updatedStudentData = {
    ...student,
    deportes: currentDeportes,
    deporteFechaInicio: student.deporteFechaInicio || todayStr,
    deportesSuscripciones: updatedSubs,
  };

  persistStudentLocal(updatedStudentData);

  try {
    const studentPayload = {
      id: student.id,
      legajo: student.legajo || student.studentID_login || `LEG-${student.id}`,
      dni: student.dni,
      nombre: student.nombreCompleto || `${student.nombre || ''} ${student.apellido || ''}`.trim(),
      curso: student.curso || 'Sin asignar',
      nivel: student.nivel || 'Primario',
    };
    await enrollStudentInDisciplineApi(sportId, studentPayload);
  } catch (err) {
    console.warn('Aviso en matrícula de disciplina:', err.message);
  }

  try {
    const studentRef = doc(db, 'students', student.id);
    await updateDoc(studentRef, {
      deportes: currentDeportes,
      deportesSuscripciones: updatedSubs,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Persistencia local activa para deportes:', err.message);
  }

  return updatedStudentData;
};

/**
 * Desinscripción de disciplina deportiva
 */
export const withdrawStudentFromSportService = async ({
  student,
  sportId,
  today = new Date(),
  isAdminOverride = false,
}) => {
  if (!student || !sportId) {
    throw new Error('Estudiante o actividad deportiva no válida.');
  }

  const nextMonth = getNextMonthFirstDay(today);
  const currentSubs = student.deportesSuscripciones || {};
  const currentSub = currentSubs[sportId] || {};

  const isSameDay = canCancelServiceToday(
    currentSub.fechaInicio || student.deporteFechaInicio,
    today
  );

  let updatedStudentData;
  let immediate = true;
  let message = '';

  if (isSameDay || isAdminOverride) {
    const currentDeportes = (student.deportes || []).filter(
      (d) => String(d).toLowerCase() !== String(sportId).toLowerCase()
    );
    const newSubs = { ...currentSubs };
    delete newSubs[sportId];

    updatedStudentData = {
      ...student,
      deportes: currentDeportes,
      deportesSuscripciones: newSubs,
    };
    immediate = true;
    message = 'La baja de la disciplina deportiva se aplicó de forma inmediata (cancelación en el mismo día).';

    try {
      const identifier = student.id || student.legajo || student.studentID_login || student.dni;
      await withdrawStudentFromDisciplineApi(sportId, identifier);
    } catch (err) {
      console.warn('Aviso en retiro de disciplina:', err.message);
    }
  } else {
    const newSubs = {
      ...currentSubs,
      [sportId]: {
        ...currentSub,
        bajaSolicitada: true,
        bajaProgramada: nextMonth.iso,
      },
    };

    updatedStudentData = {
      ...student,
      deportesSuscripciones: newSubs,
    };
    immediate = false;
    message = `Baja programada registrada con éxito. Por normativa institucional, la baja tendrá efecto a partir del ${nextMonth.display}. El mes en curso se abona con el proporcional ya facturado.`;
  }

  persistStudentLocal(updatedStudentData);

  try {
    const studentRef = doc(db, 'students', student.id);
    await updateDoc(studentRef, {
      deportes: updatedStudentData.deportes,
      deportesSuscripciones: updatedStudentData.deportesSuscripciones,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Persistencia local activa para baja de deportes:', err.message);
  }

  return { student: updatedStudentData, immediate, message };
};
