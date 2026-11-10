import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase.js';

const NOTIFICATIONS_COLLECTION = 'notifications';
const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

/**
 * Verifica si un string corresponde a un token válido de Expo Push Notifications
 */
const isValidExpoPushToken = (token) => {
  if (typeof token !== 'string') return false;
  const trimmed = token.trim();
  return (
    trimmed.startsWith('ExponentPushToken[') ||
    trimmed.startsWith('ExpoPushToken[')
  );
};

/**
 * Extrae todos los tokens válidos desde un objeto de documento (users o students)
 */
const extractTokensFromDocData = (data) => {
  if (!data || typeof data !== 'object') return [];
  const candidates = [];

  if (typeof data.expoPushToken === 'string') {
    candidates.push(data.expoPushToken.trim());
  }

  if (Array.isArray(data.expoPushTokens)) {
    for (const item of data.expoPushTokens) {
      if (typeof item === 'string') {
        candidates.push(item.trim());
      } else if (item && typeof item.token === 'string') {
        candidates.push(item.token.trim());
      }
    }
  }

  return candidates.filter(isValidExpoPushToken);
};

/**
 * Resuelve el parentId y nombre completo de un alumno a partir de su documento o búsqueda en users
 */
export const resolveStudentNotificationTarget = async ({
  studentId,
  studentData = null,
  fallbackStudentName = '',
  fallbackParentId = null,
}) => {
  let data = studentData;

  if (!data && studentId) {
    try {
      const snap = await getDoc(doc(db, 'students', String(studentId).trim()));
      if (snap.exists()) {
        data = snap.data();
      }
    } catch {
      // Ignorar fallo de lectura auxiliar
    }
  }

  const studentName =
    (
      data?.nombreCompleto ||
      `${data?.nombre || ''} ${data?.apellido || ''}`.trim() ||
      data?.name ||
      fallbackStudentName ||
      'Alumno'
    ).trim();

  let parentId =
    fallbackParentId ||
    data?.parentId ||
    data?.tutorUid ||
    data?.parentUid ||
    null;

  if (!parentId && (data?.tutorDni || data?.parentDni || data?.emailPadre || studentId)) {
    try {
      const cleanTargetDni = String(data?.tutorDni || data?.parentDni || '').replace(/\D/g, '');
      const cleanTargetEmail = String(data?.emailPadre || '').trim().toLowerCase();
      const usersSnap = await getDocs(collection(db, 'users'));

      for (const uDoc of usersSnap.docs) {
        const uData = uDoc.data();
        const uDni = String(uData.dni || '').replace(/\D/g, '');
        const uEmail = String(uData.email || '').trim().toLowerCase();
        const uStudentIds = Array.isArray(uData.studentIds) ? uData.studentIds : [];

        if (
          (studentId && uStudentIds.includes(String(studentId))) ||
          (cleanTargetDni && uDni && cleanTargetDni === uDni) ||
          (cleanTargetEmail && uEmail && cleanTargetEmail === uEmail)
        ) {
          parentId = uDoc.id;
          break;
        }
      }
    } catch {
      // Ignorar fallo de resolución secundaria
    }
  }

  return {
    parentId: parentId || null,
    studentName,
  };
};

/**
 * Recolecta tokens únicos de Expo Push desde users/{parentId} y students/{studentId}
 */
const collectRecipientPushTokens = async ({ parentId, studentId }) => {
  const tokenSet = new Set();

  const tasks = [];

  if (parentId) {
    tasks.push(
      getDoc(doc(db, 'users', String(parentId).trim()))
        .then((snap) => {
          if (snap.exists()) {
            extractTokensFromDocData(snap.data()).forEach((t) => tokenSet.add(t));
          }
        })
        .catch(() => {})
    );
  }

  if (studentId) {
    tasks.push(
      getDoc(doc(db, 'students', String(studentId).trim()))
        .then((snap) => {
          if (snap.exists()) {
            extractTokensFromDocData(snap.data()).forEach((t) => tokenSet.add(t));
          }
        })
        .catch(() => {})
    );
  }

  await Promise.all(tasks);
  return Array.from(tokenSet);
};

/**
 * Servicio centralizado para registrar notificaciones institucionales en Firestore
 * y despachar Push Notifications hacia la App Móvil (Expo) sin bloquear el flujo principal.
 *
 * @param {Object} payload
 * @param {string|null} [payload.parentId] UID del padre/tutor
 * @param {string|null} [payload.studentId] ID del documento en students/{studentId}
 * @param {string} [payload.studentName] Nombre completo del alumno
 * @param {'enfermeria'|'preceptoria'|'inasistencia'|'justificacion'|'pago'} payload.category
 * @param {string} payload.title Título corto de la notificación
 * @param {string} payload.body Descripción detallada
 * @param {'academic'|'billing'} payload.targetTab Pestaña destino en la App Móvil
 * @param {string|null} [payload.recordId] ID del registro asociado
 * @param {'info'|'aprobado'|'rechazado'|'observado'} [payload.status] Estado del evento
 */
export const sendInstitutionalNotification = async (payload = {}) => {
  try {
    let resolvedParentId = payload.parentId || payload.userId || null;
    let resolvedStudentName = payload.studentName || '';

    if ((!resolvedParentId || !resolvedStudentName) && payload.studentId) {
      const targetInfo = await resolveStudentNotificationTarget({
        studentId: payload.studentId,
        fallbackStudentName: resolvedStudentName,
        fallbackParentId: resolvedParentId,
      });
      resolvedParentId = resolvedParentId || targetInfo.parentId;
      resolvedStudentName = resolvedStudentName || targetInfo.studentName;
    }

    const notificationDoc = {
      parentId: resolvedParentId || null,
      userId: resolvedParentId || null,
      studentId: payload.studentId || null,
      studentName: resolvedStudentName || '',
      category: payload.category || 'info',
      title: payload.title || 'Notificación Institucional',
      body: payload.body || '',
      targetTab: payload.targetTab || 'academic',
      recordId: payload.recordId || null,
      status: payload.status || 'info',
      read: false,
      leida: false,
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, NOTIFICATIONS_COLLECTION),
      notificationDoc
    );

    // Envío de Push Notification vía Expo Push API (no bloqueante ante fallos de red/CORS)
    try {
      const tokens = await collectRecipientPushTokens({
        parentId: resolvedParentId,
        studentId: payload.studentId,
      });

      if (tokens.length > 0 && typeof fetch === 'function') {
        const messages = tokens.map((token) => ({
          to: token,
          sound: 'default',
          title: notificationDoc.title,
          body: notificationDoc.body,
          data: {
            category: notificationDoc.category,
            studentId: notificationDoc.studentId,
            targetTab: notificationDoc.targetTab,
            recordId: notificationDoc.recordId,
          },
        }));

        await fetch(EXPO_PUSH_ENDPOINT, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messages),
        });
      }
    } catch (pushErr) {
      console.warn(
        'Aviso: la notificación se guardó en Firestore pero el envío Push (Expo) no pudo completarse:',
        pushErr?.message || pushErr
      );
    }

    return { id: docRef.id, ...notificationDoc };
  } catch (err) {
    console.warn(
      'Aviso al registrar notificación institucional:',
      err?.message || err
    );
    return null;
  }
};

