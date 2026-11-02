import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { ensureAdminAuth } from './teachersService';

const TARIFFS_CONFIG_COLLECTION = 'tariffs_config';
const TARIFF_AUDIT_COLLECTION = 'tariff_audit_logs';

export const INITIAL_AUDIT_LOGS = [];


/**
 * Guarda los aranceles y genera un registro de auditoría en Firestore.
 */
export const saveTariffsWithAuditLogApi = async ({
  previousTariffs,
  currentTariffs,
  previousSportsPrices,
  currentSportsPrices,
  user,
}) => {
  const changes = [];

  // 1. Comparar niveles educativos
  if (previousTariffs?.academicLevels && currentTariffs?.academicLevels) {
    currentTariffs.academicLevels.forEach((level) => {
      const prev = previousTariffs.academicLevels.find((l) => l.id === level.id);
      if (prev && Number(prev.amount) !== Number(level.amount)) {
        changes.push({
          concept: level.name,
          category: 'Aranceles Curriculares',
          previousAmount: Number(prev.amount),
          newAmount: Number(level.amount),
          diff: Number(level.amount) - Number(prev.amount),
          unit: level.unit || 'ARS/mes',
        });
      }
    });
  }

  // 2. Comparar deportes
  if (currentSportsPrices && previousSportsPrices) {
    Object.keys(currentSportsPrices).forEach((sportId) => {
      const prevAmount = previousSportsPrices[sportId];
      const newAmount = currentSportsPrices[sportId];
      if (prevAmount !== undefined && Number(prevAmount) !== Number(newAmount)) {
        changes.push({
          concept: `Taller/Deporte (${sportId})`,
          category: 'Actividades Extracurriculares',
          previousAmount: Number(prevAmount),
          newAmount: Number(newAmount),
          diff: Number(newAmount) - Number(prevAmount),
          unit: 'ARS/mes',
        });
      }
    });
  }

  // 3. Comparar comedor
  if (previousTariffs?.dining && currentTariffs?.dining) {
    currentTariffs.dining.forEach((plan) => {
      const prev = previousTariffs.dining.find((p) => p.id === plan.id);
      if (prev && Number(prev.amount) !== Number(plan.amount)) {
        changes.push({
          concept: plan.name,
          category: 'Comedor Escolar',
          previousAmount: Number(prev.amount),
          newAmount: Number(plan.amount),
          diff: Number(plan.amount) - Number(prev.amount),
          unit: plan.unit || 'ARS/mes',
        });
      }
    });
  }

  // 4. Comparar transporte
  if (previousTariffs?.transport && currentTariffs?.transport) {
    currentTariffs.transport.forEach((route) => {
      const prev = previousTariffs.transport.find((r) => r.id === route.id);
      if (prev) {
        if (Number(prev.amount) !== Number(route.amount)) {
          changes.push({
            concept: `Ruta ${route.code} (${route.name})`,
            category: 'Transporte Escolar',
            previousAmount: Number(prev.amount),
            newAmount: Number(route.amount),
            diff: Number(route.amount) - Number(prev.amount),
            unit: route.unit || 'ARS/mes',
          });
        }
      } else {
        // Nueva ruta añadida
        changes.push({
          concept: `Nueva Ruta ${route.code} (${route.name})`,
          category: 'Transporte Escolar',
          previousAmount: 0,
          newAmount: Number(route.amount),
          diff: Number(route.amount),
          unit: route.unit || 'ARS/mes',
        });
      }
    });
  }

  const now = new Date();
  const formattedDate = `${now.toLocaleDateString('es-AR')}, ${now.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })} hs`;

  const userName = user?.displayName || user?.nombre || user?.email || 'Lic. Martín Valdez';
  const userRole = user?.role || 'Superadmin Dirección';
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'AD';

  const auditEntry = {
    timestamp: now,
    formattedDate,
    user: {
      name: userName,
      role: userRole,
      email: user?.email || 'admin@colegio.edu.ar',
      initials: userInitials,
    },
    changesCount: changes.length,
    changes,
  };

  try {
    await ensureAdminAuth();

    // 1. Guardar la configuración en Firebase Firestore
    const configDocRef = doc(db, TARIFFS_CONFIG_COLLECTION, 'current');
    await setDoc(
      configDocRef,
      {
        tariffs: currentTariffs,
        sportsPrices: currentSportsPrices,
        lastUpdated: serverTimestamp(),
        lastUpdatedBy: userName,
      },
      { merge: true }
    );

    // 2. Guardar registro de auditoría si hubo modificaciones
    if (changes.length > 0) {
      await addDoc(collection(db, TARIFF_AUDIT_COLLECTION), {
        ...auditEntry,
        timestamp: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error('Error guardando en Firestore:', err);
    throw err;
  }

  return auditEntry;
};

/**
 * Obtiene la configuración actual de aranceles desde Firestore.
 */
export const fetchTariffsConfig = async () => {
  try {
    await ensureAdminAuth();
    const configDocRef = doc(db, TARIFFS_CONFIG_COLLECTION, 'current');
    const docSnap = await getDoc(configDocRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (err) {
    console.warn('Aviso obteniendo configuración de tarifas:', err.message);
    return null;
  }
};

/**
 * Suscripción reactiva a la configuración de tarifas en Firebase Firestore
 */
export const subscribeToTariffsConfig = (onUpdate, onError) => {
  try {
    const configDocRef = doc(db, TARIFFS_CONFIG_COLLECTION, 'current');
    return onSnapshot(
      configDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data());
        } else {
          onUpdate(null);
        }
      },
      (err) => {
        if (typeof onError === 'function') onError(err);
        onUpdate(null);
      }
    );
  } catch (err) {
    if (typeof onError === 'function') onError(err);
    onUpdate(null);
    return () => {};
  }
};

/**
 * Suscripción reactiva a logs de auditoría en Firestore
 */
export const subscribeToTariffAuditLogs = (onUpdate) => {
  try {
    const q = query(
      collection(db, TARIFF_AUDIT_COLLECTION),
      orderBy('timestamp', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate([]);
          return;
        }

        const items = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const rawDate = data.timestamp?.toDate ? data.timestamp.toDate() : new Date();
          const formattedDate =
            data.formattedDate ||
            `${rawDate.toLocaleDateString('es-AR')}, ${rawDate.toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
            })} hs`;

          items.push({
            id: docSnap.id,
            ...data,
            timestamp: rawDate,
            formattedDate,
          });
        });

        onUpdate(items);
      },
      () => {
        onUpdate([]);
      }
    );
  } catch {
    onUpdate([]);
    return () => {};
  }
};

/**
 * Carga inicial de logs de auditoría
 */
export const fetchTariffAuditLogsApi = async () => {
  try {
    const q = query(
      collection(db, TARIFF_AUDIT_COLLECTION),
      orderBy('timestamp', 'desc')
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      return [];
    }

    const items = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const rawDate = data.timestamp?.toDate ? data.timestamp.toDate() : new Date();
      items.push({
        id: docSnap.id,
        ...data,
        timestamp: rawDate,
      });
    });

    return items;
  } catch {
    return [];
  }
};
