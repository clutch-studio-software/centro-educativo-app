import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase.js';
import { fetchAdminDashboardData } from './adminService.js';
import {
  fetchSportsActivities,
  enrollStudentInDisciplineApi,
  withdrawStudentFromDisciplineApi,
} from './sportsService.js';
import { TRANSPORT_ROUTES } from '../utils/academicUtils.js';
import { MOCK_STUDENTS } from '../data/mockStudents.js';
import { uploadFileToStorage } from './storageService.js';
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
 * NOTA: Para UIDs de Firebase Auth se usa cleanId para preservar mayúsculas y minúsculas (case-sensitive)
 */
const cleanString = (val) => String(val || '').trim().toLowerCase();
const cleanId = (val) => String(val || '').trim();
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
 * Resuelve los estudiantes vinculados a un usuario autenticado (alumno o tutor).
 * REGLA ESTRICTA: Para tutores, solo devuelve sus hijos legítimos vinculados.
 * No asigna estudiantes ajenos si no existen hijos vinculados.
 */
export const findLinkedStudents = (currentUser, allStudents = []) => {
  if (!currentUser) return [];

  const role = cleanString(currentUser.role);
  const rawUserUid = cleanId(currentUser.uid || currentUser.id);
  const userDni = cleanDni(currentUser.dni);
  const userEmail = cleanString(currentUser.email);
  const userStudentId = cleanString(currentUser.studentId);
  const userLegajo = cleanString(currentUser.legajo);

  // Caso 1: Estudiante individual autenticado
  if (role.includes('estudiante') || role.includes('alumno')) {
    const studentMatch = allStudents.find((st) => {
      const stId = cleanId(st.id);
      const stUid = cleanId(st.uid);
      const stLoginId = cleanString(st.studentID_login);
      const stLegajo = cleanString(st.legajo);
      const stDni = cleanDni(st.dni);

      return (
        (rawUserUid && (stId === rawUserUid || stUid === rawUserUid)) ||
        (userStudentId && (stId === userStudentId || stLoginId === userStudentId)) ||
        (userLegajo && (stLegajo === userLegajo || stLoginId === userLegajo)) ||
        (userDni && stDni === userDni)
      );
    });

    if (studentMatch) {
      return [studentMatch];
    }
    return allStudents.slice(0, 1);
  }

  // Caso 2: Padre / Tutor o Responsable a cargo
  const studentIdSet = new Set(
    Array.isArray(currentUser.studentIds) ? currentUser.studentIds.map(cleanId) : []
  );

  const children = allStudents.filter((st) => {
    const stId = cleanId(st.id);
    const parentId = cleanId(st.parentId);
    const tutorDni = cleanDni(st.tutorDni || st.dniPadre || st.dniTutor);
    const tutorEmail = cleanString(st.tutorEmail);
    const emailPadre = cleanString(st.emailPadre);

    const matchesStudentIds = studentIdSet.has(stId);
    const matchesId = Boolean(rawUserUid && parentId && parentId === rawUserUid);
    const matchesDni = Boolean(userDni && tutorDni && userDni === tutorDni);
    const matchesEmail = Boolean(
      userEmail &&
        ((tutorEmail && tutorEmail === userEmail) ||
          (emailPadre && emailPadre === userEmail))
    );

    return matchesStudentIds || matchesId || matchesDni || matchesEmail;
  });

  if (children.length > 0) {
    return children;
  }

  // Si es staff institucional o admin explorando en modo demostración/E2E
  if (role.includes('admin') || role.includes('staff') || role.includes('directiv')) {
    return allStudents.slice(0, 2);
  }

  // Para un tutor real sin vínculo encontrado, no inventar ni mostrar hijos ajenos
  return [];
};

/**
 * Carga todos los datos requeridos por el Portal del Estudiante / Tutor
 * Consulta Firestore con reglas autorizadas de parentesco o estudiante individual.
 */
export const fetchFamilyPortalData = async (currentUser) => {
  const role = cleanString(currentUser?.role);
  // IMPORTANTE: Respetar case-sensitivity estricta para UIDs de Firebase Auth (evita error de permisos en Firestore)
  const currentAuthUid = auth.currentUser?.uid;
  const rawUserUid = cleanId(currentAuthUid || currentUser?.uid || currentUser?.id);

  let realStudents = [];
  let isFallback = false;

  // 1. Si el usuario es Padre / Tutor: consultar sus hijos directamente en Firestore
  if (rawUserUid && (role.includes('padre') || role.includes('tutor') || !role || role.includes('family'))) {
    // a) Si el objeto currentUser ya trae studentIds vinculados en su sesión (AuthContext)
    const directStudentIds = Array.isArray(currentUser?.studentIds) ? currentUser.studentIds : [];
    if (directStudentIds.length > 0) {
      try {
        const docPromises = directStudentIds.map((sid) => getDoc(doc(db, 'students', cleanId(sid))));
        const docSnaps = await Promise.all(docPromises);
        docSnaps.forEach((ds) => {
          if (ds.exists()) {
            realStudents.push({ id: ds.id, ...ds.data() });
          }
        });
      } catch (err) {
        console.warn('Aviso leyendo studentIds directos:', err.message);
      }
    }

    // b) Si no vinieron directos, leer studentIds del documento /users/{rawUserUid}
    if (realStudents.length === 0) {
      try {
        const userSnap = await getDoc(doc(db, 'users', rawUserUid));
        if (userSnap.exists()) {
          const uData = userSnap.data();
          if (Array.isArray(uData.studentIds) && uData.studentIds.length > 0) {
            const docPromises = uData.studentIds.map((sid) => getDoc(doc(db, 'students', cleanId(sid))));
            const docSnaps = await Promise.all(docPromises);
            docSnaps.forEach((ds) => {
              if (ds.exists()) {
                realStudents.push({ id: ds.id, ...ds.data() });
              }
            });
          }
        }
      } catch (err) {
        console.warn('Aviso leyendo studentIds de usuario:', err.message);
      }
    }

    // c) Si aún no se obtuvieron, consultar en /students donde parentId == rawUserUid
    if (realStudents.length === 0) {
      try {
        const qParent = query(collection(db, 'students'), where('parentId', '==', rawUserUid));
        const qSnap = await getDocs(qParent);
        qSnap.forEach((ds) => {
          realStudents.push({ id: ds.id, ...ds.data() });
        });
      } catch (err) {
        console.warn('Aviso buscando estudiantes por parentId:', err.message);
      }
    }
  }

  // 2. Si el usuario es Estudiante: consultar su documento individual
  if (role.includes('estudiante') || role.includes('alumno')) {
    try {
      const sSnap = await getDoc(doc(db, 'students', rawUserUid));
      if (sSnap.exists()) {
        realStudents = [{ id: sSnap.id, ...sSnap.data() }];
      }
    } catch {
      // Ignorar
    }
  }

  // 3. Si el usuario es Staff / Admin institucional, o si falló Firestore y está en demo
  if (realStudents.length === 0 && (role.includes('admin') || role.includes('staff') || role.includes('directiv'))) {
    try {
      const adminData = await fetchAdminDashboardData();
      if (Array.isArray(adminData.students) && adminData.students.length > 0) {
        realStudents = adminData.students;
      }
      isFallback = adminData.isFallback;
    } catch {
      isFallback = true;
    }
  }

  // 4. Si no se obtuvieron de Firestore y el usuario coincide con alumnos en caché local / mock
  if (realStudents.length === 0) {
    const cachedStudents = getCachedStudents();
    const mockMatches = findLinkedStudents(currentUser, cachedStudents);
    if (mockMatches.length > 0) {
      realStudents = mockMatches;
      isFallback = true;
    } else if (role.includes('admin') || role.includes('staff') || role.includes('directiv')) {
      realStudents = cachedStudents;
      isFallback = true;
    }
  }

  // Si los alumnos provienen de Firestore real (!isFallback), Firestore es la única fuente de verdad
  const localCache = getCachedStudents();
  const allStudents = isFallback
    ? realStudents.map((st) => {
        const cached = localCache.find((c) => String(c.id) === String(st.id));
        return cached ? { ...st, ...cached } : st;
      })
    : realStudents;

  if (!isFallback && realStudents.length > 0) {
    realStudents.forEach((st) => persistStudentLocal(st));
  }

  let sportsActivities = [];
  try {
    sportsActivities = await fetchSportsActivities();
  } catch {
    sportsActivities = [];
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

/**
 * Marca como visto un registro médico de enfermería
 */
export const acknowledgeHealthRecordApi = async ({ student, entryId, tutorUser }) => {
  if (!student || !entryId) return student;

  const tutorName = tutorUser?.nombreCompleto || tutorUser?.nombre || tutorUser?.email || 'Tutor';
  const nowIso = new Date().toISOString();

  const entries = Array.isArray(student.entradasEnfermeria)
    ? student.entradasEnfermeria
    : Array.isArray(student.historialEnfermeria)
      ? student.historialEnfermeria
      : [];

  const updatedEntries = entries.map((en) => {
    if (String(en.id) === String(entryId) || (!en.id && en.fecha === entryId)) {
      return {
        ...en,
        vistoPorTutor: true,
        fechaVisto: nowIso,
        vistoPor: tutorName,
      };
    }
    return en;
  });

  const updatedStudent = {
    ...student,
    entradasEnfermeria: updatedEntries,
  };

  persistStudentLocal(updatedStudent);

  try {
    const sRef = doc(db, 'students', student.id);
    await updateDoc(sRef, {
      entradasEnfermeria: updatedEntries,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Aviso guardando visto enfermería:', err.message);
  }

  return updatedStudent;
};

/**
 * Marca como visto un registro de preceptoría
 */
export const acknowledgePreceptoriaRecordApi = async ({ student, entryId, tutorUser }) => {
  if (!student || !entryId) return student;

  const tutorName = tutorUser?.nombreCompleto || tutorUser?.nombre || tutorUser?.email || 'Tutor';
  const nowIso = new Date().toISOString();

  const entries = Array.isArray(student.entradasPreceptoria)
    ? student.entradasPreceptoria
    : Array.isArray(student.observacionesPreceptoria)
      ? student.observacionesPreceptoria
      : [];

  const updatedEntries = entries.map((en) => {
    if (String(en.id) === String(entryId) || (!en.id && en.fecha === entryId)) {
      return {
        ...en,
        vistoPorTutor: true,
        fechaVisto: nowIso,
        vistoPor: tutorName,
      };
    }
    return en;
  });

  const updatedStudent = {
    ...student,
    entradasPreceptoria: updatedEntries,
  };

  persistStudentLocal(updatedStudent);

  try {
    const sRef = doc(db, 'students', student.id);
    await updateDoc(sRef, {
      entradasPreceptoria: updatedEntries,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Aviso guardando visto preceptoría:', err.message);
  }

  return updatedStudent;
};

/**
 * Marca como visto un registro de inasistencia o tardanza
 */
export const acknowledgeAttendanceRecordApi = async ({ student, attendanceId, tutorUser }) => {
  if (!student || !attendanceId) return student;

  const tutorName = tutorUser?.nombreCompleto || tutorUser?.nombre || 'Tutor';
  const nowIso = new Date().toISOString();

  const rawAsistencias =
    student.asistencias && typeof student.asistencias === 'object'
      ? student.asistencias
      : { historial: [] };

  const historial = Array.isArray(rawAsistencias.historial)
    ? rawAsistencias.historial
    : Array.isArray(rawAsistencias.detalle)
      ? rawAsistencias.detalle
      : [];

  const updatedHistorial = historial.map((h) => {
    if (String(h.id) === String(attendanceId) || h.fecha === attendanceId) {
      return {
        ...h,
        vistoPorTutor: true,
        fechaVisto: nowIso,
        vistoPor: tutorName,
      };
    }
    return h;
  });

  const updatedStudent = {
    ...student,
    asistencias: {
      ...rawAsistencias,
      historial: updatedHistorial,
    },
  };

  persistStudentLocal(updatedStudent);

  try {
    const sRef = doc(db, 'students', student.id);
    await updateDoc(sRef, {
      asistencias: updatedStudent.asistencias,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Aviso guardando visto asistencia:', err.message);
  }

  return updatedStudent;
};

/**
 * Justifica formalmente una falta injustificada y asocia el comprobante en Firebase Storage al alumno y la falta
 */
export const justifyStudentAbsenceApi = async ({
  student,
  absenceId,
  motivo,
  detalle,
  certificadoRef,
  file,
  tutorUser,
}) => {
  if (!student || !absenceId) return student;

  const effectiveUid = auth.currentUser?.uid || tutorUser?.uid || tutorUser?.id || 'tutor';
  const tutorName = tutorUser?.nombreCompleto || tutorUser?.nombre || 'Tutor Titular';
  const nowIso = new Date().toISOString();

  let storageInfo = null;
  if (file) {
    try {
      storageInfo = await uploadFileToStorage({
        file,
        folder: 'justifications',
        userId: effectiveUid,
        recordId: `${student.id}_${absenceId}`,
        extraMetadata: {
          studentId: String(student.id),
          studentName: String(student.nombreCompleto || student.nombre || ''),
          absenceId: String(absenceId),
          tutorUid: String(effectiveUid),
          type: 'absence_justification',
        },
      });
    } catch (err) {
      console.warn('Aviso subiendo justificativo a Firebase Storage:', err.message);
    }
  }

  const rawAsistencias =
    student.asistencias && typeof student.asistencias === 'object'
      ? student.asistencias
      : { historial: [] };

  const historial = Array.isArray(rawAsistencias.historial)
    ? rawAsistencias.historial
    : Array.isArray(rawAsistencias.detalle)
      ? rawAsistencias.detalle
      : [];

  const updatedHistorial = historial.map((h) => {
    if (String(h.id) === String(absenceId) || h.fecha === absenceId) {
      return {
        ...h,
        tipo: 'Falta Justificada (En revisión)',
        estado: 'justificacion_pendiente',
        justificada: true,
        justificacion: {
          id: `just-${Date.now()}`,
          studentId: student.id,
          absenceId: String(absenceId),
          fechaInasistencia: h.fecha,
          motivo,
          detalle,
          certificadoRef: storageInfo?.fileName || certificadoRef || file?.name || '',
          fechaSolicitud: nowIso,
          solicitadoPor: tutorName,
          tutorUid: effectiveUid,
          estado: 'En revisión de preceptoría',
          comprobanteUrl: storageInfo?.downloadUrl || '',
          comprobanteStoragePath: storageInfo?.storagePath || '',
          comprobanteNombre: storageInfo?.fileName || file?.name || '',
          comprobanteTamanio: storageInfo?.fileSize || '',
        },
      };
    }
    return h;
  });

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

  const updatedAsistencias = {
    ...rawAsistencias,
    faltasInjustificadas,
    faltasJustificadas,
    historial: updatedHistorial,
  };

  const updatedStudent = {
    ...student,
    asistencias: updatedAsistencias,
  };

  persistStudentLocal(updatedStudent);

  try {
    const sRef = doc(db, 'students', student.id);
    await updateDoc(sRef, {
      asistencias: updatedAsistencias,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Aviso guardando justificación de inasistencia:', err.message);
  }

  return updatedStudent;
};

const slugifyReceiptKey = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/**
 * Carga un comprobante de transferencia bancaria, lo sube a Firebase Storage
 * y lo asocia a la factura correspondiente en finance_receipts y a los alumnos vinculados
 */
export const uploadTransferVoucherApi = async ({ tutorUser, voucherData, linkedStudents = [] }) => {
  const effectiveUid = auth.currentUser?.uid || tutorUser?.uid || tutorUser?.id || '';
  const cleanTutorDni = cleanDni(voucherData.tutorDni || tutorUser?.dni || '');
  const familySuffix = (effectiveUid || cleanTutorDni || '0492').slice(-4).toUpperCase();
  const familyCode = `#FAM-${familySuffix}`;
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  const invoiceMonth = voucherData.invoicePeriod || 'Octubre 2026';
  const studentIdsList = linkedStudents.map((c) => c.id).filter(Boolean);

  let storageInfo = null;
  if (voucherData.file) {
    try {
      storageInfo = await uploadFileToStorage({
        file: voucherData.file,
        folder: 'vouchers',
        userId: effectiveUid || 'tutor',
        recordId: `${slugifyReceiptKey(familyCode)}_${slugifyReceiptKey(invoiceMonth)}`,
        extraMetadata: {
          tutorUid: String(effectiveUid),
          studentIds: studentIdsList.join(','),
          invoicePeriod: invoiceMonth,
          declaredAmount: String(voucherData.declaredAmount || 0),
          type: 'payment_voucher',
        },
      });
    } catch (err) {
      console.warn('Aviso subiendo comprobante a Firebase Storage:', err.message);
    }
  }

  const tutorDisplayName =
    voucherData.tutorName || tutorUser?.nombreCompleto || tutorUser?.nombre || 'Tutor Familiar';
  const initials = tutorDisplayName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'TF';

  const deterministicDocId = `rec-${slugifyReceiptKey(familyCode)}-${slugifyReceiptKey(invoiceMonth)}`;
  let targetReceiptId = deterministicDocId;
  let existingData = null;
  const studentIdsSet = new Set(studentIdsList.map(String));

  try {
    const qMonth = query(collection(db, 'finance_receipts'), where('month', '==', invoiceMonth));
    const snap = await getDocs(qMonth);
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const matchesUid = effectiveUid && (d.tutorUid === effectiveUid || d.parentId === effectiveUid);
      const matchesDni = cleanTutorDni && cleanDni(d.tutorDni) === cleanTutorDni;
      const docChildrenIds = Array.isArray(d.children) ? d.children.map((ch) => String(ch.id)) : [];
      const matchesChild = docChildrenIds.some((cid) => studentIdsSet.has(cid));

      if (matchesUid || matchesDni || matchesChild) {
        targetReceiptId = docSnap.id;
        existingData = d;
      }
    });
  } catch (err) {
    console.warn('Aviso buscando factura existente para asociar comprobante:', err.message);
  }

  const bankingVoucher = {
    attachmentName: storageInfo?.fileName || voucherData.fileName || 'comprobante-transferencia.pdf',
    attachmentSize: storageInfo?.fileSize || voucherData.fileSize || '1.2 MB',
    fileUrl: storageInfo?.downloadUrl || '',
    downloadUrl: storageInfo?.downloadUrl || '',
    storagePath: storageInfo?.storagePath || '',
    payerName: tutorDisplayName,
    payerCuil: voucherData.tutorDni || tutorUser?.dni || '',
    operationDate: voucherData.transferDate || `${year}-${month}-${day}`,
    transferredAmount: Number(voucherData.declaredAmount) || existingData?.declaredAmount || 0,
    paymentType: 'Transferencia Bancaria',
    voucherStatus: 'Pendiente de conciliación',
    isUploadedByTutor: true,
    operationCode: voucherData.operationCode,
    originBank: voucherData.originBank,
    studentIds: studentIdsList,
    invoicePeriod: invoiceMonth,
  };

  const receiptPayload = {
    ...(existingData || {}),
    id: targetReceiptId,
    familyCode: existingData?.familyCode || familyCode,
    tutor: existingData?.tutor || tutorDisplayName,
    tutorDni: existingData?.tutorDni || voucherData.tutorDni || tutorUser?.dni || '',
    tutorUid: effectiveUid || existingData?.tutorUid || null,
    parentId: effectiveUid || existingData?.parentId || null,
    studentIds: studentIdsList,
    initials: existingData?.initials || initials,
    avatarBg: existingData?.avatarBg || 'bg-surface-container-high text-on-surface-variant',
    status: 'pendiente',
    uploadDate: `${day}/${month}/${year}`,
    uploadTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} hs`,
    declaredAmount: Number(voucherData.declaredAmount) || existingData?.declaredAmount || 0,
    month: invoiceMonth,
    invoicePeriod: invoiceMonth,
    conceptSummary: existingData?.conceptSummary || 'Cuota + Servicios Contratados',
    bankingVoucher,
    enrolledChildrenCount: linkedStudents.length || existingData?.enrolledChildrenCount || 1,
    childrenCount: linkedStudents.length,
    children:
      Array.isArray(existingData?.children) && existingData.children.length > 0
        ? existingData.children
        : linkedStudents.map((child) => ({
            id: child.id,
            name: child.nombreCompleto || `${child.nombre || ''} ${child.apellido || ''}`.trim(),
            legajo: child.legajo || child.studentID_login || child.id,
            academicInfo: `${child.curso || 'Grado no asignado'} - ${child.division || 'U'}`,
            totalAmount: Number(voucherData.declaredAmount) || 0,
            feeBreakdown: [
              {
                id: `fee-base-${child.id}`,
                label: `Cuota Nivel ${child.nivel || 'Primario'}`,
                amount: Number(voucherData.declaredAmount) || 0,
                dotClass: 'bg-primary',
              },
            ],
          })),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'finance_receipts', targetReceiptId), receiptPayload, { merge: true });
  } catch (err) {
    console.warn('Aviso persistiendo recibo en Firestore:', err.message);
  }

  // Asociar también el comprobante de pago directamente en el documento de cada alumno vinculado
  await Promise.all(
    linkedStudents
      .filter((child) => Boolean(child?.id))
      .map(async (child) => {
        try {
          const prevVouchers = Array.isArray(child.comprobantesPago) ? child.comprobantesPago : [];
          const childVoucherRecord = {
            id: targetReceiptId,
            invoicePeriod: invoiceMonth,
            uploadDate: receiptPayload.uploadDate,
            declaredAmount: receiptPayload.declaredAmount,
            operationCode: voucherData.operationCode,
            originBank: voucherData.originBank,
            fileName: bankingVoucher.attachmentName,
            fileSize: bankingVoucher.attachmentSize,
            fileUrl: bankingVoucher.fileUrl,
            storagePath: bankingVoucher.storagePath,
            status: 'pendiente',
          };
          const updatedVouchers = [
            childVoucherRecord,
            ...prevVouchers.filter((v) => v.invoicePeriod !== invoiceMonth),
          ];
          await updateDoc(doc(db, 'students', child.id), {
            comprobantesPago: updatedVouchers,
            updatedAt: serverTimestamp(),
          });
        } catch (errChild) {
          console.warn('Aviso asociando comprobante al legajo del alumno:', errChild.message);
        }
      })
  );

  try {
    const cachedReceipts = JSON.parse(localStorage.getItem('portal_finance_receipts') || '[]');
    cachedReceipts.unshift(receiptPayload);
    localStorage.setItem('portal_finance_receipts', JSON.stringify(cachedReceipts));
  } catch {
    // Ignorar
  }

  return receiptPayload;
};
