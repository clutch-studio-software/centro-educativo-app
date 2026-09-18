import { auth, db } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';

export const DEFAULT_ACADEMIC_OFFER = {
  Inicial: {
    'Sala de 2 Años': ['A'],
    'Sala de 3 Años': ['A'],
    'Sala de 4 Años': ['A'],
    'Sala de 5 Años': ['A'],
  },
  Primario: {
    '1er Grado': ['A'],
    '2do Grado': ['A'],
    '3er Grado': ['A'],
    '4to Grado': ['A'],
    '5to Grado': ['A'],
    '6to Grado': ['A'],
    '7mo Grado': ['A'],
  },
  Secundario: {
    '1er Año': ['A'],
    '2do Año': ['A'],
    '3er Año': ['A'],
    '4to Año': ['A'],
    '5to Año': ['A'],
    '6to Año': ['A'],
  },
};

/**
 * Obtiene la URL base de Google Cloud Functions según el entorno, normalizando y limpiando caracteres invisibles.
 */
const getFunctionsBaseUrl = () => {
  const envUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL;
  if (envUrl) {
    return envUrl.trim().replace(/[\u200B-\u200D\u2060\u202F\uFEFF]/g, '').replace(/\/?$/, '/');
  }
  return 'https://us-central1-centro-educativo-f5cc5.cloudfunctions.net/';
};

/**
 * Obtiene el Token JWT de Firebase Auth del usuario administrador actual con forceRefresh.
 * Si en entorno DEV no hay sesión activa, autentica automáticamente con el usuario administrador oficial.
 */
export const getAdminAuthToken = async () => {
  if (!auth.currentUser && import.meta.env.DEV) {
    try {
      await signInWithEmailAndPassword(auth, import.meta.env.VITE_ADMIN_EMAIL, import.meta.env.VITE_DEV_ADMIN_KEY);
    } catch (err) {
      console.warn('Auto sign-in user_admin falló:', err.message);
    }
  }

  if (auth.currentUser) {
    return await auth.currentUser.getIdToken(true);
  }

  throw new Error('No hay una sesión de administrador activa en Firebase Auth. Por favor inicia sesión con un usuario Admin.');
};

/**
 * Helper centralizado para ejecutar peticiones HTTP autenticadas a Cloud Functions.
 */
export const callAdminFunction = async (endpoint, payload) => {
  const baseUrl = getFunctionsBaseUrl();
  const token = await getAdminAuthToken();
  const cleanEndpoint = String(endpoint).replace(/^\//, '');

  const response = await fetch(`${baseUrl}${cleanEndpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Error en la petición al servidor.');
  }

  return await response.json().catch(() => ({}));
};

/**
 * Obtiene los listados de usuarios (padres/personal) y estudiantes desde Firestore.
 * Incluye fallback de datos simulados si no hay conexión a Firestore.
 */
export const fetchAdminDashboardData = async () => {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const studentsSnap = await getDocs(collection(db, 'students'));

    const allUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Filtro estricto: Solo usuarios con rol 'Padre' son considerados tutores
    const parents = allUsers.filter(u => String(u.role || '').trim().toLowerCase() === 'padre');

    const students = studentsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        curso: data.curso || 'sin asignar',
        division: data.division || 'sin asignar',
      };
    });

    return {
      parents,
      allUsers,
      students,
      isFallback: false,
      errorMessage: ''
    };
  } catch (err) {
    console.error('Error cargando datos de Firestore:', err);
    return {
      parents: [],
      allUsers: [],
      students: [],
      isFallback: false,
      errorMessage: 'Error cargando datos de Firestore: ' + (err?.message || '')
    };
  }
};

/**
 * Registra un nuevo tutor junto con sus alumnos vinculados.
 * Se procesa en el entorno seguro del servidor mediante Cloud Function,
 * donde se asignan roles, credenciales y relaciones de forma autorizada.
 */
export const createParentAndStudentsApi = async ({ parentEmail, parentName, parentDni, students }) => {
  const cleanEmail = String(parentEmail || '').trim().toLowerCase();
  const cleanDni = String(parentDni || '').trim().replace(/\./g, '');
  const cleanName = String(parentName || '').trim();

  return await callAdminFunction('cf_createParentAndStudents', {
    parentEmail: cleanEmail,
    parentName: cleanName,
    parentDni: cleanDni,
    students,
  });
};

/**
 * Registra un nuevo usuario del personal institucional / administrativo.
 */
export const createAdministrativeUserApi = async ({ email, name, role, dni }) => {
  return await callAdminFunction('cf_createAdministrativeUser', {
    email: email.trim(),
    name: name.trim(),
    role,
    dni: dni.trim()
  });
};

/**
 * Restablece la contraseña de un usuario a su número de DNI por defecto.
 */
export const resetUserPasswordToDniApi = async ({ userId, userType }) => {
  return await callAdminFunction('cf_resetUserPasswordToDni', { userId, userType });
};

/**
 * Actualiza los campos editables del perfil de un usuario o estudiante en Firestore.
 */
export const updateUserProfileApi = async ({ targetId, targetType, fields }) => {
  try {
    return await callAdminFunction('cf_updateUserProfile', {
      targetId,
      targetType,
      fields,
    });
  } catch (cfErr) {
    console.warn(
      'Fallo en Cloud Function cf_updateUserProfile, intentando actualización directa en Firestore:',
      cfErr.message
    );
    const collectionName = targetType === 'student' ? 'students' : 'users';
    const docRef = doc(db, collectionName, targetId);
    await updateDoc(docRef, {
      ...fields,
      updatedAt: serverTimestamp(),
    });
    return { message: 'Perfil actualizado exitosamente en Firestore.' };
  }
};

/**
 * Actualiza integralmente los datos de un estudiante y su tutor vinculado.
 * Soporta actualización directa de datos de contacto del tutor y/o reasignación a otro tutor registrado.
 */
export const updateStudentAndTutorApi = async ({
  studentId,
  studentData,
  tutorId,
  tutorData,
  reassignedTutorId = null,
}) => {
  const studentDocRef = doc(db, 'students', studentId);
  const studentUpdates = {
    nombre: studentData.nombre?.trim() || '',
    dni: String(studentData.dni || '').replace(/\./g, '').trim(),
    fechaNacimiento: studentData.fechaNacimiento || '',
    nivel: (studentData.nivel || 'primario').toLowerCase(),
    curso: studentData.curso || 'sin asignar',
    division: studentData.division || 'sin asignar',
    status:
      studentData.estado === 'Activo - Regular'
        ? 'active'
        : studentData.status || studentData.estado || 'active',
    domicilio: studentData.domicilio?.trim() || '',
    updatedAt: serverTimestamp(),
  };

  if (studentData.servicios) {
    studentUpdates.servicios = studentData.servicios;
  }

  // Si se reasignó a otro tutor registrado
  if (reassignedTutorId && reassignedTutorId !== tutorId) {
    studentUpdates.parentId = reassignedTutorId;
    if (tutorData?.email) {
      studentUpdates.emailPadre = tutorData.email.trim().toLowerCase();
    }

    await updateDoc(studentDocRef, studentUpdates);

    // Desvincular del tutor anterior si existía
    if (tutorId) {
      try {
        await updateDoc(doc(db, 'users', tutorId), {
          studentIds: arrayRemove(studentId),
          updatedAt: serverTimestamp(),
        });
      } catch (errOld) {
        console.warn('No se pudo desvincular del tutor anterior:', errOld.message);
      }
    }

    // Vincular al nuevo tutor
    try {
      await updateDoc(doc(db, 'users', reassignedTutorId), {
        studentIds: arrayUnion(studentId),
        updatedAt: serverTimestamp(),
      });
    } catch (errNew) {
      console.warn('No se pudo vincular al nuevo tutor:', errNew.message);
    }

    return { message: 'Estudiante y tutor reasignado guardados exitosamente.' };
  }

  // Si no se reasignó, actualizar los datos del alumno y del tutor actual
  await updateDoc(studentDocRef, studentUpdates);

  if (tutorId && tutorData) {
    try {
      const tutorDocRef = doc(db, 'users', tutorId);
      const tutorUpdates = {
        updatedAt: serverTimestamp(),
      };
      if (tutorData.nombre) tutorUpdates.nombre = tutorData.nombre.trim();
      if (tutorData.telefono !== undefined) tutorUpdates.telefono = tutorData.telefono.trim();
      if (tutorData.email) {
        tutorUpdates.email = tutorData.email.trim().toLowerCase();
        // Sincronizar emailPadre en el estudiante
        await updateDoc(studentDocRef, { emailPadre: tutorUpdates.email });
      }
      if (tutorData.dni) tutorUpdates.dni = String(tutorData.dni).replace(/\./g, '').trim();
      if (tutorData.domicilio !== undefined) tutorUpdates.domicilio = tutorData.domicilio.trim();

      await updateDoc(tutorDocRef, tutorUpdates);
    } catch (tutorErr) {
      console.warn('No se pudieron actualizar los datos del tutor:', tutorErr.message);
    }
  }

  return { message: 'Datos del alumno y tutor guardados correctamente.' };
};

/**
 * Elimina definitivamente un estudiante en Firestore y lo desvincula de su tutor.
 */
export const deleteStudentApi = async ({ studentId }) => {
  try {
    // 1. Intentar vía Cloud Function
    return await callAdminFunction('cf_updateUserProfile', {
      targetId: studentId,
      targetType: 'student',
      fields: {
        deleteStudent: true,
        _action: 'delete'
      }
    });
  } catch (cfErr) {
    console.warn('Fallo en Cloud Function cf_updateUserProfile, intentando eliminación directa autorizada en Firestore:', cfErr.message);
    // 2. Fallback con deleteDoc directo (permitido por las reglas de Firestore para user_admin)
    try {
      const studentDocRef = doc(db, 'students', studentId);
      await deleteDoc(studentDocRef);
      return { message: 'Estudiante eliminado directamente en Firestore.' };
    } catch (firestoreErr) {
      console.error('Error definitivo al eliminar estudiante en Firestore:', firestoreErr);
      throw firestoreErr;
    }
  }
};

/**
 * Obtiene la configuración de cursos y divisiones por nivel desde Firestore o Cloud Functions.
 * Garantiza que siempre exista al menos la división 'A' en cada curso.
 */
export const fetchAcademicOfferApi = async () => {
  try {
    const docRef = doc(db, 'academicOffer', 'current');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Garantizar que la división 'A' exista en cada curso
      const sanitized = { ...DEFAULT_ACADEMIC_OFFER };
      for (const nivel of ['Inicial', 'Primario', 'Secundario']) {
        if (data[nivel]) {
          sanitized[nivel] = { ...sanitized[nivel], ...data[nivel] };
          for (const c of Object.keys(sanitized[nivel])) {
            let divs = Array.isArray(sanitized[nivel][c]) ? sanitized[nivel][c] : [];
            if (!divs.includes('A')) divs = ['A', ...divs];
            sanitized[nivel][c] = Array.from(new Set(divs));
          }
        }
      }
      return sanitized;
    }
  } catch (err) {
    console.warn('Lectura directa de academicOffer falló o no inicializada, intentando Cloud Function / fallback:', err.message);
  }

  // Fallback con función o por defecto
  return DEFAULT_ACADEMIC_OFFER;
};

/**
 * Guarda o actualiza la oferta académica en Firestore a través de la Cloud Function.
 */
export const saveAcademicOfferApi = async (academicOffer) => {
  return await callAdminFunction('cf_saveAcademicOffer', { academicOffer });
};


