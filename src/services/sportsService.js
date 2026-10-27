import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth } from './firebase.js';
import { ensureAdminAuth } from './teachersService.js';
import { INITIAL_DISCIPLINES } from '../data/mockSportsActivities.js';
import {
  INITIAL_SPORT_DETAIL,
  INITIAL_STUDENTS_ROSTER,
} from '../data/mockSportsDetailData.js';
import { MOCK_STUDENTS } from '../data/mockStudents.js';
import { sortWeekDays } from '../components/admin/sports/sportsScheduleUtils.js';

const SPORTS_COLLECTION = 'sportsActivities';
const generarId = (prefijo) => `${prefijo}-${Date.now()}-${crypto.randomUUID().slice(0, 4)}`;


/**
 * Normaliza un objeto de disciplina deportiva obtenido de Firestore o mock
 */
export const normalizeSportActivity = (docId, data = {}) => {
  const inscriptos = Array.isArray(data.inscriptos) ? data.inscriptos : [];
  const rawDias = Array.isArray(data.dias)
    ? data.dias
    : typeof data.dias === 'string'
      ? data.dias.split(',').map((d) => d.trim()).filter(Boolean)
      : [];

  const diasSorted = sortWeekDays(rawDias);
  const cupoMax = Number(data.cupoMax) || 40;
  const cupoOcupado = inscriptos.length > 0 ? inscriptos.length : Number(data.cupoOcupado) || 0;

  return {
    id: docId,
    nombre: data.nombre || 'Disciplina sin nombre',
    code: data.code || `DEP-${String(data.nombre || 'DEP').slice(0, 3).toUpperCase()}-2026`,
    titulo: data.titulo || `${data.nombre || 'Disciplina'} - Padrón y Detalle Operativo`,
    emoji: data.emoji || '🏃',
    bgColor: data.bgColor || 'bg-blue-50',
    textColor: data.textColor || 'text-blue-600',
    profesor: {
      nombre: data.profesor?.nombre || 'Profesor sin asignar',
      iniciales:
        data.profesor?.iniciales ||
        (data.profesor?.nombre
          ? data.profesor.nombre
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
          : 'PR'),
      email: data.profesor?.email || 'profesor@colegio.edu.ar',
      telefono: data.profesor?.telefono || '+54 11 0000-0000',
      legajo: data.profesor?.legajo || '#DOC-GEN',
      avatarGrad: data.profesor?.avatarGrad || 'from-blue-600 to-indigo-500',
    },
    niveles: data.niveles || 'Todos los niveles',
    nivelId: data.nivelId || data.niveles || 'Todos los niveles',
    dias: diasSorted,
    horario: data.horario || 'Lunes y Miércoles 16:00 - 17:30 hs',
    horas: data.horas || data.horario || '16:00 - 17:30 hs',
    lugar: data.lugar || data.instalacion || 'Gimnasio Polideportivo',
    instalacion: data.instalacion || data.lugar || 'Gimnasio Polideportivo',
    cupoMax,
    cupoOcupado,
    activo: data.activo !== false,
    ofertaAbierta: data.ofertaAbierta !== false,
    politica:
      data.politica ||
      'Control transaccional: Máximo 2 deportes por alumno en el ciclo.',
    supervision: data.supervision || 'Supervisado por Dpto. Educación Física',
    inscriptos,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
};

/**
 * Si la colección en Firestore está vacía, la inicializa con los deportes iniciales
 */
const seedInitialSportsIfEmpty = async () => {
  try {
    const batch = writeBatch(db);
    INITIAL_DISCIPLINES.forEach((disc) => {
      const docRef = doc(db, SPORTS_COLLECTION, disc.id);
      const initialRoster = [];

      batch.set(
        docRef,
        {
          ...disc,
          titulo: `${disc.nombre} - Padrón y Detalle Operativo`,
          code: `DEP-${disc.nombre.slice(0, 3).toUpperCase()}-2026`,
          horas: disc.horario,
          instalacion: disc.lugar,
          cupoMax: disc.cupoMax || 40,
          cupoOcupado: initialRoster.length > 0 ? initialRoster.length : disc.cupoOcupado || 0,
          inscriptos: initialRoster,
          activo: disc.activo !== false,
          ofertaAbierta: true,
          politica: 'Control transaccional: Máximo 2 deportes por alumno en el ciclo.',
          supervision: 'Supervisado por Dpto. Educación Física',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    });
    await batch.commit();
  } catch (err) {
    console.warn('No se pudo autosembrar deportes en Firestore:', err.message);
  }
};

/**
 * Obtiene todas las disciplinas deportivas desde Firestore.
 * Si la colección está vacía o se está inicializando, auto-siembra el catálogo inicial.
 */
export const fetchSportsActivities = async () => {
  try {
    await ensureAdminAuth();
    const snap = await getDocs(collection(db, SPORTS_COLLECTION));

    if (snap.empty) {
      await seedInitialSportsIfEmpty();
      return INITIAL_DISCIPLINES.map((d) =>
        normalizeSportActivity(d.id, {
          ...d,
          inscriptos: [],
        })
      );
    }

    const items = [];
    snap.forEach((docSnap) => {
      items.push(normalizeSportActivity(docSnap.id, docSnap.data()));
    });

    return items;
  } catch (err) {
    console.warn('Error al cargar deportes desde Firestore, usando respaldo:', err.message);
    return INITIAL_DISCIPLINES.map((d) =>
      normalizeSportActivity(d.id, {
        ...d,
        inscriptos: [],
      })
    );
  }
};

export const fetchDisciplinesApi = fetchSportsActivities;

/**
 * Suscripción reactiva en tiempo real al listado de disciplinas
 */
export const subscribeToSportsActivities = (onUpdate, onError) => {
  return onSnapshot(
    collection(db, SPORTS_COLLECTION),
    (snap) => {
      if (snap.empty) {
        // En caso de estar vacía, autosembrar y emitir default
        void seedInitialSportsIfEmpty().then(() => {
          onUpdate(
            INITIAL_DISCIPLINES.map((d) =>
              normalizeSportActivity(d.id, {
                ...d,
                inscriptos: [],
              })
            )
          );
        });
        return;
      }

      const list = [];
      snap.forEach((d) => {
        list.push(normalizeSportActivity(d.id, d.data()));
      });
      onUpdate(list);
    },
    (err) => {
      console.warn('Error en suscripción de deportes:', err.message);
      if (onError) onError(err);
    }
  );
};

/**
 * Obtiene el detalle de una disciplina específica por ID
 */
export const fetchSportActivityById = async (id) => {
  try {
    await ensureAdminAuth();
    const docRef = doc(db, SPORTS_COLLECTION, id);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      return normalizeSportActivity(snap.id, snap.data());
    }

    // Si no existe aún en Firestore, buscar en mock inicial
    const found = INITIAL_DISCIPLINES.find((d) => d.id === id);
    if (found) {
      return normalizeSportActivity(id, {
        ...INITIAL_SPORT_DETAIL,
        ...found,
        inscriptos: [],
      });
    }

    return null;
  } catch (err) {
    console.warn(`Error al leer deporte ${id} de Firestore:`, err.message);
    const found = INITIAL_DISCIPLINES.find((d) => d.id === id);
    if (found) {
      return normalizeSportActivity(id, {
        ...INITIAL_SPORT_DETAIL,
        ...found,
        inscriptos: [],
      });
    }
    return null;
  }
};

/**
 * Suscripción reactiva en tiempo real al detalle de una disciplina
 */
export const subscribeToSportActivityById = (id, onUpdate, onError) => {
  const docRef = doc(db, SPORTS_COLLECTION, id);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        onUpdate(normalizeSportActivity(snap.id, snap.data()));
      } else {
        const found = INITIAL_DISCIPLINES.find((d) => d.id === id);
        if (found) {
          onUpdate(
            normalizeSportActivity(id, {
              ...INITIAL_SPORT_DETAIL,
              ...found,
              inscriptos: [],
            })
          );
        }
      }
    },
    (err) => {
      console.warn(`Error en suscripción a disciplina ${id}:`, err.message);
      if (onError) onError(err);
    }
  );
};

const sanitizeFirestorePayload = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
};

/**
 * Crea una nueva actividad extracurricular en Firestore
 */
export const createSportActivityApi = async (activityData) => {
  await ensureAdminAuth();
  const collectionRef = collection(db, SPORTS_COLLECTION);
  const newDocRef = doc(collectionRef);

  const cleanDays = sortWeekDays(activityData.dias || []);
  const payload = sanitizeFirestorePayload({
    ...activityData,
    id: newDocRef.id,
    dias: cleanDays,
    code:
      activityData.code ||
      `DEP-${String(activityData.nombre || 'ACT').slice(0, 3).toUpperCase()}-2026`,
    titulo: `${activityData.nombre} - Padrón y Detalle Operativo`,
    cupoMax: Number(activityData.cupoMax) || 40,
    cupoOcupado: 0,
    inscriptos: [],
    activo: activityData.activo !== false,
    ofertaAbierta: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(newDocRef, payload);
  return normalizeSportActivity(newDocRef.id, payload);
};

/**
 * Actualiza los datos de configuración de una actividad en Firestore
 */
export const updateSportActivityApi = async (id, updatedData) => {
  await ensureAdminAuth();
  const docRef = doc(db, SPORTS_COLLECTION, id);

  const cleanUpdates = sanitizeFirestorePayload({
    ...updatedData,
    updatedAt: serverTimestamp(),
  });

  if (Array.isArray(updatedData.dias)) {
    cleanUpdates.dias = sortWeekDays(updatedData.dias);
  }

  if (updatedData.nombre) {
    cleanUpdates.titulo = `${updatedData.nombre} - Padrón y Detalle Operativo`;
  }

  if (updatedData.cupoMax !== undefined) {
    cleanUpdates.cupoMax = Number(updatedData.cupoMax) || 40;
  }

  await setDoc(docRef, cleanUpdates, { merge: true });
  return { id, ...cleanUpdates };
};

/**
 * Modifica el estado activo/en pausa de una disciplina en Firestore
 */
export const toggleSportActivityStatusApi = async (id, currentStatus) => {
  await ensureAdminAuth();
  const docRef = doc(db, SPORTS_COLLECTION, id);
  const nextStatus = !currentStatus;

  await setDoc(
    docRef,
    {
      activo: nextStatus,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return nextStatus;
};

/**
 * Elimina definitivamente una disciplina extracurricular de Firestore.
 * Da de baja a todos los alumnos inscriptos, asentando la constancia en el historial de preceptoría
 * y liberando su cupo para futuras inscripciones (respetando el límite institucional de 2 actividades).
 */
export const deleteSportActivityApi = async (disciplineId) => {
  await ensureAdminAuth();
  const docRef = doc(db, SPORTS_COLLECTION, disciplineId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    throw new Error('La actividad extracurricular no existe o ya ha sido eliminada.');
  }

  const current = snap.data();
  const activityName = current?.nombre || 'Actividad extracurricular';
  const inscriptos = Array.isArray(current?.inscriptos) ? current.inscriptos : [];

  // Registrar baja automática en preceptoría para cada estudiante inscripto
  await Promise.all(
    inscriptos.map(async (student) => {
      try {
        await addPreceptoriaNoteToStudent({
          studentId: student.id || student.studentId || student.alumnoId,
          studentDni: student.dni,
          studentLegajo: student.legajo,
          studentName: student.nombre,
          note: {
            tipo: 'Extracurricular',
            categoria: 'Baja de Actividad',
            titulo: `Baja de actividad: ${activityName}`,
            descripcion: `Baja automática debido a la eliminación de la disciplina "${activityName}". Su cupo extracurricular ha quedado liberado.`,
            gravedad: 'Informativa',
          },
        });
      } catch (noteErr) {
        console.warn('Error al asentar nota de baja en preceptoría para alumno:', student.nombre, noteErr.message);
      }
    })
  );

  // Eliminar el documento de la actividad en Firestore
  await deleteDoc(docRef);

  return {
    success: true,
    deletedId: disciplineId,
    activityName,
    unregisteredCount: inscriptos.length,
  };
};

/**
 * Inscribe a un estudiante existente en la actividad extracurricular en Firestore
 */
export const enrollStudentInDisciplineApi = async (disciplineId, studentData) => {
  await ensureAdminAuth();
  const docRef = doc(db, SPORTS_COLLECTION, disciplineId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    throw new Error('La disciplina extracurricular no existe en la base de datos.');
  }

  const current = snap.data();
  const inscriptos = Array.isArray(current.inscriptos) ? [...current.inscriptos] : [];

  // Validar si ya está inscripto
  const sDni = String(studentData.dni || '').replace(/\D/g, '');
  const sLegajo = String(studentData.legajo || '').trim().toLowerCase();
  const sId = String(studentData.id || '').trim();

  const isDuplicate = inscriptos.some((e) => {
    const eDni = String(e.dni || '').replace(/\D/g, '');
    const eLegajo = String(e.legajo || '').trim().toLowerCase();
    const eId = String(e.id || '').trim();
    if (sDni && eDni && sDni === eDni) return true;
    if (sLegajo && eLegajo && sLegajo === eLegajo) return true;
    if (sId && eId && sId === eId) return true;
    return false;
  });

  if (isDuplicate) {
    throw new Error('El alumno ya se encuentra matriculado en esta actividad.');
  }

  const maxCupo = Number(current.cupoMax) || 40;
  if (inscriptos.length >= maxCupo) {
    throw new Error('El cupo máximo de la disciplina ya se encuentra completo.');
  }

  // REGLA DE NEGOCIO: Ningún alumno puede estar inscripto a más de 2 actividades extracurriculares
  const allDisciplinesSnap = await getDocs(collection(db, SPORTS_COLLECTION));
  let existingActivitiesCount = 0;
  const existingActivitiesNames = [];

  allDisciplinesSnap.forEach((dSnap) => {
    if (dSnap.id === disciplineId) return;
    const dData = dSnap.data();
    const dInscriptos = Array.isArray(dData.inscriptos) ? dData.inscriptos : [];
    const isEnrolledInThis = dInscriptos.some((e) => {
      const eDni = String(e.dni || '').replace(/\D/g, '');
      const eLegajo = String(e.legajo || '').trim().toLowerCase();
      const eId = String(e.id || '').trim();
      return (
        (sDni && eDni && sDni === eDni) ||
        (sLegajo && eLegajo && sLegajo === eLegajo) ||
        (sId && eId && sId === eId)
      );
    });
    if (isEnrolledInThis) {
      existingActivitiesCount += 1;
      existingActivitiesNames.push(dData.nombre || 'Otra actividad');
    }
  });

  if (existingActivitiesCount >= 2) {
    throw new Error(
      `El alumno ya se encuentra inscripto en ${existingActivitiesCount} actividades (${existingActivitiesNames.join(
        ', '
      )}). Por normativa institucional, ningún alumno puede cursar más de 2 actividades simultáneas.`
    );
  }

  inscriptos.unshift(studentData);

  await setDoc(
    docRef,
    {
      inscriptos,
      cupoOcupado: inscriptos.length,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return inscriptos;
};

/**
 * Da de baja o retira a un estudiante de una disciplina extracurricular en Firestore
 */
export const withdrawStudentFromDisciplineApi = async (disciplineId, studentIdentifier) => {
  await ensureAdminAuth();
  const docRef = doc(db, SPORTS_COLLECTION, disciplineId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    throw new Error('La disciplina extracurricular no existe en la base de datos.');
  }

  const current = snap.data();
  const inscriptos = Array.isArray(current.inscriptos) ? current.inscriptos : [];

  const targetId =
    typeof studentIdentifier === 'object' && studentIdentifier !== null
      ? String(studentIdentifier.id || studentIdentifier.studentId || '').trim()
      : String(studentIdentifier || '').trim();

  const targetDni =
    typeof studentIdentifier === 'object' && studentIdentifier !== null
      ? String(studentIdentifier.dni || '').replace(/\D/g, '')
      : '';

  const targetLegajo =
    typeof studentIdentifier === 'object' && studentIdentifier !== null
      ? String(studentIdentifier.legajo || '').trim().toLowerCase()
      : '';

  const targetNombre =
    typeof studentIdentifier === 'object' && studentIdentifier !== null
      ? String(studentIdentifier.nombre || studentIdentifier.studentName || '').trim().toLowerCase()
      : '';

  const updatedInscriptos = inscriptos.filter((s) => {
    const sId = String(s.id || s.studentId || '').trim();
    if (targetId && sId === targetId) return false;

    const sDni = String(s.dni || '').replace(/\D/g, '');
    if (targetDni && sDni && sDni === targetDni) return false;

    const sLeg = String(s.legajo || '').trim().toLowerCase();
    if (targetLegajo && sLeg && sLeg === targetLegajo) return false;

    const sNom = String(s.nombre || '').trim().toLowerCase();
    if (targetNombre && sNom && sNom === targetNombre) return false;

    return true;
  });

  await setDoc(
    docRef,
    {
      inscriptos: updatedInscriptos,
      cupoOcupado: updatedInscriptos.length,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return updatedInscriptos;
};

/**
 * Agrega un registro / nota de Preceptoría al perfil del estudiante en Firestore
 */
export const addPreceptoriaNoteToStudent = async ({
  studentId,
  studentDni,
  studentLegajo,
  studentName,
  note,
}) => {
  try {
    await ensureAdminAuth();

    let targetDocRef = null;
    let currentData = null;

    if (studentId) {
      const directRef = doc(db, 'students', String(studentId).trim());
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        targetDocRef = directRef;
        currentData = directSnap.data();
      }
    }

    if (!targetDocRef) {
      const cleanDni = String(studentDni || '').replace(/\D/g, '');
      const cleanLegajo = String(studentLegajo || '').trim().toLowerCase();
      const cleanName = String(studentName || '').trim().toLowerCase();

      const snap = await getDocs(collection(db, 'students'));
      for (const dSnap of snap.docs) {
        const dData = dSnap.data();
        const dDni = String(dData.dni || '').replace(/\D/g, '');
        const dLeg = String(dData.legajo || '').trim().toLowerCase();
        const dNom = String(dData.nombre || '').trim().toLowerCase();

        if (
          (cleanDni && dDni && cleanDni === dDni) ||
          (cleanLegajo && dLeg && cleanLegajo === dLeg) ||
          (cleanName && dNom && cleanName === dNom)
        ) {
          targetDocRef = dSnap.ref;
          currentData = dData;
          break;
        }
      }
    }

    const currentAuthUser = auth.currentUser;
    const authorFromAuth =
      currentAuthUser?.displayName ||
      currentAuthUser?.email?.split('@')[0] ||
      'Preceptoría y Administración';
    const authorEmailFromAuth = currentAuthUser?.email || '';

    const newNote = {
      id: generarId('prec'),
      fecha: new Date().toISOString(),
      autor: note?.autor || authorFromAuth,
      autorRol: note?.autorRol || 'Preceptoría / Administración',
      autorEmail: note?.autorEmail || authorEmailFromAuth,
      autorUid: note?.autorUid || currentAuthUser?.uid || null,
      ...note,
    };

    if (targetDocRef) {
      const existingNotes = Array.isArray(currentData?.entradasPreceptoria)
        ? currentData.entradasPreceptoria
        : [];
      const updatedNotes = [newNote, ...existingNotes];

      await setDoc(
        targetDocRef,
        {
          entradasPreceptoria: updatedNotes,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    return newNote;
  } catch (err) {
    console.warn('Error al registrar nota de preceptoría:', err.message);
    return null;
  }
};

/**
 * Agrega un registro / atención de Enfermería al perfil del estudiante en Firestore (inmutable)
 */
export const addEnfermeriaNoteToStudent = async ({
  studentId,
  studentDni,
  studentLegajo,
  studentName,
  note,
}) => {
  try {
    await ensureAdminAuth();

    let targetDocRef = null;
    let currentData = null;

    if (studentId) {
      const directRef = doc(db, 'students', String(studentId).trim());
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        targetDocRef = directRef;
        currentData = directSnap.data();
      }
    }

    if (!targetDocRef) {
      const cleanDni = String(studentDni || '').replace(/\D/g, '');
      const cleanLegajo = String(studentLegajo || '').trim().toLowerCase();
      const cleanName = String(studentName || '').trim().toLowerCase();

      const snap = await getDocs(collection(db, 'students'));
      for (const dSnap of snap.docs) {
        const dData = dSnap.data();
        const dDni = String(dData.dni || '').replace(/\D/g, '');
        const dLeg = String(dData.legajo || '').trim().toLowerCase();
        const dNom = String(dData.nombre || '').trim().toLowerCase();

        if (
          (cleanDni && dDni && cleanDni === dDni) ||
          (cleanLegajo && dLeg && cleanLegajo === dLeg) ||
          (cleanName && dNom && cleanName === dNom)
        ) {
          targetDocRef = dSnap.ref;
          currentData = dData;
          break;
        }
      }
    }

    const currentAuthUser = auth.currentUser;
    const authorFromAuth =
      currentAuthUser?.displayName ||
      currentAuthUser?.email?.split('@')[0] ||
      'Enfermería Escolar';
    const authorEmailFromAuth = currentAuthUser?.email || '';

    const newNote = {
      id: generarId('enf'),
      fecha: new Date().toISOString(),
      autor: note?.autor || authorFromAuth,
      autorRol: note?.autorRol || 'Enfermería Escolar',
      autorEmail: note?.autorEmail || authorEmailFromAuth,
      autorUid: note?.autorUid || currentAuthUser?.uid || null,
      categoria: 'Enfermería',
      ...note,
    };

    if (targetDocRef) {
      const existingNotes = Array.isArray(currentData?.entradasEnfermeria)
        ? currentData.entradasEnfermeria
        : [];
      const updatedNotes = [newNote, ...existingNotes];

      await setDoc(
        targetDocRef,
        {
          entradasEnfermeria: updatedNotes,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    return newNote;
  } catch (err) {
    console.warn('Error al registrar nota de enfermería:', err.message);
    return null;
  }
};

/**
 * Elimina una entrada del historial de preceptoría de un alumno en Firestore.
 */
export const deletePreceptoriaNoteFromStudent = async ({
  studentId,
  studentDni,
  studentLegajo,
  studentName,
  noteId,
  noteFecha,
}) => {
  try {
    await ensureAdminAuth();

    let targetDocRef = null;
    let currentData = null;

    if (studentId) {
      const directRef = doc(db, 'students', String(studentId).trim());
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        targetDocRef = directRef;
        currentData = directSnap.data();
      }
    }

    if (!targetDocRef) {
      const cleanDni = String(studentDni || '').replace(/\D/g, '');
      const cleanLegajo = String(studentLegajo || '').trim().toLowerCase();
      const cleanName = String(studentName || '').trim().toLowerCase();

      const snap = await getDocs(collection(db, 'students'));
      for (const dSnap of snap.docs) {
        const dData = dSnap.data();
        const dDni = String(dData.dni || '').replace(/\D/g, '');
        const dLeg = String(dData.legajo || '').trim().toLowerCase();
        const dNom = String(dData.nombre || '').trim().toLowerCase();

        if (
          (cleanDni && dDni && cleanDni === dDni) ||
          (cleanLegajo && dLeg && cleanLegajo === dLeg) ||
          (cleanName && dNom && cleanName === dNom)
        ) {
          targetDocRef = dSnap.ref;
          currentData = dData;
          break;
        }
      }
    }

    if (!targetDocRef) {
      console.warn('No se encontró el estudiante para eliminar la entrada de preceptoría');
      return false;
    }

    const existingNotes = Array.isArray(currentData?.entradasPreceptoria)
      ? currentData.entradasPreceptoria
      : [];

    const updatedNotes = existingNotes.filter((n) => {
      if (noteId && n.id) {
        return String(n.id) !== String(noteId);
      }
      if (noteFecha && n.fecha) {
        return String(n.fecha) !== String(noteFecha);
      }
      return true;
    });

    await setDoc(
      targetDocRef,
      {
        entradasPreceptoria: updatedNotes,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return true;
  } catch (err) {
    console.warn('Error al eliminar nota de preceptoría:', err.message);
    return false;
  }
};

/**
 * Consulta la base de datos institucional en Firestore para obtener
 * los alumnos reales disponibles para matricular en las actividades.
 */
export const fetchEligibleStudentsFromFirestore = async () => {
  try {
    await ensureAdminAuth();
    const [studentsSnap, usersSnap] = await Promise.all([
      getDocs(collection(db, 'students')),
      getDocs(collection(db, 'users')),
    ]);

    if (studentsSnap.empty) {
      return MOCK_STUDENTS;
    }

    const parents = [];
    usersSnap.forEach((u) => {
      const data = u.data();
      if (String(data.role || '').toLowerCase() === 'padre') {
        parents.push({ id: u.id, ...data });
      }
    });

    const realStudents = [];
    studentsSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const rawNivel = String(data.nivel || '').toLowerCase();
      const nivel =
        rawNivel === 'inicial'
          ? 'Inicial'
          : rawNivel === 'primaria' || rawNivel === 'primario'
            ? 'Primario'
            : rawNivel === 'secundaria' || rawNivel === 'secundario'
              ? 'Secundario'
              : 'Primario';

      const parent =
        parents.find((p) => p.id && data.parentId && p.id === data.parentId) ||
        parents.find((p) => Array.isArray(p.studentIds) && p.studentIds.includes(docSnap.id)) ||
        parents.find(
          (p) =>
            p.email &&
            data.emailPadre &&
            p.email.trim().toLowerCase() === data.emailPadre.trim().toLowerCase()
        ) ||
        null;

      const tutorNombre = parent
        ? parent.nombre
        : data.tutorNombre || data.tutor || 'Tutor registrado';

      const tutorTelefono = parent
        ? parent.telefono || '-'
        : data.tutorTelefono || data.telefonoTutor || '-';

      const fullName = (data.nombreCompleto || `${data.nombre || ''} ${data.apellido || ''}`).trim();
      const cursoStr = data.curso || '1er Año';
      const divisionStr = data.division || 'A';
      const cursoDisplay = `${nivel} - ${cursoStr} ${divisionStr}`.trim();

      realStudents.push({
        id: docSnap.id,
        nombre: fullName || 'Alumno sin nombre',
        dni: String(data.dni || '').trim(),
        legajo: data.legajo || `#LEG-${docSnap.id.slice(-4).toUpperCase()}`,
        nivel,
        curso: cursoStr,
        division: divisionStr,
        cursoDisplay,
        tutorNombre,
        tutorTelefono,
        estado: data.estado || 'Activo',
        isInactive: Boolean(data.disabled || data.estado === 'Inactivo'),
      });
    });

    return realStudents;
  } catch (err) {
    console.warn('Error al cargar alumnos desde Firestore, usando respaldo:', err.message);
    return [];
  }
};

/**
 * Desvincula a un estudiante de todas las actividades extracurriculares
 */
export const removeStudentFromAllSportsActivities = async (studentId, studentDni = null) => {
  try {
    await ensureAdminAuth();
    const snap = await getDocs(collection(db, SPORTS_COLLECTION));
    const batch = writeBatch(db);
    let updatedCount = 0;

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const inscriptos = Array.isArray(data.inscriptos) ? data.inscriptos : [];
      const filtered = inscriptos.filter((s) => {
        if (s.id && s.id === studentId) return false;
        if (s.studentId && s.studentId === studentId) return false;
        if (s.alumnoId && s.alumnoId === studentId) return false;
        if (studentDni && s.dni && String(s.dni).replace(/\D/g, '') === String(studentDni).replace(/\D/g, '')) return false;
        return true;
      });

      if (filtered.length !== inscriptos.length) {
        batch.update(docSnap.ref, {
          inscriptos: filtered,
          cupoOcupado: filtered.length,
          updatedAt: serverTimestamp(),
        });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
    }
  } catch (err) {
    console.warn('Error al desvincular estudiante de actividades:', err.message);
  }
};

/**
 * Desvincula a un docente de todas las actividades extracurriculares
 */
export const unassignTeacherFromAllSportsActivities = async (teacherId, teacherEmail = null, teacherName = null) => {
  try {
    await ensureAdminAuth();
    const snap = await getDocs(collection(db, SPORTS_COLLECTION));
    const batch = writeBatch(db);
    let updatedCount = 0;

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const p = data.profesor;
      const matchesId = p?.id === teacherId || data.profesorId === teacherId;
      const matchesEmail = teacherEmail && (p?.email === teacherEmail || data.profesorEmail === teacherEmail);
      const matchesName = teacherName && p?.nombre && (
        p.nombre.toLowerCase().includes(teacherName.toLowerCase()) ||
        teacherName.toLowerCase().includes(p.nombre.toLowerCase())
      );

      if (matchesId || matchesEmail || matchesName) {
        batch.update(docSnap.ref, {
          profesor: null,
          profesorId: null,
          updatedAt: serverTimestamp(),
        });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
    }
  } catch (err) {
    console.warn('Error al desvincular profesor de deportes:', err.message);
  }
};
