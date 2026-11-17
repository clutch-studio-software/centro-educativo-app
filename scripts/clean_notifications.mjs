import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const NOTIFICATIONS_COLLECTION = 'notifications';
const FIRESTORE_BATCH_LIMIT = 450;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function loadEnvVars() {
  const envPath = path.join(projectRoot, '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error(`Archivo .env no encontrado en ${envPath}`);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};

  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      envVars[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
  }

  return envVars;
}

function parseCliArgs(argv) {
  const args = {
    days: null,
    dryRun: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      args.dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--days' && argv[i + 1] !== undefined) {
      const parsed = Number(argv[++i]);
      if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error('El valor de --days debe ser un número mayor o igual a 0.');
      }
      args.days = parsed;
    } else if (arg.startsWith('--days=')) {
      const parsed = Number(arg.slice('--days='.length));
      if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error('El valor de --days debe ser un número mayor o igual a 0.');
      }
      args.days = parsed;
    }
  }

  return args;
}

function printUsage() {
  console.log(`
Uso:
  node scripts/clean_notifications.mjs [opciones]

Opciones:
  --days <n>    Elimina solo las notificaciones con más de <n> días de antigüedad.
                Si se omite, elimina TODAS las notificaciones de la colección.
  --dry-run     Simula la limpieza mostrando cuántas se eliminarían sin borrar nada.
  -h, --help    Muestra esta ayuda
`);
}

function getNotificationTimestampMs(data) {
  if (!data || typeof data !== 'object') return null;

  if (typeof data.timestamp?.toMillis === 'function') {
    return data.timestamp.toMillis();
  }
  if (typeof data.timestamp?.seconds === 'number') {
    return data.timestamp.seconds * 1000;
  }
  if (typeof data.createdAt === 'string' && data.createdAt.trim()) {
    const parsed = Date.parse(data.createdAt);
    if (!Number.isNaN(parsed)) return parsed;
  }

  return null;
}

async function cleanNotifications() {
  const options = parseCliArgs(process.argv.slice(2));

  if (options.help) {
    printUsage();
    process.exit(0);
  }

  console.log('===============================================================');
  console.log('  LIMPIEZA DE NOTIFICACIONES EN FIRESTORE (notifications)');
  if (options.dryRun) {
    console.log('  [MODO SIMULACIÓN / DRY-RUN: No se eliminará ningún documento]');
  }
  console.log('===============================================================');
  if (options.days !== null) {
    console.log(`  Filtro de antigüedad: > ${options.days} día(s)`);
  } else {
    console.log('  Filtro de antigüedad: Ninguno (se eliminarán TODAS)');
  }
  console.log('');

  const envVars = loadEnvVars();
  const adminEmail = envVars.VITE_ADMIN_EMAIL;
  const adminKey =
    envVars.ADMIN_PASSWORD ||
    envVars.VITE_DEV_ADMIN_KEY ||
    envVars.VITE_ADMIN_PASSWORD;

  if (!adminEmail || !adminKey) {
    throw new Error(
      'Faltan credenciales de administrador (VITE_ADMIN_EMAIL / VITE_DEV_ADMIN_KEY) en el archivo .env.'
    );
  }

  const firebaseConfig = {
    apiKey: envVars.VITE_FIREBASE_API_KEY,
    authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: envVars.VITE_FIREBASE_PROJECT_ID,
    storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: envVars.VITE_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log(`Iniciando sesión como administrador (${adminEmail})...`);
  const userCred = await signInWithEmailAndPassword(auth, adminEmail, adminKey);
  console.log(`Autenticado exitosamente. UID Admin: ${userCred.user.uid}\n`);

  const snap = await getDocs(collection(db, NOTIFICATIONS_COLLECTION));
  const totalDocs = snap.docs.length;
  console.log(`Total de notificaciones encontradas: ${totalDocs}`);

  if (totalDocs === 0) {
    console.log('No hay notificaciones para eliminar.');
    process.exit(0);
  }

  const cutoffMs = options.days !== null ? Date.now() - options.days * MS_PER_DAY : null;
  const docsToDelete = [];
  let skippedNoDate = 0;

  for (const docSnap of snap.docs) {
    if (cutoffMs === null) {
      docsToDelete.push(docSnap.ref);
      continue;
    }

    const docMs = getNotificationTimestampMs(docSnap.data());
    if (docMs === null) {
      skippedNoDate++;
      continue;
    }

    if (docMs < cutoffMs) {
      docsToDelete.push(docSnap.ref);
    }
  }

  const keptCount = totalDocs - docsToDelete.length;
  console.log(`  - A eliminar: ${docsToDelete.length}`);
  console.log(`  - Se conservan: ${keptCount}`);
  if (skippedNoDate > 0) {
    console.log(`  - Omitidas sin fecha válida (solo con --days): ${skippedNoDate}`);
  }
  console.log('');

  if (!options.dryRun && docsToDelete.length > 0) {
    const commitPromises = [];
    for (let i = 0; i < docsToDelete.length; i += FIRESTORE_BATCH_LIMIT) {
      const chunk = docsToDelete.slice(i, i + FIRESTORE_BATCH_LIMIT);
      const batch = writeBatch(db);
      for (const ref of chunk) {
        batch.delete(ref);
      }
      commitPromises.push(batch.commit());
    }
    await Promise.all(commitPromises);
    console.log(`Firestore: ${docsToDelete.length} notificaciones eliminadas correctamente.`);
  }

  console.log('\nProceso finalizado.');
  process.exit(0);
}

cleanNotifications().catch((err) => {
  console.error('\nError fatal durante la limpieza de notificaciones:', err);
  process.exit(1);
});
