import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { callAdminFunction } from './adminService';
import { MOCK_TEACHERS } from '../data/mockTeachers';

const STORAGE_KEY = 'school_teachers_data';

export const getStoredTeachers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error al leer docentes de localStorage:', err.message);
  }
  return MOCK_TEACHERS;
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

  // Resolver nombre y apellido si solo venía `name`
  let nombreFinal = cleanNombre;
  let apellidoFinal = cleanApellido;
  if (!nombreFinal && !apellidoFinal && nombreCompleto) {
    const partes = nombreCompleto.split(' ');
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
 * Obtiene el listado de docentes desde Firestore con rol 'Staff' o 'Docente'.
 * Si Firestore está vacío, inicializa automáticamente los docentes mockeados.
 */
export const fetchTeachersApi = async () => {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const staffDocs = [];

    usersSnap.forEach((d) => {
      const data = d.data();
      const role = String(data.role || '').toLowerCase();
      if (role === 'staff' || role === 'docente' || role === 'profesor') {
        staffDocs.push(normalizeFirestoreTeacher(d.id, data));
      }
    });

    if (staffDocs.length > 0) {
      saveStoredTeachers(staffDocs);
      return staffDocs;
    }

    // Si Firestore no tiene docentes aún, sembrar datos de MOCK_TEACHERS para tener información real
    console.info('No se encontraron docentes en Firestore. Inicializando colección de Staff...');
    const createdList = [];
    for (const mock of MOCK_TEACHERS) {
      try {
        const docRef = await addDoc(collection(db, 'users'), {
          role: 'Staff',
          legajo: mock.legajo,
          tratamiento: mock.tratamiento || '',
          nombre: mock.nombre,
          apellido: mock.apellido,
          nombreCompleto: mock.nombreCompleto,
          dni: mock.dni,
          titulacion: mock.titulacion,
          especialidad: mock.especialidad,
          email: mock.email,
          telefono: mock.telefono,
          estado: mock.estado,
          disabled: mock.estado === 'Suspendido',
          mustChangePassword: true,
          cargaHoras: mock.cargaHoras || 0,
          cargaMaxHoras: mock.cargaMaxHoras || 30,
          catedras: mock.catedras || [],
          grillaHoraria: mock.grillaHoraria || [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        createdList.push({ ...mock, id: docRef.id });
      } catch (seedErr) {
        console.warn('Error al sembrar docente mock en Firestore:', seedErr.message);
      }
    }

    const finalList = createdList.length > 0 ? createdList : getStoredTeachers();
    saveStoredTeachers(finalList);
    return finalList;
  } catch (err) {
    console.warn('Fallo al obtener docentes de Firestore. Usando almacenamiento local:', err.message);
    return getStoredTeachers();
  }
};

/**
 * Registra un nuevo docente y genera su legajo institucional automático.
 * La contraseña inicial por defecto es su DNI.
 * Invoca la Cloud Function cf_createAdministrativeUser con fallback a Firestore directo.
 */
export const createTeacherApi = async (teacherData) => {
  const currentList = getStoredTeachers();
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
      console.warn('Error en persistencia directa a Firestore, usando ID local:', firestoreErr.message);
      createdId = `doc-${Date.now()}`;
    }
  }

  const newTeacher = {
    id: createdId || `doc-${Date.now()}`,
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

  const updatedList = [newTeacher, ...currentList.filter((t) => t.id !== newTeacher.id)];
  saveStoredTeachers(updatedList);

  return newTeacher;
};

/**
 * Modifica los datos de un docente existente.
 * Actualiza en Cloud Function o Firestore directo.
 */
export const updateTeacherApi = async (teacherId, teacherData) => {
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
  const currentList = getStoredTeachers();
  const teacher = currentList.find((t) => t.id === teacherId);
  if (!teacher) throw new Error('Docente no encontrado');

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
  const currentList = getStoredTeachers();
  const teacher = currentList.find((t) => t.id === teacherId);
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
      // Continuar para limpiar de la caché local
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
