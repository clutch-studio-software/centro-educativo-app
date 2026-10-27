import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { ensureAdminAuth } from './teachersService.js';
import { sortCourseObjects } from '../utils/academicUtils.js';

/**
 * Normaliza y ordena un listado de cursos según nivel, curso y división
 */
export const sortAcademicCourses = (courses = []) => {
  return sortCourseObjects(courses);
};

/**
 * Obtiene todos los cursos y divisiones académicas desde la colección 'academicOffer' en Firestore.
 */
export const fetchAcademicCourses = async () => {
  try {
    await ensureAdminAuth();
    const querySnapshot = await getDocs(collection(db, 'academicOffer'));

    const courses = [];
    querySnapshot.forEach((docSnap) => {
      // Ignoramos el documento raíz del catálogo 'current'
      if (docSnap.id === 'current') return;

      const data = docSnap.data();
      // Verificamos que sea un documento de curso
      if (data.type === 'course' || data.isCourse || (data.nivelId && data.nombre)) {
        courses.push({
          id: docSnap.id,
          ...data,
        });
      }
    });

    return sortAcademicCourses(courses);
  } catch (err) {
    console.error('Error al obtener cursos desde Firestore academicOffer:', err);
    throw err;
  }
};

/**
 * Suscripción en tiempo real a los cursos académicos en Firestore.
 */
export const subscribeToAcademicCourses = (onUpdate, onError) => {
  const unsubscribe = onSnapshot(
    collection(db, 'academicOffer'),
    (snapshot) => {
      const courses = [];
      snapshot.forEach((docSnap) => {
        if (docSnap.id === 'current') return;
        const data = docSnap.data();
        if (data.type === 'course' || data.isCourse || (data.nivelId && data.nombre)) {
          courses.push({
            id: docSnap.id,
            ...data,
          });
        }
      });
      onUpdate(sortAcademicCourses(courses));
    },
    (err) => {
      console.warn('Error en listener de cursos academicOffer:', err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
};

/**
 * Sincroniza el catálogo estructural 'academicOffer/current' en Firestore.
 * Esto mantiene compatibilidad absoluta con StudentsManagement, NewStudentModal y EditStudentModal.
 */
export const syncAcademicCatalog = async (courses) => {
  try {
    const catalog = {
      Inicial: {},
      Primario: {},
      Secundario: {},
    };

    for (const c of courses) {
      const nivelKey =
        c.nivelId === 'inicial'
          ? 'Inicial'
          : c.nivelId === 'secundario'
          ? 'Secundario'
          : 'Primario';

      const nombreKey = c.nombre;
      if (!catalog[nivelKey][nombreKey]) {
        catalog[nivelKey][nombreKey] = [];
      }
      const div = (c.division || 'A').toUpperCase().trim();
      if (!catalog[nivelKey][nombreKey].includes(div)) {
        catalog[nivelKey][nombreKey].push(div);
      }
    }

    const currentDocRef = doc(db, 'academicOffer', 'current');
    await setDoc(currentDocRef, catalog);
  } catch (err) {
    console.warn('No se pudo sincronizar academicOffer/current:', err.message);
  }
};

/**
 * Sanitiza un objeto eliminando cualquier propiedad con valor undefined
 * para evitar que Firestore rechace la operación setDoc/updateDoc.
 */
const sanitizeFirestorePayload = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );
};

/**
 * Crea una nueva división o curso en Firestore.
 */
export const createAcademicCourse = async (courseData) => {
  await ensureAdminAuth();

  const id =
    courseData.id ||
    `curso-${String(courseData.nivelId || 'gen').slice(0, 2)}-${Date.now()}`;

  const docRef = doc(db, 'academicOffer', id);
  const payload = {
    ...courseData,
    id,
    type: 'course',
    isCourse: true,
    activo: courseData.activo !== undefined ? courseData.activo : true,
    cupoMax: Number(courseData.cupoMax) || 30,
    division: (courseData.division || 'A').toUpperCase().trim(),
    nombre: courseData.nombre.trim(),
    turno: courseData.turno || 'Turno Mañana',
    aula: courseData.aula || 'Por asignar',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const cleanPayload = sanitizeFirestorePayload(payload);
  await setDoc(docRef, cleanPayload);
  return cleanPayload;
};

/**
 * Actualiza los datos de un curso o división existente en Firestore.
 * Si se modificó el nombre o la división, actualiza en lote a todos los alumnos asignados.
 */
export const updateAcademicCourse = async (
  courseId,
  courseData,
  affectedStudents = []
) => {
  await ensureAdminAuth();

  const cleanNombre = courseData.nombre.trim();
  const cleanDivision = (courseData.division || 'A').toUpperCase().trim();

  const updates = sanitizeFirestorePayload({
    ...courseData,
    cupoMax: Number(courseData.cupoMax) || 30,
    division: cleanDivision,
    nombre: cleanNombre,
    updatedAt: serverTimestamp(),
  });

  const docRef = doc(db, 'academicOffer', courseId);

  // Si hay alumnos que pertenecían a la división anterior, actualizar su asignación en Firestore
  if (Array.isArray(affectedStudents) && affectedStudents.length > 0) {
    const BATCH_SIZE = 400;
    const nivelCap = courseData.nivelId
      ? courseData.nivelId.charAt(0).toUpperCase() + courseData.nivelId.slice(1)
      : '';
    const cursoDisplay = nivelCap
      ? `${nivelCap} - ${cleanNombre} ${cleanDivision}`
      : `${cleanNombre} ${cleanDivision}`;

    for (let i = 0; i < affectedStudents.length; i += BATCH_SIZE) {
      const batch = writeBatch(db);
      if (i === 0) {
        batch.update(docRef, updates);
      }
      const chunk = affectedStudents.slice(i, i + BATCH_SIZE);
      for (const student of chunk) {
        if (student.id) {
          const studentRef = doc(db, 'students', student.id);
          batch.update(studentRef, {
            curso: cleanNombre,
            division: cleanDivision,
            cursoDisplay,
            cursoId: courseId,
            updatedAt: serverTimestamp(),
          });
        }
      }
      await batch.commit();
    }
  } else {
    await updateDoc(docRef, updates);
  }

  return { id: courseId, ...updates };
};

/**
 * Cambia el estado activo/inactivo de una división en Firestore.
 */
export const toggleAcademicCourseStatus = async (courseId, newStatus) => {
  await ensureAdminAuth();
  const docRef = doc(db, 'academicOffer', courseId);
  await updateDoc(docRef, {
    activo: Boolean(newStatus),
    updatedAt: serverTimestamp(),
  });
};

/**
 * Elimina un curso o división de Firestore y reasigna los alumnos vinculados a 'sin asignar'.
 */
export const deleteAcademicCourse = async (courseId, affectedStudents = []) => {
  await ensureAdminAuth();

  const batch = writeBatch(db);

  // 1. Reasignar a los alumnos en Firestore
  if (Array.isArray(affectedStudents) && affectedStudents.length > 0) {
    for (const student of affectedStudents) {
      if (student.id) {
        const studentRef = doc(db, 'students', student.id);
        batch.update(studentRef, {
          curso: 'sin asignar',
          division: 'sin asignar',
          cursoDisplay: 'Sin asignar',
          cursoId: null,
          updatedAt: serverTimestamp(),
        });
      }
    }
  }

  // 2. Eliminar el documento del curso en academicOffer
  const courseRef = doc(db, 'academicOffer', courseId);
  batch.delete(courseRef);

  await batch.commit();
};

/**
 * Desvincula a un docente de todos los cursos asignados en academicOffer
 */
export const unassignTeacherFromAllCourses = async (teacherId, teacherName = null) => {
  try {
    await ensureAdminAuth();
    const snap = await getDocs(collection(db, 'academicOffer'));
    const batch = writeBatch(db);
    let updatedCount = 0;

    snap.forEach((docSnap) => {
      if (docSnap.id === 'current') return;
      const data = docSnap.data();
      const matchesId = data.docenteId && data.docenteId === teacherId;
      const matchesName =
        teacherName &&
        data.docenteTitular &&
        (data.docenteTitular.toLowerCase().includes(teacherName.toLowerCase()) ||
          teacherName.toLowerCase().includes(data.docenteTitular.toLowerCase()));

      if (matchesId || matchesName) {
        batch.update(docSnap.ref, {
          docenteTitular: null,
          docenteId: null,
          updatedAt: serverTimestamp(),
        });
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
    }
  } catch (err) {
    console.warn('Error al desvincular docente de cursos academicOffer:', err.message);
  }
};
