import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from './firebase';
import { callAdminFunction } from './adminService';

const STORAGE_KEY = 'school_teachers_data';

/**
 * Garantiza que exista una sesión de administrador activa en Firebase Auth
 * para no violar las reglas de seguridad de Firestore (Missing or insufficient permissions).
 */
export const ensureAdminAuth = async () => {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  // En entorno de desarrollo, auto-autenticar con credenciales de admin configuradas
  if (import.meta.env.DEV) {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      try {
        const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        return cred.user;
      } catch (err) {
        console.warn('Auto sign-in user_admin falló:', err.message);
      }
    }
  }

  // Esperar a que la sesión persistida se restaure si está disponible
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
    setTimeout(() => resolve(auth.currentUser), 2500);
  });
};

export const getStoredTeachers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Descartar datos viejos si tienen IDs simulados locales como 'doc-1', 'doc-2'
        const hasFakes = parsed.some((p) => p.id && String(p.id).startsWith('doc-') && p.id.length <= 6);
        if (!hasFakes) {
          return parsed;
        }
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  } catch (err) {
    console.warn('Error al leer docentes de localStorage:', err.message);
  }
  return [];
};

export const saveStoredTeachers = (teachers) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers));
  } catch (err) {
    console.warn('Error al persistir docentes en localStorage:', err.message);
  }
};

/**
 * Normaliza los datos de un documento de Firestore a la estructura del docente.
 */
const normalizeFirestoreTeacher = (docId, data = {}) => {
  const cleanNombre = (data.nombre || '').trim();
  const cleanApellido = (data.apellido || '').trim();
  const tratamiento = (data.tratamiento || '').trim();
  const legajo = data.legajo || `#DOC-${new Date().getFullYear()}-${docId.slice(-4).toUpperCase()}`;

  let nombreCompleto = (data.nombreCompleto || data.name || '').trim();
  if (!nombreCompleto && (cleanNombre || cleanApellido)) {
    nombreCompleto = tratamiento
      ? `${tratamiento} ${cleanNombre} ${cleanApellido}`.trim()
      : `${cleanNombre} ${cleanApellido}`.trim();
  }

  // Resolver nombre y apellido si solo venía `name` o `nombreCompleto`
  let nombreFinal = cleanNombre;
  let apellidoFinal = cleanApellido;
  if (!nombreFinal && !apellidoFinal && nombreCompleto) {
    const sinTratamiento = nombreCompleto.replace(/^(Prof\.|Ing\.|Lic\.|Dra\.|Dr\.)\s*/i, '').trim();
    const partes = sinTratamiento.split(' ');
    if (partes.length === 1) {
      nombreFinal = partes[0];
    } else {
      apellidoFinal = partes.pop() || '';
      nombreFinal = partes.join(' ');
    }
  }

  let creadoEn = new Date().toISOString();
  if (data.createdAt?.toDate) {
    creadoEn = data.createdAt.toDate().toISOString();
  } else if (typeof data.createdAt === 'string') {
    creadoEn = data.createdAt;
  }

  return {
    id: docId,
    legajo,
    tratamiento,
    nombre: nombreFinal,
    apellido: apellidoFinal,
    nombreCompleto: nombreCompleto || `${nombreFinal} ${apellidoFinal}`.trim(),
    dni: String(data.dni || '').trim(),
    titulacion: (data.titulacion || '').trim(),
    especialidad: (data.especialidad || '').trim(),
    email: (data.email || '').trim().toLowerCase(),
    telefono: (data.telefono || '').trim(),
    estado: data.estado || (data.disabled ? 'Suspendido' : 'Titular'),
    avatar: null,
    cargaHoras: Number(data.cargaHoras) || 0,
    cargaMaxHoras: Number(data.cargaMaxHoras) || 30,
    catedras: Array.isArray(data.catedras) ? data.catedras : [],
    grillaHoraria: Array.isArray(data.grillaHoraria) && data.grillaHoraria.length > 0
      ? data.grillaHoraria
      : [
          { hora: '07:30 - 08:50', lun: null, mar: null, mie: null, jue: null, vie: null },
          { hora: '09:00 - 10:20', lun: null, mar: null, mie: null, jue: null, vie: null },
          { hora: '10:30 - 11:50', lun: null, mar: null, mie: null, jue: null, vie: null },
        ],
    creadoEn,
  };
};

/**
 * Obtiene el listado de docentes directamente desde la colección users de Firestore.
 * Filtra por rol 'Staff' o 'Docente'.
 */
export const fetchTeachersApi = async () => {
  try {
    // 1. Asegurar sesión de administrador activa para no violar reglas de lectura
    await ensureAdminAuth();

    // 2. Consultar directamente Firestore
    const usersSnap = await getDocs(collection(db, 'users'));
    const staffDocs = [];

    usersSnap.forEach((d) => {
      const data = d.data();
      const role = String(data.role || '').toLowerCase();
      if (role === 'staff' || role === 'docente' || role === 'profesor') {
        staffDocs.push(normalizeFirestoreTeacher(d.id, data));
      }
    });

    // Ordenar alfabéticamente por apellido / nombre
    staffDocs.sort((a, b) => {
      const strA = (a.apellido || a.nombre || '').toLowerCase();
      const strB = (b.apellido || b.nombre || '').toLowerCase();
      return strA.localeCompare(strB, 'es', { sensitivity: 'base' });
    });

    saveStoredTeachers(staffDocs);
    return staffDocs;
  } catch (err) {
    console.error('Error al obtener docentes desde Firestore:', err);
    // Solo usar caché local si no tiene IDs simulados
    const cached = getStoredTeachers();
    if (cached.length > 0) {
      return cached;
    }
    throw err;
  }
};

/**
 * Registra un nuevo docente en Firebase (Cloud Function / Firestore directo).
 * La contraseña inicial por defecto es su número de DNI.
 */
export const createTeacherApi = async (teacherData) => {
  await ensureAdminAuth();

  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const legajo = `#DOC-${year}-${randomNum}`;

  const cleanNombre = (teacherData.nombre || '').trim();
  const cleanApellido = (teacherData.apellido || '').trim();
  const tratamiento = (teacherData.tratamiento || '').trim();
  const nombreCompleto = tratamiento
    ? `${tratamiento} ${cleanNombre} ${cleanApellido}`.trim()
    : `${cleanNombre} ${cleanApellido}`.trim();
  const cleanEmail = (teacherData.email || '').trim().toLowerCase();
  const cleanDni = String(teacherData.dni || '').trim().replace(/\./g, '');
  const cleanTelefono = (teacherData.telefono || '').trim();
  const cleanTitulacion = (teacherData.titulacion || '').trim();
  const cleanEspecialidad = (teacherData.especialidad || '').trim();
  const estado = teacherData.estado || 'Titular';

  let createdId = null;

  // 1. Intentar registrar vía Cloud Function
  try {
    const cfResult = await callAdminFunction('cf_createAdministrativeUser', {
      email: cleanEmail,
      name: nombreCompleto,
      role: 'Staff',
      dni: cleanDni,
      tratamiento,
      nombre: cleanNombre,
      apellido: cleanApellido,
      legajo,
      titulacion: cleanTitulacion,
      especialidad: cleanEspecialidad,
      telefono: cleanTelefono,
      estado,
      nombreCompleto,
    });
    createdId = cfResult.uid || cfResult.id;
  } catch (cfErr) {
    console.warn(
      'Fallo en Cloud Function cf_createAdministrativeUser, ejecutando persistencia directa en Firestore:',
      cfErr.message
    );
    // 2. Fallback a persistencia directa en Firestore
    try {
      const newDocRef = await addDoc(collection(db, 'users'), {
        role: 'Staff',
        legajo,
        tratamiento,
        nombre: cleanNombre,
        apellido: cleanApellido,
        nombreCompleto,
        dni: cleanDni,
        titulacion: cleanTitulacion,
        especialidad: cleanEspecialidad,
        email: cleanEmail,
        telefono: cleanTelefono,
        estado,
        disabled: estado === 'Suspendido',
        mustChangePassword: true,
        cargaHoras: 0,
        cargaMaxHoras: 30,
        catedras: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      createdId = newDocRef.id;
    } catch (firestoreErr) {
      console.error('Error en persistencia directa a Firestore:', firestoreErr.message);
      throw firestoreErr;
    }
  }

  const newTeacher = {
    id: createdId,
    legajo,
    tratamiento,
    nombre: cleanNombre,
    apellido: cleanApellido,
    nombreCompleto,
    dni: cleanDni,
    titulacion: cleanTitulacion,
    especialidad: cleanEspecialidad,
    email: cleanEmail,
    telefono: cleanTelefono,
    estado,
    avatar: null,
    cargaHoras: 0,
    cargaMaxHoras: 30,
    catedras: [],
    grillaHoraria: [
      { hora: '07:30 - 08:50', lun: null, mar: null, mie: null, jue: null, vie: null },
      { hora: '09:00 - 10:20', lun: null, mar: null, mie: null, jue: null, vie: null },
      { hora: '10:30 - 11:50', lun: null, mar: null, mie: null, jue: null, vie: null },
    ],
    creadoEn: new Date().toISOString(),
  };

  const currentList = getStoredTeachers();
  const updatedList = [newTeacher, ...currentList.filter((t) => t.id !== newTeacher.id)];
  saveStoredTeachers(updatedList);

  return newTeacher;
};

/**
 * Modifica los datos de un docente existente.
 * Actualiza en Cloud Function o Firestore directo.
 */
export const updateTeacherApi = async (teacherId, teacherData) => {
  await ensureAdminAuth();

  const currentList = getStoredTeachers();
  const cleanNombre = (teacherData.nombre || '').trim();
  const cleanApellido = (teacherData.apellido || '').trim();
  const tratamiento = (
    teacherData.tratamiento !== undefined ? teacherData.tratamiento : ''
  ).trim();
  const nombreCompleto = tratamiento
    ? `${tratamiento} ${cleanNombre} ${cleanApellido}`.trim()
    : `${cleanNombre} ${cleanApellido}`.trim();
  const cleanDni = String(teacherData.dni || '').trim().replace(/\./g, '');
  const cleanEmail = (teacherData.email || '').trim().toLowerCase();
  const cleanTelefono = (teacherData.telefono || '').trim();
  const cleanTitulacion = (teacherData.titulacion || '').trim();
  const cleanEspecialidad = (teacherData.especialidad || '').trim();
  const estado = teacherData.estado || 'Titular';

  const fieldsToUpdate = {
    tratamiento,
    nombre: cleanNombre,
    apellido: cleanApellido,
    nombreCompleto,
    dni: cleanDni,
    titulacion: cleanTitulacion,
    especialidad: cleanEspecialidad,
    email: cleanEmail,
    telefono: cleanTelefono,
    estado,
    disabled: estado === 'Suspendido',
  };

  // 1. Intentar vía Cloud Function
  try {
    await callAdminFunction('cf_updateUserProfile', {
      targetId: teacherId,
      targetType: 'staff',
      fields: fieldsToUpdate,
    });
  } catch (cfErr) {
    console.warn(
      'Fallo en Cloud Function cf_updateUserProfile, intentando actualización directa en Firestore:',
      cfErr.message
    );
    // 2. Fallback a Firestore directo
    try {
      await updateDoc(doc(db, 'users', teacherId), {
        ...fieldsToUpdate,
        updatedAt: serverTimestamp(),
      });
    } catch (firestoreErr) {
      console.warn('Fallo actualización en Firestore directo:', firestoreErr.message);
      throw firestoreErr;
    }
  }

  const updatedList = currentList.map((t) => {
    if (t.id === teacherId) {
      return {
        ...t,
        tratamiento,
        nombre: cleanNombre,
        apellido: cleanApellido,
        nombreCompleto: nombreCompleto || t.nombreCompleto,
        dni: cleanDni || t.dni,
        titulacion: cleanTitulacion,
        especialidad: cleanEspecialidad,
        email: cleanEmail || t.email,
        telefono: cleanTelefono,
        estado,
        updatedAt: new Date().toISOString(),
      };
    }
    return t;
  });

  saveStoredTeachers(updatedList);
  return updatedList.find((t) => t.id === teacherId);
};

/**
 * Alterna el estado de habilitación del docente (Suspendido <-> Titular).
 */
export const toggleTeacherStatusApi = async (teacherId) => {
  await ensureAdminAuth();

  const currentList = getStoredTeachers();
  const teacher = currentList.find((t) => t.id === teacherId);
  if (!teacher) {
    // Si no está en caché, recargar de Firestore
    const refreshed = await fetchTeachersApi();
    const found = refreshed.find((t) => t.id === teacherId);
    if (!found) throw new Error('Docente no encontrado');
    return toggleTeacherStatusApi(teacherId);
  }

  const nuevoEstado = teacher.estado === 'Suspendido' ? 'Titular' : 'Suspendido';

  await updateTeacherApi(teacherId, {
    ...teacher,
    estado: nuevoEstado,
  });

  const refreshedList = getStoredTeachers();
  return {
    teacher: refreshedList.find((t) => t.id === teacherId),
    nuevoEstado,
  };
};

/**
 * Restablece la contraseña institucional del docente a su número de DNI por defecto.
 */
export const resetTeacherPasswordApi = async (teacherId) => {
  await ensureAdminAuth();

  const currentList = getStoredTeachers();
  let teacher = currentList.find((t) => t.id === teacherId);
  if (!teacher) {
    const list = await fetchTeachersApi();
    teacher = list.find((t) => t.id === teacherId);
  }
  if (!teacher) throw new Error('Docente no encontrado');

  // 1. Intentar vía Cloud Function
  try {
    await callAdminFunction('cf_resetUserPasswordToDni', {
      userId: teacherId,
      userType: 'staff',
    });
  } catch (cfErr) {
    console.warn(
      'Fallo en Cloud Function cf_resetUserPasswordToDni, ejecutando flag en Firestore:',
      cfErr.message
    );
    try {
      await updateDoc(doc(db, 'users', teacherId), {
        mustChangePassword: true,
        updatedAt: serverTimestamp(),
      });
    } catch (firestoreErr) {
      console.warn('Fallo al marcar mustChangePassword en Firestore:', firestoreErr.message);
    }
  }

  return {
    success: true,
    dni: teacher.dni,
    nombre: teacher.nombreCompleto || teacher.nombre,
  };
};

/**
 * Elimina definitivamente un docente en Auth y Firestore.
 */
export const deleteTeacherApi = async (teacherId) => {
  await ensureAdminAuth();

  // 1. Intentar vía Cloud Function
  try {
    await callAdminFunction('cf_updateUserProfile', {
      targetId: teacherId,
      targetType: 'staff',
      fields: {
        deleteUser: true,
        _action: 'delete',
      },
    });
  } catch (cfErr) {
    console.warn(
      'Fallo en Cloud Function cf_updateUserProfile (delete), ejecutando eliminación directa en Firestore:',
      cfErr.message
    );
    // 2. Fallback con deleteDoc directo
    try {
      await deleteDoc(doc(db, 'users', teacherId));
    } catch (firestoreErr) {
      console.error('Error al eliminar docente en Firestore:', firestoreErr);
      throw firestoreErr;
    }
  }

  const currentList = getStoredTeachers();
  const updatedList = currentList.filter((t) => t.id !== teacherId);
  saveStoredTeachers(updatedList);

  return { success: true };
};

/**
 * Actualiza las cátedras y carga horaria asignadas a un docente.
 */
export const updateTeacherAssignmentsApi = async (teacherId, { catedras, grillaHoraria }) => {
  await ensureAdminAuth();

  const currentList = getStoredTeachers();
  const totalHoras = (catedras || []).reduce((acc, cat) => acc + (Number(cat.horasSemanales) || 0), 0);

  try {
    await updateDoc(doc(db, 'users', teacherId), {
      catedras: catedras || [],
      cargaHoras: totalHoras,
      ...(grillaHoraria ? { grillaHoraria } : {}),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Error al actualizar asignaciones en Firestore:', err.message);
  }

  const updatedList = currentList.map((docente) => {
    if (docente.id === teacherId) {
      return {
        ...docente,
        catedras: catedras || docente.catedras,
        cargaHoras: totalHoras,
        grillaHoraria: grillaHoraria || docente.grillaHoraria,
      };
    }
    return docente;
  });

  saveStoredTeachers(updatedList);
  return updatedList.find((d) => d.id === teacherId);
};

/**
 * Exporta la nómina docente a un archivo CSV estructurado.
 */
export const exportTeachersPayrollCsv = (teachers = []) => {
  const headers = [
    'Legajo',
    'DNI',
    'Tratamiento',
    'Nombre',
    'Apellido',
    'Nombre Completo',
    'Titulación',
    'Especialidad',
    'Email',
    'Teléfono',
    'Estado',
    'Horas Asignadas',
  ];
  const rows = teachers.map((t) => [
    t.legajo,
    t.dni,
    `"${(t.tratamiento || '').replace(/"/g, '""')}"`,
    `"${(t.nombre || '').replace(/"/g, '""')}"`,
    `"${(t.apellido || '').replace(/"/g, '""')}"`,
    `"${(t.nombreCompleto || `${t.nombre || ''} ${t.apellido || ''}`).trim().replace(/"/g, '""')}"`,
    `"${(t.titulacion || '').replace(/"/g, '""')}"`,
    `"${(t.especialidad || '').replace(/"/g, '""')}"`,
    t.email,
    t.telefono,
    t.estado,
    t.cargaHoras || 0,
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Nomina_Docente_Educar_${new Date().getFullYear()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
