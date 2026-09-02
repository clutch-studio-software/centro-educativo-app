import { auth, db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

/**
 * Obtiene la URL base de Google Cloud Functions según el entorno, normalizando y limpiando caracteres invisibles.
 */
const getFunctionsBaseUrl = () => {
  const envUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL;
  if (envUrl) {
    return envUrl.trim().replace(/[\u200B-\u200D\u2060\u202F\uFEFF]/g, '').replace(/\/?$/, '/');
  }
  return (
    import.meta.env.DEV
      ? 'http://127.0.0.1:5001/centro-educativo-f5cc5/us-central1/'
      : 'https://us-central1-centro-educativo-f5cc5.cloudfunctions.net/'
  );
};

/**
 * Obtiene el Token JWT de Firebase Auth del usuario administrador actual.
 */
export const getAdminAuthToken = async () => {
  if (auth.currentUser) {
    return await auth.currentUser.getIdToken();
  }
  return 'mock-admin-token';
};

/**
 * Helper centralizado para ejecutar peticiones HTTP autenticadas a Cloud Functions.
 */
const callAdminFunction = async (endpoint, payload) => {
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
    const parentsSnap = await getDocs(collection(db, 'users'));
    const studentsSnap = await getDocs(collection(db, 'students'));

    const parents = parentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const students = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return {
      parents,
      students,
      isFallback: false,
      errorMessage: ''
    };
  } catch (err) {
    console.error('Error cargando datos de Firestore:', err);
    return {
      parents: [
        { id: 'parent-1', nombre: 'Eduardo Gómez', email: 'eduardo@ejemplo.com', emailInvalid: false, studentIds: ['student-1', 'student-2'] },
        { id: 'parent-2', nombre: 'María Rodríguez', email: 'maria.invalid@gmail.com', emailInvalid: true, studentIds: ['student-3'] }
      ],
      students: [
        { id: 'student-1', studentID_login: 'EST-2026-88123', parentId: 'parent-1', emailPadre: 'eduardo@ejemplo.com', nombre: 'Lucía Gómez', dni: '48123456', nivel: 'inicial', status: 'active' },
        { id: 'student-2', studentID_login: 'EST-2026-90412', parentId: 'parent-1', emailPadre: 'eduardo@ejemplo.com', nombre: 'Mateo Gómez', dni: '45123987', nivel: 'primaria', status: 'pendingParentActivation' },
        { id: 'student-3', studentID_login: 'EST-2026-10492', parentId: 'parent-2', emailPadre: 'maria.invalid@gmail.com', nombre: 'Sofía Rodríguez', dni: '42987123', nivel: 'secundaria', status: 'pendingParentActivation' }
      ],
      isFallback: true,
      errorMessage: 'No se pudieron cargar datos reales de Firestore. Mostrando datos simulados.'
    };
  }
};

/**
 * Registra un nuevo tutor junto con sus alumnos vinculados.
 */
export const createParentAndStudentsApi = async ({ parentEmail, parentName, parentDni, students }) => {
  return await callAdminFunction('cf_createParentAndStudents', {
    parentEmail: parentEmail.trim(),
    parentName: parentName.trim(),
    parentDni: parentDni.trim(),
    students
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
  return await callAdminFunction('cf_updateUserProfile', {
    targetId,
    targetType,
    fields
  });
};
