import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

const TARIFFS_CONFIG_COLLECTION = 'tariffs_config';
const TARIFF_AUDIT_COLLECTION = 'tariff_audit_logs';

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'audit-init-001',
    timestamp: new Date('2026-10-12T10:30:00Z'),
    formattedDate: '12/10/2026, 10:30 hs',
    user: {
      name: 'Lic. Martín Valdez',
      role: 'Superadmin Dirección',
      email: 'martin.valdez@colegio.edu.ar',
      initials: 'MV',
    },
    changesCount: 3,
    changes: [
      {
        concept: 'Nivel Inicial (Jardín)',
        category: 'Aranceles Curriculares',
        previousAmount: 42000,
        newAmount: 48000,
        diff: 6000,
        unit: 'ARS/mes',
      },
      {
        concept: 'Nivel Primario (1° a 7° Grado)',
        category: 'Aranceles Curriculares',
        previousAmount: 58000,
        newAmount: 65000,
        diff: 7000,
        unit: 'ARS/mes',
      },
      {
        concept: 'Nivel Secundario (Básico y Orientado)',
        category: 'Aranceles Curriculares',
        previousAmount: 66000,
        newAmount: 74000,
        diff: 8000,
        unit: 'ARS/mes',
      },
    ],
  },
  {
    id: 'audit-init-002',
    timestamp: new Date('2026-10-05T15:45:00Z'),
    formattedDate: '05/10/2026, 15:45 hs',
    user: {
      name: 'Cra. Natalia Benítez',
      role: 'Administración Financiera',
      email: 'natalia.benitez@colegio.edu.ar',
      initials: 'NB',
    },
    changesCount: 2,
    changes: [
      {
        concept: 'Pase Mensual Comedor Completo',
        category: 'Comedor Escolar',
        previousAmount: 21000,
        newAmount: 24000,
        diff: 3000,
        unit: 'ARS/mes',
      },
      {
        concept: 'Vianda Simple / Turno Individual',
        category: 'Comedor Escolar',
        previousAmount: 1500,
        newAmount: 1800,
        diff: 300,
        unit: 'ARS/vianda',
      },
    ],
  },
  {
    id: 'audit-init-003',
    timestamp: new Date('2026-09-28T11:15:00Z'),
    formattedDate: '28/09/2026, 11:15 hs',
    user: {
      name: 'Lic. Martín Valdez',
      role: 'Superadmin Dirección',
      email: 'martin.valdez@colegio.edu.ar',
      initials: 'MV',
    },
    changesCount: 4,
    changes: [
      {
        concept: 'Natación',
        category: 'Actividades Extracurriculares',
        previousAmount: 16000,
        newAmount: 18000,
        diff: 2000,
        unit: 'ARS/mes',
      },
      {
        concept: 'Atletismo',
        category: 'Actividades Extracurriculares',
        previousAmount: 13000,
        newAmount: 14500,
        diff: 1500,
        unit: 'ARS/mes',
      },
      {
        concept: 'Ruta 1 (Microcentro y B° Norte)',
        category: 'Transporte Escolar',
        previousAmount: 12500,
        newAmount: 14000,
        diff: 1500,
        unit: 'ARS/mes',
      },
      {
        concept: 'Ruta 4 (Perilago y Zonas Rurales)',
        category: 'Transporte Escolar',
        previousAmount: 16000,
        newAmount: 18000,
        diff: 2000,
        unit: 'ARS/mes',
      },
    ],
  },
];

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
    console.warn('Error guardando en Firestore, manteniendo en memoria:', err.message);
  }

  return auditEntry;
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
          onUpdate(INITIAL_AUDIT_LOGS);
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

        // Combinar con los iniciales si hay pocos
        const combined = [...items, ...INITIAL_AUDIT_LOGS];
        const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());
        onUpdate(unique);
      },
      () => {
        onUpdate(INITIAL_AUDIT_LOGS);
      }
    );
  } catch {
    onUpdate(INITIAL_AUDIT_LOGS);
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
      return INITIAL_AUDIT_LOGS;
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
    return INITIAL_AUDIT_LOGS;
  }
};
