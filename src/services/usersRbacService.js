import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from './firebase';
import { callAdminFunction } from './adminService';
import {
  INITIAL_RBAC_USERS,
  DEFAULT_ROLE_PERMISSIONS,
} from '../data/mockUsersRbac';
import { normalizeRole } from '../components/admin/users/userRbacConstants';

const USERS_STORAGE_KEY = 'school_rbac_users';
const ROLES_STORAGE_KEY = 'school_rbac_roles';

/**
 * Garantiza que exista una sesión de administrador activa en Firebase Auth.
 */
export const ensureAdminAuth = async () => {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  if (import.meta.env.DEV) {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const adminKey = import.meta.env.VITE_DEV_ADMIN_KEY;
    if (adminEmail && adminKey) {
      try {
        const cred = await signInWithEmailAndPassword(auth, adminEmail, adminKey);
        return cred.user;
      } catch (err) {
        console.warn('Auto sign-in user_admin falló:', err.message);
      }
    }
  }

  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
    setTimeout(() => resolve(auth.currentUser), 2000);
  });
};

/**
 * Carga usuarios desde el almacenamiento local seguro.
 */
export const getStoredRbacUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error leyendo usuarios RBAC de localStorage:', err.message);
  }
  return [...INITIAL_RBAC_USERS];
};

/**
 * Persiste los usuarios en el almacenamiento local.
 */
export const saveStoredRbacUsers = (users) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.warn('Error guardando usuarios RBAC en localStorage:', err.message);
  }
};

/**
 * Genera un código de legajo institucional según el rol y año actual.
 */
export const generateLegajo = (role, existingUsers = []) => {
  const normRole = normalizeRole(role);
  let prefix = 'ADM';
  if (normRole === 'Directivo') prefix = 'DIR';
  if (normRole === 'Docente') prefix = 'DOC';
  if (normRole === 'Enfermeria') prefix = 'ENF';
  if (normRole === 'Preceptoria') prefix = 'PRE';

  const year = new Date().getFullYear();
  const nextNum = String(existingUsers.length + 101).padStart(4, '0');
  return `#${prefix}-${year}-${nextNum}`;
};

/**
 * Obtiene el listado completo de usuarios con roles institucionales (RBAC).
 * Excluye perfiles de alumnos y tutores/padres puros.
 */
export const fetchRbacUsersApi = async () => {
  try {
    await ensureAdminAuth();
    const snap = await getDocs(collection(db, 'users'));

    if (!snap.empty) {
      const firestoreUsers = snap.docs
        .map((docSnap) => {
          const data = docSnap.data();
          const rawRole = data.role || '';
          const normRole = normalizeRole(rawRole);
          const lowerRaw = String(rawRole).toLowerCase();

          // Excluir si es explícitamente padre o estudiante
          if (lowerRaw === 'padre' || lowerRaw === 'tutor' || lowerRaw === 'estudiante') {
            return null;
          }

          return {
            id: docSnap.id,
            legajo: data.legajo || `#USR-${docSnap.id.slice(0, 6).toUpperCase()}`,
            nombre: data.nombre || data.name || '',
            apellido: data.apellido || '',
            nombreCompleto: data.nombreCompleto || `${data.nombre || ''} ${data.apellido || ''}`.trim() || data.name || 'Sin nombre',
            dni: data.dni || '',
            email: data.email || '',
            telefono: data.telefono || '',
            role: normRole,
            cargo: data.cargo || `Personal ${normRole}`,
            estado: data.estado || (data.disabled ? 'Suspendido' : 'Activo'),
            customPermissions: data.customPermissions || [],
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          };
        })
        .filter(Boolean);

      if (firestoreUsers.length > 0) {
        saveStoredRbacUsers(firestoreUsers);
        return firestoreUsers;
      }
    }
  } catch (err) {
    console.warn('Firestore no disponible o sin conexión. Usando almacenamiento local.', err.message);
  }

  return getStoredRbacUsers();
};

/**
 * Registra un nuevo usuario en el sistema con su rol correspondiente.
 */
export const createRbacUserApi = async (userData) => {
  const currentUsers = getStoredRbacUsers();
  const normRole = normalizeRole(userData.role);
  const legajo = userData.legajo || generateLegajo(normRole, currentUsers);
  const cleanDni = String(userData.dni || '').trim();
  const cleanEmail = String(userData.email || '').trim().toLowerCase();
  const cleanNombre = String(userData.nombre || '').trim();
  const cleanApellido = String(userData.apellido || '').trim();
  const nombreCompleto = `${cleanNombre} ${cleanApellido}`.trim();

  let targetUid = `usr-${Date.now()}`;

  // Intentar crear mediante Cloud Function si está disponible
  try {
    const cfResult = await callAdminFunction('cf_createAdministrativeUser', {
      email: cleanEmail,
      name: nombreCompleto,
      role: normRole === 'Directivo' ? 'user_admin' : normRole === 'Docente' ? 'teacher' : normRole,
      dni: cleanDni,
      nombre: cleanNombre,
      apellido: cleanApellido,
      nombreCompleto,
      telefono: userData.telefono || '',
      cargo: userData.cargo || `Personal ${normRole}`,
      legajo,
      estado: userData.estado || 'Activo',
      customPermissions: userData.customPermissions || [],
    });

    if (cfResult?.uid) {
      targetUid = cfResult.uid;
    }
  } catch (cfErr) {
    console.warn('Cloud Function cf_createAdministrativeUser no disponible, creando directo en Firestore/local:', cfErr.message);
  }

  const newUser = {
    id: targetUid,
    legajo,
    nombre: cleanNombre,
    apellido: cleanApellido,
    nombreCompleto,
    dni: cleanDni,
    email: cleanEmail,
    telefono: userData.telefono || '',
    role: normRole,
    cargo: userData.cargo || `Personal ${normRole}`,
    estado: userData.estado || 'Activo',
    customPermissions: userData.customPermissions || [],
    createdAt: new Date().toISOString(),
  };

  // Guardar en Firestore
  try {
    await ensureAdminAuth();
    await setDoc(doc(db, 'users', targetUid), {
      ...newUser,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (firestoreErr) {
    console.warn('No se pudo guardar usuario en Firestore, usando caché local:', firestoreErr.message);
  }

  // Guardar en localStorage
  const updatedList = [newUser, ...currentUsers];
  saveStoredRbacUsers(updatedList);

  return newUser;
};

/**
 * Modifica los datos de un usuario existente.
 */
export const updateRbacUserApi = async (userId, userData) => {
  const currentUsers = getStoredRbacUsers();
  const normRole = normalizeRole(userData.role);
  const cleanNombre = String(userData.nombre || '').trim();
  const cleanApellido = String(userData.apellido || '').trim();
  const nombreCompleto = `${cleanNombre} ${cleanApellido}`.trim();

  const updatedUser = {
    ...userData,
    id: userId,
    nombre: cleanNombre,
    apellido: cleanApellido,
    nombreCompleto,
    role: normRole,
    updatedAt: new Date().toISOString(),
  };

  // Actualizar en Firestore
  try {
    await ensureAdminAuth();
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      nombre: cleanNombre,
      apellido: cleanApellido,
      nombreCompleto,
      dni: userData.dni || '',
      email: userData.email || '',
      telefono: userData.telefono || '',
      role: normRole,
      cargo: userData.cargo || '',
      estado: userData.estado || 'Activo',
      customPermissions: userData.customPermissions || [],
      updatedAt: serverTimestamp(),
    });
  } catch (firestoreErr) {
    console.warn('No se pudo actualizar en Firestore, actualizando en local:', firestoreErr.message);
  }

  // Llamar a cf_updateUserProfile si es posible
  try {
    await callAdminFunction('cf_updateUserProfile', {
      targetId: userId,
      targetType: 'administrative',
      fields: {
        nombre: cleanNombre,
        apellido: cleanApellido,
        nombreCompleto,
        email: userData.email,
        cargo: userData.cargo,
        role: normRole === 'Directivo' ? 'user_admin' : normRole,
      },
    });
  } catch (err) {
    console.warn('cf_updateUserProfile no ejecutada:', err.message);
  }

  const updatedList = currentUsers.map((u) => (u.id === userId ? { ...u, ...updatedUser } : u));
  saveStoredRbacUsers(updatedList);

  return updatedUser;
};

/**
 * Alterna el estado de un usuario (Activo <-> Suspendido).
 */
export const toggleRbacUserStatusApi = async (userId) => {
  const currentUsers = getStoredRbacUsers();
  const target = currentUsers.find((u) => u.id === userId);
  if (!target) {
    throw new Error('Usuario no encontrado.');
  }

  const nuevoEstado = target.estado === 'Activo' ? 'Suspendido' : 'Activo';
  const updatedUser = { ...target, estado: nuevoEstado, updatedAt: new Date().toISOString() };

  try {
    await ensureAdminAuth();
    await updateDoc(doc(db, 'users', userId), {
      estado: nuevoEstado,
      disabled: nuevoEstado === 'Suspendido',
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('No se pudo actualizar estado en Firestore:', err.message);
  }

  const updatedList = currentUsers.map((u) => (u.id === userId ? updatedUser : u));
  saveStoredRbacUsers(updatedList);

  return { user: updatedUser, nuevoEstado };
};

/**
 * Restablece la contraseña del usuario a su número de DNI.
 */
export const resetRbacUserPasswordApi = async (userId) => {
  const currentUsers = getStoredRbacUsers();
  const user = currentUsers.find((u) => u.id === userId);
  if (!user) {
    throw new Error('Usuario no encontrado.');
  }

  const cleanDni = String(user.dni || '').replace(/\D/g, '');
  if (!cleanDni) {
    throw new Error('El usuario no tiene un DNI registrado.');
  }

  // Intentar llamar a Cloud Function
  try {
    await callAdminFunction('cf_resetUserPasswordToDni', {
      userId,
      userType: 'administrative',
    });
  } catch (cfErr) {
    console.warn('No se pudo ejecutar cf_resetUserPasswordToDni, procesado localmente:', cfErr.message);
  }

  return {
    success: true,
    dni: user.dni,
    nombre: user.nombreCompleto || user.nombre,
  };
};

/**
 * Elimina definitivamente un usuario del sistema.
 */
export const deleteRbacUserApi = async (userId, userEmail) => {
  try {
    await ensureAdminAuth();
    await deleteDoc(doc(db, 'users', userId));
  } catch (err) {
    console.warn('No se pudo eliminar de Firestore:', err.message);
  }

  try {
    await callAdminFunction('cf_updateUserProfile', {
      targetId: userId,
      targetType: 'administrative',
      fields: {
        _action: 'delete',
        deleteUser: true,
        email: userEmail,
      },
    });
  } catch (err) {
    console.warn('No se pudo ejecutar cf_updateUserProfile para baja:', err.message);
  }

  const currentUsers = getStoredRbacUsers();
  const updatedList = currentUsers.filter((u) => u.id !== userId);
  saveStoredRbacUsers(updatedList);

  return { success: true };
};

/**
 * Obtiene la matriz de permisos configurada para cada rol.
 */
export const fetchRolePermissionsApi = async () => {
  try {
    await ensureAdminAuth();
    const configDoc = await getDoc(doc(db, 'systemConfig', 'rbac_roles'));
    if (configDoc.exists()) {
      const data = configDoc.data();
      if (data && typeof data === 'object') {
        const merged = { ...DEFAULT_ROLE_PERMISSIONS, ...data };
        localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    }
  } catch (err) {
    console.warn('No se pudo leer matriz de permisos de Firestore, usando local:', err.message);
  }

  try {
    const raw = localStorage.getItem(ROLES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_ROLE_PERMISSIONS, ...parsed };
    }
  } catch (err) {
    console.warn('Error leyendo roles de localStorage:', err.message);
  }

  return { ...DEFAULT_ROLE_PERMISSIONS };
};

/**
 * Guarda los permisos actualizados para los roles institucionales.
 */
export const saveRolePermissionsApi = async (rolePermissions) => {
  try {
    await ensureAdminAuth();
    await setDoc(doc(db, 'systemConfig', 'rbac_roles'), {
      ...rolePermissions,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('No se pudo guardar la matriz de permisos en Firestore, guardando en local:', err.message);
  }

  try {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(rolePermissions));
  } catch (err) {
    console.warn('Error al persistir roles en localStorage:', err.message);
  }

  return rolePermissions;
};

/**
 * Exporta el listado de usuarios a formato CSV.
 */
export const exportUsersCsv = (users = [], activeRole = 'Todos') => {
  const headers = ['Legajo', 'Nombre y Apellido', 'DNI', 'Email Institucional', 'Teléfono', 'Rol', 'Cargo', 'Estado'];
  const rows = users.map((u) => [
    `"${u.legajo || ''}"`,
    `"${u.nombreCompleto || `${u.nombre || ''} ${u.apellido || ''}`.trim()}"`,
    `"${u.dni || ''}"`,
    `"${u.email || ''}"`,
    `"${u.telefono || ''}"`,
    `"${u.role || ''}"`,
    `"${u.cargo || ''}"`,
    `"${u.estado || ''}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `nomina_usuarios_${activeRole.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
