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
import { db } from './firebase';
import { ensureAdminAuth } from './teachersService';

/**
 * Orden estándar pedagógico de los niveles educativos
 */
const LEVEL_ORDER = {
  inicial: 1,
  primario: 2,
  secundario: 3,
};

/**
 * Normaliza y ordena un listado de cursos según nivel y grado/año
 */
export const sortAcademicCourses = (courses = []) => {
  return [...courses].sort((a, b) => {
    const levelDiff = (LEVEL_ORDER[a.nivelId] || 99) - (LEVEL_ORDER[b.nivelId] || 99);
    if (levelDiff !== 0) return levelDiff;

    // Extraer número de grado o sala si existe
    const numA = parseInt(String(a.nombre || '').match(/\d+/)?.[0] || '0', 10);
    const numB = parseInt(String(b.nombre || '').match(/\d+/)?.[0] || '0', 10);
    if (numA !== numB) return numA - numB;

    // Comparar división alfabéticamente
    return String(a.division || 'A').localeCompare(String(b.division || 'A'));
  });
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
      if (!c.activo) continue;
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
      const div = c.division || 'A';
      if (!catalog[nivelKey][nombreKey].includes(div)) {
        catalog[nivelKey][nombreKey].push(div);
      }
    }

    const currentDocRef = doc(db, 'academicOffer', 'current');
    await setDoc(currentDocRef, catalog, { merge: true });
  } catch (err) {
    console.warn('No se pudo sincronizar academicOffer/current:', err.message);
  }
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

  await setDoc(docRef, payload);
  return payload;
};

/**
 * Actualiza los datos de un curso o división existente en Firestore.
 */
export const updateAcademicCourse = async (courseId, courseData) => {
  await ensureAdminAuth();

  const docRef = doc(db, 'academicOffer', courseId);
  const updates = {
    ...courseData,
    cupoMax: Number(courseData.cupoMax) || 30,
    division: (courseData.division || 'A').toUpperCase().trim(),
    nombre: courseData.nombre.trim(),
    updatedAt: serverTimestamp(),
  };

  await updateDoc(docRef, updates);
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
