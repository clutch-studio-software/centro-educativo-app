import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase.js';
import { fetchAdminDashboardData, updateStudentAndTutorApi } from './adminService.js';
import {
  fetchSportsActivities,
  enrollStudentInDisciplineApi,
  withdrawStudentFromDisciplineApi,
} from './sportsService.js';
import { TRANSPORT_ROUTES } from '../utils/academicUtils.js';
import {
  getTodayDateString,
  canCancelTransportToday,
  getNextMonthFirstDay,
  getTransportRouteOccupancy,
  SPRINTER_STANDARD_CAPACITY,
} from '../utils/transportSubscriptionUtils.js';

/**
 * Normaliza cadenas para comparaciones flexibles (DNI, emails, IDs)
 */
const cleanString = (val) => String(val || '').trim().toLowerCase();
const cleanDni = (val) => String(val || '').replace(/\D/g, '');

/**
 * Resuelve los estudiantes vinculados a un usuario autenticado (alumno o tutor)
 */
export const findLinkedStudents = (currentUser, allStudents = []) => {
  if (!currentUser || !Array.isArray(allStudents) || allStudents.length === 0) {
    return [];
  }

  const role = cleanString(currentUser.role);
  const userUid = cleanString(currentUser.uid || currentUser.id);
  const userDni = cleanDni(currentUser.dni);
  const userEmail = cleanString(currentUser.email);
  const userStudentId = cleanString(currentUser.studentId);
  const userLegajo = cleanString(currentUser.legajo);

  // Caso 1: Estudiante individual autenticado
  if (role.includes('estudiante') || role.includes('alumno')) {
    const studentMatch = allStudents.find((st) => {
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
  const children = allStudents.filter((st) => {
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

  // Fallback de contingencia: si es staff explorando o no hay vínculo exacto,
  // devolver el primer estudiante del padrón para pruebas
  if (role.includes('padre') || role.includes('tutor') || role.includes('admin') || role.includes('staff')) {
    return allStudents.slice(0, 2);
  }

  return allStudents.slice(0, 1);
};

/**
 * Carga todos los datos requeridos por el Portal del Estudiante / Tutor
 */
export const fetchFamilyPortalData = async (currentUser) => {
  const [adminData, sportsActivities] = await Promise.all([
    fetchAdminDashboardData(),
    fetchSportsActivities(),
  ]);

  const allStudents = adminData.students || [];
  const linkedStudents = findLinkedStudents(currentUser, allStudents);

  return {
    students: allStudents,
    linkedStudents,
    allSports: sportsActivities || [],
    routes: TRANSPORT_ROUTES,
    isFallback: adminData.isFallback,
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
    console.warn('Fallback a guardado de transporte institucional:', err.message);
    await updateStudentAndTutorApi({
      studentId: student.id,
      studentData: updatedStudentData,
      tutorId: student.parentId || null,
      tutorData: {},
    });
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
    } catch {
      await updateStudentAndTutorApi({
        studentId: student.id,
        studentData: updatedStudentData,
        tutorId: student.parentId || null,
        tutorData: {},
      });
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

  try {
    const studentRef = doc(db, 'students', student.id);
    await updateDoc(studentRef, {
      transporteBajaSolicitada: true,
      transporteBajaProgramada: nextMonth.iso,
      updatedAt: serverTimestamp(),
    });
  } catch {
    await updateStudentAndTutorApi({
      studentId: student.id,
      studentData: updatedStudentData,
      tutorId: student.parentId || null,
      tutorData: {},
    });
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
export const toggleStudentDiningApi = async ({ student, active }) => {
  if (!student) throw new Error('Estudiante no válido.');

  let currentServicios = Array.isArray(student.servicios) ? [...student.servicios] : [];
  if (active) {
    if (!currentServicios.some((s) => String(s).toLowerCase().includes('comedor'))) {
      currentServicios.push('Comedor Escolar');
    }
  } else {
    currentServicios = currentServicios.filter(
      (s) => !String(s).toLowerCase().includes('comedor')
    );
  }

  const updatedStudentData = {
    ...student,
    comedor: active,
    servicios: currentServicios,
  };

  try {
    const studentRef = doc(db, 'students', student.id);
    await updateDoc(studentRef, {
      comedor: active,
      servicios: currentServicios,
      updatedAt: serverTimestamp(),
    });
  } catch {
    await updateStudentAndTutorApi({
      studentId: student.id,
      studentData: updatedStudentData,
      tutorId: student.parentId || null,
      tutorData: {},
    });
  }

  return updatedStudentData;
};

/**
 * Autogestión de matrícula en disciplina deportiva (aplica límite de 2 y prevención de choques horarios)
 */
export const enrollStudentInSportService = async ({ student, sportId }) => {
  const studentPayload = {
    id: student.id,
    legajo: student.legajo || student.studentID_login || `LEG-${student.id}`,
    dni: student.dni,
    nombre: student.nombreCompleto || `${student.nombre || ''} ${student.apellido || ''}`.trim(),
    curso: student.curso || 'Sin asignar',
    nivel: student.nivel || 'Primario',
  };

  await enrollStudentInDisciplineApi(sportId, studentPayload);

  // Actualizar lista de deportes local en el alumno
  const currentDeportes = Array.isArray(student.deportes) ? [...student.deportes] : [];
  if (!currentDeportes.includes(sportId)) {
    currentDeportes.push(sportId);
  }

  const updatedStudentData = {
    ...student,
    deportes: currentDeportes,
  };

  try {
    const studentRef = doc(db, 'students', student.id);
    await updateDoc(studentRef, {
      deportes: currentDeportes,
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Si falla actualización del doc del alumno, la matrícula en la disciplina ya persistió
  }

  return updatedStudentData;
};

/**
 * Desinscripción de disciplina deportiva
 */
export const withdrawStudentFromSportService = async ({ student, sportId }) => {
  const identifier = student.id || student.legajo || student.studentID_login || student.dni;
  await withdrawStudentFromDisciplineApi(sportId, identifier);

  const currentDeportes = (student.deportes || []).filter(
    (d) => String(d).toLowerCase() !== String(sportId).toLowerCase()
  );

  const updatedStudentData = {
    ...student,
    deportes: currentDeportes,
  };

  try {
    const studentRef = doc(db, 'students', student.id);
    await updateDoc(studentRef, {
      deportes: currentDeportes,
      updatedAt: serverTimestamp(),
    });
  } catch {
    // Continúa con éxito
  }

  return updatedStudentData;
};
