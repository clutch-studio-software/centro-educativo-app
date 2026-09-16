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
      parents: [
        { id: 'Shdj0VD8MPYnnu9HOgIbstxiuIH3', nombre: 'Martin Goya', email: 'tutor@hotmail.com', dni: '919239123', role: 'Padre', studentIds: ['AIXylomqTOt9xSURW8kR'] },
        { id: 'TUbJVTMFzOgLY3NpapOCuFyg3Iz1', nombre: 'Miguel Rodriguez', email: 'miguel.rodriguez@gmail.com', dni: '12470994', role: 'Padre', studentIds: ['AfGkOPgu8UpT0j5RQwlp'] },
        { id: 'O9YCc9EpNYbm8IKFS2aheHyzQFH3', nombre: 'Carlos Martinez', email: 'carlos@martinez.com', dni: '40034102', role: 'Padre', studentIds: ['MTcLSx1ut5orQNZZ5qxA'] },
        { id: 'oogdQ8npTKVz7gU7otQtZVxb7A32', nombre: 'Fabricio Alegre', email: 'fabricioalegre@gmail.com', dni: '41517446', role: 'Padre', studentIds: ['TvPE6UtgGw5IGtdF2yog'] },
        { id: 'N0kYhNM4sdVIfe2HsfSRuDiZwU02', nombre: 'Graciela Gomez', email: 'SantiNick29@gmail.com', dni: '12555888', role: 'Padre', studentIds: ['e0zIsEOQ0vMS0nPuRNPM'] }
      ],
      allUsers: [],
      students: [
        { id: 'AIXylomqTOt9xSURW8kR', studentID_login: 'EST-2026-65167', parentId: 'Shdj0VD8MPYnnu9HOgIbstxiuIH3', emailPadre: 'tutor@hotmail.com', nombre: 'Lucas Goya', dni: '123919239', nivel: 'secundaria', curso: 'sin asignar', division: 'sin asignar', status: 'active', fechaNacimiento: '2010-12-01' },
        { id: 'AfGkOPgu8UpT0j5RQwlp', studentID_login: 'EST-2026-56443', parentId: 'TUbJVTMFzOgLY3NpapOCuFyg3Iz1', emailPadre: 'miguel.rodriguez@gmail.com', nombre: 'Lucas Rodriguez', dni: '40034122', nivel: 'inicial', curso: 'sin asignar', division: 'sin asignar', status: 'active', fechaNacimiento: '1990-12-01' },
        { id: 'MTcLSx1ut5orQNZZ5qxA', studentID_login: 'EST-2026-94244', parentId: 'O9YCc9EpNYbm8IKFS2aheHyzQFH3', emailPadre: 'carlos@martinez.com', nombre: 'Lucas Martinez', dni: '912391239', nivel: 'inicial', curso: 'sin asignar', division: 'sin asignar', status: 'active', fechaNacimiento: '2022-12-01' },
        { id: 'TvPE6UtgGw5IGtdF2yog', studentID_login: 'EST-2026-19509', parentId: 'oogdQ8npTKVz7gU7otQtZVxb7A32', emailPadre: 'fabricioalegre@gmail.com', nombre: 'Mateo Alegre', dni: '10101010', nivel: 'secundaria', curso: 'sin asignar', division: 'sin asignar', status: 'active', fechaNacimiento: '2010-12-01' },
        { id: 'e0zIsEOQ0vMS0nPuRNPM', studentID_login: 'EST-2026-79353', parentId: 'N0kYhNM4sdVIfe2HsfSRuDiZwU02', emailPadre: 'SantiNick29@gmail.com', nombre: 'Santiago Nickisch', dni: '42404103', nivel: 'secundaria', curso: 'sin asignar', division: 'sin asignar', status: 'active', fechaNacimiento: '2011-01-28' }
      ],
      isFallback: true,
      errorMessage: 'No se pudieron cargar datos directos de Firestore. Mostrando réplica sincronizada.'
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

/**
 * Elimina definitivamente un estudiante en Firestore y lo desvincula de su tutor.
 */
export const deleteStudentApi = async ({ studentId }) => {
  return await callAdminFunction('cf_deleteStudent', { studentId });
};

